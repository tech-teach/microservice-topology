FROM python:3.6
RUN apt-get update -q -y && apt-get install build-essential -q -y
ADD . /code
WORKDIR code
RUN pip install -r requirements.txt
RUN pip install .