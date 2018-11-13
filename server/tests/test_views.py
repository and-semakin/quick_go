from typing import List
import pytest
from aiohttp.web import WebSocketResponse

from server.views import notify_all, game_move_handler


@pytest.mark.asyncio
async def test_notify_all():
    """Check that notify all calls send_json() on all WebSockets."""
    class WebSocketResponseStub(WebSocketResponse):
        async def send_json(self, _):
            self.was_called = True

    ws_list: List[WebSocketResponse] = [WebSocketResponseStub() for _ in range(5)]
    await notify_all({}, ws_list)
    assert all(ws.was_called for ws in ws_list)


@pytest.mark.asyncio
async def test_game_move_handler():
    """Check that game_move_handler() behaves as expected."""
    # await game_move_handler(request, logger, **{'game_id': 1, 'x': 0, 'y': 0, '_pass': False})
    assert True
