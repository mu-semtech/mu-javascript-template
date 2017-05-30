#! /bin/sh

## Install new dependencies
npm install /app
npm install

if [ "$NODE_ENV" == "production" ]; 
then 
    ./node_modules/supervisor/lib/cli-wrapper.js \
        -i . \
        -k --ignore-symlinks \
        -x sh start.sh
else
    ./node_modules/supervisor/lib/cli-wrapper.js \
        -w /usr/src/app,/app \
        -i /usr/src/app/node_modules,/usr/src/app/helpers,/app/node_modules \
        -e .js \
        -k --ignore-symlinks \
        -x sh start.sh
fi
