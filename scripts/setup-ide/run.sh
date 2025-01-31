#!/bin/bash
source /usr/src/app/helpers.sh

# mkdir -p /app
# if [ -f /data/service/package.json ]
# then
#     # install script expects service package.json to be in /app
#     cp /data/service/package.json /app/package.json
# fi

# this script runs from a clean slate, the app hasn't ran yet so /usr/src/app/app is empty
docker-rsync /app /usr/src/app/app
cd /usr/src/app
./prepare-package-json.sh
./npm-install-dependencies.sh

# copy results into the service's source folder
docker-rsync /usr/src/app/app/node_modules/ /app/node_modules
# TODO: this should be behind an ENV var and should be updated when running development so it's kept up-to-date.  It may be that this requires us to have the node_modules locally but only saving in this case makes it feel a bit brittle
if [ -f /usr/src/app/app/package-lock.json ]
then
   cp /usr/src/app/app/package-lock.json /app/package-lock.json
fi
