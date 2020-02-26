#! /bin/sh
#echo Hello World!;

npm run daemon;

# if [ "$NODE_ENV" == "production" ]; 
# then 
#     ./start.sh
# else
#     ## Install new dependencies
#     if [ -f "./main/package.json" ]; then npm config set unsafe-perm true && npm install /app; fi
#     ## Boot the app in development mode
#     ./start.sh
# fi