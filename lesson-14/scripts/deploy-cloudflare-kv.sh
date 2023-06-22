#! /usr/bin/env bash

THIS_SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

THIS_SCRIPT_DIR_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

PROJECT_DIR_PATH="$(cd "${THIS_SCRIPT_DIR_PATH}/.." && pwd -P)"

MANUAL_PAGE_TEMPLATE="$(cat <<'EOF'
    MANUAL_PAGE
        @{SCRIPT_NAME}

    USAGE
        @{SCRIPT_NAME} [optons] <kv-config>

    DESCRIPTION
        Deploy a cloudflare KV namespace using the supplied configuration.

    OPTIONS
        -h|--help
            Print this manual page.

        -p|--prefix <prefix>
            Prefix the KV namespace name. The prefix may use alpha-numeric and '_'
            characters, but must not start with a number.

    ARGUMENTS
        <kv-config>
        A config file for a KV namespace.

    END
EOF
)"

CONFIG_FILE_PATH=""
KV_NAME_PREFIX=""

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
            -p|--prefix)
                shift
                KV_NAME_PREFIX="${1}"
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

    CONFIG_FILE_PATH="${1}"
}

function checkConfigFileExists()
{
    if [ ! -e "${CONFIG_FILE_PATH}" ]
    then
        echo "The supplied config file could not be located. Check the config file path and run this script again."
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

function deployKv()
{
    local KV_NAME="$(cat "${CONFIG_FILE_PATH}" | grep -P "^name =" | tr -d " \"" | cut -d "=" -f 2)"

    echo ""
    echo "========"
    echo "Deploying KV: ${KV_NAME_PREFIX}${KV_NAME}"

    local TEMP_FILE_PATH="$(mktemp --tmpdir=/dev/shm XXXXXX-wrangler.toml)"
   
    echo "name = \"kv\"" > "${TEMP_FILE_PATH}"

    local DEPLOYED_KV_NAMESPACES="$(npx wrangler kv:namespace list)"

    echo "${DEPLOYED_KV_NAMESPACES}" | grep -Pq "${KV_NAME_PREFIX}${KV_NAME}"
    RESULT=$?

    if [ ${RESULT} -ne 0 ]
    then
        npx wrangler kv:namespace create --config "${TEMP_FILE_PATH}" "${KV_NAME_PREFIX}${KV_NAME}" || return $?
        DEPLOYED_KV_NAMESPACES="$(npx wrangler kv:namespace list)"
    fi

    local DEPLOYED_INDEX=$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"title\":" | grep -n "\"title\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep "${KV_NAME_PREFIX}${KV_NAME}" | cut -d ":" -f 1)
    local DEPLOYED_ID="$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"id\":" | grep -n "\"id\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep -P "^${DEPLOYED_INDEX}" | cut -d ":" -f 2)"


    local ADDING="no"
    while read LINE
    do
        #
        # Skip blank and comment lines.
        #

        echo "${LINE}" | grep -Pq "(^$|^#)"
        RESULT=$?

        if [ ${RESULT} -eq 0 ]
        then
            continue
        fi

        if [ "${LINE}" == "[data]" ]
        then
            ADDING="yes"
            continue
        fi

        if [ "${ADDING}" == "no" ]
        then
            continue
        fi

        local KEY="$(echo "${LINE}" | cut -d "=" -f 1)"
        local VALUE="$(echo "${LINE}" | cut -d "=" -f 2)"

        echo "Setting key '${KEY}'."
        npx wrangler kv:key put --namespace-id="${DEPLOYED_ID}" "${KEY}" "${VALUE}" 1>/dev/null
    done < <(cat "${CONFIG_FILE_PATH}")

    echo "========"
}

fn_main()
{
    checkConfigFileExists || return $?

    checkNodePackageInstalled "wrangler" || return $?

    deployKv || return $?
}

fn_parse_cli "$@" && fn_main
