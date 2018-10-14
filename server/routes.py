from views import new_game, get_game, websocket


def setup_routes(app):
    app.router.add_post('/api/new', new_game)
    app.router.add_get('/api/game/{link}', get_game, name='get_game')
    app.router.add_get('/api/ws/{link}', websocket, name='ws')
