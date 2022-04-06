#! /bin/sh

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

## Check if package existed and did not change since previous build (/usr/src/app/app/ is copied later in this script, at first run from the template itself it doesn't exist but that's fine for comparison)
cmp -s /app/package.json /usr/src/app/app/package.json
CHANGE_IN_PACKAGE_JSON="$?"

## Copy node_modules to temporary location so we can reuse them, this occurs when the mountend sources have a node_modules and/or on restart
rm -Rf /tmp/node_modules
mv ./app/node_modules /tmp/node_modules
## Remove app folder if exists
rm -rf ./app
mkdir ./app
mv /tmp/node_modules ./app/
## Copy app folder and config folder (including node_modules so host node_modules win)
cp -rf /app ./
mkdir -p /config/; mkdir -p ./app/config/; cp -rf /config/* ./app/config/;

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

cd /usr/src/build/
/usr/src/app/node_modules/.bin/babel-node \
    --inspect="0.0.0.0:9229" \
    ./app.js
