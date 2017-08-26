# internal libraries
import multiprocessing
from time import time
import csv
import sys

# external libraries
from sklearn.metrics import pairwise, accuracy_score
import numpy as np

NOT_BOOL_METRICS = [
    'euclidean',
    'l2',
    'l1',
    'manhattan',
    'minkowski',
    'canberra',
    'cosine',
    'cityblock',
    'braycurtis',
    'chebyshev',
    'correlation',
    'hamming',
    'mahalanobis',
    'seuclidean',
    'sqeuclidean',
    # "wminkowski"
]

BOOL_METRIC = [
    'dice',
    'jaccard',
    'kulsinski',
    'matching',
    'rogerstanimoto',
    'russellrao',
    'sokalmichener',
    'sokalsneath',
    'yule',
]


def get_accuracy(file_handler, n_workers):
    accuracy_list = []

    csv_content = np.loadtxt(
        file_handler,  # Csv file to process
        delimiter=","
    )

    data = csv_content[:, 0:-1]
    labels = csv_content[:, -1]

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

        accuracy = accuracy_score(labels, supposed_labels)

        accuracy_list.append(accuracy)

    return accuracy_list
