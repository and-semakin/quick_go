from typing import Tuple, Any, List
from datetime import datetime
import secrets

import aiopg.sa  # type: ignore
from sqlalchemy import (  # type: ignore
    MetaData, Table, Column, ForeignKey,
    Integer, String, DateTime, Boolean, or_,
)
from sqlalchemy.engine import Connection  # type: ignore

__all__ = ['game', 'move', 'chat_message', 'undo_request']

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

meta = MetaData(naming_convention=convention)

game = Table(
    'game', meta,

    Column('id', Integer, primary_key=True),
    Column('link_black', String(32), nullable=False),
    Column('link_white', String(32), nullable=False),
    Column('goban_size', Integer, server_default="9", nullable=False),
    Column('move', Integer, server_default="0", nullable=False),
    Column('finished', Boolean, server_default="f", nullable=False),
    Column('start_date', DateTime, nullable=False),
    Column('finish_date', DateTime, nullable=True),
    Column('result', String(6), nullable=True),
    Column('move_submit_enabled', Boolean, server_default="t", nullable=False),
    Column('undo_requests_enabled', Boolean, server_default="f", nullable=False),
    Column('chat_enabled', Boolean, server_default="f", nullable=False),
)

move = Table(
    'move', meta,

    Column('id', Integer, primary_key=True),
    Column(
        'game_id',
        Integer,
        ForeignKey('game.id', ondelete='CASCADE')
    ),
    Column('time', DateTime, nullable=False),
    Column('order', Integer, server_default="0", nullable=False),
    Column('pass', Boolean, server_default="t", nullable=False),
    Column('x', Integer, server_default="0", nullable=False),
    Column('y', Integer, server_default="0", nullable=False),
)

undo_request = Table(
    'undo_request', meta,

    Column('id', Integer, primary_key=True),
    Column(
        'game_id',
        Integer,
        ForeignKey('game.id', ondelete='CASCADE')
    ),
    Column('request_time', DateTime, nullable=False),
    Column('response_time', DateTime, nullable=False),
    Column('order', Integer, server_default="0", nullable=False),
    Column('still_actual', Boolean, server_default="t", nullable=False),
    Column('was_undone', Boolean, server_default="f", nullable=False),
)

chat_message = Table(
    'chat_message', meta,

    Column('id', Integer, primary_key=True),
    Column(
        'game_id',
        Integer,
        ForeignKey('game.id', ondelete='CASCADE')
    ),
    Column('time', DateTime, nullable=False),
    Column('is_black', Boolean, server_default="t", nullable=False),
    Column('text', String(256), nullable=False),
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


async def get_game(
    conn: Connection,
    link: str,
    with_moves: bool = False,
    with_messages: bool = False
) -> Tuple[Any, Any, Any]:
    """Get game info, moves and chat messages."""
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

    moves: List[Any] = []
    chat_messages: List[Any] = []

    if with_moves:
        result = await conn.execute(
            move.select()
            .where(move.c.game_id == found_game.id)
            .order_by(move.c.order)
        )
        moves = await result.fetchall()

    if with_messages:
        result = await conn.execute(
            chat_message.select()
            .where(chat_message.c.game_id == found_game.id)
            .order_by(chat_message.c.time)
        )
        chat_messages = await result.fetchall()

    return found_game, moves, chat_messages


async def new_game(
    conn,
    goban_size,
    move_submit_enabled=True,
    undo_requests_enabled=True,
    chat_enabled=False,
):
    link_black = secrets.token_hex(16)
    link_white = secrets.token_hex(16)
    result = await conn.execute(
        game.insert({
            'link_black': link_black,
            'link_white': link_white,
            'goban_size': goban_size,
            'start_date': datetime.now(),
            'finish_date': None,
            'result': None,
            'move_submit_enabled': move_submit_enabled,
            'undo_requests_enabled': undo_requests_enabled,
            'chat_enabled': chat_enabled,
        }).returning(game.c.link_black, game.c.link_white)
    )
    new_game = await result.fetchone()
    return new_game


async def do_move(conn, game_id, x=0, y=0, _pass=True):
    result = await conn.execute(
        game.select()
        .where(game.c.id == game_id)
    )
    found_game = await result.first()
    if not found_game:
        msg = "Game with id: {} does not exists"
        raise RecordNotFound(msg.format(game_id))

    result = await conn.execute(
        move.insert({
            'game_id': game_id,
            'order': found_game.move,
            'time': datetime.now(),
            'pass': _pass,
            'x': x,
            'y': y,
        }).returning(
            move.c.order,
            move.c.x,
            move.c.y,
            move.c['pass']
        )
    )
    current_move = await result.fetchone()

    result = await conn.execute(
        game.update(None, values={
            'move': found_game.move + 1,
        }).where(game.c.id == game_id)
    )

    return current_move.order, current_move.x, current_move.y, current_move['pass']


async def game_resign(conn, game_id, is_black):
    values = {
        'finished': True,
        'finish_date': datetime.now(),
        'result': 'W+R' if is_black else 'B+R',
    }
    await conn.execute(
        game.update(None, values=values).where(game.c.id == game_id)
    )
    return values

async def create_undo_request(conn, game_id, move):
    await conn.execute(
        undo_request.insert({
            'game_id': game_id,
            'move': move,
            'request_time': datetime.now(),
        })
    )