import { render, component } from "./vendors/reef/reef.es.min.js"
import { fetchProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { buildCartIcon } from "./modules/nav-bar.js";
import { showPageContentErrorMessage, showPageContentErrorMessageAndRedirect } from "./modules/errors.js";
import { Notifier } from "./modules/notifier.js";
import { timedFetch } from "./modules/fetch.js";

async function initProductListAppState(appState)
{
    appState.productList = await fetchProductList();
}

function initCartAppState(appState)
{
    appState.cart = Cart();
    appState.cart.load();
}

function initCheckoutMutexAppState(appState)
{
    appState.checkingOut = false;
}

function initCartNotiferAppState(appState)
{
    let cartNotificationContainer = document.querySelector("[data-notification-container='cart-notifications']");
    appState.cartNotifier = Notifier(cartNotificationContainer);
}

function generateCartListingTableHeaderHtml(appState)
{
    let {cart} = appState;

    //
    // Don't return the table header HTML if the cart is empty.
    //

    if(cart.items().length == 0)
    {
        return "";
    }

    let html = `
        <div class="cart-listing-table__label-bar">
            <p class="cart-listing-table__label">Product</p>
            <p class="cart-listing-table__label">Price</p>
        </div>
    `;

    return html;
}

function generateCartListingTableBodyHtml(appState)
{
    let {productList, cart} = appState;

    //
    // Return a message that the cart is empty if there are no products in the
    // cart.
    //

    if(cart.items().length == 0)
    {
        return `
            <p>Your cart is empty.</p>
        `;
    }

    let html = ``;

    cart.items().forEach(
        function(productId)
        {
            let product = productList.find((product) => { return product.id == productId; });
            if(!product)
            {
                console.log("A product was removed from your cart because it could not be found.");
                return;
            }

            let itemHtml = `
                <div class="cart-listing-table-item">
                    <a href="product.html?id=${product.id}">
                        <img class="cart-listing-table-item__product-image" src="${product.url}" alt="${product.description}">
                        <p class="cart-listing-table-item__product-name">${product.name}</p>
                    </a>
                    <div class="cart-listing-table-item__order-detail">
                        <p class="cart-listing-table-item__product-price">$${product.price}</p>
                        <a class="cart-listing-table-item__remove-item-action action" data-action="remove-product" data-product-id="${product.id}">&#x2716</a>
                    </div>
                </div>
            `;

            html += itemHtml;
        }
    );

    return html;
}

function generateCartListingTableHtml(appState)
{
    let cartListingTableHeaderHtml = generateCartListingTableHeaderHtml(appState);

    let cartListingTableBodyHtml = generateCartListingTableBodyHtml(appState);

    let tableHtml = `
        <div class="cart-listing-table">
            ${cartListingTableHeaderHtml}
            <div>
                ${cartListingTableBodyHtml}
            </div>
        </div>
    `;

    return tableHtml;
}

function generateCartListingSummaryBar(appState)
{
    let {productList, cart} = appState;

    //
    // Don't return summary bar HTML if there are no products in the cart.
    //

    if(cart.items().length == 0)
    {
        return "";
    }

    //
    // Calculate the cart total.
    //

    let cartTotal = 0;

    cart.items().forEach(
        function(productId)
        {
            let product = productList.find((product) => { return product.id == productId; });
            if(!product)
            {
                return;
            }

            cartTotal += product.price;
        }
    );

    let summaryBarHtml = `
        <div class="cart-listing-summary-bar">
            <p class="cart-listing-summary-bar__total-label">Total:</p>
            <p class="cart-listing-summary-bar__total-value">$${cartTotal}</p>
            <p class="cart-listing-summary-bar__remove-item-action-spacer"></p>
        </div>
    `;

    return summaryBarHtml;
}

function generateCartListingCheckoutBarHtml(appState)
{
    let {cart} = appState;

    //
    // Don't return checkout bar HTML if there are no products in the cart.
    //

    if(cart.items().length == 0)
    {
        return "";
    }

    let checkoutBarHtml = `
        <div class="cart-listing-checkout-bar">
            <a class="button primary" data-action="checkout">Checkout</a>
        </div>
    `;

    return checkoutBarHtml;
}

function generateCartListingHtml(appState)
{
    let cartListingTableHtml = generateCartListingTableHtml(appState);

    let cartListingSummaryBarHtml = generateCartListingSummaryBar(appState);

    let cartListingCheckoutBarHtml = generateCartListingCheckoutBarHtml(appState);

    let cartListingHtml = `
        ${cartListingTableHtml}
        ${cartListingSummaryBarHtml}
        ${cartListingCheckoutBarHtml}
    `;

    return cartListingHtml;
}

function buildCartListing(appState)
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    let {productList} = appState;

    if(productList.length == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showPageContentErrorMessage(message);
        return;
    }

    //
    // Render the cart listing.
    //

    let cartListingHtml = generateCartListingHtml(appState);

    render(pageContentContainer, cartListingHtml);

    //
    // Listen for data updates.
    //

    component(
        pageContentContainer,
        () => { return generateCartListingHtml(appState); }
    );
}

