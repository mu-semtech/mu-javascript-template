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
    diff -rq /app /app.original > /dev/null
    APP_FILES_CHANGED="$?"
    diff -rq /config /config.original > /dev/null
    CONFIG_FILES_CHANGED="$?"

    if [ ! -f /usr/src/build/app.js ]
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

        # move new configuration into app for transpilation
        if [[ "$(ls -A /config 2> /dev/null)" ]]
        then
            cp -Rf /config/* /usr/src/app/app/config/
        fi

        # make a backup of the used configuration so we can detect changes
        rm -Rf /config.original
        mkdir /config.original
        if [[ "$(ls -A /config 2> /dev/null)" ]]
        then
            cp -Rf /config/* /config.original
        fi

        # transpile sources
        cd /usr/src/app/
        ./transpile-sources.sh

        # boot transpiled sources
        cd /usr/src/build/
        exec node ./app.js
    else
        cd /usr/src/build/
        exec node ./app.js
    fi
fi
