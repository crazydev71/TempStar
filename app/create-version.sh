#!/bin/bash

# Extract version from config.xml and write to version.js
mkdir -p www/js
cat config.xml \
    | grep '^<widget' \
    | sed 's|^.*version="\([^"]*\)".*|TempStars.version = "\1";|' \
    > www/js/tempstars.version.js
