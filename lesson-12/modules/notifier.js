import { store, component } from "../vendors/reef/reef.es.min.js"

let notifier = document.querySelector("[data-notifier]");
let notifications = store([]);
component(
    notifier,
    function()
    {
        let template = ``;

        notifications.forEach(
            function(message)
            {
                template += `<p><em>${message}</em></p>`;
            }
        );

        return template;
    }
);

function notify(message)
{
    notifications.push(message);

    setTimeout(
        function(e)
        {
            let index = notifications.indexOf(message);
            notifications.splice(index, 1);
        },
        3000
    );
}

export {
    notify
};

