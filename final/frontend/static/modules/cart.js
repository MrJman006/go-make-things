import { Storage } from "./storage.js"
    
let _CACHE_ID = "cartItems";

function getCartItems()
{
    let cartItems = Storage.local.getItem(_CACHE_ID);

    if(cartItems)
    {
        console.log("Loaded cart from the site cache.");
        return cartItems;
    }

    cartItems = [];
    return cartItems;
};

function saveCartItems(cartItems)
{
    Storage.local.setItem(_CACHE_ID, cartItems);
}

export {
    getCartItems,
    saveCartItems
};

