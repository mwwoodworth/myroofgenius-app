class _DummySession:
    def __init__(self, id="sess_dummy", url=""):
        self.id = id
        self.url = url

class checkout:
    class Session:
        @staticmethod
        def create(**kwargs):
            return _DummySession()

class Webhook:
    @staticmethod
    def construct_event(payload, sig, secret):
        return {}

api_key = ""
