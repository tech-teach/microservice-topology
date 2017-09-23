"""
Abstract tasks.
"""
import json
import logging

from pony.orm import db_session
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
    logger = logging.getLogger()
    try:
        metrics = accuracies(file, 1)
        task.status = 'complete'
        task.accuracies = json.dumps(metrics)
    except MetricsError as err:
        task.status = 'failed'
        task.errors = json.dumps({
            'error': 'Failed to process file.',
            'message': f'{err}',
        })
