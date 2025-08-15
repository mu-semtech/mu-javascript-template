#!/bin/bash
echo "NOTE: running your service in development will auto-update node_modules and package-lock.json"

# this script runs from a clean slate, the app hasn't ran yet so /usr/src/app/app is empty
docker-rsync /app /usr/src/app/app
cd /usr/src/app
if [ -f /app/package-lock.json ]
then
    ./npm-install-dependencies.sh development ci
else
    ./npm-install-dependencies.sh development install
fi

./validate-package-json.sh

# copy results into the service's source folder
docker-rsync /usr/src/app/app/node_modules/ /app/node_modules

if [ -f /usr/src/app/app/package-lock.json ]
then
   cp /usr/src/app/app/package-lock.json /app/package-lock.json
fi

echo "NOTE: running your service in development will auto-update node_modules and package-lock.json"
