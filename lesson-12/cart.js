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
    if(!e.target.hasAttribute("data-remove-item"))
    {
        return;
    }

    if(redirecting)
    {
        showNotification("Redirecting to the payment processor. Cannot modify cart.");
        return;
    }

    let productId = e.target.getAttribute("data-remove-item");

    cart.remove(productId);

    let product = productList.get(productId);
    if(!product)
    {
        return;
    }

    showNotification(`Removed '${product.name}' from the cart.`);
}

async function handleCheckoutButtonClick(e)
{
    if(!e.target.hasAttribute("data-checkout"))
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

    let success_url = new URL("http://127.0.0.1:9999/success.html");
    success_url.searchParams.set("productIds", cart.items());
    requestBodyData.success_url = success_url.toString();
   
    let cancel_url = new URL("http://127.0.0.1:9999/cart.html");
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

    let response = await fetch(
        CHECKOUT_ENDPOINT,
        requestObject
    );

    if(!response.ok)
    {
        showNotification(`Failed to redirect to the payment processor. Please notify the site administrator.`);
        redirecting = false;
        return;
    }

    // Get the response
    let data = await response.json();

    // Redirect to the payment page.
    cart.removeAll();
    history.replaceState(history.state, null, cancel_url.toString());
    window.location.href = data.url;
}

function onClick(e)
{
    handleRemoveItemFromCartIconClick(e);
    handleCheckoutButtonClick(e);
}

////////////////////////////////
// Functions

function generateCartItemTableHtml()
{
    let cartItemTableHtml = `
        <div class="label-bar">
            <p class="label-bar__product-name">Product</p>
            <p class="label-bar__product-price">Price</p>
        </div>
        <div class="line-item-table">
    `;

    //
    // Check for an empty cart.
    //

    if(cart.items().length == 0)
    {
        cartItemTableHtml += `
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

                let itemTemplate = `
                    <div class="line-item">
                        <div class="line-item__product-detail">
                            <a href="product.html?id=${product.id}"><img class="line-item__product-image" src="${product.url}" alt="${product.description}"></a>
                            <p class="line-item__product-name">${product.name}</p>
                        </div>
                        <div class="line-item__order-detail">
                            <p class="line-item__product-price">$${product.price}</p>
                            <a class="line-item__remove-item-button button" data-remove-item="${product.id}">&#x2716</a>
                        </div>
                    </div>
                `;

                cartItemTableHtml += itemTemplate;
            }
        );
    }

    cartItemTableHtml += `
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

    cartItemTableHtml += `
        <div class="total-bar">
            <p class="total-bar__label">Total:</p>
            <p class="total-bar__total">$${checkoutTotal}</p>
            <p class="total-bar__remove-item-spacer"></p>
        </div>
    `;

    if(cart.items().length != 0)
    {
        cartItemTableHtml += `
            <div class="checkout-bar">
                <a class="checkout-button button primary" data-checkout>Checkout</a>
            </div>
        `;
    }

    return cartItemTableHtml;
}

function buildCartItemTable()
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
        () => { return generateCartItemTableHtml(); }
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

    buildCartItemTable();

    buildCartIcon();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);
document.addEventListener("click", onClick);

