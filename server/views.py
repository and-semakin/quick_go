import logging
import json
import functools
import asyncio
import sys

from aiohttp import web, WSMsgType

import db

loop = asyncio.get_event_loop()


async def list_games(request):
    async with request.app['db'].acquire() as conn:
        cursor = await conn.execute(db.game.select())
        records = await cursor.fetchall()
        games = [dict(g) for g in records]
        return web.json_response({'games': games}, dumps=functools.partial(json.dumps, default=str))


async def new_game(request):
    data = await request.post()
    goban_size = data.get('goban_size', 9)
    async with request.app['db'].acquire() as conn:
        game = await db.new_game(conn, goban_size)
        return web.json_response({
            'link_black': game['link_black'],
            'link_white': game['link_white'],
        })


async def get_game(request):
    async with request.app['db'].acquire() as conn:
        link = request.match_info['link']
        try:
            game, moves = await db.get_game(
                conn,
                link
            )
        except db.RecordNotFound as e:
            raise web.HTTPNotFound(text=str(e))
        moves = list(map(lambda move: {
            'order': move['order'],
            'pass': move['pass'],
            'x': move['x'],
            'y': move['y'],
        }, moves))
        return web.json_response({
            'isBlack': (link == game['link_black']),
            'link': link,
            'gobanSize': game['goban_size'],
            'move': game['move'],
            'finished': game['finished'],
            'moves': moves
        })

async def websocket(request):
    link = request.match_info['link']

    async with request.app['db'].acquire() as conn:
        try:
            game, _ = await db.get_game(
                conn,
                link
            )
        except db.RecordNotFound as e:
            raise web.HTTPNotFound(text=str(e))

    ws = web.WebSocketResponse(heartbeat=10, receive_timeout=20)
    await ws.prepare(request)

    game_id = game['id']

    # add current WS to list of this game
    request.app['ws'][game_id].append(ws)

    # create new logger for this websocket session
    ws_logger = logging.getLogger(f'WS{id(request)}')
    ws_logger.propagate = False
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter(f'%(asctime)s - %(name)s - %(levelname)s - [GAME: {game_id}] %(message)s')
    ch.setFormatter(formatter)
    ws_logger.addHandler(ch)

    ws_logger.debug('Websocket connection ready.')

    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            try:
                data = json.loads(msg.data)
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
                    move_no, x, y = int(data['move_no']), int(data['x']), int(data['y'])
                    _pass = bool(data['pass'])
                except ValueError:
                    ws_logger.debug(f'Cant parse data: {data}')
                    continue

                # writing update to database
                async with request.app['db'].acquire() as conn:
                    move_no, x, y, _pass = await db.do_move(conn, game_id, x, y, _pass)

                # notifying online users about update
                for i, _ws in enumerate(request.app['ws'][game_id]):
                    ws_logger.debug(f'Sending to {i} client socket (closed: {_ws.closed}, close_code: {_ws.close_code})...')
                    await _ws.send_json({
                        'type': 'game_move',
                        'move_no': move_no,
                        'x': x,
                        'y': y,
                        'pass': _pass,
                    })
                ws_logger.debug(f'Sending update done.')
            elif msg_type == 'game_resign':
                pass
            elif msg_type == 'game_finish':
                pass
            elif msg_type == 'chat_send':
                pass
            else:
                ws_logger.debug(f'Unexpected type "{msg_type}": {data}')
                continue
        else:
            ws_logger.debug(f'Unexpected type of message: {msg.type.name}')

    ws_logger.debug('Websocket connection closed.')
    request.app['ws'][game_id].remove(ws)
    return ws
