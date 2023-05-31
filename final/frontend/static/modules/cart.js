import { store } from "../vendors/reef/reef.js";
import { storage } from "./storage.js";

let _STORAGE_ID = "cart";

function Cart()
{
    let _cart;
   
    function addProduct(productId)
    {
        if(_cart.includes(productId))
        {
            return;
        }

        console.log("Adding product to the cart.");
        _cart.push(productId);
        storage.site.setItem(_STORAGE_ID, _cart);
    }

    function removeProduct(productId)
    {
        if(!_cart.includes(productId))
        {
            return;
        }

        console.log("Removing product from the cart.");
        _cart.splice(_cart.indexOf(productId), 1);
        storage.site.setItem(_STORAGE_ID, _cart);
    }

    function removeAllProducts()
    {
        storage.site.removeItem(_STORAGE_ID);
        _cart.splice(0, _cart.length);
    }
    
    function hasProduct(productId)
    {
        return _cart.includes(productId);
    }

    function productList()
    {
        return [..._cart];
    }

    function init()
    {
        _cart = storage.site.getItem(_STORAGE_ID);

        if(_cart)
        {
            console.log("Loaded cart from site storage.");
        }
        else
        {
            _cart = [];
        }

        _cart = store(_cart);
    }

    init();

    return {
        addProduct,
        removeProduct,
        removeAllProducts,
        hasProduct,
        productList
    };
}

export {
    Cart
};

