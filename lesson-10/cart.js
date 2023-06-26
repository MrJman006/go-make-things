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
    requestBodyData.line_items = [];
    requestBodyData.success_url = "https://mrjman006.github.io/gmt-webapps-workshop/lesson-10/success.html";
    requestBodyData.cancel_url = "https://mrjman006.github.io/gmt-webapps-workshop/lesson-10/cart.html";

    cart.forEachProduct(
        function(productId)
        {
            let product = productList.get(productId);

            if(!product)
            {
                return;
            }

            let line_items = requestBodyData.line_items;
            line_items.push({});

            let line_item = line_items[line_items.length - 1];
            line_item.quantity = 1;
            line_item.price_data = {};

            let price_data = line_item.price_data;
            price_data.currency = "usd";
            price_data.product_data = {};
            price_data.unit_amount = product.price * 100;

            let product_data = price_data.product_data;
            product_data.name = product.name;
            product_data.description = product.description;
            product_data.images = [];

            let images = product_data.images;
            images.push(product.url);
        }
    );

    requestObject.body = JSON.stringify(requestBodyData);

    redirecting = true;
    notify(`Redirecting to payment processor...`);

    // Call the middleman API
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

