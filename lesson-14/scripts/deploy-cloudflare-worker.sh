#! /usr/bin/env bash

THIS_SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

THIS_SCRIPT_DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

PROJECT_DIR_PATH="$(cd "${THIS_SCRIPT_DIR_PATH}/.." && pwd -P)"

MANUAL_PAGE_TEMPLATE="$(cat <<'EOF'
    MANUAL_PAGE
        @{SCRIPT_NAME}

    USAGE
        @{SCRIPT_NAME} <worker>

    DESCRIPTION
        Deploy the specified cloudflare worker.

    ARGUMENTS
        <worker>
        The worker to deploy. The name supplied must exist in the '_cloudflare'
        build directory.

    END
EOF
)"

WORKER_NAME=""

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

    if [ $# -lt 1 ]
    then
        echo "Missing arguments. Need --help?"
        return 1
    fi

    WORKER_NAME="${1}"
}

function checkWorkerBuildExist()
{
    if [ ! -e "${PROJECT_DIR_PATH}/_cloudflare/${WORKER_NAME}" ]
    then
        echo "Could not a build for worker '${WORKER_NAME}'. Please build the cloudflare worker and run this script again."
        return 1
    fi

    return 0
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

function deployWorkerSecrets()
{
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
}

function deployWorkerKvs()
{
    local WORKER_CONFIG_PATH="${1}"

    #
    # Check if the current worker has any automation data for KV Namespaces.
    #

    grep -Pq "^# Automation Meta-Data: KV Namespaces" "${WORKER_CONFIG_PATH}"
    RESULT=$?

    if [ ${RESULT} -ne 0 ]
    then
        return 0
    fi

    echo "Found KV Namespace automation data."

    #
    # Collect automation data for KV Namespaces.
    #

    local KV_NAME_LIST=($(cat "${WORKER_CONFIG_PATH}" | grep "KV Name:" | tr -d " " | cut -d ":" -f 2 ))
    local KV_BINDING_LIST=($(cat "${WORKER_CONFIG_PATH}" | grep "KV Binding:" | tr -d " " | cut -d ":" -f 2 ))

    #
    # For each KV Namespace defined in the automation data, deploy and define it
    # if it does not exist.
    #

    local DEPLOYED_KV_NAMESPACES="$(npx wrangler kv:namespace list)"

    local I
    for I in ${!KV_NAME_LIST[@]}
    do
        local KV_NAME="${KV_NAME_LIST[${I}]}"
        local KV_BINDING="${KV_BINDING_LIST[${I}]}"

        #
        # Check if the KV needs to be deployed.
        #

        echo "${DEPLOYED_KV_NAMESPACES}" | grep -q "${KV_NAME}"
        RESULT=$?

        if [ ${RESULT} -ne 0 ]
        then
            echo "Deploying new KV Namespace '${KV_NAME}'."
            npx wrangler kv:namespace create "${KV_NAME}"
            DEPLOYED_KV_NAMESPACES="$(npx wrangler kv:namespace list)"
        fi

        #
        # Check if the KV needs to be added to the worker config.
        #

        grep -q "name = \"${KV_NAME}\"" "${WORKER_CONFIG_PATH}"
        RESULT=$?

        if [ ${RESULT} -ne 0 ]
        then
            local DEPLOYED_INDEX=$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"title\":" | grep -n "\"title\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep "${KV_NAME}" | cut -d ":" -f 1)
            local DEPLOYED_ID="$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"id\":" | grep -n "\"id\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep -P "^${DEPLOYED_INDEX}" | cut -d ":" -f 2)"

            echo "Adding KV Namespace '${KV_NAME}' to the config."

            echo "" >> "${WORKER_CONFIG_PATH}"
            echo "[[kv_namespaces]]" >> "${WORKER_CONFIG_PATH}"
            echo "name = \"${KV_NAME}\"" >> "${WORKER_CONFIG_PATH}"
            echo "binding = \"${KV_BINDING}\"" >> "${WORKER_CONFIG_PATH}"
            echo "id = \"${DEPLOYED_ID}\"" >> "${WORKER_CONFIG_PATH}"
        fi
    done
}

function deployWorkerSecrets()
{
    local WORKER_CONFIG_PATH="${1}"

    #
    # Check if the current worker has any automation data for Secrets.
    #

    grep -Pq "^# Automation Meta-Data: Secret Variables" "${WORKER_CONFIG_PATH}"
    RESULT=$?

    if [ ${RESULT} -ne 0 ]
    then
        return 0
    fi

    echo "Found Secret Variables automation data."

    local WORKER_DIR_PATH="$(dirname "${WORKER_CONFIG_PATH}")"
    local SECRET_VARS_JSON_PATH="${WORKER_DIR_PATH}/secret-vars.json"

    if [ ! -e "${SECRET_VARS_JSON_PATH}" ]
    then
        echo ""
        echo "WARNING: This worker relies on secret variables and no secret variable config file was found in the build directory. You must create a secret variables config file in the build directory of the worker and re-run this script. The config file must be named 'secret-vars.json' and contain a json object that maps a single key value pair for each required secret variable. See the worker's 'wrangler.toml' for a list of required secret variables."
        return 1
    fi

    npx wrangler secret:bulk --config "${WORKER_CONFIG_PATH}" "${SECRET_VARS_JSON_PATH}"
}

function deployWorker()
{
    local WORKER_CONFIG_PATH="${PROJECT_DIR_PATH}/_cloudflare/${WORKER_NAME}/wrangler.toml"

    echo ""
    echo "========"
    echo "Deploying: ${WORKER_NAME}"

    deployWorkerKvs "${WORKER_CONFIG_PATH}"

    npx wrangler deploy --config "${WORKER_CONFIG_PATH}"

    deployWorkerSecrets "${WORKER_CONFIG_PATH}"

    echo "========"
}

fn_main()
{
    checkWorkerBuildExist || return $?

    checkNodePackageInstalled "wrangler" || return $?

    deployWorker || return $?
}

fn_parse_cli "$@" && fn_main
