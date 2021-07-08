if [ "$NODE_ENV" == "development" -a "$DEV_OS" == "windows" ]
then
    # Run live-reload development with legacy-watch
    # It's important to go to the right directory first, and to ignore the /usr/src/app/ and /tmp/ directories, since legacy-watch will match any file matching the **.* pattern
    # not ignoring these paths will result in an infinite restart loop, as run-development.sh writes to these directories
    cd /app/
    exec /usr/src/app/node_modules/.bin/nodemon \
         --legacy-watch /app \
         --ignore /usr/src/app/ \
         --ignore /tmp/ \
         --ext js,mjs,cjs,json \
         --exec /usr/src/app/run-development.sh
elif [ "$NODE_ENV" == "development" ]
then
    # Run live-reload development
    exec /usr/src/app/node_modules/.bin/nodemon \
         --watch /app \
         --ext js,mjs,cjs,json \
         --exec /usr/src/app/run-development.sh
elif [ "$NODE_ENV" == "production" ]
then
    diff -rq /app /app.original > /dev/null
    FILES_CHANGED="$?"

    if [ ! -f /usr/src/output/app/app.js ]
    then
        echo "No built sources found.  If you mount new sources, please set the NODE_ENV=\"development\" environment variable."
        sleep 5;
        exit 1;
    elif [ $FILES_CHANGED != "0" ]
    then
        echo "Built sources are not the same as sources available in /app.  If you mount new sources, please set the NODE_ENV=\"development\" environment variable."
        sleep 5;
        exit 1;
    else
        cd /usr/src/output/
        exec node ./app/app.js
    fi
fi
