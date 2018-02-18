#! /bin/sh

## Kill lingering processes
ps aux | grep babel-node | awk '{print $1}' | xargs kill -9

## Run using babel
if [ "$NODE_ENV" == "development" ]
then
    NODE_PATH=`pwd`/node_modules:`pwd`/helpers:$NODE_PATH ./node_modules/babel-cli/bin/babel-node.js app.js --inspect=0.0.0.0:9229 --presets es2015,es2016,es2017
else
    NODE_PATH=`pwd`/node_modules:`pwd`/helpers:$NODE_PATH ./node_modules/babel-cli/bin/babel-node.js app.js --presets es2015,es2016,es2017
fi
