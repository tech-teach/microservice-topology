from apistar.frameworks.wsgi import WSGIApp as App
from apistar.http import Response, Request, QueryParam
from apistar import Route
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


def cpu(interval: QueryParam):
    """
    Retrieves the cpu percentage in an interval of time.
    """
    # TODO Return an error in case the query param cannot be casted to float
    interval = float(interval or 1.0)
    return {
        'cpu': cpu_percent(interval=interval, percpu=True),
        'interval': interval
    }


ROUTES = [
    Route('/htop', 'GET', cpu),
]


app = CORSApp(routes=ROUTES)