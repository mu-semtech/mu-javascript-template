#! /bin/sh
#remove app folder if exists
rm -rf ./app;
#copy app folder
cp -r /app ./;
#install app dependencies
npm install ./app;
#remove package to avoid babel and imports breaking
#TODO: if there are nested package.json files stuff will break but I think this is true for older versions too
rm ./app/package.json;
#run daemon and watch mounted app folder
npm run daemon;