import multiprocessing as mp
from datetime import datetime
import time

import scipy.spatial.distance as ds
import numpy as np

class MetricsError(Exception):
    pass


class FileReadError(MetricsError):
    pass


class ProcessFileError(MetricsError):
    pass

__version__ = '0.1.0'

np.seterr(divide='ignore', invalid='ignore')

def lagrange(u, v):
    return np.amax(np.absolute(u-v))

def lance_williams(u, v):
    return np.sum(np.absolute(u-v)) / np.sum(np.absolute(u+v))

def soergel(u, v):
    return np.sum(np.absolute(u-v)) / np.sum(np.maximum(u, v))

def clark(u, v):
    return np.sqrt(
        np.sum(
            np.power(np.absolute(u-v), 2) / np.sum([u, v], axis=0)
        )
    ) / len(u)

def matusia(u, v):
    return np.sqrt(
        np.sum(
            np.power(np.sqrt(u) - np.sqrt(v), 2)
        ) / len(u)
    )

def wave_edges(u, v):
    return np.sum(
        1 - np.minimum(u, v) / np.maximum(u, v)
    ) / len(u)

def jaccard_tanimoto(u, v):
    return 1 - (
        np.sum(np.product([u, v], axis=0)) / (
            np.sum(np.power(u, 2)) + np.sum(np.power(v, 2)) - (
                np.sum(np.product([u, v], axis=0))
            )
        )
    )

def mahalanobis(u, v):
    return ds.mahalanobis(u, v, np.cov(np.vstack((u, v)).T))

NOT_BOOL_DISTANCES = [
    ds.minkowski,
    ds.euclidean,
    # ds.chebyshev, # lagrange
    lagrange,
    ds.canberra,
    lance_williams,
    soergel,
    clark,
    matusia,
    wave_edges,
    jaccard_tanimoto,
    ds.hamming,
    ds.cosine,
    ds.cityblock, # manhattan
    ds.braycurtis,
    ds.correlation,
    mahalanobis,
]

class DistanceAccuracy():
    '''docstring for DistanceAccuracy'''

    def process_csv(self, distance, n_workers):

        mat_distances = mp.Manager().dict()

        progress = mp.Manager().dict()

        def distances(distance, index_list, mat_distances, worker, progress):
            limit = len(index_list) - 1
            for i, row_source_ind in enumerate(index_list):

                progress[worker] = int(i / limit * 100)

                temp_distance = [float('inf')] * row_source_ind
                for row_target_ind in range(row_source_ind, self.rows):
                    dist = distance(
                        self.data[row_source_ind],
                        self.data[row_target_ind]
                    )
                    temp_distance.append(dist if dist else float('inf'))
                mat_distances[row_source_ind] = np.array(temp_distance)

        indexes_step = self.rows / n_workers

        indexes = [
            [y for z in x for y in [z, self.rows - 1 - z]]
            for x in [ list(range(
                int(indexes_step * worker / 2),
                (
                    int(indexes_step * (worker + 1) / 2) + 1
                    + int(worker == n_workers - 1)
                )
            )) for worker in range(n_workers)]
        ]

        workers = [
            mp.Process(
                target=distances,
                args=(
                    distance,
                    index_list,
                    mat_distances,
                    worker,
                    progress
                )
            )
            for worker, index_list in enumerate(indexes)
        ]

        for worker in workers:
            worker.start()

        state = None
        temp_state = None
        while True in [x.is_alive() for x in workers]:
            state = {
                'progress': np.average(progress.values()),
                'accuracy': None
            }
            if temp_state and state['progress'] != temp_state['progress']:
                yield state
            temp_state = state.copy()

        np_mat_distances = np.array(
            [
                mat_distances[i]
                for i in range(self.rows)
            ]
        )

        for i in range(self.rows):
            for j in range(i, self.rows):
                np_mat_distances[j][i] = np_mat_distances[i][j]

        r = [
            (self.labels[i], self.labels[np.argmin(x)])
            for i, x in enumerate(np_mat_distances)
        ]

        yield {
            'progress': progress.values(),
            'accuracy': sum(
                [
                    1 if i == j else 0
                    for i, j in r
                ]
            ) / float(len(r))
        }

    def read_csv(self, file_handler):
        csv_content = np.loadtxt(
            file_handler,
            delimiter=','
        )

        self.rows = csv_content.shape[0]
        self.columns = csv_content.shape[1]
        self.data = csv_content[:, 0:-1]
        self.labels = csv_content[:, -1]

def accuracies(file_handler, n_workers):
    distance_accuracy = DistanceAccuracy()
    distance_accuracy.read_csv(file_handler)

    step = 1 / len(NOT_BOOL_DISTANCES)
    for i, distance in enumerate(NOT_BOOL_DISTANCES):
        start = time.time()
        for result in distance_accuracy.process_csv(distance, n_workers):
            accuracy_progress = np.average(result.get('progress'))
            progress = step * accuracy_progress + (step * i * 100)
            yield {
                'globalProgress': progress,
                'accuracyProgress': accuracy_progress,
                'accuracyName': distance.__name__,
                'accuracyResult': result.get('accuracy'),
                'accuracyTime': time.time() - start,
                'accuracyKey': i
            }
