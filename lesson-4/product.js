////////////////////////////////
// Imports

import {store, component} from "./reef.es.min.js"
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

function buildErrorContentTemplate(message)
{
    let template = `<p>${message}</p>`;
    return template;
}

function buildErrorContentRedirectTemplate(message, reactiveData)
{
    return template;
}

function buildErrorContentWithRedirect(contentElement, message)
{
    let reactiveData = store({
        remainingSec: 3
    });

    function templateGenerator()
    {
        return `<p>${message} Redirecting to the product gallery in ${reactiveData.remainingSec} seconds.</p>`;
    };

    component(contentElement, templateGenerator);

    let interval;
    let intervalDelayMilliSec = 1000;

    function update()
    {
        reactiveData.remainingSec -= 1;
        if(reactiveData.remainingSec == 0 )
        {
            clearInterval(interval);
            window.location.href = "/";
        }
    }

    interval = setInterval(update, intervalDelayMilliSec);
}

function buildErrorContent(contentElement, message)
{
    let templateGenerator = () => { return `<p>There are no photos available at this time. Please check back later.</p>`; };
    component(contentElement, templateGenerator);
}

function buildProductContent(contentElement, productData)
{
    // Update the page title.
    document.title = `${productData.name} | ${document.title}`;

    function addToCartButtonTemplateGenerator()
    {
        let template = `<a class="button" data-add-to-cart>Add To Cart</a>`;
        return template;
    }

    function templateGenerator()
    {
        let template = `
            <div class="product">
                <img src="${productData.url}" alt="${productData.description}">
                <div class="info">
                    <p class="title">${productData.name}</p>
                    <p class="description">${productData.description}</p>
                    <p class="price">$${productData.price}</p>
                    ${addToCartButtonTemplateGenerator()}
                </div>
            </div>
        `;
        return template;
    };

    component(contentElement, templateGenerator);
}

function buildContent(products)
{
    let contentElement = document.querySelector("[data-content]");

    //
    // Ensure that products are available.
    //

    if(products.length == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        buildErrorContent(contentElement, message);
        return;
    }

    //
    // Ensure a product was requested.
    //

    let productId = getProductId();
    if(!productId || productId == "")
    {
        let message = "The requested product could not be located.";
        buildErrorContentWithRedirect(contentElement, message);
        return;
    }

    //
    // Ensure the product exists.
    //

    let productData = getProductData(products, productId);
    if(!productData)
    {
        let message = "The requested product could not be located.";
        buildErrorContentWithRedirect(contentElement, message);
        return;
    }

    //
    // Display the product.
    //

    buildProductContent(contentElement, productData);
}

async function main()
{
    let products = await fetchProductData();
    buildContent(products);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

