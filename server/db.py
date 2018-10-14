import time

import aiopg.sa
from sqlalchemy import (
    MetaData, Table, Column, ForeignKey,
    Integer, String, Date, Boolean, TIMESTAMP,
    or_,
)

__all__ = ['game', 'move']

meta = MetaData()

game = Table(
    'game', meta,

    Column('id', Integer, primary_key=True),
    Column('link_black', String(32), nullable=False),
    Column('link_white', String(32), nullable=False),
    Column('goban_size', Integer, server_default="9", nullable=False),
    Column('move', Integer, server_default="0", nullable=False),
    Column('finished', Boolean, server_default="f", nullable=False),
    Column('start_date', Date, nullable=False),
    Column('finish_date', Date, nullable=False),
)

move = Table(
    'move', meta,

    Column('id', Integer, primary_key=True),
    Column(
        'game_id',
        Integer,
        ForeignKey('game.id', ondelete='CASCADE')
    ),
    Column('time', Date, nullable=False),
    Column('order', Integer, server_default="0", nullable=False),
    Column('pass', Boolean, server_default="t", nullable=False),
    Column('x', Integer, server_default="0", nullable=False),
    Column('y', Integer, server_default="0", nullable=False),
)


class RecordNotFound(Exception):
    """Requested record in database was not found."""


async def init_pg(app):
    conf = app['config']['postgres']
    engine = await aiopg.sa.create_engine(
        database=conf['database'],
        user=conf['user'],
        password=conf['password'],
        host=conf['host'],
        port=conf['port'],
        minsize=conf['minsize'],
        maxsize=conf['maxsize'],
    )
    app['db'] = engine


async def close_pg(app):
    app['db'].close()
    await app['db'].wait_closed()


async def get_game(conn, link):
    result = await conn.execute(
        game.select()
        .where(or_(
            game.c.link_black == link,
            game.c.link_white == link
        ))
    )
    found_game = await result.first()
    if not found_game:
        msg = "Game with link: {} does not exists"
        raise RecordNotFound(msg.format(link))
    result = await conn.execute(
        move.select()
        .where(move.c.game_id == found_game.id)
        .order_by(move.c.order)
    )
    moves = await result.fetchall()
    return found_game, moves


async def do_move(conn, game_id, x=0, y=0, pass_=True):
    result = await conn.execute(
        move.insert().values({
            'order': current_game.move,
            'time': time.time(),
            'pass': pass_,
            'x': x,
            'y': y,
        })
    )
    record = await result.fetchone()
    if not record:
        msg = "Question with id: {} or choice id: {} does not exists"
        raise RecordNotFound(msg.format(question_id, choice_id))
