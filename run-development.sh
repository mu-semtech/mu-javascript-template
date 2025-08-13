#!/bin/bash
sleep 0.1
SERVICE_STATUS=$(cat /tmp/service-status.lock)
if [ "$SERVICE_STATUS" == "exit_after_compile" ]
then
  echo "More changed files detected during compilation. Continuing compilation and scheduling another compile run."
  exit 0
fi

trap '{ SERVICE_STATUS=$(cat /tmp/service-status.lock); if [ $SERVICE_STATUS == "compiling" ]; then echo "exit_after_compile" > /tmp/service-status.lock; elif [ $SERVICE_STATUS == "running" ]; then exit 0; fi }' SIGUSR2 > /dev/null 2>&1

echo "compiling" > /tmp/service-status.lock

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

## Check if package.json existed and did not change since previous build (at
## first run from the template itself it doesn't exist but that's fine for
## comparison)
if [ ! -f /tmp/dependencies-installed-once-for-dev ]
then
    IS_FIRST_RUN=true
else
    IS_FIRST_RUN=false
fi

cmp -s /app/package.json /tmp/last-build-service-package.json
if [ "$?" == "1" ] && [ $IS_FIRST_RUN == false ]
then
  PACKAGE_JSON_CHANGED=true
else
  PACKAGE_JSON_CHANGED=false
fi

if [ -f /app/package.json ]
then
    cp /app/package.json /tmp/last-build-service-package.json
fi

HAS_PACKAGE_LOCK=([ -f /app/package-lock.json ])

## Ensure we _sync_ the sources from the hosted app withouth the node_modules.
## These are handled at a later stage when dependencies are installed.
##
## We don't want to do --delete on the node_modules because this allows us
## to depend on the node_modules installed in an earlier update cycle as well as
## taking node_modules from the hosted app into account.
##
## Although we can always override the mu package, we may install the
## node_modules in the template, or the node_modules may be offered in part or
## in full.  Hence we should only add the node_modules of the mounted code and
## not remove anything.
docker-rsync --delete --exclude node_modules /app/ /usr/src/app/app/

## Copy config folder
if [[ "$(ls -A /config/ 2> /dev/null)" ]]
then
    mkdir -p ./app/config/
    cp -rf /config/* ./app/config/
fi

# Determine npm command and install dependencies
if [ -f /app/package.json ]
then
  if $IS_FIRST_RUN
  then
    if $HAS_PACKAGE_LOCK
    then
      npm_install_command=ci
    else
      npm_install_command=install
    fi
  elif $PACKAGE_JSON_CHANGED
  then
    npm_install_command=install
  fi
fi
./npm-install-dependencies.sh development $npm_install_command
./validate-package-json.sh
touch /tmp/dependencies-installed-once-for-dev

###############
# Transpilation
###############

./transpile-sources.sh

cp /usr/src/app/helpers/mu/package.json /usr/src/dist/node_modules/mu/

##############
# Start server
##############
SERVICE_STATUS=$(cat /tmp/service-status.lock)
if [ "$SERVICE_STATUS" == "exit_after_compile" ]
then
  echo "" > /tmp/service-status.lock
  touch /tmp/service-restart
  exit 0
else
  echo "running" > /tmp/service-status.lock
  cd /usr/src/dist/
  node \
    --inspect="0.0.0.0:9229" \
    ./start-server.js
fi
