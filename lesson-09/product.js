////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showMessage, showMessageWithRedirect } from "./modules/utils.js";
import { render, component } from "./vendors/reef/reef.es.min.js"

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

function buildProductContent(contentElement, product, cart)
{
    // Update the page title.
    document.title = `${product.name} | ${document.title}`;

    function cartDetailsTemplateGenerator()
    {
        let template;

        if(cart.hasProduct(product.id))
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
                    <a class="button primary" data-add-to-cart>Add To Cart</a>
                </div>
            `;
        }

        return template;
    }

    function templateGenerator()
    {
        let template = `
            <div class="product-listing" aria-live="polite">
                <img class="product-listing__image" src="${product.url}" alt="${product.description}">
                <p class="product-listing__title">${product.name}</p>
                <p class="product-listing__description">${product.description}</p>
                <p class="product-listing__price">$${product.price}</p>
                ${cartDetailsTemplateGenerator()}
            </div>
        `;
        return template;
    };

    render(contentElement, templateGenerator());

    function onAddToCartClicked(e)
    {
        cart.addProduct(product.id);
        render(contentElement, templateGenerator());
    }

    let addToCartButton = contentElement.querySelector("[data-add-to-cart]");
    addToCartButton?.addEventListener(
        "click",
        onAddToCartClicked
    );
}

function buildContent(productList, cart)
{
    let contentElement = document.querySelector("[data-content]");

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
    // Ensure a product was requested.
    //

    let productId = getProductId();
    if(!productId || productId == "")
    {
        let message = "The requested product could not be located.";
        showMessageWithRedirect(contentElement, message);
        return;
    }

    //
    // Ensure the product exists.
    //

    let product = productList.get(productId);
    if(!product)
    {
        let message = "The requested product could not be located.";
        showMessageWithRedirect(contentElement, message);
        return;
    }

    //
    // Display the product.
    //

    buildProductContent(contentElement, product, cart);
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

    buildContent(productList, cart);
    buildCart(cart);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

