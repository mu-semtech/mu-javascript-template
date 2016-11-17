#! /bin/sh
npm install
NODE_PATH=/usr/src/app/node_modules:$NODE_PATH node app.js
