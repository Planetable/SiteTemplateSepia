#!/bin/sh
buildNumber=`git rev-list --count main`
jq ".buildNumber = $buildNumber" template.json > template.json.tmp && mv template.json.tmp template.json && git add template.json