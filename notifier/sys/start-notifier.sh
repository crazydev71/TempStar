#!/bin/bash

# Get the full path to this file and change to that directory
NOTIFIER_SYS_PATH=$(cd ${0%/*} && pwd -P)
cd $NOTIFIER_SYS_PATH

# Make sure node modules are installed
cd ..
npm install

# Start notifier server, passing along any options such as --env production
cd $NOTIFIER_SYS_PATH
pm2 start pm2-notifier.json "$@"

exit 0
