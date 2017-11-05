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
    with db_session:
        task = Task.select(lambda t: t.uid == uid).first()
        cores = task.cores
        try:
            if language == "Python":
                file = storage.open(task.filename, 'r')
                for acc in accuracies(file, cores):
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

                    commit()

                    if task.canceled:
                        break

                task.status = 'complete'
            else:
                file = storage.path(task.filename)
                to_str = lambda value: (
                    value.decode() if isinstance(value, bytes) else value
                )
                for distance in range(15):
                    args = ["_", str(file), str(cores), str(distance)]
                    Args = c_char_p * len(args)
                    args = Args(
                        *[
                            c_char_p(arg.encode("utf-8"))
                            for arg in args
                        ]
                    )

                    NN.main.restype=c_char_p

                    response = NN.main(len(args), args)

                    try:
                        response_json = json.loads(
                            to_str(response).replace("'", '"')
                        )

                        response_json = {
                            to_str(key) : to_str(value)
                            for key, value in response_json.items()
                        }
                    except:
                        task.status = 'complete'
                        task.progress = 1.0
                        task.errors = json.dumps(['executionError', str(response)])
                        break

                    if 'errors' in response_json.keys():
                        task.status = 'complete'
                        task.progress = 1.0
                        task.errors = json.dumps(['fileReadError', str(response)])
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

