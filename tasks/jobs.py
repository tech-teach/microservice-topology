"""
Abstract tasks.
"""
import json

from pony.orm import db_session, commit
from redis import Redis
from rq import Queue

from models import Task
from storage import StorageUnit
from metrics import accuracies, MetricsError


def queue():
    """
    Get ourselves a default queue.
    """
    return Queue(connection=Redis(host='redis'))


@db_session
def process_file(uid):
    """
    Process a file given an uid.
    """
    storage = StorageUnit()
    task = Task.select(lambda t: t.uid == uid).first()
    file = storage.open(task.filename, 'r')
    # Call metrics from here
    try:
        for acc in accuracies(file, 4):
            all_accuracies = (
                json.loads(task.accuracies)
                if task.accuracies else list()
            )
            all_accuracies.append(
                {acc.get('accuracyName'): acc.get('accuracyResult')}
            )

            task.accuracies = json.dumps(all_accuracies)
            task.progress = acc.get('progress')
            commit()
            if task.canceled:
                break

        task.status = 'complete'
    except MetricsError as err:
        task.status = 'failed'
        task.errors = json.dumps({
            'error': 'Failed to process file.',
            'message': f'{err}',
        })
