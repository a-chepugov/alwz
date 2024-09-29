#!/bin/bash
#
# Change files extension and import/export extension in code
#
# Rename files in ROOT_PATH ($1) with '.js' extension into files with TARGET_EXT ($2) extension
# also correct import/export declarations in them and 'map' files
#
# usage:
# ./fix-ext.sh ./build/cjs cjs
# ./fix-ext.sh ./build/esm esm
#

ROOT_PATH=$1

if ! [ $ROOT_PATH ]; then
	echo "ERROR - empty ROOT_PATH"
	exit 1
fi

TARGET_EXT=$2

if ! [ $TARGET_EXT ]; then
	echo "ERROR - empty TARGET_EXT"
	exit 1
fi

process_source () {
	local FILENAME=$1
	echo process source $FILENAME
	sed -i "s/\.js\b/\.${TARGET_EXT}/g" "$FILENAME"
  mv "$FILENAME" "${FILENAME%.js}.${TARGET_EXT}"
}

process_source_map () {
	local FILENAME=$1
	echo process source map $FILENAME
	sed -i "s/\.js\b/\.${TARGET_EXT}/g" "$FILENAME"
  mv "$FILENAME" "${FILENAME%.js.map}.${TARGET_EXT}.map"
}

find $ROOT_PATH -name *.js | while read FILENAME; do process_source "$FILENAME"; done
find $ROOT_PATH -name *.js.map | while read FILENAME; do process_source_map "$FILENAME"; done
