#! /usr/bin/env bash

THIS_SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

THIS_SCRIPT_DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

PROJECT_DIR_PATH="$(cd "${THIS_SCRIPT_DIR_PATH}/.." && pwd -P)"

MANUAL_PAGE_TEMPLATE="$(cat <<'EOF'
    MANUAL PAGE
        @{SCRIPT_NAME}

    USAGE
        @{SCRIPT_NAME} [optons]

    DESCRIPTION
        Deploys live versions of all lessons to GitHub hosting.

    OPTIONS
        -h|--help
            Show this manual page.

    END
EOF
)"

SHOW_HELP=""

function print_manual_page()
{
    #
    # Instantiate the template.
    #

    local TEMP_FILE="$(mktemp --tmpdir="/dev/shm" "XXXXXX-manual.txt")"

    echo "${MANUAL_PAGE_TEMPLATE}" > "${TEMP_FILE}"

    #
    # Remove leading spaces and fill in template fields.
    #

    sed -ri "s/^\s{4}//" "${TEMP_FILE}"

    sed -ri "s/@\{SCRIPT_NAME\}/${THIS_SCRIPT_NAME}/g" "${TEMP_FILE}"

    #
    # Print to console.
    #

    cat "${TEMP_FILE}"

    #
    # Clean up.
    #

    rm "${TEMP_FILE}"
}

function parse_cli()
{
    #
    # Parse options.
    #

    while [ 1 ]
    do
        case "${1}" in
            -h|--help)
                shift
                SHOW_HELP="yes"
                return 0
                ;;
            *)
                if [ "${1:0:1}" == "-" ] && [ "${1}" != "--" ]
                then
                    echo "Invalid option '${1}'. Need --help?"
                    return 1
                fi

                if [ "${1}" == "--" ]
                then
                    shift
                fi

                break
                ;;
        esac
    done
}

function checkForCleanRepo()
{
    #
    # Ensure there repo is up to date.
    #
    
    git status | grep -Pq "Changes not staged for commit"
    RESULT=$?

    if [ ${RESULT} -eq 0 ]
    then
        echo "Error: The repo has non-commited changes. Either discard them or stash them before attempting to deploy."
        return 1
    fi
}

function stageLessonSites()
{
    mkdir -p _stage

    #
    # Add a link for the latest lesson site to the root index.
    #

    LATEST_LESSON="$(find . -maxdepth 1 -name "lesson-*" | sort | tail -n 1 | xargs basename)"

    echo "<a href=\"${LATEST_LESSON}\">latest</a><br>" >> "_stage/index.html"

    #
    # Process each lesson.
    #

    local LESSON_PATH

    while read LESSON_PATH
    do
        local LESSON_NAME="$(basename "${LESSON_PATH}")"
    
        #
        # Stage the lesson site files.
        #
   
        if [ -e "${LESSON_PATH}/frontend" ]
        then
            local CMD=("${LESSON_PATH}/scripts/build-frontend-site.sh")
            "${CMD[@]}" || continue
            rsync -ai "${LESSON_PATH}/_frontend/" "_stage/${LESSON_NAME}"
        else
            rsync -ai "${LESSON_PATH}" _stage
        fi
    
        #
        # Remove unnecessary files.
        #

        local FILE_LIST=() 

        FILE_LIST+=("_stage/${LESSON_NAME}/README.md")      
        FILE_LIST+=("_stage/${LESSON_NAME}/package.json")

        local FILE
        for FILE in "${FILE_LIST[@]}"
        do
            [ -e "${FILE}" ] && rm "${FILE}"
        done

        #
        # Change localhost links.
        #
    
        find "_stage/${LESSON_NAME}" -type f -exec sed -ri "s|http://127.0.0.1:9999|https://mrjman006.github.io/gmt-webapps-workshop/${LESSON_NAME}|g" {} \;
    
        #
        # Add a link for the lesson site to the root index.
        #
    
        echo "<a href=\"${LESSON_NAME}\">${LESSON_NAME}</a><br>" >> "_stage/index.html"
    done < <(find . -maxdepth 1 -name "lesson-*" | sort)
}

function deployStagedSites()
{
    #
    # GitHub Pages are automatically deployed for files in a remote branch
    # called 'gh-pages'. So we need to add just the staged site files to the
    # named branch and GitHub will take care of the rest.

    #
    # Commit the staging directory so we can add the staged files to the
    # 'gh-pages' remote branch. Save the previous HEAD state so we can remove
    # the staging commit from the history when we are done.
    #
    
    local ORIGINAL_HEAD="$(git rev-parse --short HEAD)"
    git add --force _stage
    git commit -m "Deploying staged lesson sites." 
  
    # 
    # Remove old versions of the 'gh-pages' remote branch. 
    #

    git push -d origin gh-pages

    #
    # Push just the contents of the staging directory to the 'gh-pages' remote
    # branch.
    #

    git subtree push --prefix _stage origin gh-pages
    
    #
    # Now that the staged files are deployed, we can restore the git repo
    # to it's original state.
    #
    
    git reset --hard "${ORIGINAL_HEAD}"
}

function main()
{
    if [ "${SHOW_HELP}" == "yes" ]
    then
        show_manual_page
        return 0
    fi

    checkForCleanRepo || return $?

    stageLessonSites || return $?
   
    deployStagedSites || return $?
}

parse_cli "$@" && main
