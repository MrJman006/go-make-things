////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showErrorMessage } from "./modules/utils.js";
import { component } from "./vendors/reef/reef.es.min.js";

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

// N/A

////////////////////////////////
// Functions

function buildProductGallery(productList, cart)
{
    let contentElement = document.querySelector("[data-content]");
    contentElement.replaceChildren();

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showErrorMessage(contentElement, message);
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

function buildCart(cart)
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
    let productList = ProductList();
    await productList.load();

    let cart = Cart();
    cart.load();

    buildProductGallery(productList, cart);
    buildCart(cart);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

