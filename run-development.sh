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

# Transpile everything

## target folder
cd /usr/src/output/
rm -Rf coffeescript-transpilation typescript-transpilation built
mkdir coffeescript-transpilation typescript-transpilation built

## coffeescript
cp -R ./app/* ./built
/usr/src/app/node_modules/.bin/coffee -M -m --compile -t --output ./coffeescript-transpilation ./built

cd ./coffeescript-transpilation
for file in **/*
do
    # based on https://unix.stackexchange.com/questions/33486/how-to-copy-only-matching-files-preserving-subdirectories#33498
    echo "Making directory ${file%/*} and copying to ../app/$file"
    mkdir -p "../app/${file%/*}"
    cp -p -- "$file" "../app/$file"
done
cd ..

## typescript

echo "copying"

cp -R ./app/* typescript-transpilation

# count=`ls -1 tsconfig.json 2>/dev/null | wc -l`

# if [ $count != 0 ]
# then
#     echo "Running tsc"
#     cd ./typescript-transpilation
#     /usr/src/app/node_modules/.bin/tsc --sourcemap
#     cd ..
# fi

echo "Babel 1"

rm -Rf built
mv typescript-transpilation built
mkdir typescript-transpilation

/usr/src/app/node_modules/.bin/babel \
  ./built/ \
  --out-dir ./typescript-transpilation/ \
  --source-maps true \
  --extensions ".ts,.js"

rm -Rf built
mv typescript-transpilation built

cd ./coffeescript-transpilation
for file in **/*
do
    # based on https://unix.stackexchange.com/questions/33486/how-to-copy-only-matching-files-preserving-subdirectories#33498
    echo "Making directory ${file%/*} and copying to ../built/$file (again)"
    mkdir -p "../built/${file%/*}"
    cp -p -- "$file" "../built/$file"
done
cd ..

echo "Babel 2"
mkdir built-mu
/usr/src/app/node_modules/.bin/babel \
  /usr/src/output/helpers/mu/ \
  --source-maps true \
  --out-dir ./built-mu \
  --extensions ".js"

cp -R ./app/node_modules ./built/
cp -R ./built-mu ./built/node_modules/mu

echo "Node"

# Start babel dev server
cd built
/usr/src/app/node_modules/.bin/babel-node \
    --inspect="0.0.0.0:9229" \
    ./app.js
