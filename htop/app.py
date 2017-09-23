from psutil import cpu_percent, cpu_freq, virtual_memory

from sanic.response import json
from sanic import Sanic

from sanic_cors import CORS


app = Sanic(__name__)
CORS(app)


def get_cpu_info():
    cpu_info = {
        'percent': cpu_percent(interval=0.5, percpu=True),
        'frequency': [
            {
                'current': freq.current,
                'min': freq.min,
                'max': freq.max
            }
            for freq in cpu_freq(percpu=True)
        ]
    }

    return [dict(zip(cpu_info, col)) for col in zip(*cpu_info.values())]

def get_memory_info():
    memory_info = virtual_memory()
    return {
        'free': memory_info.free,
        'used': memory_info.used,
        'percent': memory_info.percent
    }


@app.route('/htop', methods=['GET', 'OPTIONS'])
async def cpu(request):
    """
    Retrieves the cpu percentage in an interval of time.
    """

    if request.method == 'OPTIONS':
        return json({})

    return json({
        'cpu': get_cpu_info(),
        'memory': get_memory_info(),
        'interval': 0.5
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
