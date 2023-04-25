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

// N/A

////////////////////////////////
// Functions

function removeItemFromCart(e, cart, productList)
{
    let productId = e.target.getAttribute("data-remove-item");
    if(productId == "")
    {
        return;
    }

    cart.removeProduct(productId);

    let product = productList.get(productId);
    if(!product)
    {
        return;
    }

    notify(`Removed '${product.name}' from the cart.`);
}

function buildContent(productList, cart)
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

async function checkout(e, cart, productList)
{
    if(!e.target.hasAttribute("data-checkout"))
    {
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
    requestBodyData.success_url = "http://127.0.0.1:9999/success.html";
    requestBodyData.cancel_url = "http://127.0.0.1:9999/checkout.html";

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

    // Call the middleman API
    let response = await fetch(
        CHECKOUT_ENDPOINT,
        requestObject
    );

    if(!response.ok)
    {
        notify(`An error occured with the checkout system. Please notify the site administrator.`);

        return;
    }

    // Get the response
    let data = await response.json();

    // Redirect to the payment page.
    window.location.href = data.url;
}

async function main()
{
    let productList = ProductList();
    await productList.load();

    let cart = Cart();
    cart.load();

    buildContent(productList, cart);
    buildCart(productList, cart);

    
    document.addEventListener("click", function(e){ removeItemFromCart(e, cart, productList); });
    document.addEventListener("click", function(e){ checkout(e, cart, productList); });
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

