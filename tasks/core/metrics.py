"""
Get some accuracies.
"""


# external libraries
from sklearn.metrics import pairwise, accuracy_score
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

NOT_BOOL_METRICS = [
    'minkowski',
    'manhattan',
    'euclidean',
    'chebyshev',
    lagrange,
    'canberra',
    lance_williams,
    soergel,
    clark,
    matusia,
    wave_edges,
    jaccard_tanimoto,
    'hamming',
    'cosine',
    'cityblock',
    'braycurtis',
    'correlation',
    'mahalanobis',
    # 'l2',
    # 'l1',
    # 'seuclidean',
    # 'sqeuclidean',
]

def accuracies(file_handler, n_workers):
    """
    Get a set of accuracies from a file.
    """

    try:
        csv_content = np.loadtxt(
            file_handler,
            delimiter=","
        )
    except ValueError as error:
        raise FileReadError(error)

    data = csv_content[:, 0:-1]
    labels = csv_content[:, -1]

    results = dict()

    for metric in NOT_BOOL_METRICS:
        matrix_distances = pairwise.pairwise_distances(
            data,
            metric=metric,
            n_jobs=n_workers  # Number of workers
        )

        # Replace zeros by infinity
        # matrix_distances[matrix_distances == 0.0] = float("inf")
        np.fill_diagonal(matrix_distances, float("inf"))

        supposed_labels = np.array(
            [labels[np.argmin(x)] for x in matrix_distances]
        )

        name = metric if isinstance(metric, str) else metric.__name__
        results[name] = accuracy_score(labels, supposed_labels)

    return results
