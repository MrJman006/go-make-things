////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { parseUrlProductIds, clearUrlProductIds } from "./modules/utils.js";
import { showNotification } from "./modules/notifications.js";
import { showErrorMessage } from "./modules/errors.js";
import { store, component } from "./vendors/reef/reef.es.min.js"

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

function handleRemoveItemFromCartIconClick(e)
{
    if(e.target.getAttribute("data-action") != "remove-product")
    {
        return;
    }

    if(redirecting)
    {
        showNotification("Redirecting to the payment processor. Cannot modify cart.");
        return;
    }

    let productId = e.target.getAttribute("data-product-id");

    let product = productList.get(productId);
    if(!product)
    {
        return;
    }

    cart.remove(productId);

    showNotification(`Removed '${product.name}' from the cart.`);
}

async function handleCheckoutButtonClick(e)
{
    if(e.target.getAttribute("data-action") != "checkout")
    {
        return;
    }

    if(redirecting)
    {
        showNotification("A redirect to the payment processor is already in progress.");
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

    let success_url = new URL("https://mrjman006.github.io/gmt-webapps-workshop/lesson-13/success.html");
    success_url.searchParams.set("productIds", cart.items());
    requestBodyData.success_url = success_url.toString();
   
    let cancel_url = new URL("https://mrjman006.github.io/gmt-webapps-workshop/lesson-13/cart.html");
    cancel_url.searchParams.set("productIds", cart.items());
    requestBodyData.cancel_url = cancel_url.toString();

    let cart_items = [];

    cart.items().forEach(
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
    showNotification(`Redirecting to payment processor...`);

    let url;

    try
    {
        let response = await fetch(
            CHECKOUT_ENDPOINT,
            requestObject
        );

        if(!response.ok)
        {
            throw response;
        }

        // Get the response
        let data = await response.json();
        url = data.url;
    }
    catch(e)
    {
        showNotification(`Failed to redirect to the payment processor. Please notify the site administrator.`);
        redirecting = false;
        return;
    }

    // Redirect to the payment page.
    cart.removeAll();
    history.replaceState(history.state, null, cancel_url.toString());
    window.location.href = url;
}

function onClick(e)
{
    handleRemoveItemFromCartIconClick(e);
    handleCheckoutButtonClick(e);
}

////////////////////////////////
// Functions

function generateCartListHtml()
{
    let cartListHtml = `
        <div class="cart-list">
            <div class="label-bar">
                <p class="product-name">Product</p>
                <p class="product-price">Price</p>
            </div>
            <div class="items">
    `;

    //
    // Check for an empty cart.
    //

    if(cart.items().length == 0)
    {
        cartListHtml += `
            <p>Your cart is empty.</p>
        `;
    }
    else
    {
        cart.items().forEach(
            function(productId)
            {
                let product = productList.get(productId);
                if(!product)
                {
                    return;
                }

                let itemHtml = `
                    <div class="item">
                        <div class="product-detail">
                            <a href="product.html?id=${product.id}">
                                <img class="product-image" src="${product.url}" alt="${product.description}">
                                <p class="product-name">${product.name}</p>
                            </a>
                        </div>
                        <div class="order-detail">
                            <p class="product-price">$${product.price}</p>
                            <a class="action" data-action="remove-product" data-product-id="${product.id}">&#x2716</a>
                        </div>
                    </div>
                `;

                cartListHtml += itemHtml;
            }
        );
    }

    cartListHtml += `
            </div>
        </div>
    `;

    let checkoutTotal = 0;

    cart.items().forEach(
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

    cartListHtml += `
        <div class="cart-total-bar">
            <p class="label">Total:</p>
            <p class="value">$${checkoutTotal}</p>
            <p class="remove-product-action-spacer"></p>
        </div>
    `;

    if(cart.items().length != 0)
    {
        cartListHtml += `
            <div class="checkout-bar">
                <a class="button primary" data-action="checkout">Checkout</a>
            </div>
        `;
    }

    return cartListHtml;
}

function buildCartList()
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showMessage(message);
        return;
    } 

    component(
        pageContentContainer,
        generateCartListHtml
    );
}

function generateCartIconHtml()
{
    let productCount = cart.items().length;

    let cartIconHtml = `
        <span aria-hidden="true">&#x1f6d2;</span> Cart <span>${productCount}</span>
    `;

    return cartIconHtml;
}

function buildCartIcon()
{
    let cartIconContainer = document.querySelector("[data-cart-icon-container]");

    component(
        cartIconContainer,
        () =>{ return generateCartIconHtml(); }
    );
}

function mergeCanceledCheckoutItems()
{
    let productIds = parseUrlProductIds();
    clearUrlProductIds();

    productIds.forEach((id) => { cart.add(id); });
}

async function main()
{
    redirecting = false;

    productList = ProductList();
    await productList.load();

    cart = Cart();
    cart.load();

    mergeCanceledCheckoutItems();

    buildCartList();

    buildCartIcon();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);
document.addEventListener("click", onClick);

