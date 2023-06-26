////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showMessage } from "./modules/utils.js";
import { notify } from "./modules/notifier.js";
import { render, store, component } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

let productList;
let cart;
let redirecting;

////////////////////////////////
// Event Handlers

function removeItemFromCart(e)
{
    if(!e.target.hasAttribute("data-remove-item"))
    {
        return;
    }

    if(redirecting)
    {
        notify("Redirecting to the payment processor. Cannot modify cart.");
        return;
    }

    let productId = e.target.getAttribute("data-remove-item");

    cart.removeProduct(productId);

    let product = productList.get(productId);
    if(!product)
    {
        return;
    }

    notify(`Removed '${product.name}' from the cart.`);
}

async function checkout(e)
{
    if(!e.target.hasAttribute("data-checkout"))
    {
        return;
    }

    if(redirecting)
    {
        notify("A redirect to the payment processor is already in progress.");
        return;
    }

    let CHECKOUT_ENDPOINT = "https://gmtww-stripe.cfjcd.workers.dev";

    //
    // Build the request object.
    //

    let requestObject = {};

    // Method.
    requestObject.method = "POST";

    // Headers.
    requestObject.headers = {};
    requestObject.headers["Content-type"] = "application/json";

    // Body.
    let requestBodyData = {};
    requestBodyData.currency = "usd";
    requestBodyData.success_url = "https://mrjman006.github.io/gmt-webapps-workshop/lesson-11/success.html";
    requestBodyData.cancel_url = "https://mrjman006.github.io/gmt-webapps-workshop/lesson-11/cart.html";

    let cart_items = [];

    cart.forEachProduct(
        function(productId)
        {
            let product = productList.get(productId);

            if(!product)
            {
                return;
            }

            let cart_item = {};
            cart_item.product_id = product.id;
            cart_item.quantity = 1;

            cart_items.push(cart_item);
        }
    );

    requestBodyData.cart_items = cart_items;
    requestObject.body = JSON.stringify(requestBodyData);

    //
    // Call the middleman API
    //

    redirecting = true;
    notify(`Redirecting to payment processor...`);

    let response = await fetch(
        CHECKOUT_ENDPOINT,
        requestObject
    );

    if(!response.ok)
    {
        notify(`Failed to redirect to the payment processor. Please notify the site administrator.`);
        redirecting = false;
        return;
    }

    // Get the response
    let data = await response.json();

    // Redirect to the payment page.
    window.location.href = data.url;
}

function onClick(e)
{
    removeItemFromCart(e);
    checkout(e);
}

////////////////////////////////
// Functions

function buildContent()
{
    let contentElement = document.querySelector("[data-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        buildContent(contentElement, message);
        return;
    }

    function checkoutListTemplateGenerator()
    {
        let template = `
            <div class="label-bar">
                <p class="label-bar__product-name">Product</p>
                <p class="label-bar__product-price">Price</p>
            </div>
        `;

        //
        // Check for an empty cart.
        //
    
        if(cart.productCount() == 0)
        {
            template += `
                <p>Your cart is empty.</p>
            `;
        }
        else
        {
            cart.forEachProduct(
                function(productId)
                {
                    let product = productList.get(productId);
                    if(!product)
                    {
                        return;
                    }

                    let itemTemplate = `
                        <div class="cart-item">
                            <div class="cart-item__product-detail">
                                <a href="product.html?id=${product.id}"><img class="cart-item__product-image" src="${product.url}" alt="${product.description}"></a>
                                <p class="cart-item__product-name">${product.name}</p>
                            </div>
                            <div class="cart-item__order-detail">
                                <p class="cart-item__product-price">$${product.price}</p>
                                <a class="cart-item__remove-item-button button" data-remove-item="${product.id}">&#x2716</a>
                            </div>
                        </div>
                    `;

                    template += itemTemplate;
                }
            );
        }

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
            }
        );

        template += `
            <div class="total-bar">
                <p class="total-bar__label">Total:</p>
                <p class="total-bar__total">$${checkoutTotal}</p>
            </div>
        `;

        if(cart.productCount() != 0)
        {
            template += `
                <div class="checkout-bar">
                    <a class="checkout-button button primary" data-checkout>Checkout</a>
                </div>
            `;
        }

        return template;
    }

    component(contentElement, checkoutListTemplateGenerator);
}

function buildCart()
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
    redirecting = false;

    productList = ProductList();
    await productList.load();

    cart = Cart();
    cart.load();

    buildContent();
    buildCart();

    document.addEventListener("click", onClick);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

