#!/bin/bash
cd /usr/src/app/
node ./validate-package-json.js
cd /usr/src/app/app/

## Ensure package.json has module
if [ -f /usr/src/app/app/package.json ]
then
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
else
  echo '{ "type": "module" }' > /usr/src/app/app/package.json
fi
