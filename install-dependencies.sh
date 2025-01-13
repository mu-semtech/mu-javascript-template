#!/bin/bash
source ./helpers.sh

cd /usr/src/app/
node ./merge-package-json.js
mv /tmp/package.json /usr/src/app/app/package.json
cd /usr/src/app/app/

if [ "$1" == "-clean" ]
then
  rm -rf package-lock.json node_modules
fi
npm install

# if processing exists we can take the built mu module out of it directly, we built it in an earlier step
if [ -d /usr/src/processing/built-mu ]
then
  cp -R /usr/src/processing/built-mu /usr/src/app/app/node_modules/mu
# else we need to create processing npm install and build it again
else
  mkdir -p /usr/src/processing/built-mu
  cd /usr/src/processing/
  docker-rsync /usr/src/app/. .
  npm install
  /usr/src/app/node_modules/.bin/babel \
    /usr/src/app/helpers/mu/ \
    --source-maps true \
    --out-dir /usr/src/processing/built-mu \
    --extensions ".js"

  cp -R /usr/src/processing/built-mu /usr/src/app/app/node_modules/mu
fi
