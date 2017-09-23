"""
Abstract tasks.
"""
import csv

from pony.orm import db_session
from redis import Redis
from rq import Queue

from models import Task
from storage import StorageUnit


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
    file = storage.open(task.filename, 'rb')
    # Call metrics from here
    # Store the results or store the errors
    _reader = csv.reader(file)
    task.status = 'complete'
