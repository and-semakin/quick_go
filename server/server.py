import typing
import asyncio
import tornado.web
import tornado.httpserver

class HealthzHandler(tornado.web.RequestHandler):
    """Обработчик хелсчека контейнера."""

    def get(self):
        """Проверка того, что контейнер жив и отвечает.

        Должен отдавать 200, если с контейнером всё хорошо.
        Должен отдавать 4XX или 5XX в случае проблем.
        """
        self.set_status(200)

class CreateGameHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

def make_app() -> tornado.web.Application:
    return tornado.web.Application([
        (r"/healthz", HealthzHandler),
        (r"/api/create_game", CreateGameHandler),
    ])

if __name__ == "__main__":
    server = tornado.httpserver.HTTPServer(
        make_app()
    )
    server.listen(8888)
    asyncio.get_event_loop().run_forever()
