#!/bin/bash
set -e # exit on error

USER="your-github-user-name"
PROJECT="your-itowns-project-name"
QUICKSTART="https://github.com/itownsResearch/itowns-quickstart.git"
ITOWNS="https://github.com/itownsResearch/itowns.git"
ORIGIN="https://$USER@github.com/$USER/$PROJECT.git"
BRANCH_QUICKSTART="master"
BRANCH_ITOWNS="master"

echo " # Create the project '$PROJECT' on github : $ORIGIN"
curl -u "$USER" https://api.github.com/user/repos -d "{\"name\":\"$PROJECT\"}"

echo " # Create the root directory : $PROJECT"
mkdir $PROJECT && cd $PROJECT

echo " # Initialize the repository: $PROJECT/master"
mkdir master && cd master
git init
git remote add origin $ORIGIN
git remote add quickstart $QUICKSTART
git remote add itowns $ITOWNS

echo " # Create the master branch from : $QUICKSTART master"
git pull quickstart $BRANCH_QUICKSTART:master
git push -u origin master

echo " # Create the itowns branch from : $ITOWNS master"
git fetch itowns $BRANCH_ITOWNS:itowns
git push -u origin itowns

echo " # Build the itowns branch in a new directory : $PROJECT/itowns"
git branch -D itowns
git clone --single-branch -b itowns $ORIGIN ../itowns
cd ../itowns && git checkout itowns
npm install # calls "npm run build"
npm run doc

echo " # Build master"
cd ../master && git checkout master
npm install file:../itowns
npm run build
# npm run doc # If doc is configured on the quickstart project

echo " # Create an empty gh-pages branch in the directory : $PROJECT/gh-pages"
cd ../master && git checkout --orphan gh-pages
git rm -qrf .
echo -e "node_modules\npackage.json\npackage-lock.json\nsrc\nwebpack.config.js\nscripts" > .gitignore
git add .gitignore
git commit -m ".gitignore"
git push -u origin gh-pages
git checkout master
git branch -D gh-pages
git clone --single-branch -b gh-pages $ORIGIN ../gh-pages



echo " # Publish the gh-pages"
cd ../master && COMMIT=`git rev-parse HEAD`
# remove all current files but .gitignore
cd ../gh-pages && git rm -qrf . && git checkout HEAD -- .gitignore
# copy non-dev files from master to gh-pages directory, excluding node-modules for windows compatibility
#cp -r ../master/* .
cd ../master
cp -r `ls ../master | grep -v "node_modules"` ../gh-pages
cd ../gh-pages
mkdir doc && cp -r ../itowns/out doc/itowns
# commit and push all files
git add --all && git commit -m "Publish from master ($COMMIT)" && git push origin gh-pages

# copy publish script on the root directory, and adjust variables
cd ..
cp master/scripts/publish.sh ./
sed -i "s/your-itowns-project-name/$PROJECT/g" publish.sh
sed -i "s/your-github-user-name/$USER/g" publish.sh
chmod +x publish.sh

echo " # You can sync your live demo website with master by running : cd $PROJECT/master && ./publish.sh"

echo " # All done, you can run locally with : cd $PROJECT/master && npm run server"
echo " # or open a browser to : https://$USER.github.io/$PROJECT"


