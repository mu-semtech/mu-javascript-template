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




## Copy over template node_modules
mkdir -p /usr/src/output/node_modules
cp -R /usr/src/app/node_modules /usr/src/output/

cp -R /usr/src/app /usr/src/intermediate-transpilation


cd /usr/src/intermediate-transpilation



# typescript compiler run
count=`ls -1 tsconfig.json 2>/dev/null | wc -l`

if [ $count != 0 ]
then 
/usr/src/app/node_modules/.bin/tsc
fi

## coffeescript
/usr/src/app/node_modules/.bin/coffee -M -m --compile --output ./app ./app
# cd ./intermediate-transpilation
# for map in **/*.map
# do
#     # based on https://unix.stackexchange.com/questions/33486/how-to-copy-only-matching-files-preserving-subdirectories#33498
#     echo "Making directory ${map%/*} and copying to ../app/$map"
#     mkdir -p "../app/${map%/*}"
#     cp -p -- "$map" "../app/$map"
# done
# cd ..


# Build microservice sources from js and ts
/usr/src/app/node_modules/.bin/babel . \
     --ignore app/node_modules,node_modules \
     --copy-files --no-copy-ignored \
     --out-dir /usr/src/output \
     --extensions ".ts,.js"

