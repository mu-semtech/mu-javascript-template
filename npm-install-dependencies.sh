#!/bin/bash
source ./helpers.sh

environment=$1
npm_install_command=$2

cd /usr/src/app/app/
mkdir -p /usr/src/app/app/node_modules/

# Copy service dependencies if any
if [ $environment == "development" ] && [ -d /app/node_modules/ ]
then
  docker-rsync /app/node_modules /usr/src/app/app/
fi

# Install service dependencies
if [ "$npm_install_command" == "ci" ]
then
  echo "Installing dependencies from package-lock.json"
  npm ci
  if [ "$?" != "0" ]
  then
    echo "npm ci failed. Remove package-lock.json and restart."
    exit 1 # may not exit the full template
  fi
elif [ "$npm_install_command" == "install" ]
then
  echo "Installing dependencies from package.json"
  npm install
  if [ "$?" != "0" ]
  then
    echo "npm install failed."
    exit 1 # may not exit the full template
  fi
fi

# Copy template dependencies
docker-rsync /usr/src/app/node_modules /usr/src/app/app
cp -R /usr/src/app/helpers/mu /usr/src/app/app/node_modules/mu

# Copy merged dependencies back to the mounted service folder
if [ $environment == "development" ] && [ "$npm_install_command" != "" ]
then
  docker-rsync --delete /usr/src/app/app/node_modules/ /app/node_modules
fi

# Copy package-lock.json of service dependencies back to mounted service folder
if [ $environment == "development" ] && [ "$npm_install_command" == "install" ] && [ -f /usr/src/app/app/package-lock.json ]
then
  docker-rsync /usr/src/app/app/package-lock.json /app/
fi
