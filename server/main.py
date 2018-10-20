import logging
import sys
import collections

from aiohttp import web

from db import close_pg, init_pg
from routes import setup_routes
from settings import get_config

logging_format = '%(asctime)-15s - %(name)s - %(levelname)s - %(message)s'

def init_app(argv=None):

    app = web.Application()

    app['config'] = get_config(argv)
    app['ws'] = collections.defaultdict(list)

    # create db connection on startup, shutdown on exit
    app.on_startup.append(init_pg)
    app.on_cleanup.append(close_pg)

    # setup views and routes
    setup_routes(app)

    return app


def main(argv):
    logging.basicConfig(level=logging.DEBUG, format=logging_format)

    app = init_app(argv)

    config = get_config(argv)
    web.run_app(app,
                host=config['host'],
                port=config['port'])


if __name__ == '__main__':
    main(sys.argv[1:])
