#! /usr/bin/env bash

echo "$@" | grep -Pq "(^|\s+)(-s|--help)(\s+|$)"

if [ $? -eq 0 ] || [ $# -ne 1 ]
then
    echo "usage: deploy.sh <directory>"
    exit 1
fi

#
# Modify url paths to work with Github Pages.
#

while read FILE
do
    echo "${FILE}"
    sed -ri "s|href=\"(.*)\"|href=\"gmt-webapps-workshop/\1\"|" "${FILE}"
    sed -ri "s|src=\"(.*)\"|href=\"gmt-webapps-workshop/\1\"|" "${FILE}"
done < <(find "${1}" -type f)

#
# Remove unnecessary files.
#

rm "${1}/README.md"

#
# Push the contents of the subdirectory to the 'gh-pages' remote branch.
#

git push -d origin gh-pages
git subtree push --prefix "${1}" origin gh-pages

#
# Discard deployment changes.
#

git checkout -- .

