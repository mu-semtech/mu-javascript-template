#!/bin/bash

# Production startup doesn't write to the image or to /config, both may be
# read-only (e.g. an arbitrary UID on OpenShift, /config mounted from a
# ConfigMap).  When /config overrides the default configuration, the service
# sources are copied to a temporary folder where the overrides are transpiled.

diff -rq /app /app.original > /dev/null
APP_FILES_CHANGED="$?"
# Kubernetes mounts ConfigMaps with ..data and ..<timestamp> entries next to
# the configuration files, these are not part of the configuration.
diff -rq --exclude='..*' /config /usr/src/app/app/config > /dev/null 2>&1
CONFIG_FILES_CHANGED="$?"
if [[ -z "$(ls -A /config 2> /dev/null)" ]]
then
    CONFIG_FILES_CHANGED=0
fi

if [ $APP_FILES_CHANGED == "2" ]
then
    echo "[WARNING] Could not verify sources in /app match the built sources (e.g. unreadable files).  Continuing."
    APP_FILES_CHANGED=0
fi

if [ ! -f /usr/src/dist/app.js ]
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
    set -eo pipefail

    RUN_DIR="$(mktemp -d "${TMPDIR:-/tmp}/mu-service-XXXXXX")"
    CONFIG_SOURCES="$RUN_DIR/.config-sources"

    # copy the built sources, the node_modules are shared with the image
    rsync -rl --exclude /node_modules /usr/src/dist/ "$RUN_DIR/"
    ln -s /usr/src/dist/node_modules "$RUN_DIR/node_modules"

    # overrides replace the defaults file by file
    rsync -rL --exclude '..*' /config/ "$CONFIG_SOURCES/"

    # transpile the overrides, a compile cache would only fill up /tmp, which
    # may be in memory
    pushd "$CONFIG_SOURCES" > /dev/null
    NODE_DISABLE_COMPILE_CACHE=1 NODE_PATH="/usr/src/app/node_modules/" /usr/src/app/node_modules/.bin/coffee -M --compile -t .
    NODE_DISABLE_COMPILE_CACHE=1 NODE_PATH="/usr/src/app/node_modules/" /usr/src/app/node_modules/.bin/babel \
      . \
      --out-dir "$RUN_DIR/config" \
      --copy-files \
      --source-maps inline \
      --config-file "/usr/src/app/babel.config.json" \
      --extensions ".ts,.js" \
      > /dev/null
    popd > /dev/null
    rm -rf "$CONFIG_SOURCES"

    # boot transpiled sources
    cd "$RUN_DIR"
    exec node ./start-server.js
else
    cd /usr/src/dist/
    exec node ./start-server.js
fi
