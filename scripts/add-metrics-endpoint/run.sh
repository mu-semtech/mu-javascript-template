#!/bin/bash
if [ -f /app/app.js ]
then
    APP_COPY=$(mktemp)
    cp /app/app.js "$APP_COPY"
    awk '!/^import/ && !x {print "import { metricsHandler } from \"mu\";"; x=1} 1' "$APP_COPY" >/app/app.js
    rm "$APP_COPY"

    cat <<EOF>> /app/app.js

app.get('/metrics', metricsHandler);
EOF
    echo "Added /metrics endpoint to app.js"
else
    echo "Can only insert into app.js"
fi
