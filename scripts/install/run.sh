#!/bin/bash
source /usr/src/app/helpers.sh

# if first arg is clean, remove package-lock
if [ "$1" == "-clean" ]
then
    rm -rf /data/service/package-lock.json
fi
mkdir -p /app
if [ -f /data/service/package.json ]
then
    # install script expects service package.json to be in /app
    cp /data/service/package.json /app/package.json
fi
docker-rsync /data/service/ /usr/src/app/app
cd /usr/src/app
NODE_ENV=development ./install-dependencies.sh $1

docker-rsync /usr/src/app/app/node_modules/ /data/service/node_modules
cp /usr/src/app/app/package-lock.json /data/service/package-lock.json
