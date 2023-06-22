#! /usr/bin/env bash

THIS_SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

THIS_SCRIPT_DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

PROJECT_DIR_PATH="$(cd "${THIS_SCRIPT_DIR_PATH}/.." && pwd -P)"

MANUAL_PAGE_TEMPLATE="$(cat <<'EOF'
    MANUAL_PAGE
        @{SCRIPT_NAME}

    USAGE
        @{SCRIPT_NAME} [optons] <worker-name>

    DESCRIPTION
        Deploy a cloudflare worker.

    OPTIONS
        -h|--help
            Print this manual page.

        --kv-prefix <prefix>
            Prefix KV namespace names. The prefix may use alpha-numeric and '_'
            characters, but must not start with a number.

        --worker-prefix <prefix>
            Prefix the worker name. The prefix may use alpha-numeric and '_'
            characters, but must not start with a number.

    ARGUMENTS
        <worker-name>
        The name of a cloudflare worker build directory.

    END
EOF
)"

WORKER_NAME=""
KV_NAME_PREFIX=""
WORKER_NAME_PREFIX=""

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
    while [ 1 ]
    do
        case "${1}" in
            -h|--help)
                shift
                fn_print_manual_page
                return 1
                ;;
            --kv-prefix)
                shift
                KV_NAME_PREFIX="${1}"
                shift
                ;;
            --worker-prefix)
                shift
                WORKER_NAME_PREFIX="${1}"
                shift
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

    if [ $# -lt 1 ]
    then
        echo "Missing arguments. Need --help?"
        return 1
    fi

    WORKER_NAME="${1}"
}

