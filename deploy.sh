#! /usr/bin/env bash

echo "$@" | grep -Pq "(^|\s+)(-s|--help)(\s+|$)"

if [ $? -eq 0 ]
then
    echo "usage: deploy.sh"
    exit 1
fi

#
# Ensure there repo is up to date.
#

git status | grep -Pq "Changes not staged for commit"
RESULT=$?
if [ ${RESULT} -eq 0 ]
then
    echo "The repo has non-commited changes. Either discard them or stash them before attempting to deploy."
    exit 1
fi

while read LESSON
do
    LESSON="$(basename "${LESSON}")"

    #
    # Stage the target directory.
    #

    rsync -ai "${LESSON}" _stage

    #
    # Remove unnecessary files.
    #
    
    rm "_stage/${LESSON}/README.md"
    rm "_stage/${LESSON}/package.json"

    #
    # Add a link for the lesson site to the root index.
    #

    echo "<a href=\"${LESSON}\">${LESSON}</a><br>" >> "_stage/index.html"
done < <(find . -maxdepth 1 -type d \( -not -path . \) | sort)

#
# Add the staging dir to the repo.
#

ORIGINAL_HEAD="$(git rev-parse --short HEAD)"
git add --force _stage
git commit -m "Deploying staged lesson sites."

#
# Push the contents of the staging dir to the 'gh-pages' remote branch.
#

git push -d origin gh-pages
git subtree push --prefix _stage origin gh-pages

#
# Restore the git repo to it's original state.
#

git reset --hard "${ORIGINAL_HEAD}"

