////////////////////////////////
// Imports

import {render} from "./reef.es.min.js"
import {fetchProductData} from "./api.js"
import {fetchCartData} from "./api.js"
import {Storage} from "./storage.js"

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
    let remainingSec = 3;

    function templateGenerator()
    {
        return `<p>${message} Redirecting to the product gallery in ${remainingSec} seconds.</p>`;
    };

    render(contentElement, templateGenerator());

    let interval;
    let intervalDelayMilliSec = 1000;

    function update()
    {
        remainingSec -= 1;
        render(contentElement, templateGenerator());
        if(remainingSec == 0 )
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
    render(contentElement, templateGenerator());
}

function buildProductContent(contentElement, productData, cart)
{
    // Update the page title.
    document.title = `${productData.name} | ${document.title}`;

    function addToCartButtonTemplateGenerator()
    {
        let template;

        let productIsInCart = cart.includes(productData.id);
        if(productIsInCart)
        {
            template = `
                <div class="product-listing__cart-details">
                    <p>This product is in your cart!</p>
                </div>
            `;
        }
        else
        {
            template = `
                <div class="product-listing__cart-details">
                    <a class="button" data-add-to-cart>Add To Cart</a>
                </div>
            `;
        }

        return template;
    }

    function templateGenerator()
    {
        let template = `
            <div class="product-listing">
                <img class="product-listing__image" src="${productData.url}" alt="${productData.description}">
                <p class="product-listing__title">${productData.name}</p>
                <p class="product-listing__description">${productData.description}</p>
                <p class="product-listing__price">$${productData.price}</p>
                ${addToCartButtonTemplateGenerator()}
            </div>
        `;
        return template;
    };

    render(contentElement, templateGenerator());

    function onAddToCartClicked(e)
    {
        cart.push(productData.id);
        Storage.local.setItem("cart", cart);
        render(contentElement, templateGenerator());
    }

    let addToCartButton = contentElement.querySelector("[data-add-to-cart]");
    addToCartButton?.addEventListener(
        "click",
        onAddToCartClicked
    );
}

function buildContent(products, cart)
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

    buildProductContent(contentElement, productData, cart);
}

async function main()
{
    let products = await fetchProductData();
    let cart = fetchCartData();
    buildContent(products, cart);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

