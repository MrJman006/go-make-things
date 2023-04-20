////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showErrorMessage } from "./modules/utils.js";
import { render, component } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

// N/A

////////////////////////////////
// Functions

function buildContent(productList, cart)
{
    let contentElement = document.querySelector("[data-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        buildErrorContent(contentElement, message);
        return;
    }

    function checkoutListTemplateGenerator()
    {
        //
        // Check for an empty cart.
        //
    
        if(cart.productCount() == 0)
        {
            let template = `
                <p>Your cart is empty.</p>
            `;
            return template;
        }
    
        //
        // Show cart items.
        //
    
        let checkoutTemplate = ``;
        let checkoutTotal = 0;

        cart.forEachProduct(
            function(productId)
            {
                let product = productList.get(productId);
                if(!product)
                {
                    return;
                }

                checkoutTotal += product.price;

                let itemTemplate = `
                    <div class="cart-item">
                        <div class="cart-item__product-detail">
                            <img class="cart-item__product-image" src="${product.url}" alt="${product.description}">
                            <p class="cart-item__product-name">${product.name}</p>
                        </div>
                        <div class="cart-item__order-detail">
                            <p class="cart-item__product-price">$${product.price}</p>
                        </div>
                    </div>
                `;

                checkoutTemplate += itemTemplate;
            }
        );

        checkoutTemplate += `
            <div class="total-bar">
                <p class="total-bar__label">Total:</p>
                <p class="total-bar__total">$${checkoutTotal}</p>
            </div>
        `;

        return checkoutTemplate;
    }

    component(contentElement, checkoutListTemplateGenerator);
}

function buildCart(productList, cart)
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
    let productList = ProductList();
    await productList.load();

    let cart = Cart();
    cart.load();

    buildContent(productList, cart);
    buildCart(productList, cart);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

