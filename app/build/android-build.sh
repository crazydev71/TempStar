#!/bin/bash

# Get the full path to this file and change to that directory
BUILD_PATH=$(cd ${0%/*} && pwd -P)
cd $BUILD_PATH

# Go to parent directory to do build
cd ..
grunt android-buildsrc --target=production
cd $BUILD_PATH

# Change the package in the AndroidManifest.xml
cp ../platforms/android/AndroidManifest.xml ./AndroidManifest.xml.orig
cat ./AndroidManifest.xml.orig | sed "s/ca.version1.TempStars/ca.tempstars.app2/" > ../platforms/android/AndroidManifest.xml

# do the cordova build
cordova build android --release

# Get the version
VERSION=`cat ../config.xml \
    | grep '^<widget' \
    | sed 's|^.*version="\([^"]*\)".*|\1|'`

echo ""
echo "Signing TempStars version: $VERSION"


# copy unsigned apk to this directory
cp ../platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk .

# sign it
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android-release.keystore android-armv7-release-unsigned.apk android

# optimize it
rm TempStars-$VERSION.apk
~/Library/Android/sdk/build-tools/25.0.2/zipalign -v 4 android-armv7-release-unsigned.apk TempStars-$VERSION.apk
