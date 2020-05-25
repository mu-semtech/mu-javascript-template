#!/bin/bash

service=`basename "$SERVICE_HOST_DIR"`

echo "  $service:"
echo "    image: semtech/mu-javascript-template:1.3.5"
echo "    links:"
echo "      - db:database"
echo "    ports:"
echo '      - "8888:80"'
echo '      - "9229:9229"'
echo "    environment:"
echo '      NODE_ENV: "development"'
echo "    volumes:"
echo "      - \"$SERVICE_HOST_DIR:/app\""
