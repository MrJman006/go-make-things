import { render } from "../vendors/reef/reef.es.min.js"

function showPageContentErrorMessage(message)
{
    let container = document.querySelector("[data-page-content]");

    let html = `<p class="error-message">${message}</p>`;

    render(container, html);
}

export {
    showPageContentErrorMessage
};

