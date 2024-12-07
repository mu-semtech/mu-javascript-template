#!/bin/bash

source ./helpers.sh

# We want to run from /app but don't want to touch that folder.
#
# - node_modules which were already available in the mounted sources
# should be taken into account but shouldn't be overwritten by a
# following npm install.
#
# - Only run npm install when the package.json has changed.

# Move to right folder
cd /usr/src/app/



######################
# Install dependencies
######################

## Check if package.json existed and did not change since previous build (/usr/src/app/app/ is copied later in this script, at first run from the template itself it doesn't exist but that's fine for comparison)
cmp -s /app/package.json /usr/src/app/app/package.json
CHANGE_IN_PACKAGE_JSON="$?"

## Ensure we _sync_ the sources from the hosted app and _copy_ the node_modules.
##
## We don't want to do --delete on the node_modules because this allows us
## to depend on the node_modules installed in an earlier update cycle as well as
## taking node_modules from the hosted app into account.
docker-rsync --delete --exclude node_modules /app/ /usr/src/app/app/
if [ -d /app/node_modules/ ]
then
    docker-rsync /app/node_modules /usr/src/app/app/
fi

## Copy config folder
if [[ "$(ls -A /config/ 2> /dev/null)" ]]
then
    mkdir -p ./app/config/
    cp -rf /config/* ./app/config/
fi

## Install dependencies on first boot
if [ $CHANGE_IN_PACKAGE_JSON != "0" ] && [ -f ./app/package.json ]
then
    echo "Running npm install"
    cd /usr/src/app/app/
    npm install
    cd /usr/src/app/
fi



###############
# Transpilation
###############

./transpile-sources.sh



##############
# Start server
##############

cd /usr/src/dist/
if [ "$NO_BABEL_NODE" == "true" ]
then
    echo "running without babel-node"
    node \
        --inspect="0.0.0.0:9229" \
        ./app.js
else
    /usr/src/app/node_modules/.bin/babel-node \
        --enable-source-maps \
        --inspect="0.0.0.0:9229" \
        ./app.js
fi