function checkConfigFileExists()
{
    local WORKER_CONFIG_FILE_PATH="${PROJECT_DIR_PATH}/_cloudflare/workers/${WORKER_NAME}/wrangler.toml"

    if [ ! -e "${WORKER_CONFIG_FILE_PATH}" ]
    then
        echo "Could not locate a 'wrangler.toml' config file. Ensure that a 'wrangler.toml' config file exists in the worker build directory and run this script again."
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

function fillInWorkerKvs()
{
    local WORKER_CONFIG_FILE_PATH="${1}"

    #
    # Check if the current worker has any automation data for KV Namespaces.
    #

    grep -Pq "^# Automation Meta-Data: KV Namespaces" "${WORKER_CONFIG_FILE_PATH}"
    RESULT=$?

    if [ ${RESULT} -ne 0 ]
    then
        return 0
    fi

    echo "Found KV Namespace automation data."

    #
    # Collect automation data for KV Namespaces.
    #

    local KV_NAME_LIST=($(cat "${WORKER_CONFIG_FILE_PATH}" | grep "KV Name:" | tr -d " " | cut -d ":" -f 2 ))
    local KV_BINDING_LIST=($(cat "${WORKER_CONFIG_FILE_PATH}" | grep "KV Binding:" | tr -d " " | cut -d ":" -f 2 ))

    #
    # For each KV Namespace defined in the automation data, add it to the worker
    # config file if it does not already exist.
    #

    local DEPLOYED_KV_NAMESPACES="$(npx wrangler kv:namespace list)"

    local I
    for I in ${!KV_NAME_LIST[@]}
    do
        local KV_NAME="${KV_NAME_LIST[${I}]}"
        local KV_BINDING="${KV_BINDING_LIST[${I}]}"

        #
        # Check if the KV has been deployed.
        #

        echo "${DEPLOYED_KV_NAMESPACES}" | grep -q "${KV_NAME_PREFIX}${KV_NAME}"
        RESULT=$?

        if [ ${RESULT} -ne 0 ]
        then
            echo "Could not locate a deployed KV Namespace with name '${KV_NAME_PREFIX}${KV_NAME}'. Deploy a KV Namespace with the name '${KV_NAME_PREFIX}${KV_NAME}' and run this script again."
            return 1
        fi

        #
        # Check if the KV needs to be added to the worker config.
        #

        grep -q "name = \"${KV_NAME_PREFIX}${KV_NAME}\"" "${WORKER_CONFIG_FILE_PATH}"
        RESULT=$?

        if [ ${RESULT} -ne 0 ]
        then
            local DEPLOYED_INDEX=$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"title\":" | grep -n "\"title\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep "${KV_NAME_PREFIX}${KV_NAME}" | cut -d ":" -f 1)
            local DEPLOYED_ID="$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"id\":" | grep -n "\"id\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep -P "^${DEPLOYED_INDEX}" | cut -d ":" -f 2)"

            echo "Adding KV Namespace '${KV_NAME_PREFIX}${KV_NAME}' to the config."

            echo "" >> "${WORKER_CONFIG_FILE_PATH}"
            echo "[[kv_namespaces]]" >> "${WORKER_CONFIG_FILE_PATH}"
            echo "name = \"${KV_NAME_PREFIX}${KV_NAME}\"" >> "${WORKER_CONFIG_FILE_PATH}"
            echo "binding = \"${KV_BINDING}\"" >> "${WORKER_CONFIG_FILE_PATH}"
            echo "id = \"${DEPLOYED_ID}\"" >> "${WORKER_CONFIG_FILE_PATH}"
        fi
    done
}

function fillInWorkerPrefix()
{
    local WORKER_CONFIG_FILE_PATH="${1}"

    if [ "${WORKER_NAME_PREFIX}" == "" ]
    then
        return 0
    fi

    echo "Adding prefix to worker name."
    sed -ri "s/^name = \"${WORKER_NAME}\"/name = \"${WORKER_NAME_PREFIX}${WORKER_NAME}\"/" "${WORKER_CONFIG_FILE_PATH}"
}

function deployWorkerSecrets()
{
    local WORKER_CONFIG_FILE_PATH="${1}"

    #
    # Check if the current worker has any automation data for Secrets.
    #

    grep -Pq "^# Automation Meta-Data: Secret Variables" "${WORKER_CONFIG_FILE_PATH}"
    RESULT=$?

    if [ ${RESULT} -ne 0 ]
    then
        return 0
    fi

    echo "Found Secret Variables automation data."

    local WORKER_BUILD_DIR_PATH="$(dirname "${WORKER_CONFIG_FILE_PATH}")"
    local SECRET_VARS_JSON_PATH="${WORKER_BUILD_DIR_PATH}/secret-vars.json"

    if [ ! -e "${SECRET_VARS_JSON_PATH}" ]
    then
        echo ""
        echo "WARNING: This worker relies on secret variables and no secret variable config file was found in the build directory. You must create a secret variables config file in the build directory of the worker and re-run this script. The config file must be named 'secret-vars.json' and contain a json object that maps a single key value pair for each required secret variable. See the worker's 'wrangler.toml' for a list of required secret variables."
        return 1
    fi

    npx wrangler secret:bulk --config "${WORKER_CONFIG_FILE_PATH}" "${SECRET_VARS_JSON_PATH}"
}

function deployWorker()
{
    local WORKER_CONFIG_FILE_PATH="${PROJECT_DIR_PATH}/_cloudflare/workers/${WORKER_NAME}/wrangler.toml"

    echo ""
    echo "========"
    echo "Deploying Worker: ${WORKER_NAME_PREFIX}${WORKER_NAME}"

    fillInWorkerKvs "${WORKER_CONFIG_FILE_PATH}" || return $?

    fillInWorkerPrefix "${WORKER_CONFIG_FILE_PATH}" || return $?

    npx wrangler deploy --config "${WORKER_CONFIG_FILE_PATH}" || return $?

    deployWorkerSecrets "${WORKER_CONFIG_FILE_PATH}" || return $?

    echo "========"
}

fn_main()
{
    checkConfigFileExists || return $?

    checkNodePackageInstalled "wrangler" || return $?

    deployWorker || return $?
}

fn_parse_cli "$@" && fn_main
