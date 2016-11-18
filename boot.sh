#! /bin/sh
./node_modules/supervisor/lib/cli-wrapper.js \
    -w /usr/src/app,/app \
    -i /usr/src/app/node_modules,/app/node_modules \
    -e .js \
    -k --ignore-symlinks \
    -x sh start.sh
