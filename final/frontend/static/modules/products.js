import { Storage } from "./storage.js"

let _PRODUCTS_ENDPOINT = "https://gmtww-product-list.cfjcd.workers.dev";

let _CACHE_ID = "productList";

async function getProductList()
{
    let productList;

    if(Storage.session.hasItem(_CACHE_ID))
    {
        console.log("Loading product list from the session cache.");
        productList = Storage.session.getItem(_CACHE_ID);
        return productList;
    }

    try
    {
        console.log("Fetching product list from the server.");

        let result = await fetch(_PRODUCTS_ENDPOINT);

        if(!result.ok)
        {
            let message = await result.text();
            throw message;
        }
   
        productList = await result.json();

        console.log("Saving product list to the session cache.");
        Storage.session.setItem(_CACHE_ID, productList);
    }
    catch(error)
    {
        console.error(error);

        productList = [];
    }

    return productList;
}

export {
    getProductList
};

