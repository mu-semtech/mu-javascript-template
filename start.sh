#! /bin/sh
npm install

NODE_PATH=`pwd`/node_modules:$NODE_PATH ./node_modules/babel-cli/bin/babel-node.js app.js --presets es2015,es2016,es2017

