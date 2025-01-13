#!/bin/bash
source ./helpers.sh

cd /usr/src/app/
node ./merge-package-json.js
mv /tmp/merged-package.json /usr/src/app/app/package.json
cd /usr/src/app/app/

npm install

mkdir -p /usr/src/app/app/node_modules/
cp -R /usr/src/app/helpers/mu /usr/src/app/app/node_modules/mu
