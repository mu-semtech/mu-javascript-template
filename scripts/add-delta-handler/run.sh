#!/bin/bash
if [ -f /app/app.js ]
then
    APP_COPY=$(mktemp)
    cp /app/app.js "$APP_COPY"
    awk '!/^import/ && !x {print "import bodyParser from \"body-parser\";"; x=1} 1' "$APP_COPY" >/app/app.js
    rm "$APP_COPY"

    cat <<EOF>> /app/app.js

app.post('/delta', bodyParser.json({ limit: '50mb' }), (req, _res) => {
  for( const {inserts, deletes: _deletes} of req.body ) {
    for( const triple of inserts ) {
      console.log(triple.subject.value, triple.predicate.value, triple.object.value);
    }
  }
});
EOF
else
    echo "Can only insert into app.js"
fi
