#!/bin/bash

####
#### BUILDS SOURCES
####
#### Expects sources to be in /usr/src/app/ with the app in
#### /usr/src/app/app/ and stores the resulting build in /usr/src/build


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

