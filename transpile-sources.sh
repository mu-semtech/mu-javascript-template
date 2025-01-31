#!/bin/bash
source ./helpers.sh

####
#### BUILDS SOURCES
####
#### Expects sources to be in /usr/src/app/ with the app in
#### /usr/src/app/app/ and stores the resulting build in /usr/src/build

# Clean starting state
rm -Rf /usr/src/processing /usr/src/build

# Copy template (/usr/src/app/) and app (/usr/src/app/app/) sources
# without package.json, which we want to skip as it would conflict
# building sources.

cp -R /usr/src/app /usr/src/processing
rm -f /usr/src/processing/app/package.json


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

cd /usr/src/

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

## TypeScript and ES6
##
## Transpiles TypeScript and ES6 to something nodejs wants to run.
cd /usr/src/processing/

mkdir build dist
cp -R /usr/src/processing/app/* /usr/src/processing/build

docker-rsync /usr/src/processing/coffeescript-transpilation/ /usr/src/processing/build/

# We don't need the --config-file option but this helps discovery
/usr/src/app/node_modules/.bin/babel \
  ./build/ \
  --out-dir ./dist/ \
  --source-maps true \
  --config-file "/usr/src/app/babel.config.json" \
  --extensions ".ts,.js"

mkdir -p /usr/src/dist
rm -Rf /usr/src/dist/*
mv /usr/src/processing/dist/* /usr/src/dist/

# We move the coffeescript files again because the previous step will
# have built the sources coffeescript generated, but these sources were
# already node compliant.  We could make coffeescript emit ES6 and
# transpile them to nodejs in this step, but that breaks SourceMaps.
docker-rsync /usr/src/processing/coffeescript-transpilation/ /usr/src/dist/

# We move all unhandled files (non js, ts, coffee) into dist from where they'll run
docker-rsync \
    --exclude '*.js' \
    --exclude '*.ts' \
    --exclude '*.coffee' \
    --exclude 'node_modules/' \
    --exclude './Dockerfile' \
    /usr/src/processing/app/ /usr/src/dist/

# Move the original sources so the original paths of the sourcemaps resolve (these are relative paths from
# /usr/src/dist/ to ../build/
docker-rsync \
    --exclude "node_modules/" \
    --exclude "./Dockerfile" \
    /usr/src/processing/app/ /usr/src/build/

##############
# Node modules
##############
cd /usr/src/processing/

## merged template and app modules with mu module
docker-rsync /usr/src/app/app/node_modules /usr/src/dist/
docker-rsync /usr/src/app/app/package.json /usr/src/dist/package.json

## Clean temporary folders
rm -Rf /usr/src/processing

cd /usr/src/
