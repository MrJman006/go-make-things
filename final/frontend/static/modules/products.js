import { storage } from "./storage.js"

let _PRODUCTS_ENDPOINT = "https://gmtww-product-list.cfjcd.workers.dev";

let _STORAGE_ID = "productList";

async function getProducts()
{
    let _productList = storage.session.getItem(_STORAGE_ID);

    if(_productList)
    {
        console.log("Loaded product list from session storage.");
        return _productList;
    }
    
    console.log("Fetching product list from the server.");

    try
    {
        let response = await fetch(
            _PRODUCTS_ENDPOINT,
            {
                method: "GET"
            }
        );

        if(!response.ok)
        {
            let message = await response.text();

            throw new Error(message);
        }

        _productList = await response.json();

        console.log("Saving product list to session storage.");
        storage.session.setItem(_STORAGE_ID, _productList);

        return _productList;
    }
    catch(error)
    {
        console.warn(error);
    
        _productList = [];
        return _productList;
    }
}

export {
    getProducts
};

