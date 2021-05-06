FROM node:14.16.1-alpine

LABEL maintainer="madnificent@gmail.com"

RUN apk update && apk upgrade && apk add --no-cache bash git openssh

ENV MU_SPARQL_ENDPOINT 'http://database:8890/sparql'
ENV MU_APPLICATION_GRAPH 'http://mu.semte.ch/application'
ENV NODE_ENV 'production'

ENV LOG_SPARQL_ALL 'true'
ENV DEBUG_AUTH_HEADERS 'true'

WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
COPY ./scripts /app/scripts
RUN npm config set unsafe-perm true && npm install
COPY . /usr/src/app
RUN chmod +x /usr/src/app/run-development.sh
RUN chmod +x /usr/src/app/build-production.sh

CMD sh boot.sh

# This stuff only runs when building an image from the template
ONBUILD RUN rm -Rf /app/scripts
ONBUILD ADD . /app/
ONBUILD RUN /usr/src/app/build-production.sh

ONBUILD RUN if [ -f /app/on-build.sh ]; \
     then \
        echo "Running custom on-build.sh of child" \
        && chmod +x /app/on-build.sh \
        && /bin/bash /app/on-build.sh ;\
     fi
