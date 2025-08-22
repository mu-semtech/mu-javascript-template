#!/bin/bash
if [ "$NODE_ENV" == "development" ]
then
    # Run live-reload development
    echo "" > /tmp/service-status.lock
    echo "" > /tmp/service-restart

    # Ensure watched folders exist
    mkdir -p /config

    exec watchexec \
         --project-origin="/" \
         --watch="/app" \
         --watch="/config" \
         --exts="js,coffee,ts,mjs,cjs,json" \
         --stop-timeout="60s" \
         --stop-signal="SIGUSR2" \
         --shell=none --no-process-group \
         --restart \
         /usr/src/app/run-development.sh
elif [ "$NODE_ENV" == "production" ]
then
    exec /usr/src/app/run-production.sh
fi
