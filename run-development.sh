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

# Version logging
echo "Using version 20220314155209";

# Transpile everything

## target folder
cd /usr/src/output/
rm -Rf intermediate-transpilation built
mkdir intermediate-transpilation built

## coffeescript
/usr/src/app/node_modules/.bin/coffee -M -m --compile --output ./intermediate-transpilation ./app
cd ./intermediate-transpilation
for map in **/*.map
do
    # based on https://unix.stackexchange.com/questions/33486/how-to-copy-only-matching-files-preserving-subdirectories#33498
    echo "Making directory ${map%/*} and copying to ../app/$map"
    mkdir -p "../app/${map%/*}"
    cp -p -- "$map" "../app/$map"
done
cd ..

## typescript
cp -R ./app/* intermediate-transpilation


count=`ls -1 tsconfig.json 2>/dev/null | wc -l`

if [ $count != 0 ]
then 
cd ./intermediate-transpilation
/usr/src/app/node_modules/.bin/tsc
cd ..
fi

/usr/src/app/node_modules/.bin/babel \
  ./intermediate-transpilation/ \
  --source-maps true \
  --out-dir ./app/ \
  --extensions ".ts,.js"

# cp -R ./app/node_modules ./built/

# Start babel dev server
/usr/src/app/node_modules/.bin/babel-node \
    --inspect="0.0.0.0:9229" \
    ./app/app.js
