#!/bin/bash

# Get the full path to this file and change to that directory
BILL_SYS_PATH=$(cd ${0%/*} && pwd -P)
cd $BILL_SYS_PATH

# Make sure node modules are installed
cd ..
npm install

# Start bill server, passing along any options such as --env production
cd $BILL_SYS_PATH
pm2 start pm2-bill.json "$@"

exit 0
