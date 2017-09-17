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
    """
    Receive a file and enqueue processing.
    """

    if request.method == 'OPTIONS':
        return json({})

    file = request.files.get('file')
    if file is None:
        return json({'error': 'A file is required'}, status=400)

    # Further validate file if need be

    # Write file to the filesystem

    # Create Task row in the database

    # Enqueue task excecution with the uuid

    # Return to the user with the task uid and 201 created

    return json({'uid': uuid.uuid4().hex}, status=201)


@app.route('/tasks/<uid>', methods=['GET', 'OPTIONS'])
def task(request, uid):
    """
    Inform the user about a tasks status.
    """
    # Find task by uid
    # If not found, you'now not found
    # return task status
    return json({
        'uid': uid,
        'status': 'complete',
        'errors': None,
        'accuracies': {
            'something': 1.0,
            'something_else': 0.5,
        },
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
