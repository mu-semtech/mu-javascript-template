#!/bin/bash
source /usr/src/app/helpers.sh

mkdir -p /app
if [ -f /data/service/package.json ]
then
    # install script expects service package.json to be in /app
    cp /data/service/package.json /app/package.json
fi
docker-rsync /data/service/ /usr/src/app/app
cd /usr/src/app
NODE_ENV=development ./install-dependencies.sh

docker-rsync /usr/src/app/app/node_modules/ /data/service/node_modules
if [ -f /usr/src/app/app/package-lock.json ]
then
   cp /usr/src/app/app/package-lock.json /data/service/package-lock.json
fi
