import { store, component } from "./vendors/reef/reef.es.min.js"
import { fetchProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showPageContentErrorMessage, showPageContentErrorMessageAndRedirect } from "./modules/errors.js";
import { buildCartIcon } from "./modules/nav-bar.js";

async function buildInitialAppState()
{
    let appState = {};

    //
    // Product List
    //

    appState.productList = await fetchProductList();

    //
    // Cart
    //

    appState.cart = Cart();
    appState.cart.load();

    return appState;
}

function parseProductIdFromUrl()
{
    let url = new URL(window.location.href);
    let id = url.searchParams.get("id");
    return id;
}

function generateProductListingCartDetailsHtml(product, cart)
{
    let html = ``;

    if(cart.has(product.id))
    {
        html += `
            <div class="product-listing__cart-details">
                <p>This product is in your cart!</p>
            </div>
        `;
    }
    else
    {
        html = `
            <div class="product-listing__cart-details">
                <a class="button primary" data-button="add-to-cart" data-product="${product.id}">Add To Cart</a>
            </div>
        `;
    }

    return html;
}

function generateProductListingHtml(product, cart)
{
    let html = `
        <div class="product-listing" aria-live="polite">
            <img class="product-listing__image" src="${product.url}" alt="${product.description}">
            <p class="product-listing__title">${product.name}</p>
            <p class="product-listing__description">${product.description}</p>
            <p class="product-listing__price">$${product.price}</p>
            ${generateProductListingCartDetailsHtml(product, cart)}
        </div>
    `;

    return html;
}

function buildProductListing(appState)
{
    let {productList, cart} = appState;

    let pageContentContainer = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showPageContentErrorMessage(message);
        return;
    }

    //
    // Ensure a product was requested.
    //

    let productId = parseProductIdFromUrl();
    if(!productId || productId == "")
    {
        let message = "The requested product could not be located.";
        showPageContentErrorMessageAndRedirect(message);
        return;
    }

    //
    // Ensure the product exists.
    //

    let product = productList.find(
        function(p)
        {
            return p.id == productId;
        }
    );

    if(!product)
    {
        let message = "The requested product could not be located.";
        showPageContentErrorMessageAndRedirect(message);
        return;
    }

    //
    // Display the product.
    //

    // Update the page title.
    document.title = `${product.name} | ${document.title}`; 

    component(
        pageContentContainer,
        () => { return generateProductListingHtml(product, cart); }
    );
}

function handleAddToCartButtonClick(e, appState)
{
    let {cart} = appState;

    let buttonType = e.target.getAttribute("data-button");
    if(buttonType != "add-to-cart")
    {
        return;
    }

    let productId = e.target.getAttribute("data-product");
    cart.add(productId);
}

function onClick(e, appState)
{
    handleAddToCartButtonClick(e, appState);
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
    let appState = await buildInitialAppState();

    buildCartIcon(appState.cart);

    buildProductListing(appState);

    setupEventListeners(appState);
}

window.addEventListener("load", main);
