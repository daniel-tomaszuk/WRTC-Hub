FROM python:3.8.2-slim

ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
ENV WORKDIR .
ENV APPSOURCEDIR "./app"
WORKDIR ${WORKDIR}
COPY ${APPSOURCEDIR} .

RUN pip install -r ./requirements/dev.txt
RUN pip install -r ./requirements/requirements.txt
RUN chmod 755 ./entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["./app/entrypoint.sh"]
