import { render, component } from "./vendors/reef/reef.es.min.js"
import { fetchProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { buildCartIcon } from "./modules/nav-bar.js";
import { showPageContentErrorMessage, showPageContentErrorMessageAndRedirect } from "./modules/errors.js";
import { Notifier } from "./modules/notifier.js";

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
            let product = productList.find((product) => { return product.id == productId; });
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

function onClick(e, appState)
{
    handleRemoveItemFromCartIconClick(e, appState);
    //handleCheckoutButtonClick(e, appState);
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