function handleRemoveItemFromCartIconClick(e, appState)
{
    if(e.target.getAttribute("data-action") != "remove-product")
    {
        return;
    }

    if(appState.checkingOut)
    {
        appState.cartNotifier.notify("The cart cannot be modifed while you are redirecting to the payment processor.");

        return;
    }

    let {cart, productList} = appState;

    let productId = e.target.getAttribute("data-product-id");
    cart.remove(productId);

    let product = productList.find((product) => { return product.id == productId; });
    if(!product)
    {
        appState.cartNotifier.notify("Removed a product from the cart.");
        return;
    }

    appState.cartNotifier.notify(`Removed '${product.name}' from the cart.`);
}

function buildCheckoutRequest(appState)
{
    let request = {};

    let {cart, productList} = appState;

    //
    // Method.
    //

    request.method = "POST";

    //
    // Headers.
    //

    request.headers = {};
    request.headers["Content-type"] = "application/json";

    //
    // Body.
    //

    let data = {};

    data.currency = "usd";

    let successUrl = new URL("http://127.0.0.1:9999/success.html");
    successUrl.searchParams.set("purchasedItems", appState.cart.items());
    data.successUrl = successUrl.toString();
   
    let cancelUrl = new URL("http://127.0.0.1:9999/cart.html");
    cancelUrl.searchParams.set("cartItems", cart.items());
    data.cancelUrl = cancelUrl.toString();

    let cartItems = [];

    cart.items().forEach(
        function(productId)
        {
            let product = productList.find((product) => { return product.id == productId; });
            if(!product)
            {
                return;
            }

            let cartItem = {};
            cartItem.productId = product.id;
            cartItem.quantity = 1;

            cartItems.push(cartItem);
        }
    );

    data.cartItems = cartItems;
    request.body = JSON.stringify(data);

    return request;
}

async function handleCheckoutButtonClick(e, appState)
{
    if(e.target.getAttribute("data-action") != "checkout")
    {
        return;
    }

    if(appState.checkingOut)
    {
        appState.cartNotifier.notify("Redirecting to the payment processor.");
        return;
    }

    //
    // Request to checkout.
    //

    let CHECKOUT_ENDPOINT = "https://gmtww-api-checkout.cfjcd.workers.dev";

    let request = buildCheckoutRequest(appState);

    appState.cartNotifier.notify("Redirecting to the payment processor.");

    appState.checkingOut = true;

    let paymentProcessorLink;

    try
    {
        let response = await timedFetch(
            CHECKOUT_ENDPOINT,
            request
        );

        if(!response.ok)
        {
            let message = await response.text();
            throw new Error(message);
        }

        let data = await response.json();
        paymentProcessorLink = data.url;
    }
    catch(e)
    {
        console.error(e);
        appState.cartNotifier.notify("Failed to redirect to the payment processor. Please try again or notify the site administrator.");
        appState.checkingOut = false;
        return;
    }

    //
    // Redirect to the payment page.
    //

    let {cart} = appState;
    cart.removeAll();
    window.location.href = paymentProcessorLink;
}

function onClick(e, appState)
{
    handleRemoveItemFromCartIconClick(e, appState);
    handleCheckoutButtonClick(e, appState);
}

function setupEventListeners(appState)
{
    document.addEventListener(
        "click",
        (e) => { onClick(e, appState); }
    );
}

async function main()
{
    let appState = {};

    await initProductListAppState(appState);

    initCartAppState(appState);

    initCheckoutMutexAppState(appState);

    initCartNotiferAppState(appState);

    buildCartIcon(appState.cart);

    buildCartListing(appState);

    setupEventListeners(appState);
}

window.addEventListener("load", main);
