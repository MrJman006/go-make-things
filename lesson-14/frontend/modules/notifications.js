////////////////////////////////
// Imports

import { store, component } from "../vendors/reef/reef.es.min.js"

////////////////////////////////
// Variables

let _notificationContainer = document.querySelector("[data-notification-container]");
let _notifications = store([]);

////////////////////////////////
// Functions

function _generateNotificationsHtml()
{
    let html = ``;

    _notifications.forEach(
        function(message)
        {
            html += `<p><em>${message}</em></p>`;
        }
    );

    return html;
}

function _removeNotification(message)
{
    let index = _notifications.indexOf(message);
    _notifications.splice(index, 1);
}

function showNotification(message, options = {})
{
    let opts = Object.assign(
        options,
        {
            delay: 3
        }
    );

    _notifications.push(message);

    let SECONDS_TO_MILLISECONDS = 1000;
    let delay = opts.delay * SECONDS_TO_MILLISECONDS;
    
    setTimeout((e) => { _removeNotification(message); }, delay);
}

////////////////////////////////
// Always Executable Code

component(_notificationContainer, _generateNotificationsHtml);

////////////////////////////////
// Exports

export {
    showNotification
};

