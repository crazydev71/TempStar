#!/bin/bash

# Get the full path to this file and change to that directory
SENDER_SYS_PATH=$(cd ${0%/*} && pwd -P)
cd $SENDER_SYS_PATH

# Make sure node modules are installed
cd ..
npm install

# Start resume sender server, passing along any options such as --env production
cd $SENDER_SYS_PATH
pm2 start pm2-resume-sender.json "$@"

exit 0
