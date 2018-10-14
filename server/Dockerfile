FROM python:3.6.6-alpine3.8 as pipenv
WORKDIR /app
RUN pip install pipenv
COPY Pipfile Pipfile.lock ./
RUN pipenv lock -r | tee requirements.txt

FROM python:3.6.6-alpine3.8
WORKDIR /app
COPY --from=pipenv /app/requirements.txt .
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev
RUN pip install -r requirements.txt
COPY . .
CMD python main.py
