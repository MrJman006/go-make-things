import { render } from "../vendors/reef/reef.es.min.js"

function showPageContentErrorMessage(message)
{
    let container = document.querySelector("[data-page-content]");

    let html = `<p class="error-message">${message}</p>`;

    render(container, html);
}

function showPageContentErrorMessageAndRedirectHome(message, options = {})
{
    let REDIRECT_TARGET = "index.html";

    let opts = Object.assign(
        {
            redirectDelay: 5
        },
        options
    );

    let container = document.querySelector("[data-page-content]");

    let {redirectDelay} = opts;

    function update()
    {
        //
        // Generate and render the html.
        //

        let html = `<p class="error-message">${message} Redirecting to the product gallery in ${redirectDelay} seconds.`;

        render(container, html);

        //
        // Redirect if it is time.
        //

        if(redirectDelay == 0 )
        {
            location.replace(REDIRECT_TARGET);
            return;
        }

        //
        // Delay one second.
        //

        redirectDelay -= 1;

        let UPDATE_DELAY_MILLISECONDS = 1000;
        setTimeout(update, UPDATE_DELAY_MILLISECONDS);
    }

    update();
}

export {
    showPageContentErrorMessage,
    showPageContentErrorMessageAndRedirectHome
};
