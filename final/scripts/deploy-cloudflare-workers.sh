#! /usr/bin/env bash

THIS_SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

THIS_SCRIPT_DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

PROJECT_DIR_PATH="$(cd "${THIS_SCRIPT_DIR_PATH}/.." && pwd -P)"

MANUAL_PAGE_TEMPLATE="$(cat <<'EOF'
    MANUAL_PAGE
        @{SCRIPT_NAME}

    USAGE
        @{SCRIPT_NAME}

    DESCRIPTION
        Deploy all cloudflare workers.

    END
EOF
)"

WORKER_BUILD_SCRIPT_TEMPLATE="$(cat <<'EOF'
    #! /usr/bin/env bash

    WORKER_CONFIG_PATH="${1}"

    WORKER_NAME="$(basename "$(dirname "${1}")")"

    echo ""
    echo "====== Deploy ${WORKER_NAME} ======"

    NODE_PACKAGE="wrangler" 
    if [ ! -e "node_modules/${NODE_PACKAGE}" ]
    then
        echo "Please install the node package '${NODE_PACKAGE}' and run this script again."
        exit 1
    fi 

    npx wrangler \
        deploy \
        --config "${WORKER_CONFIG_PATH}"

    grep -Pq "^# This worker relies on .* secret vars" "${WORKER_CONFIG_PATH}"
    RESULT=$?

    if [ ${RESULT} -ne 0 ]
    then
        return 0
    fi

    SECRET_VARS_JSON="$(dirname ${WORKER_CONFIG_PATH})/secret-vars.json"

    if [ ! -e "${SECRET_VARS_JSON}" ]
    then
        echo ""
        echo "WARNING: This worker relies on secret variables and no secret variables config file was found in the build directory. You must do one of the following before the deployed worker will execute successfully."
        echo ""
        echo "1. You can manually add secret variables to the deployed cloudflare worker. This can be done via the web UI at cloudflare.com or via wrangler with the command 'wrangler secret put'."
        echo ""
        echo "2. You can create a secret variables config file in the build directory of the worker and re-run the deploy script. The config file must be named 'secret-vars.json' and contain a json object that maps a single key value pair for each required secret var."
        echo ""
        echo "See the worker's 'wrangler.toml' for a list of required secret variables used by the worker."
        exit 1
    fi

    npx wrangler \
        secret:bulk \
        --config "${WORKER_CONFIG_PATH}" \
        "${SECRET_VARS_JSON}"
EOF
)"

fn_print_manual_page()
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

fn_parse_cli()
{
    echo "$@" | grep -Pq "(^|\s+)(-h|--help)(\s+|$)"
    RESULT=$?

    if [ ${RESULT} -eq 0 ]
    then
        fn_print_manual_page
        return 1
    fi
}

fn_main()
{
    #
    # Instantiate the template.
    #

    BUILD_SCRIPT="$(mktemp --tmpdir="/dev/shm")"

    echo "${WORKER_BUILD_SCRIPT_TEMPLATE}" > "${BUILD_SCRIPT}"

    chmod 755 "${BUILD_SCRIPT}"

    #
    # Ensure a build has been performed.
    #

    if [ ! -e _cloudflare ]
    then
        echo "Could not find any cloudflare worker builds. Please build the cloudflare workers and run this script again."
        return 1
    fi

    #
    # For each worker, run the build script.
    #
    
    find _cloudflare \
        -name wrangler.toml \
        -exec sh "${BUILD_SCRIPT}" "{}" \;

    #
    # Clean up.
    #

    rm "${BUILD_SCRIPT}"
}

fn_parse_cli "$@" && fn_main
