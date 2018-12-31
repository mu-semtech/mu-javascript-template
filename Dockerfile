FROM node:10.9.0

LABEL maintainer="madnificent@gmail.com"

RUN apt-get update && apt-get -y upgrade && apt-get install -y openssh-server

ENV MU_SPARQL_ENDPOINT 'http://database:8890/sparql'
ENV MU_APPLICATION_GRAPH 'http://mu.semte.ch/application'
ENV NODE_ENV 'production'

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN ln -s /app/app.js /usr/src/app/
RUN npm config set unsafe-perm true && npm install

CMD sh boot.sh

ONBUILD ADD . /app/
ONBUILD RUN if [ -f /app/on-build.sh ]; \
     then \
        echo "Running custom on-build.sh of child" \
        && chmod +x /app/on-build.sh \
        && /bin/bash /app/on-build.sh ;\
     fi
ONBUILD RUN if [ -f "/app/package.json" ]; then npm config set unsafe-perm true && npm install /app; fi
