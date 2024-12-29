FROM debian:11.6-slim@sha256:171530d298096f0697da36b3324182e872db77c66452b85783ea893680cc1b62

RUN apt-get update && apt-get install -y python3

WORKDIR /app

COPY static static
COPY src src

EXPOSE 3000

CMD ["python3", "src/serve.py"]