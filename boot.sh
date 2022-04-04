if [ "$NODE_ENV" == "development" ]
then
    # Run live-reload development
    exec /usr/src/app/node_modules/.bin/nodemon \
         --watch /app \
         --watch /config \
         --ext js,mjs,cjs,json \
         --exec /usr/src/app/run-development.sh
elif [ "$NODE_ENV" == "production" ]
then
    diff -rq /app /app.original > /dev/null
    APP_FILES_CHANGED="$?"
    diff -rq /config /config.original > /dev/null
    CONFIG_FILES_CHANGED="$?"

    if [ ! -f /usr/src/output/app/app.js ]
    then
        echo "No built sources found.  If you mount new sources, please set the NODE_ENV=\"development\" environment variable."
        sleep 5;
        exit 1;
    elif [ $APP_FILES_CHANGED != "0" ]
    then
        echo "Built sources are not the same as sources available in /app.  If you mount new sources, please set the NODE_ENV=\"development\" environment variable."
        sleep 5;
        exit 1;
    elif [ $CONFIG_FILES_CHANGED != "0" ]
    then
        echo "Rebuilding sources to include /config."

        cp -Rf /config/* /usr/src/app/app/config/

        /usr/src/app/node_modules/.bin/babel /usr/src/app/ \
             --ignore app/node_modules,node_modules \
             --copy-files --no-copy-ignored \
             --out-dir /usr/src/output

        cd /usr/src/output/
        exec node ./app/app.js
    else
        cd /usr/src/output/
        exec node ./app/app.js
    fi
fi
