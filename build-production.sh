#!/bin/bash

# Builds sources in production
#
# We want to compare the used sources from the one available in /app
# so we can warn at runtime in case developers accidentally mount
# sources without setting the development environment variable.

source ./helpers.sh

# Copy sources from /app to where they can be built
cd /usr/src/app
rm -rf ./app /app.original

docker-rsync --delete --exclude node_modules /app/ /usr/src/app/app/

# Ship the default configuration in /config for services reading it directly.
# run-production.sh only applies /config when it differs from these defaults.
mkdir -p /config
if [[ "$(ls -A /app/config/ 2> /dev/null)" ]]
then
    cp -r /app/config/. /config/
fi

cp -r /app /app.original

# Install custom packages if need be
# Determine npm command and install dependencies
if [ -f /app/package.json ]
then
  if [ -f /app/package-lock.json ]
  then
    npm_install_command=ci
  else
    npm_install_command=install
  fi
fi
./npm-install-dependencies.sh production $npm_install_command
./validate-package-json.sh

./transpile-sources.sh

# Allow running as an arbitrary user in the root group (e.g. OpenShift), which
# needs write access for development mode only.
chgrp -R 0 /usr/src/app/app /usr/src/dist && chmod -R g=u /usr/src/app/app /usr/src/dist
