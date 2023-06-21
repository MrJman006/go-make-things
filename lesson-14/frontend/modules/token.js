////////////////////////////////
// Imports

import { Storage } from "./storage.js"

////////////////////////////////
// Functions

function getToken()
{
    let token = Storage.local.getItem("sessionToken");
    return token;
}

function setToken(token)
{
    Storage.local.setItem("sessionToken", token);
}

function removeToken()
{
    Storage.local.removeItem("sessionToken");
}

async function checkTokenStatus(token)
{
    if(token === null)
    {
        return "invalid";
    }

    let _AUTHORIZATION_ENDPOINT = "https://gmtww-auth.cfjcd.workers.dev";

    try
    {
        let response = await fetch(
            _AUTHORIZATION_ENDPOINT,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if(!response.ok)
        {
            let message = await response.text();
            console.warn(message);
            return "inactive";
        }

        return "active";
    }
    catch(error)
    {
        console.warn(error);
        return "invalid";
    }
}

////////////////////////////////
// Exports

export {
    setToken,
    getToken,
    removeToken,
    checkTokenStatus
}
