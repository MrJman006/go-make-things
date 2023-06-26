////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showMessageWithRedirect } from "./modules/utils.js";
import { render, component } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

// N/A

////////////////////////////////
// Functions

function buildContent()
{
    let contentElement = document.querySelector("[data-content]");

    let message = "We really appreciate your business. Your items will be sent to your email shortly.";
    showMessageWithRedirect(contentElement, message);
    return;
}

function buildCart(cart)
{
    function cartTemplateGenerator()
    {
        let productCount = cart.productCount();
        let cartTemplate = `
            <span aria-hidden="true">&#x1f6d2;</span> Cart <span>${productCount}</span>
        `;

        return cartTemplate;
    }

    let cartElement = document.querySelector("[data-cart]");
    component(cartElement, cartTemplateGenerator);
}

async function main()
{
    let cart = Cart();
    cart.load();
    cart.removeAllProducts();

    buildContent();
    buildCart(cart);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

