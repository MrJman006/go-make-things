////////////////////////////////
// Imports

import { Storage } from "./storage.js"
import { store } from "../vendors/reef/reef.es.min.js"

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

    function removeProduct(productId)
    {
        if(!_cart.includes(productId))
        {
            return;
        }

        console.log("Removing product from the cart.");
        _cart.splice(_cart.indexOf(productId), 1);
        Storage.local.setItem(_CACHE_ID, _cart);
    }

    function removeAllProducts()
    {
        Storage.local.removeItem(_CACHE_ID);
        load();
    }
    
    function hasProduct(productId)
    {
        return _cart.includes(productId);
    }

    function productCount()
    {
        return _cart.length;
    }

    function forEachProduct(callback)
    {
        _cart.forEach(callback);
    }

    return {
        load,
        addProduct,
        removeProduct,
        removeAllProducts,
        hasProduct,
        productCount,
        forEachProduct
    };
}

////////////////////////////////
// Exports

export {
    Cart
};

