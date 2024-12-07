FROM node:20-bookworm

LABEL maintainer="team@semantic.works"

RUN apt-get update && apt-get -y upgrade && apt-get -y install git openssh-client rsync

ENV MU_SPARQL_ENDPOINT 'http://database:8890/sparql'
ENV MU_APPLICATION_GRAPH 'http://mu.semte.ch/application'
ENV NODE_ENV 'production'

ENV HOST '0.0.0.0'
ENV PORT '80'

ENV LOG_SPARQL_ALL 'true'
ENV DEBUG_AUTH_HEADERS 'true'

WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
COPY ./scripts /app/scripts
RUN npm install
COPY . /usr/src/app
RUN chmod +x /usr/src/app/run-development.sh
RUN chmod +x /usr/src/app/build-production.sh

EXPOSE ${PORT}

CMD bash boot.sh

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
