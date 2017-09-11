from apistar.frameworks.wsgi import WSGIApp as App
from apistar.http import Response, Request, QueryParam
from apistar import Route, Component
from psutil import cpu_percent


class CORSApp(App):
    """
    Wraps an app, so that it injects CORS headers.
    """

    def finalize_response(self, response: Response) -> Response:
        """
        Inject cors headers and finalize.
        """
        response = super().finalize_response(response)
        content, status, headers, content_type = response
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Authorization'
        headers['Access-Control-Allow-Credentials'] = 'true'
        headers['Access-Control-Allow-Methods'] = 'GET'
        return Response(content, status, headers, content_type)


class Interval(object):
    """
    Wraps a cpu interval.
    """
    def __init__(self, value):
        self.value = float(value)
        if self.value < 0:
            raise ValueError('Interval must be positive.')


def fetch_interval(interval: QueryParam):
    """
    Builds an interval out of the provided query param.
    """
    try:
        return Interval(interval)
    except (ValueError, TypeError):
        return Interval(0.5)


def cpu(interval: Interval):
    """
    Retrieves the cpu percentage in an interval of time.
    """
    return {
        'cpu': cpu_percent(interval=interval.value, percpu=True),
        'interval': interval.value
    }


ROUTES = [
    Route('/htop', 'GET', cpu),
]

COMPONENTS = [
    Component(Interval, init=fetch_interval)
]


app = CORSApp(routes=ROUTES, components=COMPONENTS)