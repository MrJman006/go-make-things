////////////////////////////////
// Imports

import { showErrorMessage } from "./modules/errors.js"
import { showNotification } from "./modules/notifications.js"
import { getToken, setToken, removeToken, checkTokenStatus } from "./modules/token.js"
import { render } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

let AUTHORIZATION_ENDPOINT = "https://gmtww-auth.cfjcd.workers.dev";
let LOGIN_URL = "https://mrjman006.github.io/gmt-webapps-workshop/lesson-14/login.html";

////////////////////////////////
// Variables

let sessionToken;

////////////////////////////////
// Functions

async function handleLogoutClick(e)
{
    if(e.target.getAttribute("data-action") != "logout")
    {
        return;
    }

    // Logout the user.
    fetch(
        AUTHORIZATION_ENDPOINT,
        {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${sessionToken}`
            }
        }
    );

    // Remove the token.
    removeToken();

    // Redirect.
    location.href = LOGIN_URL;
}

function onClick(e)
{
    handleLogoutClick(e);
}

function buildDashboard()
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    render(
        pageContentContainer,
        "<p>You're logged into the dashboard.</p>"
    );
}

async function main()
{
    sessionToken = getToken();

    if(sessionToken === null)
    {
        location.href = LOGIN_URL;
        return;
    }

    let sessionStatus = await checkTokenStatus(sessionToken);
    if(sessionStatus !== "active")
    {
        location.href = LOGIN_URL;
        removeToken();
        return;
    }

    buildDashboard();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);
window.addEventListener("click", onClick);
