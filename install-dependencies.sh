#!/bin/bash
set -o xtrace
source ./helpers.sh

cd /usr/src/app/
node ./merge-package-json.js
mv /tmp/merged-package.json /usr/src/app/app/package.json
cd /usr/src/app/app/

mkdir -p /usr/src/app/app/node_modules/

npm install # This should be conditional
cp -R /usr/src/app/helpers/mu /usr/src/app/app/node_modules/mu

## This code probably belongs elsewhere

## Ensure package.json has module
cat /usr/src/app/app/package.json | jq -e ".type" > /dev/null
if [  $? -ne 0 ]
then
    echo '[WARNING] Adding "type": "module" to your package.json.'
    echo 'To remove this warning, add "type": "module" at the same level as "name" in your package.json'
    sed -i '0,/{/s/{/{\n  "type": "module",/' /usr/src/app/app/package.json
else
    PACKAGE_TYPE=`cat /usr/src/app/app/package.json | jq -r ".type"`
    if [[ "$PACKAGE_TYPE" -ne "module" ]]
    then
        echo '[WARNING] DIFFERENT TYPE THAN "module" IN package.json; CONTINUING WITH UNSPECIFIED BEHAVIOUR'
    fi
fi
