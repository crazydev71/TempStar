#!/bin/bash

export NODE_ENV=production

# Get the full path to this file and change to the parent directory
SYS_PATH=$(cd ${0%/*} && pwd -P)
cd $SYS_PATH
cd ..

# Run resume-sender service
./tempstars-resume-sender.js >> /var/log/tempstars-resume-sender.log 2>&1
exit 0
