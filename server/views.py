from aiohttp import web

import db


async def index(request):
    async with request.app['db'].acquire() as conn:
        cursor = await conn.execute(db.game.select())
        records = await cursor.fetchall()
        games = [dict(q) for q in records]
        return web.json_response({'games': games})


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
        return web.json_response({
            'game': game,
            'moves': moves
        })
