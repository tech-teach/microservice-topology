"""
Abstract tasks.
"""
import json

from pony.orm import db_session, commit
from ctypes import *
import json

from redis import Redis
from rq import Queue

from models import Task
from storage import StorageUnit
from metrics import accuracies, MetricsError

NN = CDLL('./core/libNN.so')

def queue():
    """
    Get ourselves a default queue.
    """
    return Queue(connection=Redis(host='redis'))


def process_file(uid, language):
    """
    Process a file given an uid.
    """
    storage = StorageUnit()
    # Call metrics from here

    try:
        if language == "Python":
            with db_session:
                task = Task.select(lambda t: t.uid == uid).first()
                file = storage.open(task.filename, 'r')
                cores = task.cores

            for acc in accuracies(file, cores):
                with db_session:
                    task = Task.select(lambda t: t.uid == uid).first()
                    all_accuracies = (
                        json.loads(task.accuracies)
                        if task.accuracies else list()
                    )
                    all_accuracies.append(
                        {
                            'name': acc.get('accuracyName'),
                            'result': acc.get('accuracyResult')
                        }
                    )

                    task.accuracies = json.dumps(all_accuracies)
                    task.progress = acc.get('progress')

                    if task.canceled:
                        task.status = 'aborted'
                        break

            with db_session:
                task = Task.select(lambda t: t.uid == uid).first()
                if task.status != 'aborted':
                    task.status = 'complete'


        else:
            to_str = lambda value: (
                value.decode() if isinstance(value, bytes) else value
            )

            with db_session:
                task = Task.select(lambda t: t.uid == uid).first()
                file_rows = storage.open(task.filename, 'r').read().split('\n')
                file_content = [
                    float(value)
                    for row in file_rows
                    for value in row.split(',')
                    if value != ''
                ]

                rows = len(file_rows) - 1
                cols = len(file_rows[0].split(','))

                file_content_c = (
                    (c_float * len(file_content))(*file_content)
                )

                cores = task.cores


            for distance in range(15):
                with db_session:
                    task = Task.select(lambda t: t.uid == uid).first()
                    NN.main.restype=c_char_p
                    response = NN.main(
                        cores,
                        distance,
                        file_content_c,
                        rows,
                        cols
                    )

                    try:
                        response_json = json.loads(
                            to_str(response).replace("'", '"')
                        )

                        response_json = {
                            to_str(key) : to_str(value)
                            for key, value in response_json.items()
                        }
                    except:
                        task.status = 'aborted'
                        task.progress = 1.0
                        all_errors = json.loads(
                            task.errors
                        ) if task.errors else list()
                        all_errors.append('executionError')
                        task.errors = all_errors
                        break

                    all_accuracies = (
                        json.loads(task.accuracies)
                        if task.accuracies else list()
                    )

                    all_accuracies.append(
                        {
                            'name': response_json.get('accuracyName'),
                            'result': response_json.get('accuracyResult')
                        }
                    )

                    task.accuracies = json.dumps(all_accuracies)
                    task.progress = (distance + 1) / 15

                    if task.canceled:
                        task.status = 'aborted'
                        break

            with db_session:
                task = Task.select(lambda t: t.uid == uid).first()
                if task.status != 'aborted':
                    task.status = 'complete'


    except MetricsError as err:
        task.status = 'failed'
        task.errors = json.dumps({
            'error': 'Failed to process file.',
            'message': f'{err}',
        })

