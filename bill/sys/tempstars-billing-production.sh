#!/bin/bash

export NODE_ENV=production

# Get the full path to this file and change to the parent directory
BILL_SYS_PATH=$(cd ${0%/*} && pwd -P)
cd $BILL_SYS_PATH
cd ..

# Run billing service
./tempstars-bill.js >> /var/log/tempstars-bill.log 2>&1
exit 0
