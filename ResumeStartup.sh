#!/bin/sh

echo Finding directory...
echo Checking for updates...

cd ./

git pull

echo Repo up to date.

cd ./Resume/

echo Starting server...

node server.js