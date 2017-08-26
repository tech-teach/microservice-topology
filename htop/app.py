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

    def __init__(self, value):
        self.value = float(value)
        if self.value < 0:
            raise ValueError('Interval must be positive.')


def fetch_interval(interval: QueryParam):
    try:
        return Interval(interval)
    except ValueError:
        return None


def cpu(interval: Interval):
    """
    Retrieves the cpu percentage in an interval of time.
    """
    # TODO Return an error in case the query param cannot be casted to float
    interval = interval.value if interval else 1.0
    return {
        'cpu': cpu_percent(interval=interval, percpu=True),
        'interval': interval
    }


ROUTES = [
    Route('/htop', 'GET', cpu),
]

COMPONENTS = [
    Component(Interval, init=fetch_interval)
]


app = CORSApp(routes=ROUTES, components=COMPONENTS)