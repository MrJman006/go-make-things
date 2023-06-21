////////////////////////////////
// Imports

import { store, component } from "../vendors/reef/reef.es.min.js"

////////////////////////////////
// Variables

let _messageContainer = document.querySelector("[data-message-container]");
let _data = store({message: ""});

////////////////////////////////
// Functions

function _generateMessageHtml()
{
    let html = `
        <p>${_data.message}</p>
    `;

    return html;
}

function showErrorMessage(message)
{
    _data.message = message;
}

function _generateRedirectMessage(message, delay)
{
    return `${message} Redirecting to the product gallery in ${delay} seconds.`;
}

function showErrorMessageAndRedirect(message, options = {})
{
    let opts = Object.assign(
        {
            redirectDelay: 5,
            redirectTarget: "index.html"
        },
        options
    );

    let redirectDelay = opts.redirectDelay;

    _data.message = _generateRedirectMessage(message, redirectDelay);

    //
    // Redirect with dealy.
    //

    function update()
    {
        // Update the message.
        _data.message = _generateRedirectMessage(message, redirectDelay);

        // Redirect if it is time.
        if(redirectDelay == 0 )
        {
            location.replace("index.html");
            return;
        }

        redirectDelay -= 1;

        let UPDATE_DELAY_MILLISECONDS = 1000;
        setTimeout(update, UPDATE_DELAY_MILLISECONDS);
    }

    update();
}

////////////////////////////////
// Always Executable Code

component(_messageContainer, _generateMessageHtml);

////////////////////////////////
// Exports

export {
    showErrorMessage,
    showErrorMessageAndRedirect
};

