#!/bin/bash

# Get the full path to this file and change to that directory
# API_SYS_PATH=$(cd ${0%/*} && pwd -P)

BASEDIR=$(dirname $0)
ABSPATH=$(readlink -f $0)
ABSDIR=$(dirname $ABSPATH)
cd $ABSDIR

# Make sure node modules are installed
cd ..
npm install

# Start api server, passing along any options such as --env production
cd $ABSDIR
pm2 start pm2-api.json "$@"

exit 0
