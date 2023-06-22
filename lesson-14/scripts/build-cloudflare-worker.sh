#! /usr/bin/env bash

THIS_SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

THIS_SCRIPT_DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

PROJECT_DIR_PATH="$(cd "${THIS_SCRIPT_DIR_PATH}/.." && pwd -P)"

MANUAL_PAGE_TEMPLATE="$(cat <<'EOF'
    MANUAL_PAGE
        @{SCRIPT_NAME}

    USAGE
        @{SCRIPT_NAME} <worker-name>

    DESCRIPTION
        Build a cloudflare worker from source.

    ARGUMENTS
        <worker-name>
        The name of a cloudflare worker source directory.

    END
EOF
)"

WORKER_DIR_NAME=""

function print_manual_page()
{
    #
    # Instantiate the template.
    #

    local TEMP_FILE="$(mktemp --tmpdir="/dev/shm")"

    echo "${MANUAL_PAGE_TEMPLATE}" > "${TEMP_FILE}"

    # Remove leading spaces.
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
    echo "$@" | grep -Pq "(^|\s+)(-h|--help)(\s+|$)"
    RESULT=$?

    if [ ${RESULT} -eq 0 ]
    then
        print_manual_page
        return 1
    fi

    if [ $# -lt 1 ]
    then
        echo "Missing arguments. Need --help?"
        return 1
    fi

    WORKER_DIR_NAME="${1}"
}

function checkNodePackageInstalled()
{
    local PACKAGE_NAME="${1}"

    if [ ! -e "${PROJECT_DIR_PATH}/node_modules/${PACKAGE_NAME}" ]
    then
        echo "Could not locate the node package '${PACKAGE_NAME}'. Please install it and run this script again."
        return 1
    fi

    return 0
}

function buildWorker()
{
    local WORKER_CONFIG_FILE_PATH="${PROJECT_DIR_PATH}/cloudflare/workers/${WORKER_DIR_NAME}/wrangler.toml"

    if [ ! -e "${WORKER_CONFIG_FILE_PATH}" ]
    then
        echo "Could not locate a 'wrangler.toml' config file. Ensure that a 'wrangler.toml' config file exists in the worker source directory and run this script again."
        return 1
    fi

    local WORKER_SOURCE_DIR_PATH="${PROJECT_DIR_PATH}/cloudflare/workers/${WORKER_DIR_NAME}"
    local WORKER_BUILD_DIR_PATH="${PROJECT_DIR_PATH}/_cloudflare/workers/${WORKER_DIR_NAME}"

    echo ""
    echo "========"
    echo "Building Worker: ${WORKER_DIR_NAME}"

    npx esbuild \
        --bundle \
        --tree-shaking=true \
        --legal-comments=inline \
        --target=chrome58,firefox57,safari11 \
        --outfile="${WORKER_BUILD_DIR_PATH}/main.js" \
        "${WORKER_SOURCE_DIR_PATH}/main.js"

    cp "${WORKER_CONFIG_FILE_PATH}" "${WORKER_BUILD_DIR_PATH}"

    echo "========"
}

function main()
{
    checkNodePackageInstalled "esbuild" || return $?

    buildWorker || return $?
}

parse_cli "$@" && main
