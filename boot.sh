if [ "$NODE_ENV" == "development" ]
then
    # Run live-reload development
    exec /usr/src/app/node_modules/.bin/nodemon \
         --watch /app \
         --ext js,mjs,cjs,json,hbs \
         --exec /usr/src/app/run-development.sh
elif [ "$NODE_ENV" == "test" ]
then
    exec /usr/src/app/run-test.sh
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
