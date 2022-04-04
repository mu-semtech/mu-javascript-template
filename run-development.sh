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

# Check if package existed and did not change since previous build
cmp -s /app/package.json /usr/src/app/app/package.json
CHANGE_IN_PACKAGE_JSON="$?"

# Copy node_modules to temporary location so we can reuse them
rm -Rf /tmp/node_modules
mv ./app/node_modules /tmp/node_modules
# Remove app folder if exists
rm -rf ./app
mkdir ./app
mv /tmp/node_modules ./app/
# Copy app folder and config folder (including node_modules so host node_modules win)
cp -rf /app ./
mkdir -p /config/; mkdir -p ./app/config/; cp -rf /config/* ./app/config/;

# Install dependencies on first boot
if [ $CHANGE_IN_PACKAGE_JSON != "0" ] && [ -f ./app/package.json ]
then
    echo "Running npm install"
    npm install ./app
fi

# Remove package to avoid babel and imports breaking (temporary move)
cp ./app/package.json /tmp/package.json
rm -f ./app/package.json

# Copy to common /usr/src/output folder
rm -Rf /usr/src/output
cp -R /usr/src/app /usr/src/output

# Put back the package.json for a next run
cp /tmp/package.json ./app/package.json

# Start babel dev server
cd /usr/src/output
/usr/src/app/node_modules/.bin/babel-node --inspect=0.0.0.0:9229 ./app/app.js
