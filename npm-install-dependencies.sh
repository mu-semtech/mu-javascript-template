#!/bin/bash
cd /usr/src/app/app/
if [ -f "/usr/src/app/app/package.json" ]
then
    echo "Installing dependencies from package.json"
    npm install
fi

mkdir -p /usr/src/app/app/node_modules/
cp -R /usr/src/app/helpers/mu /usr/src/app/app/node_modules/mu
