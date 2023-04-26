import {render} from "../vendors/reef/reef.es.min.js";

function showErrorMessage(contentElement, message)
{
    let template = `
        <p>${message}</p>
    `;
    render(contentElement, template);
}

function showErrorMessageWithRedirect(contentElement, message)
{
    let remainingSec = 3;

    function templateGenerator()
    {
        return `<p>${message} Redirecting to the product gallery in ${remainingSec} seconds.</p>`;
    };

    render(contentElement, templateGenerator());

    let interval;
    let intervalDelayMilliSec = 1000;

    function update()
    {
        remainingSec -= 1;
        render(contentElement, templateGenerator());
        if(remainingSec == 0 )
        {
            clearInterval(interval);
            window.location.href = "index.html";
        }
    }

    interval = setInterval(update, intervalDelayMilliSec);
}

export {
    showErrorMessage,
    showErrorMessageWithRedirect
};

