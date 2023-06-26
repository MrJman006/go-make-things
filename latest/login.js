////////////////////////////////
// Imports

import { showErrorMessage } from "./modules/errors.js"
import { showNotification } from "./modules/notifications.js"
import { getToken, setToken, removeToken, checkTokenStatus } from "./modules/token.js"
import { render } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

let AUTHORIZATION_ENDPOINT = "https://gmtww-auth.cfjcd.workers.dev";
let DASHBOARD_URL = "https://mrjman006.github.io/gmt-webapps-workshop/latest/dashboard.html";

////////////////////////////////
// Variables

let submitting;
let sessionToken;

////////////////////////////////
// Functions

function parseFormData(form)
{
    let data = new FormData(form);
    
    let obj = {};
    for(let [key, value] of data)
    {
        if(obj[key] !== undefined)
        {
            if(!Array.isArray(obj[key]))
            {
                obj[key] = [obj[key]];
            }
            obj[key].push(value);
        }
        else
        {
            obj[key] = value;
        }
    }
    return obj;
}

async function handleFormSubmitClick(e)
{
    // Block page reload.
    e.preventDefault();

    // Only process the login form.
    if(e.target.getAttribute("data-action") != "login")
    {
        return;
    }

    // Prevent multiple submissions.
    if(submitting)
    {
        showNotification("The form is already submitting.");
        return;
    }

    // Ensure valid form data.
    let form = document.querySelector("[data-form=login]");
    let formData = parseFormData(form);

    if(!formData["username"] || !formData["password"])
    {
        showNotification("Please enter a valid username and password.");
        return;
    }

    // Unfocus all form inputs.
    form.querySelectorAll("input").forEach(
        function(input)
        {
            input.blur();
        }
    );

    // Attempt to login.
    submitting = true;

    let authCredentials = `${formData.username}:${formData.password}`;
    let encodedAuthCredentials = btoa(authCredentials);

    try
    {
        let response = await fetch(
            AUTHORIZATION_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${encodedAuthCredentials}`
                }
            }
        );

        if(!response.ok)
        {
            let message = await response.text();
            throw message;
        }

        let data = await response.json();
        sessionToken = data.token;
        setToken(sessionToken);
    }
    catch(error)
    {
        submitting = false;
        form.reset();
        showNotification(error);
        console.warn(error);
        return;
    }

    // Redirect
    location.href = DASHBOARD_URL;
}

function onClick(e)
{
    handleFormSubmitClick(e);
}

function generateLoginFormHtml()
{
    let loginFormHtml = `
        <form data-form="login">
            <div class="control">
                <label class="control__label" for="username">Username</label>
                <input class="control__input" type="text" name="username" id="username" required>
            </div>
            <div class="control">
                <label class="control__label" for="password">Password</label>
                <input class="control__input" type="password" name="password" id="password" required>
            </div>
            <div class="control">
                <input class="primary" type="submit" value="Login" data-action="login">
            </div>
        </form>
    `;

    return loginFormHtml;
}

function buildLoginForm()
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    render(
        pageContentContainer,
        generateLoginFormHtml()
    );
}

async function main()
{
    submitting = false;

    sessionToken = getToken();

    if(sessionToken === null)
    {
        buildLoginForm();
        return;
    }

    let sessionStatus = await checkTokenStatus(sessionToken);
    if(sessionStatus !== "active")
    {
        removeToken();
        buildLoginForm();
        return;
    }

    // redirect.
    location.href = DASHBOARD_URL;
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);
window.addEventListener("click", onClick);

