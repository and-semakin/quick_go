from typing import Dict, Any
import logging
import json
import functools
import asyncio
import sys

from aiohttp import web, WSMsgType

import server.db
from server.utils import to_bool

loop: asyncio.AbstractEventLoop = asyncio.get_event_loop()


async def list_games(request):
    async with request.app['db'].acquire() as conn:
        cursor = await conn.execute(server.db.game.select())
        records = await cursor.fetchall()
        games = [dict(g) for g in records]
        return web.json_response({'games': games}, dumps=functools.partial(json.dumps, default=str))


async def new_game(request):
    data = await request.post()
    goban_size: int = int(data.get('goban_size', 9))
    move_submit_enabled: bool = to_bool(
        data.get('move_submit_enabled', 'true'))
    undo_requests_enabled: bool = to_bool(
        data.get('undo_requests_enabled', 'true'))
    async with request.app['db'].acquire() as conn:
        game = await server.db.new_game(
            conn,
            goban_size,
            move_submit_enabled,
            undo_requests_enabled,
        )
        return web.json_response({
            'link_black': game['link_black'],
            'link_white': game['link_white'],
        })


async def get_game(request):
    async with request.app['db'].acquire() as conn:
        link = request.match_info['link']
        try:
            game, moves, messages = await server.db.get_game(
                conn,
                link,
                with_moves=True,
                with_messages=True
            )
        except server.db.RecordNotFound as e:
            raise web.HTTPNotFound(text=str(e))
        moves = list(map(lambda move: {
            'order': move['order'],
            'pass': move['pass'],
            'x': move['x'],
            'y': move['y'],
        }, moves))
        messages = list(map(lambda msg: {
            'time': msg.time.timestamp(),
            'isBlack': msg.is_black,
            'text': msg.text
        }, messages))
        logging.debug(messages)
        return web.json_response({
            'is_black': (link == game['link_black']),
            'link': link,
            'goban_size': game['goban_size'],
            'move': game['move'],
            'finished': game['finished'],
            'result': game['result'],
            'start_date': game['start_date'].timestamp(),
            'finish_date': game['finish_date'].timestamp() if game['finish_date'] else None,
            'moves': moves,
            'chat_messages': messages,
            'move_submit_enabled': game['move_submit_enabled'],
            'undo_requests_enabled': game['undo_requests_enabled'],
            'chat_enabled': game['chat_enabled'],
        })


async def notify_all(msg, ws_list, logger=logging):
    for i, ws in enumerate(ws_list):
        logger.debug(
            f'Sending to {i} client socket (closed: {ws.closed}, close_code: {ws.close_code})...')
        await ws.send_json(msg)
    logger.debug(f'Notifying all done.')


async def websocket(request: web.Request) -> web.WebSocketResponse:
    link: str = request.match_info['link']

    async with request.app['db'].acquire() as conn:
        try:
            game, _, _ = await server.db.get_game(
                conn,
                link,
                with_moves=False,
                with_messages=False
            )
        except server.db.RecordNotFound as e:
            raise web.HTTPNotFound(text=str(e))

    ws: web.Response = web.WebSocketResponse(heartbeat=10, receive_timeout=20)
    await ws.prepare(request)

    game_id: int = game['id']
    is_black: bool = (link == game['link_black'])

    # add current WS to list of this game
    request.app['ws'][game_id].append(ws)

    # create new logger for this websocket session
    ws_logger: logging.Logger = logging.getLogger(f'WS{id(request)}')
    ws_logger.propagate = False
    ch: logging.StreamHandler = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG)
    formatter: logging.Formatter = logging.Formatter(
        f'%(asctime)s - %(name)s - %(levelname)s - [GAME: {game_id}] %(message)s')
    ch.setFormatter(formatter)
    ws_logger.addHandler(ch)

    ws_logger.debug('Websocket connection ready.')

    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            try:
                data: Dict[str, Any] = json.loads(msg.data)
            except ValueError:
                ws_logger.debug(f'Wrong message: {msg.data}')
                continue

            if 'type' not in data:
                ws_logger.debug(f'Wrong message: {data}')
                continue

            msg_type = data['type'].lower()

            if msg_type == 'game_move':
                # getting data
                try:
                    move_no, x, y = int(data['move_no']), int(
                        data['x']), int(data['y'])
                    _pass = bool(data['pass'])
                except ValueError:
                    ws_logger.debug(f'Can\'t parse data: {data}')
                    continue

                # writing update to database
                async with request.app['db'].acquire() as conn:
                    move_no, x, y, _pass = await server.db.do_move(conn, game_id, x, y, _pass)

                # notifying users online about update
                await notify_all(
                    {
                        'type': 'game_move',
                        'move_no': move_no,
                        'x': x,
                        'y': y,
                        'pass': _pass,
                    },
                    request.app['ws'][game_id],
                    logger=ws_logger
                )
            elif msg_type == 'game_resign':
                # writing update to database
                async with request.app['db'].acquire() as conn:
                    resign_values = await server.db.game_resign(conn, game_id, is_black)

                # notifying users online about update
                await notify_all(
                    {
                        'type': 'game_resign',
                        **resign_values,
                        'finish_date': resign_values['finish_date'].timestamp(),
                    },
                    request.app['ws'][game_id],
                    logger=ws_logger
                )
            elif msg_type == 'game_finish':
                pass
            elif msg_type == 'chat_message':
                pass
            else:
                ws_logger.debug(f'Unexpected type "{msg_type}": {data}')
                continue
        else:
            ws_logger.debug(f'Unexpected type of message: {msg.type.name}')

    ws_logger.debug('Websocket connection closed.')
    request.app['ws'][game_id].remove(ws)
    return ws
