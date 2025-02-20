#!/bin/bash
source ./helpers.sh

####
#### BUILDS SOURCES
####
#### Expects sources to be in /usr/src/app/ with the app in
#### /usr/src/app/app/ and stores the resulting build in /usr/src/dist

###
# PREPARE FOLDERS
###

# NOTE: We don't clean a starting state because we can incrementally update the
# previous build

# Prepare the build folder if it doesn't exist yet
mkdir -p /usr/src/dist

# Copy app from /usr/src/app/app/ sources without package.json, which we want to
# skip as it would conflict building sources.
docker-rsync --exclude node_modules --delete /usr/src/app/app/ /usr/src/dist
rm -f /usr/src/dist/package.json

############################
# CoffeeScript Transpilation
############################

## Coffeescript is transpiled ready for nodejs.  This is then moved into app so
## we have the javascript available which other preprocessors may expect to
## exist.
##
## In order to transpile correctly we need the node_modules for babel and the
## babelrc file.  We temporarily move those around.
cp /usr/src/app/babel.config.json /usr/src/dist/

# make the build and move to coffeescript-transpilation `-m` for external
# sourcemaps `-M` for inlined maps.  Hence -m -M will generate both.

# Set the NODE_PATH environment variable so we don't have to assume the
# node_modules for coffeescript transpilation are available in this folder.  We
# need these for the babel plugins in babel.config.json

# We transpile from . so we have a nice folder mentioned in the inlined SourceMap
pushd /usr/src/dist/ > /dev/null
NODE_PATH="/usr/src/app/node_modules/" /usr/src/app/node_modules/.bin/coffee -M --compile -t .
popd > /dev/null

# clean up
rm /usr/src/dist/babel.config.json


##################################
# TypeScript and ES6 transpilation
##################################

## TypeScript and ES6
##
## Transpiles TypeScript and ES6 to something nodejs wants to run.
#
# --source-maps both would give both separate sourcemaps and inline sourcemaps
# but makes Chromium unhappy.  Set to inline to only get inline sourcemaps and
# make Chromium happy.  Set to true to get external sourcemaps.

# We transpile from . so we have a nice folder mentioned in the inlined SourceMap
pushd /usr/src/dist > /dev/null
NODE_PATH="/usr/src/app/node_modules/" /usr/src/app/node_modules/.bin/babel \
  . \
  --out-dir . \
  --source-maps inline \
  --config-file "/usr/src/app/babel.config.json" \
  --extensions ".ts,.js"
popd > /dev/null

##############
# Node modules
##############

## merged template and app modules with mu module
docker-rsync --delete /usr/src/app/app/node_modules /usr/src/dist/
docker-rsync /usr/src/app/app/package.json /usr/src/dist/package.json
