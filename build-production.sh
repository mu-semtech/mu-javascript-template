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
mkdir -p /config; mkdir -p ./app/config; cp -rf /config/* ./app/config/ 2> /dev/null
cp -r /app /app.original
cp -r /config /config.original

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


count=`ls -1 tsconfig.json 2>/dev/null | wc -l`

if [ $count != 0 ]
then 
/usr/src/app/node_modules/.bin/tsc
fi

## Build microservice sources
/usr/src/app/node_modules/.bin/babel /usr/src/app/ \
     --ignore app/node_modules,node_modules \
     --copy-files --no-copy-ignored \
     --out-dir /usr/src/output \
     --extensions ".ts,.js"
