# internal libraries
import io
import uuid

# external libraries
from sanic.response import json, stream
from sanic import Sanic

from sanic_cors import CORS
import metrics as mt

app = Sanic(__name__)
CORS(app)


@app.route('/tasks', methods=['POST', 'OPTIONS'])
def tasks(request):
    if request.method == 'OPTIONS':
        return json({})
    try:
        request_file = request.files.get('file').body.decode('unicode_escape')
    except Exception as e:
        return json(
            {'error': 'File has not been found', 'message': f'{e}'},
            status=400
        )

    file_handler = io.StringIO(request_file)

    response = mt.get_accuracy(file_handler, 4)

    return json({
        "uuid": uuid.uuid4().hex,
        # "response": response
    })



if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
