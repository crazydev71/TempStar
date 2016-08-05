#!/bin/bash

# Get the full path to this file and change to that directory
API_SYS_PATH=$(cd ${0%/*} && pwd -P)
cd $API_SYS_PATH

# Make sure node modules are installed
cd ..
npm install

# Start api server, passing along any options such as --env production
cd $API_SYS_PATH
pm2 start pm2-api.json "$@"

exit 0
