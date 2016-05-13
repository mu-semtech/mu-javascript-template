FROM node:latest

ENV NODE_ENV production
ENV PORT 3000
ENV MU_SPARQL_ENDPOINT 'http://database:8890/sparql'
ENV MU_APPLICATION_GRAPH 'http://mu.semte.ch/application'

EXPOSE 3000

COPY package.json .babelrc /app/
WORKDIR /app

RUN npm set progress=false
RUN npm install

COPY src /app/src

CMD ["npm", "run", "start"]

ONBUILD ADD package.json .babelrc /app/
ONBUILD RUN npm install
ONBUILD ADD src /app/src
