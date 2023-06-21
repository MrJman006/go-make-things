import {render} from "../vendors/reef/reef.es.min.js";

function parseUrlProductIds()
{
    let productIds = [];

    let url = new URL(window.location.href);
    let param = url.searchParams.get("productIds");

    if(param)
    {
        productIds = param.split(",");
    }

    return productIds;
}

function clearUrlProductIds()
{
    let url = new URL(window.location.href);
    url.searchParams.delete("productIds");
    history.replaceState(history.state, null, url.toString());
}

export {
    parseUrlProductIds,
    clearUrlProductIds
};

