import json
import functools

from aiohttp import web, WSMsgType

import db


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
    print('Websocket connection starting')
    async with request.app['db'].acquire() as conn:
        link = request.match_info['link']
        try:
            game, _ = await db.get_game(
                conn,
                link
            )
        except db.RecordNotFound as e:
            raise web.HTTPNotFound(text=str(e))

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    game_id = game['id']
    request.app['ws'][game_id].append(ws)
    print('Websocket connection ready')

    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            if msg.data == 'close':
                await ws.close()
                request.app['ws'][game_id].remove(ws)
            else:
                # (move_no, x, y, pass)
                parts = msg.data.split()
                print(parts)
                try:
                    move_no, x, y = int(parts[0]), int(parts[1]), int(parts[2])
                    _pass = parts[3].lower() in ['1', 't', 'true', 'y', 'yes']
                    async with request.app['db'].acquire() as conn:
                        move_no, x, y, _pass = await db.do_move(conn, game_id, x, y, _pass)
                    for _ws in request.app['ws'][game_id]:
                        await _ws.send_str(f'{move_no} {x} {y} {int(_pass)}')
                except (ValueError, IndexError) as e:
                    continue

    print('Websocket connection closed')
    return ws