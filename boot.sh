#! /bin/sh
copyFolderAndInstall()
{
  #remove app folder if exists
  rm -rf ./app;
  #copy app folder
  cp -r /app ./;
  #install app dependencies
  npm install ./app;
  #remove package to avoid babel and imports breaking
  #TODO: if there are nested package.json files stuff will break but I think this is true for older versions too
  rm ./app/package.json;
}

if [ "$NODE_ENV" == "development" ] && [ "$IMAGE_STATUS" == "template" ]
then
  copyFolderAndInstall;
  #run daemon and watch mounted app folder
  exec npm run daemon;
elif [ "$NODE_ENV" == "production" ] && [ "$IMAGE_STATUS" == "template" ]
then
  copyFolderAndInstall;
  #build production app
  npm run build;
  #run production app
  exec npm run node-prod;
elif [ "$NODE_ENV" == "development" ] && [ "$IMAGE_STATUS" == "standalone" ]
then
  copyFolderAndInstall
  #run daemon and watch mounted app folder
  exec npm run daemon;
elif [ "$NODE_ENV" == "production" ] && [ "$IMAGE_STATUS" == "standalone" ]
then
  #run production app
  exec npm run node-prod;
fi
