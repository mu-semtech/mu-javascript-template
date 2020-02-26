FROM node:12.16.1-alpine

LABEL maintainer="madnificent@gmail.com"

RUN apk update && apk upgrade && apk add --no-cache bash git openssh

ENV MU_SPARQL_ENDPOINT 'http://database:8890/sparql'
ENV MU_APPLICATION_GRAPH 'http://mu.semte.ch/application'
ENV NODE_ENV 'production'

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm config set unsafe-perm true && npm install
RUN chmod +x ./run.sh

CMD sh boot.sh

ONBUILD ADD . /app/
ONBUILD RUN if [ -f /app/on-build.sh ]; \
     then \
        echo "Running custom on-build.sh of child" \
        && chmod +x /app/on-build.sh \
        && /bin/bash /app/on-build.sh ;\
     fi