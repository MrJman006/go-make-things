import { storage } from "./storage.js"
import { store } from "../vendors/reef/reef.es.min.js"

function Cart()
{
    let _CACHE_ID = "cart";
    let _cart;

    function load()
    {
        _cart = store([]);

        //
        // First load any saved cart data.
        //

        let savedCartData = storage.site.getItem(_CACHE_ID);

        if(savedCartData)
        {
            console.log("Adding products to the cart from the site cache.");
            _cart.push(...savedCartData);
        }

        //
        // Second load cart data from the URL if it exists.
        //

        let url = new URL(window.location.href);
        let param = url.searchParams.get("cartItems");

        if(param)
        {
            console.log("Adding products to the cart from the URL.");
            let urlCartData = param.split(",");

            //
            // Only add products that are not already in the cart.
            //

            urlCartData.forEach(
                function(productId)
                {
                    if(_cart.includes(productId))
                    {
                        return;
                    }

                    _cart.push(productId);
                }
            );

            //
            // Clean up the URL.
            //

            url.searchParams.delete("cartItems");
            history.replaceState(history.state, null, url.toString());
        }
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

