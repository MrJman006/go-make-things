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
        _cart = store(Storage.local.getItem(_CACHE_ID));
        if(_cart)
        {
            console.log("Loading cart from the site cache.");
            return;
        }
   
        console.log("Creating a new cart."); 
        _cart = store([]);
        Storage.local.setItem(_CACHE_ID, _cart);
        
        return;
    }
    
    function save()
    {
        console.log("Saving cart to the site cache.");
        Storage.local.setItem(_CACHE_ID, _cart);
    }
    
    function addProduct(productId)
    {
        console.log("Adding product to the cart.");
        for(let id of _cart)
        {
            if(id == productId)
            {
                return;
            }
        }
    
        _cart.push(productId);
    }
    
    function hasProduct(productId)
    {
        for(let id of _cart)
        {
            if(id == productId)
            {
                return true;
            }
        }
    
        return false;
    }

    function productCount()
    {
        return _cart.length;
    }

    return {
        load,
        save,
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

