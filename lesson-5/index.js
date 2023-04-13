////////////////////////////////
// Imports

import { ProductList } from "./product-list.js";

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

// N/A

////////////////////////////////
// Functions

function buildProductGallery(productList)
{
    let contentElement = document.querySelector("[data-content]");
    contentElement.replaceChildren();

    //
    // Ensure that products are available.
    //

    if(productList.length() == 0)
    {
        contentElement.innerHTML = `
            <p>There are no photos available at this time. Please check back later.</p>
        `;
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

async function main()
{
    let productList = ProductList();
    await productList.load();
    buildProductGallery(productList);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

