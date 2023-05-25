import { tinybind } from "../vendors/tinybind/tinybind.js";

function bind(container, templateStr, data, options = {})
{
    let opts = Object.assign(
        {},
        options
    );

    let parser = new DOMParser();
    let doc = parser.parseFromString(templateStr, "text/html");
    container.replaceChildren(...doc.body.children);

    tinybind.bind(container, data);
}

tinybind.configure({
    prefix: 'tb'
});

tinybind.formatters.urlWithParams = function(urlString, ...args)
{
    let params = new URLSearchParams();

    for(let i = 0; i < args.length; i+=2)
    {
        if(i + 1 >= args.length)
        {
            break;
        }

        let paramKey = args[i];
        let paramValue = args[i + 1];

        params.set(paramKey, paramValue);
    }

    return `${urlString}?${params.toString()}`;
};

export {
    bind
};
