from ctypes import *
import json

NN = CDLL('./libNN.so')

for distance in range(15):
    args = ["_", "Data/tecator.csv", "8", str(distance)]
    Args = c_char_p * len(args)
    args = Args(
        *[
            c_char_p(arg.encode("utf-8"))
            for arg in args
        ]
    )

    NN.main.restype=c_char_p

    response = json.loads(
        str(
            NN.main(len(args), args)
        ).replace("'", '"')
    )

    response = {
        key.encode(): value.encode() if isinstance(value, unicode) else value
        for key, value in response.items()
    }
    print(response)
