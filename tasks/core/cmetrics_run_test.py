from ctypes import *
import json
import ast

NN = CDLL('./libNN.so')

for distance in range(15):
    file_rows = open("Data/tecator.csv", 'r').read().split('\n')
    file_content = [
        float(value)
        for row in file_rows
        for value in row.split(',')
        if value != ''
    ]

    numfil = len(file_rows) - 1
    numcol = len(file_rows[0].split(','))

    file_content_c = (
        (c_float * len(file_content))(*file_content)
    )

    NN.main.restype=c_char_p
    print(NN.main(8, distance, file_content_c, numfil, numcol))

    '''
    NN.main.restype=c_char_p

    response = json.loads(
        str(
            NN.main(8, 0, file_content_c)
        ).replace("'", '"')
    )

    response = {
        key.encode(): value.encode() if isinstance(value, unicode) else value
        for key, value in response.items()
    }

    print(response)
    '''