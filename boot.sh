#!/bin/bash
if [ "$NODE_ENV" == "development" ]
then
    # Run live-reload development
    exec /usr/src/app/node_modules/.bin/nodemon \
         --watch /app \
         --watch /config \
         --ext js,coffee,ts,mjs,cjs,json \
         --exec /usr/src/app/run-development.sh
elif [ "$NODE_ENV" == "production" ]
then
    /usr/src/app/run-production.sh
fi
