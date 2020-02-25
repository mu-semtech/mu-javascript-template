#! /bin/sh
if [ "$NODE_ENV" == "production" ]; 
then 
    npm start
else
    ## Install new dependencies
    if [ -f "/app/package.json" ]; then npm config set unsafe-perm true && npm install /app; fi
    ## Boot the app in development mode
    npm start
fi
