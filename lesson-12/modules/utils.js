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
        render(contentElement, templateGenerator());
        if(remainingSec == 0 )
        {
            location.replace("index.html");
        }

        remainingSec -= 1;
        let ONE_SECOND = 1000;
        setTimeout(update, ONE_SECOND);
    }

    update();
}

export {
    showMessage,
    showMessageWithRedirect
};
