#! /bin/sh

## Kill lingering processes
ps aux | grep babel-node | awk '{print $1}' | xargs kill -9

## Run using babel
if [ "$NODE_ENV" == "development" ]
then
    NODE_PATH=`pwd`/node_modules:`pwd`/helpers:$NODE_PATH npm start
else
    NODE_PATH=`pwd`/node_modules:`pwd`/helpers:$NODE_PATH npm start
fi
