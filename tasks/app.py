# internal libraries
import uuid
import hashlib
import binascii
import os
import json

# external libraries
from sanic_cors import CORS
from sanic import Sanic, response

from pony.orm import db_session

from models import Task, TASKS
import metrics as mt


TASKS.bind(
    'sqlite',
    os.path.join(os.getenv('DB_STORAGE'), 'db.sqlite'),
    create_db=True
)
TASKS.generate_mapping(create_tables=True)


APP = Sanic(__name__)
CORS(APP)


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

    def store_unique(self, file_text):
        """
        Stores the file with a sha1 of its contents to avoid duplication.
        """
        dk = hashlib.pbkdf2_hmac(
            'sha1',
            file_text.encode(),
            b'',
            100000
        )
        file_name = binascii.hexlify(dk).decode()
        file_path = f'{self.path(file_name)}.csv'
        file_was_created = os.path.isfile(file_path)
        if not file_was_created:
            with open(file_path, 'a+') as file:
                file.write(file_text)

        return {
            'fileName': file_name,
            'filePath': file_path,
            'fileWasCreated': file_was_created
        }


@APP.route('/tasks', methods=['POST', 'OPTIONS'])
async def tasks(request):
    """
    Receive a file and enqueue processing.
    """

    if request.method == 'OPTIONS':
        return response.json({})

    file = request.files.get('file')
    if file is None:
        return response.json({'error': 'A file is required'}, status=400)

    # Further validate file if need be

    # Write file to the filesystem
    storage = StorageUnit()
    file_status = storage.store_unique(file.body.decode())

    with db_session:
        task = Task(
            filename=file_status.get('fileName'),
        )

    # Create Task row in the database

    # Enqueue task excecution with the uuid

    # Return to the user with the task uid and 201 created

    return response.json(
        {
            'uid': task.uid,
            'path': file_status.get('filePath'),
            'fileCreated': file_status.get('fileWasCreated')
        },
        status=201
    )


@APP.route('/tasks/<uid>', methods=['GET', 'OPTIONS'])
async def task(_request, uid):
    """
    Inform the user about a tasks status.
    """
    # Find task by uid
    # If not found, you'now not found
    # return task status
    with db_session:
        task = Task.select(lambda t: t.uid == uid).first()

    if task is None:
        return response.json(
            {'error': f'A task with uid: "{uid}" was not found'},
            status=400
        )

    return response.json({
        'uid': task.uid,
        'status': task.status,
        'errors': json.loads(task.errors),
        'accuracies': json.loads(task.accuracies),
    })


if __name__ == "__main__":
    APP.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
