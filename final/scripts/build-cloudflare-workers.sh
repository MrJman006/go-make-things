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
        Build all cloudflare workers.

    END
EOF
)"

WORKER_BUILD_SCRIPT_TEMPLATE="$(cat <<'EOF'
    #! /usr/bin/env bash

    WORKER_CONFIG_FILE_PATH="${1}"

    WORKER_SOURCE_DIR_PATH="$(dirname "${WORKER_CONFIG_FILE_PATH}")"

    WORKER_BUILD_DIR_PATH="_${WORKER_SOURCE_DIR_PATH}"

    WORKER_NAME="$(basename "${WORKER_SOURCE_DIR_PATH}")"

    echo ""
    echo "====== Build ${WORKER_NAME} ======"

    NODE_PACKAGE="esbuild" 
    if [ ! -e "node_modules/${NODE_PACKAGE}" ]
    then
        echo "Please install the node package '${NODE_PACKAGE}' and run this script again."
        exit 1
    fi
 
    npx esbuild \
        --bundle \
        --tree-shaking=true \
        --legal-comments=inline \
        --target=chrome58,firefox57,safari11 \
        --outfile="${WORKER_BUILD_DIR_PATH}/main.js" \
        "${WORKER_SOURCE_DIR_PATH}/main.js"

    cp "${WORKER_SOURCE_DIR_PATH}/wrangler.toml" "${WORKER_BUILD_DIR_PATH}"
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

    # Remove leading spaces.
    sed -ri "s/^\s{4}//" "${BUILD_SCRIPT}"
    
    chmod 755 "${BUILD_SCRIPT}"

    #
    # Build each worker.
    #
    
    find cloudflare \
        -name wrangler.toml \
        -exec sh "${BUILD_SCRIPT}" "{}" \;

    #
    # Clean up.
    #

    rm "${BUILD_SCRIPT}"
}

fn_parse_cli "$@" && fn_main
