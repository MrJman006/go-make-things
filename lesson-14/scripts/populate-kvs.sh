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
        Populates KV Namespaces with dummy data.

    END
EOF
)"

PRODUCT_LIST="$(cat <<'EOF'
    [
        {
            "id": "anchor",
            "name": "Anchor",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/anchor.jpg",
            "description": "A boat sits in a bay of gorgeous topaz water, an anchor line cast from her bow.",
            "price": 29
        },
        {
            "id": "jellyfish-2",
            "name": "Orange Bloom",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/jellyfish2.jpg",
            "description": "A bloom of orange jellyfish drift through the lush blue ocean.",
            "price": 79
        },
        {
            "id": "compass",
            "name": "Compass",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/compass.jpg",
            "description": "You're never lost if you know what you're going. A compass in the sand.",
            "price": 29
        },
        {
            "id": "starfish",
            "name": "Solo Starfish",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/starfish.jpg",
            "description": "A lone starfish sits on the seafloor, hoping for a friend to come join him.",
            "price": 79
        },
        {
            "id": "hammerhead",
            "name": "From the Depths",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/hammerhead.jpg",
            "description": "A hammerhead shark emerges from the dark depths.",
            "price": 129
        },
        {
            "id": "island-1",
            "name": "Desert Island",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/island1.jpg",
            "description": "A deserted island beach, with cool blue water off to the right.",
            "price": 129
        },
        {
            "id": "island-2",
            "name": "Treasure Hideout",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/island2.jpg",
            "description": "A rocky outcrop in a vast ocean, covered in trees and perfect for hiding treasure.",
            "price": 79
        },
        {
            "id": "island-3",
            "name": "Paradise",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/island3.jpg",
            "description": "Sun sets on the horizon, as a flock of birds flies past the stolen boat used to navigate to this remote paradise.",
            "price": 129
        },
        {
            "id": "crab",
            "name": "Curious Crab",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/crab.jpg",
            "description": "A crab skitters across the sand, the wet beach a blur behind him.",
            "price": 49
        },
        {
            "id": "turtle",
            "name": "Silly Sea Turtle",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/turtle.jpg",
            "description": "A good luck charm for pirates, a curious sea turtle swims right past my camera. Is he after me treasure, or does he just want to say hi?",
            "price": 129
        },
        {
            "id": "jellyfish-3",
            "name": "Jellyfish in a Sunbeam",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/jellyfish3.jpg",
            "description": "A lone jellyfish, suspended in a sunbeam, floats close the surface.",
            "price": 129
        },
        {
            "id": "kelp",
            "name": "Kelp Forest",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/kelp.jpg",
            "description": "A blue forest of kelp rises from the dark sea floor to the light of the surface above.",
            "price": 49
        },
        {
            "id": "jolly-roger",
            "name": "Jolly Roger",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/jollyroger.jpg",
            "description": "The pride of the fleet, the skull-and-crossbones hangs on the red wall, a single rose perched from her lips.",
            "price": 49
        },
        {
            "id": "sting-rays-1",
            "name": "Rays and Coral",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/stingrays1.jpg",
            "description": "A pair of sting rays make their way past a school of fish on the edge of a coral reef.",
            "price": 49
        },
        {
            "id": "jellyfish-1",
            "name": "Rainbow Jellies",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/jellyfish1.jpg",
            "description": "Three jellyfish in a rainbow of colors pulse through the dark waters.",
            "price": 49
        },
        {
            "id": "map",
            "name": "Treasure Map",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/map.jpg",
            "description": "With this map, you'll always know where to find your buried treasure.",
            "price": 29
        },
        {
            "id": "sharks",
            "name": "Guardians of the Deep",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/sharks.jpg",
            "description": "A school of sharks circles in the dark blue waters, providing natural protection for the treasures that lay on the nearby island.",
            "price": 29
        },
        {
            "id": "ship",
            "name": "Home, Sweet Home",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/ship.jpg",
            "description": "The four masts of a gorgeous ship silhouette the clouds as the sun sets on the horizon.",
            "price": 129
        },
        {
            "id": "sting-rays-2",
            "name": "Sting Ray Taxi",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/stingrays2.jpg",
            "description": "A large, aging ray provides a free ride to some grifters.",
            "price": 29
        },
        {
            "id": "treasure",
            "name": "Treasure!",
            "url": "https://cdn.gomakethings.com/academy/ecommerce/treasure.jpg",
            "description": "Me buried treasure sits at the base of the stone steps leading up to me hideout.",
            "price": 29
        }
    ]
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

function populateKvs()
{
    local KV_NAME
    local KV_ID
    local KEY
    local VALUE

    local DEPLOYED_KV_NAMESPACES="$(npx wrangler kv:namespace list)"

    #
    # KV: worker-kv_gmtww_l14_storage
    #

    KV_NAME="worker-kv_gmtww_l14_storage"

    echo "========"
    echo "Populating: ${KV_NAME}"

    local KV_DEPLOYED_INDEX=$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"title\":" | grep -n "\"title\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep "${KV_NAME}" | cut -d ":" -f 1)
    local KV_DEPLOYED_ID="$(echo "${DEPLOYED_KV_NAMESPACES}" | grep "\"id\":" | grep -n "\"id\":" | tr -d " ,\"" | cut -d ":" -f 1,3 | grep -P "^${KV_DEPLOYED_INDEX}" | cut -d ":" -f 2)"

    KEY="productList"
    VALUE="${PRODUCT_LIST}"

    echo "key: ${KEY}"
    npx wrangler kv:key put --namespace-id="${KV_DEPLOYED_ID}" "${KEY}" "${VALUE}" 1>/dev/null

    echo "========"
}

fn_main()
{
    checkNodePackageInstalled "wrangler" || return $?

    populateKvs
}

fn_parse_cli "$@" && fn_main
