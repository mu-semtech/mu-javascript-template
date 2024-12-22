#!/bin/bash
source /usr/src/app/helpers.sh

if [ ! -f /data/service/package.json ]
then
    echo "No package.json found in service.  Nothing to do."
    exit 1;
fi

rm -rf /data/service/package-lock.json
mkdir -p /app
# install script expects service package.json to be in /app
cp /data/service/package.json /app/package.json
docker-rsync /data/service/ /usr/src/app/app
cd /usr/src/app
NODE_ENV=development ./install-dependencies.sh

docker-rsync /usr/src/app/app/node_modules/ /data/service/node_modules
cp /usr/src/app/app/package-lock.json /data/service/package-lock.json