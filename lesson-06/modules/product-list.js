////////////////////////////////
// Imports

import { Storage } from "./storage.js"

////////////////////////////////
// Products API

function ProductList()
{
    let _PRODUCTS_ENDPOINT = "https://vanillajsacademy.com/api/photos.json";
    let _CACHE_ID = "productList";
    let _productList = [];

    async function load(options = { bypassCache: false })
    {
        if(!options.bypassCache)
        {
            _productList = Storage.session.getItem(_CACHE_ID);
            if(_productList)
            {
                console.log("Loading product list from the session cache.");
                return;
            }
        }
    
        try
        {
            console.log("Fetching fresh product list from the server.");
            let result = await fetch(_PRODUCTS_ENDPOINT);
            if(!result.ok)
            {
                throw result;
            }
        
            _productList = await result.json();
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

    function save()
    {
        console.log("Saving product list to the session cache.");
        Storage.session.setItem(_CACHE_ID, _productList);
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

    function contains(productId)
    {
        let product = _productList.find(function(p){ return p.id == productId; });
        return (product) ? true : false;
    }

    return {
        load,
        save,
        length,
        forEach,
        get,
        contains
    };
}

////////////////////////////////
// Exports

export {
    ProductList
};

