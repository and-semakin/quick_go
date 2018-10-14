from views import index, get_game


def setup_routes(app):
    app.router.add_get('/api/new', index)
    app.router.add_get('/api/game/{link}', get_game, name='get_game')
