#! /bin/sh

#kill lingering process
#TODO: this isn't needed but unsure how nodemon kills the process
#ps aux | grep babel-node | awk '{print $1}' | xargs kill -9;

#remove app folder if exists
rm -rf ./app;
#copy app folder
cp -r /app ./;
#install app dependencies
npm install ./app;
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