FROM node:6

# Fix for "EXDEV: cross-device link not permitted", see https://github.com/npm/npm/issues/9863
RUN cd $(npm root -g)/npm && npm install fs-extra && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js

ENV NODE_ENV production
ENV PORT 3000
ENV MU_SPARQL_ENDPOINT 'http://database:8890/sparql'
ENV MU_APPLICATION_GRAPH 'http://mu.semte.ch/application'

EXPOSE 3000

COPY package.json .babelrc server.js /app/
COPY helpers /app/helpers
WORKDIR /app

RUN npm set progress=false
RUN npm install

COPY src /app/src

CMD ["npm", "run", "start"]

ONBUILD ADD package.json .babelrc /app/
ONBUILD RUN npm install
ONBUILD ADD src /app/src
