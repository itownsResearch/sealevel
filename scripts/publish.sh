#!/bin/bash
set -e # exit on error

USER="your-github-user-name"
PROJECT="your-itowns-project-name"

echo " # Publish the gh-pages"
cd master && COMMIT=`git rev-parse HEAD`
# remove all current files but .gitignore
cd ../gh-pages && git rm -qrf . && git checkout HEAD -- .gitignore
# copy non-dev files from master to gh-pages directory, excluding node-modules for windows compatibility
#cp -r ../master/* .
cd ../master
cp -r `ls ../master | grep -v "node_modules"` ../gh-pages
cd ../gh-pages
# we remove first, windows compatibility
rm -rf doc
mkdir doc && cp -r ../itowns/out doc/itowns
# commit and push all files
git add --all && git commit -m "Publish from master ($COMMIT)" && git push origin gh-pages

echo " # Published to : https://$USER.github.io/$PROJECT"
