////////////////////////////////
// Imports

import {Storage} from "./storage.js"

////////////////////////////////
// Constants

let PRODUCTS_ENDPOINT = "https://vanillajsacademy.com/api/photos.json";

////////////////////////////////
// Functions

async function fetchProductData()
{
    //
    // Fetch the list of products and cache the results
    // for use within the current browser session.
    //

    let json = Storage.session.getItem("products");
    if(json)
    {
        console.log("Using cached product data.");
        return json;
    }

    try
    {
        let result = await fetch(PRODUCTS_ENDPOINT);
        if(!result.ok)
        {
            throw result;
        }
    
        json = await result.json();
        Storage.session.setItem("products", json);
    }
    catch(error)
    {
        console.warn(error);
        json = [];
    }

    return json;
}

function fetchCartData()
{
    //
    // Fetch the cart data from local storage.
    //

    let json = Storage.local.getItem("cart");
    if(json)
    {
        console.log("Found cart data.");
        return json;
    }

    return [];
}

////////////////////////////////
// Exports

export {
    fetchProductData,
    fetchCartData
};

