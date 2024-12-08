#!/bin/bash
source /usr/src/app/helpers.sh

if [ ! -f /data/service/package.json ]
then
    echo "No package.json found in service.  Nothing to do."
    exit 1;
fi

echo "Removing node_modules from service"
cd /data/service/
rm -rf node_modules

echo "Running template npm install"
cd /usr/src/app/
rm -rf /usr/src/app/node_modules

npm install

echo "Moving service code"
# move our service code to the app folder. In theory we only need the package.json and package-lock.json files
docker-rsync /data/service/ /usr/src/app/app/
rm -rf /usr/src/app/app/node_modules

# sync the node modules of template to service directory.
# do this after we took the service code to not take them with us
docker-rsync /usr/src/app/node_modules /data/service/

cd /usr/src/app/app/

echo "Running service npm install"
npm install

# sync the node modules of app to service directory
docker-rsync /usr/src/app/app/node_modules/ /data/service/node_modules/

cd /usr/src/app/

echo "Generating mu module"

mkdir /usr/src/app/built-mu
/usr/src/app/node_modules/.bin/babel \
  /usr/src/app/helpers/mu/ \
  --source-maps true \
  --out-dir /usr/src/app/built-mu \
  --extensions ".js"

cp -R /usr/src/app/built-mu /data/service/node_modules/mu
