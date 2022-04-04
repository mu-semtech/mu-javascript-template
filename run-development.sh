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

## Copy node_modules to temporary location so we can reuse them
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
    npm install ./app
fi

## Remove package to avoid babel and imports breaking (temporary move)
cp ./app/package.json /tmp/package.json
rm -f ./app/package.json

## Copy to common /usr/src/processing folder
rm -Rf /usr/src/processing
cp -R /usr/src/app /usr/src/processing

## Put back the package.json for a next run
cp /tmp/package.json ./app/package.json


###############
# Transpilation
###############

## Target folder
cd /usr/src/processing/ # the default place to start from

## CoffeeScript
##
## Coffeescript is transpiled ready for nodejs.  This is then moved into
## app so we have the javascript available which other preprocessors may
## expect to exist.
##
## In order to generate the sourcemaps correctly, it seems we have to be
## next to the folder where we want the sources to land, but in order to
## transpile correctly we also need the node_modules for babel and the
## babelrc file.  We temporarily move those around.

cd /usr/src

# prepare the build folders
mkdir /usr/src/build /usr/src/build.coffee
cp -R /usr/src/processing/app/* /usr/src/build/
cp /usr/src/processing/babel.config.json /usr/src/
cp -R /usr/src/processing/node_modules/ /usr/src/

# make the build and move to coffeescript-transpilation
/usr/src/app/node_modules/.bin/coffee -M -m --compile -t --output ./build.coffee/ ./build
mv build.coffee/ /usr/src/processing/coffeescript-transpilation

# clean up
rm -Rf /usr/src/build /usr/src/node_modules/
rm /usr/src/babel.config.json
cd /usr/src/processing/


## TypeScript and ES6
##
## Transpiles TypeScript and ES6 to something nodejs wants to run.
mkdir typescript-transpilation build
cp -R ./app/* build

cd coffeescript-transpilation
find . -type d -exec mkdir -p ../build/{} \;
find . -type f -exec cp "{}" ../build/{} \;
cd ..

# count=`ls -1 tsconfig.json 2>/dev/null | wc -l`

# if [ $count != 0 ]
# then
#     echo "Running tsc"
#     cd ./typescript-transpilation
#     /usr/src/app/node_modules/.bin/tsc --sourcemap
#     cd ..
# fi

/usr/src/app/node_modules/.bin/babel \
  ./build/ \
  --out-dir ./typescript-transpilation/ \
  --source-maps true \
  --extensions ".ts,.js"

rm -Rf ./build
mv typescript-transpilation /usr/src/build

# We move the coffeescript files again because the previous step will
# have built the sources coffeescript generated, but these sources were
# already node compliant.  We could make coffeescript emit ES6 and
# transpile them to nodejs in this step, but that breaks SourceMaps.
cd coffeescript-transpilation
find . -type d -exec mkdir -p /usr/src/build/{} \;
find . -type f -exec cp "{}" /usr/src/build/{} \;
cd ..


##############
# Node modules
##############

## template modules
cp -R /usr/src/processing/node_modules /usr/src/build/

## app modules
if [ -d /usr/src/processing/app/node_modules ]
then
    cd /usr/src/processing/app/
    find node_modules/ -type d -exec mkdir -p /usr/src/build/{} \;
    find node_modules/ -type f -exec cp "{}" /usr/src/build/{} \;
fi

## mu helpers
cd /usr/src/processing/
mkdir /usr/src/processing/built-mu
/usr/src/app/node_modules/.bin/babel \
  /usr/src/processing/helpers/mu/ \
  --source-maps true \
  --out-dir /usr/src/processing/built-mu \
  --extensions ".js"

cp -R /usr/src/processing/built-mu /usr/src/build/node_modules/mu

# tail -f /dev/null


##############
# Start server
##############

cd /usr/src/build/
/usr/src/app/node_modules/.bin/babel-node \
    --inspect="0.0.0.0:9229" \
    ./app.js
