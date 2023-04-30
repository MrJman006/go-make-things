////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showMessage } from "./modules/utils.js";
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
    let contentElement = document.querySelector("[data-content]");
    contentElement.replaceChildren();

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showMessage(contentElement, message);
        return;
    }

    //
    // Build product cards.
    //    

    contentElement.classList.add("gallery");

    function buildProductCard(product)
    {
        let productElement = `
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card">
                <img class="product-card__image" src="${product.url}" alt="${product.description}">
                <p class="product-card__title">${product.name}</p>
            </a>
        `;
        contentElement.innerHTML += productElement;
    }

    productList.forEach(buildProductCard);
}

function buildCart()
{
    function cartTemplateGenerator()
    {
        let productCount = cart.items().length;
        let cartTemplate = `
            <span aria-hidden="true">&#x1f6d2;</span> Cart <span>${productCount}</span>
        `;

        return cartTemplate;
    }

    let cartElement = document.querySelector("[data-cart]");
    component(cartElement, cartTemplateGenerator);
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
    buildCart();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

