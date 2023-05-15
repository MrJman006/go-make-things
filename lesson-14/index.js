////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showErrorMessage } from "./modules/errors.js";
import { component } from "./vendors/reef/reef.es.min.js";

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

let cart;
let productList;

////////////////////////////////
// Functions

function buildProductGallery()
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

    //
    // Build product cards.
    //    

    pageContentContainer.classList.add("gallery");

    function buildProductCard(product)
    {
        let productElement = `
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card">
                <img class="product-card__image" src="${product.url}" alt="${product.description}">
                <p class="product-card__title">${product.name}</p>
            </a>
        `;
        pageContentContainer.innerHTML += productElement;
    }

    productList.forEach(buildProductCard);
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

function cleanupUrl()
{
    let regex = new RegExp("/index.html$");
    let cleanUrl = location.href.replace(regex, "/")
    history.replaceState(history.state, null, cleanUrl);
}

async function main()
{
    cleanupUrl();

    productList = ProductList();
    await productList.load();

    cart = Cart();
    cart.load();

    buildProductGallery();

    buildCartIcon();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);

