////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
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
            window.location.href = "index.html";
        }
    }

    interval = setInterval(update, intervalDelayMilliSec);
}

function buildErrorContent(contentElement, message)
{
    let template = `
        <p>${message}</p>
    `;
    render(contentElement, template);
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
                    <a class="button" data-add-to-cart>Add To Cart</a>
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
        buildErrorContent(contentElement, message);
        return;
    }

    function checkoutListTemplateGenerator()
    {
        //
        // Check for an empty cart.
        //
    
        if(cart.productCount() == 0)
        {
            let template = `
                <p>Your cart is empty.</p>
            `;
            return template;
        }
    
        //
        // Show cart items.
        //
    
        let checkoutTemplate = ``;
        let checkoutTotal = 0;

        cart.forEachProduct(
            function(productId)
            {
                let product = productList.get(productId);
                if(!product)
                {
                    return;
                }

                checkoutTotal += product.price;

                let itemTemplate = `
                    <div class="cart-item">
                        <div class="cart-item__product-detail">
                            <img class="cart-item__product-image" src="${product.url}" alt="${product.description}">
                            <p class="cart-item__product-name">${product.name}</p>
                        </div>
                        <div class="cart-item__order-detail">
                            <p class="cart-item__product-price">$${product.price}</p>
                        </div>
                    </div>
                `;

                checkoutTemplate += itemTemplate;
            }
        );

        checkoutTemplate += `
            <div class="total-bar">
                <p class="total-bar__label">Total:</p>
                <p class="total-bar__total">$${checkoutTotal}</p>
            </div>
        `;

        return checkoutTemplate;
    }

    component(contentElement, checkoutListTemplateGenerator);
}

function buildCart(productList, cart)
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
    buildCart(productList, cart);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

