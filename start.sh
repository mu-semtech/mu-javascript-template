#! /bin/sh

## Kill lingering processes
ps aux | grep babel-node | awk '{print $1}' | xargs kill -9

## Install new dependencies
npm install

## Run using babel
NODE_PATH=`pwd`/node_modules:$NODE_PATH ./node_modules/babel-cli/bin/babel-node.js app.js --presets es2015,es2016,es2017
