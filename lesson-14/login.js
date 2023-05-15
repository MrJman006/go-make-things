////////////////////////////////
// Imports

import { showErrorMessage } from "./modules/errors.js"
import { showNotification } from "./modules/notifications.js"
import { render } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

let AUTHORIZATION_ENDPOINT = "https://gmtww-auth.cfjcd.workers.dev";

////////////////////////////////
// Variables

let submitting;

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

    // Submit the form.
    let token;
    submitting = true;

    try
    {
        let authCredentials = `${formData.username}:${formData.password}`;
        let encodedAuthCredentials = btoa(authCredentials);

        let tokenResponse = await fetch(
            AUTHORIZATION_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${encodedAuthCredentials}`
                }
            }
        );

        if(!tokenResponse.ok)
        {
            let message = await tokenResponse.text();
            throw message;
        }

        let data = await tokenResponse.json();
        token = data.token;
    }
    catch(error)
    {
        submitting = false;
        form.reset();
        console.warn(error);
        showNotification(error);
        return;
    }

    submitting = false;
    showErrorMessage(`Success. Your auth token is ${token}`);
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

function main()
{
    submitting = false;

    buildLoginForm();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);
window.addEventListener("click", onClick);

