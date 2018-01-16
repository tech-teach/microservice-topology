from setuptools import setup
import metrics


setup(
    name='metrics',
    version=metrics.__version__,
    author='Daniel Stiven Valencia',
    author_email='dsvalenciah@gmail.com',
    py_modules=['metrics'],
    install_requires=[
        'numpy',
        'scipy',
    ],
    url='https://github.com/tech-teach/microservice-topology',
    description='A metric accuracy meter.',
)
