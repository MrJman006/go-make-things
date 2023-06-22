////////////////////////////////
// Imports

import { storage } from "./storage.js"
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
        _cart = store(storage.site.getItem(_CACHE_ID) || []);
    }
    
    function add(productId)
    {
        if(_cart.includes(productId))
        {
            return;
        }

        console.log("Adding product to the cart.");
        _cart.push(productId);
        storage.site.setItem(_CACHE_ID, _cart);
    }

    function remove(productId)
    {
        if(!_cart.includes(productId))
        {
            return;
        }

        console.log("Removing product from the cart.");
        _cart.splice(_cart.indexOf(productId), 1);
        storage.site.setItem(_CACHE_ID, _cart);
    }

    function removeAll()
    {
        storage.site.removeItem(_CACHE_ID);
        load();
    }
    
    function has(productId)
    {
        return _cart.includes(productId);
    }

    function items()
    {
        return [..._cart];
    }

    return {
        load,
        add,
        remove,
        removeAll,
        has,
        items
    };
}

////////////////////////////////
// Exports

export {
    Cart
};

