# internal libraries
import io
import uuid

# external libraries
from sanic.response import json
from sanic import Sanic
# TODO import metrics module


app = Sanic(__name__)


@app.route('/tasks', methods=['POST'])
def tasks(request):
    try:
        request_file = request.files.get('file').body.decode("unicode_escape")
    except Exception:
        return json(
            {"error": "File has not found"},
            status=400
        )

    file_handler = io.StringIO(request_file)

    # TODO call accuracy function from  metrics module
    # response = get_accuracy(file_handler, 1)
    # return response

    return json({
        "uuid": uuid.uuid4().hex
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
