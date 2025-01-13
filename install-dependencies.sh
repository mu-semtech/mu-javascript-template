#!/bin/bash
set -o xtrace
source ./helpers.sh

cd /usr/src/app/
node ./merge-package-json.js
mv /tmp/merged-package.json /usr/src/app/app/package.json
cd /usr/src/app/app/

npm install

mkdir -p /usr/src/app/app/node_modules/
# if processing exists we can take the built mu module out of it directly, we built it in an earlier step
if [ -d /usr/src/processing/built-mu ]
then
  cp -R /usr/src/processing/built-mu /usr/src/app/app/node_modules/mu
# else we need to create processing npm install and build it again
else
  mkdir -p /usr/src/processing/built-mu
  cd /usr/src/processing/
  docker-rsync /usr/src/app/. .
  npm install
  /usr/src/app/node_modules/.bin/babel \
    /usr/src/app/helpers/mu/ \
    --source-maps true \
    --out-dir /usr/src/processing/built-mu \
    --extensions ".js"

  cp -R /usr/src/processing/built-mu /usr/src/app/app/node_modules/mu
  cp /usr/src/app/helpers/mu/package.json /usr/src/processing/built-mu/

  ## Ensure package.json has module
  # cp /app/package.json /usr/src/build/ # already copied above
  cat /usr/src/app/app/package.json | jq -e ".type" > /dev/null
  if [  $? -ne 0 ]
  then
      echo '[WARNING] Adding "type": "module" to your package.json.'
      echo 'To remove this warning, add "type": "module" at the same level as "name" in your package.json'
      sed -i 's/{/{\n  "type": "module",/' /usr/src/app/app/package.json
  else
      PACKAGE_TYPE=`cat /usr/src/app/app/package.json | jq -r ".type"`
      if [[ "$PACKAGE_TYPE" -ne "module" ]]
      then
          echo '[WARNING] DIFFERENT TYPE THAN "module" IN package.json; CONTINUING WITH UNSPECIFIED BEHAVIOUR'
      fi
  fi
fi

