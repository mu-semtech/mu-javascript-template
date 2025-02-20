#!/bin/bash
cd /usr/src/app/app/
if [ -f "/usr/src/app/app/package.json" ]
then
    if [[ "$1" == "production" ]] && [ -f "/usr/src/app/app/package-lock.json" ]
    then
        echo "Installing dependencies in ci mode"
        npm ci
    else
        echo "Installing dependencies from package.json"
        npm install
    fi
fi

mkdir -p /usr/src/app/app/node_modules/
cp -R /usr/src/app/helpers/mu /usr/src/app/app/node_modules/mu
