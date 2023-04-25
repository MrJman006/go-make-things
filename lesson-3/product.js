////////////////////////////////
// Imports

import {fetchProductData} from "./api.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

// N/A

////////////////////////////////
// Functions

function getProductId()
{
    let url = new URL(window.location.href);
    let id = url.searchParams.get("id");
    return id;
}

function getProductData(products, productId)
{
    let productData = products.find((p) => { return p.id == productId; });
    return productData;
}

function buildProductContent(products)
{
    let contentElement = document.querySelector("[data-content]");
    contentElement.replaceChildren();

    //
    // Ensure that products are available.
    //

    if(products.length == 0)
    {
        contentElement.innerHTML = `
            <p>There are no photos available at this time. Please check back later.</p>
        `;
        return;
    }

    //
    // Ensure a product was requested.
    //
 
    let productId = getProductId();
    if(!productId || productId == "")
    {
        contentElement.innerHTML = `
            <p>The requested product could not be located. Redirecting to the product gallery.</p>
        `;
        setTimeout((e) => { window.location.href = "index.html"; }, 3000);
        return;       
    }

    //
    // Ensure the product exists.
    //

    let productData = getProductData(products, productId);
    if(!productData)
    {
        contentElement.innerHTML = `
            <p>The requested product could not be located. Redirecting to the product gallery.</p>
        `;
        setTimeout((e) => { window.location.href = "index.html"; }, 3000);
        return;
    }

    //
    // Display the product.
    //

    // Update the page title.
    document.title = `${productData.name} | ${document.title}`;

    let productElement = `
        <div class="product">
            <img src="${productData.url}" alt="${productData.description}">
            <div class="info">
                <p class="title">${productData.name}</p>
                <p class="price">$${productData.price}</p>
                <p class="description">${productData.description}</p>
            </div>
        </div>
    `;
    contentElement.innerHTML += productElement;
}

async function main()
{
    let products = await fetchProductData();
    buildProductContent(products);
}

////////////////////////////////
// Script Entry Point

window.addEventListener(
    "load",
    e => { main(); }
);

