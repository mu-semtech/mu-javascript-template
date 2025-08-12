#!/bin/bash

# Builds sources in production
#
# We want to compare the used sources from the one available in /app
# so we can warn at runtime in case developers accidentally mount
# sources without setting the development environment variable.

# Copy sources from /app to where they can be built
cd /usr/src/app
rm -rf ./app /app.original
cp -r /app ./

mkdir -p /config /config.original

if [[ "$(ls -A /app/config/ 2> /dev/null)" ]]
then
    cp -r /app/config/* /config.original/
    cp -r /app/config/* /config/
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
