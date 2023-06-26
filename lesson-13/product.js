////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showErrorMessage, showErrorMessageAndRedirect } from "./modules/errors.js";
import { store, component } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

let cart;
let productList;

////////////////////////////////
// Functions

function handleAddToCartButtonClick(e)
{
    let buttonType = e.target.getAttribute("data-button");
    if(buttonType != "add-to-cart")
    {
        return;
    }

    let productId = e.target.getAttribute("data-product");
    cart.add(productId);
}

function onClick(e)
{
    handleAddToCartButtonClick(e);
}

function getProductId()
{
    let url = new URL(window.location.href);
    let id = url.searchParams.get("id");
    return id;
}

function generateProductListingCartDetailsHtml(product)
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

function generateProductListingHtml(product)
{
    let html = `
        <div class="product-listing" aria-live="polite">
            <img class="product-listing__image" src="${product.url}" alt="${product.description}">
            <p class="product-listing__title">${product.name}</p>
            <p class="product-listing__description">${product.description}</p>
            <p class="product-listing__price">$${product.price}</p>
            ${generateProductListingCartDetailsHtml(product)}
        </div>
    `;

    return html;
}

function buildProductListing()
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showErrorMessage(message);
        return;
    }

    //
    // Ensure a product was requested.
    //

    let productId = getProductId();
    if(!productId || productId == "")
    {
        let message = "The requested product could not be located.";
        showErrorMessageAndRedirect(message);
        return;
    }

    //
    // Ensure the product exists.
    //

    let product = productList.get(productId);
    if(!product)
    {
        let message = "The requested product could not be located.";
        showErrorMessageAndRedirect(message);
        return;
    }

    //
    // Display the product.
    //

    // Update the page title.
    document.title = `${product.name} | ${document.title}`; 

    component(
        pageContentContainer,
        () => { return generateProductListingHtml(product); }
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

async function main()
{
    productList = ProductList();
    await productList.load();

    cart = Cart();
    cart.load();

    buildProductListing();

    buildCartIcon();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);
document.addEventListener("click", onClick);
