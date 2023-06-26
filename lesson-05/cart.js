////////////////////////////////
// Imports

import { Storage } from "./storage.js"
import { store } from "./reef.es.min.js"

////////////////////////////////
// Cart API

function Cart()
{
    let _CACHE_ID = "cart";
    let _cart;

    function load()
    {
        console.log("Loading cart from the site cache.");
        _cart = store(Storage.local.getItem(_CACHE_ID) || []);
    }
    
    function addProduct(productId)
    {
        if(_cart.includes(productId))
        {
            return;
        }

        console.log("Adding product to the cart.");
        _cart.push(productId);
        Storage.local.setItem(_CACHE_ID, _cart);
    }
    
    function hasProduct(productId)
    {
        return _cart.includes(productId);
    }

    function productCount()
    {
        return _cart.length;
    }

    return {
        load,
        addProduct,
        hasProduct,
        productCount
    };
}

////////////////////////////////
// Exports

export {
    Cart
};

