#! /bin/sh
#remove app folder if exists
rm -rf ./app;
#copy app folder
cp -r /app ./;
#remove package to avoid babel and imports breaking
#TODO: if there are nested package.json files stuff will break but I think this is true for older versions too
rm ./app/package.json;

if [ "$NODE_ENV" == "development" ]
then
  npm run babel-node-dev;
else
  npm run build;
  npm run node-prod;
fi