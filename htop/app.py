import multiprocessing

from psutil import cpu_percent, cpu_freq, virtual_memory

from sanic.response import json
from sanic import Sanic

from sanic_cors import CORS


app = Sanic(__name__)
CORS(app)
core_count = multiprocessing.cpu_count()


def get_cpu_info():
    cpu_percents = list(cpu_percent(interval=0.5, percpu=True))
    cpu_frequencies = list(cpu_freq(percpu=True))
    cpu_info = [
        {
            'percent': cpu_percents[i],
            'frequency': {
                'current': cpu_frequencies[i].current if i < len(cpu_frequencies) else 0,
                'min': cpu_frequencies[i].min if i < len(cpu_frequencies) else 0,
                'max': cpu_frequencies[i].max if i < len(cpu_frequencies) else 0
             }
        }
        for i in range(len(cpu_percents))
    ]
    return cpu_info


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
        'interval': 0.3
    })

@app.route('/htop/corecount', methods=['GET', 'OPTIONS'])
async def cpu_cores(request):
    return json({'coreCount': core_count})

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=80
    )
