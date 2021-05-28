#! /bin/sh

# Builds sources in production
#
# We want to compare the used sources from the one available in /app
# so we can warn at runtime in case developers accidentally mount
# sources without setting the development environment variable.

# Copy sources from /app to where they can be built
cd /usr/src/app
rm -rf ./app /app.original
cp -r /app ./
cp -r /app /app.original

# Install custom packages if need be
if [ -f ./app/package.json ]
then
    npm install ./app
    rm ./app/package.json
fi

# Make the build

## Copy over template node_modules
mkdir -p /usr/src/output/node_modules
cp -R /usr/src/app/node_modules /usr/src/output/

## Build microservice sources
/usr/src/app/node_modules/.bin/babel /usr/src/app/ --ignore **/node_modules --out-dir /usr/src/output
