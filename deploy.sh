#! /usr/bin/env bash

echo "$@" | grep -Pq "(^|\s+)(-s|--help)(\s+|$)"

if [ $? -eq 0 ] || [ $# -ne 1 ]
then
    echo "usage: deploy.sh <project-directory>"
    exit 1
fi

PROJECT_DIR="$(echo "${1}" | sed -r "s|(.)/+$|\1|")"

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

#
# Stage the target directory.
#

rsync -ai "${PROJECT_DIR}/" _stage

#
# Remove unnecessary files.
#

rm "_stage/README.md"
rm "_stage/package.json"

#
# Add the staging dir to the repo.
#

ORIGINAL_HEAD="$(git rev-parse --short HEAD)"
git add --force _stage
git commit -m "Deploying staged site files."

#
# Push the contents of the staging dir to the 'gh-pages' remote branch.
#

git push -d origin gh-pages
git subtree push --prefix _stage origin gh-pages

#
# Restore the git repo to it's original state.
#

git reset --hard "${ORIGINAL_HEAD}"

