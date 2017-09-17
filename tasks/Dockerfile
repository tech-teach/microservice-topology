FROM python:3.6
RUN apt-get update -q -y && apt-get install build-essential -q -y
ADD requirements.txt requirements.txt
RUN pip install -r requirements.txt
ADD core/requirements.txt requirements.txt
RUN pip install -r requirements.txt
ADD core/ /core
RUN pip install /core
ADD . /code
WORKDIR /code
