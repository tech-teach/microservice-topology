# internal libraries
import os
import uuid

# external libraries
from sanic.response import json, stream
from sanic import Sanic

from sanic_cors import CORS
import metrics as mt


app = Sanic(__name__)
CORS(app)


class StorageUnit(object):
    """
    Abstraction for an storage unit.
    """
    def __init__(self, root=None):
        if root is None:
            self.root = os.getenv('FILE_STORAGE')
        else:
            self.root = root

    def path(self, name):
        """
        Create a path relative to the storage units root.
        """
        return os.path.join(self.root, name)

    def store_unique(self, file):
        """
        Stores the file with a sha1 of its contents to avoid duplication.
        """
        raise NotImplementedError('Darn!')


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
    storage = StorageUnit()
    path = storage.path('hola.csv')

    # Create Task row in the database

    # Enqueue task excecution with the uuid

    # Return to the user with the task uid and 201 created

    return json({'uid': uuid.uuid4().hex, 'path': path}, status=201)


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
