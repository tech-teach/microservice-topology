FROM python:3.6
ADD . /code
WORKDIR /code
RUN apt-get update -q -y && apt-get install build-essential -q -y
RUN pip install -r requirements.txt
