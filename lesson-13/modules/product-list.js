////////////////////////////////
// Imports

import { Storage } from "./storage.js"

////////////////////////////////
// Products API

function ProductList()
{
    let _PRODUCTS_ENDPOINT = "https://gmtww-products.cfjcd.workers.dev";
    let _CACHE_ID = "productList";
    let _productList = [];

    async function load()
    {
        if(Storage.session.hasItem(_CACHE_ID))
        {
            console.log("Loading product list from the session cache.");
            _productList = Storage.session.getItem(_CACHE_ID);
            return;
        }
    
        try
        {
            console.log("Fetching product list from the server.");

            let result = await fetch(_PRODUCTS_ENDPOINT);

            if(!result.ok)
            {
                throw result.status;
            }
        
            _productList = await result.json();

            console.log("Saving product list to the session cache.");
            Storage.session.setItem(_CACHE_ID, _productList);

            return;
        }
        catch(error)
        {
            console.warn(error);
    
            _productList = [];
            return;
        }
    }

    function length()
    {
        return _productList.length;
    }

    function forEach(callback)
    {
        _productList.forEach(callback);
    }

    function get(productId)
    {
        return _productList.find(function(p){ return p.id == productId; });
    }

    function includes(productId)
    {
        let product = _productList.find(function(p){ return p.id == productId; });
        return (product) ? true : false;
    }

    return {
        load,
        length,
        forEach,
        get,
        includes
    };
}

////////////////////////////////
// Exports

export {
    ProductList
};

