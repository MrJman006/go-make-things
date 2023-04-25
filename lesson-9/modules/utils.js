import {render} from "../vendors/reef/reef.es.min.js";

function showMessage(contentElement, message)
{
    let template = `
        <p>${message}</p>
    `;
    render(contentElement, template);
}

function showMessageWithRedirect(contentElement, message, options = {})
{
    let opts = Object.assign(
        {
            delay: 5
        },
        options
    );

    let remainingSec = opts.delay;

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
            window.location.href = "/";
        }
    }

    interval = setInterval(update, intervalDelayMilliSec);
}

export {
    showMessage,
    showMessageWithRedirect
};

