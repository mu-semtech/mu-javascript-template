#! /bin/sh
if [ "$NODE_ENV" == "production" ]; 
then 
    ./node_modules/supervisor/lib/cli-wrapper.js \
        -i . \
        -k --ignore-symlinks \
        -x sh start.sh
else
    ## Install new dependencies
    if [ -f "/app/package.json" ]; then npm install /app; fi
    ## Boot the app in development mode
    ./node_modules/supervisor/lib/cli-wrapper.js \
        -w /usr/src/app,/app \
        -i /usr/src/app/node_modules,/usr/src/app/helpers,/app/node_modules \
        -e .js \
        -k --ignore-symlinks \
        -x sh start.sh
fi
