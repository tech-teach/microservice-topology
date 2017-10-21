# internal libraries
import json

# external libraries
from sanic_cors import CORS
from sanic import Sanic, response, views

from pony.orm import db_session

from models import Task
from storage import StorageUnit
from jobs import queue



APP = Sanic(__name__)
CORS(APP)


class TaskListResource(views.HTTPMethodView):

    def get(self, request):
        """
        List all the tasks in the database.
        """
        raise NotImplementedError('Not yet implemented')

    def post(self, request):
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
        filename, created = storage.store_unique(file.body.decode())

        # Create Task row in the database
        with db_session:
            task = Task(filename=filename)

        # Enqueue task excecution with the uuid
        queue().enqueue('jobs.process_file', task.uid, timeout=3600)

        # Return to the user with the task uid and 201 created

        return response.json({
            'uid': task.uid,
            'fileCreated': created
        }, status=201)



class TasksDetailResource(views.HTTPMethodView):

    def get(self, _request, uid):
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
            'progress': task.progress,
            'canceled': task.canceled,
            'errors': json.loads(task.errors) if task.errors else None,
            'accuracies': json.loads(task.accuracies) if task.accuracies else None,
        })

    def delete(self, _request, uid):
        """
        Just cancels a task.
        """
        with db_session:
            task = Task.select(lambda t: t.uid == uid).first()

            if task is None:
                return response.json(
                    {'error': f'A task with uid: "{uid}" was not found'},
                    status=400
                )

            task.canceled = True

            return response.json(
                {'message': 'canceling'}
            )


APP.add_route(TaskListResource.as_view(), '/tasks')
APP.add_route(TasksDetailResource.as_view(), '/tasks/<uid>')


if __name__ == "__main__":
    APP.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
