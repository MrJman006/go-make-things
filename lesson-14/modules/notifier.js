import { store, component } from "../vendors/reef/reef.es.min.js"

let Notifier = function(notificationContainer, options = {})
{
    let SECONDS_TO_MILLISECONDS = 1000;

    let opts = Object.assign(
        {
            notificationRemoveDelay: 3
        },
        options
    );

    let notificationList = store([]);
    let {notificationRemoveDelay} = opts;

    function notify(message)
    {
        notificationList.push(message);

        let delay = notificationRemoveDelay * SECONDS_TO_MILLISECONDS;

        setTimeout((e) => { _removeNotification(message); }, delay);
    }

    function _removeNotification(message)
    {
        let messageIndex = notificationList.indexOf(message);
        notificationList.splice(messageIndex, 1);
    }

    function _generateNotificationsHtml()
    {
        let html = "";

        notificationList.forEach(
            function(message)
            {
                html += `<p class="notification">${message}</p>`;
            }
        );

        return html;
    }

    component(notificationContainer, _generateNotificationsHtml);

    return {
        notify
    };
};

export {
    Notifier
};
