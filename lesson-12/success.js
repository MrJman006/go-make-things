////////////////////////////////
// Imports

import { ProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { parseUrlProductIds } from "./modules/utils.js";
import { render, component } from "./vendors/reef/reef.es.min.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

let cart;
let productList;
let productIds;

////////////////////////////////
// Functions

function buildCheckoutSummary(purchasedProductIds)
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    let template = `
        <p class="message">Thank you for shopping with us! Below is a summary of your purchase.</p>
        <div class="label-bar">
            <p class="label-bar__product-name">Product</p>
            <p class="label-bar__product-price">Price</p>
        </div>
        <div class="line-item-table">
    `;

    purchasedProductIds.forEach(
        function(productId)
        {
            let product = productList.get(productId);
            if(!product)
            {
                return;
            }

            let itemTemplate = `
                <div class="line-item">
                    <div class="line-item__product-detail">
                        <a href="product.html?id=${product.id}"><img class="line-item__product-image" src="${product.url}" alt="${product.description}"></a>
                        <p class="line-item__product-name">${product.name}</p>
                    </div>
                    <div class="line-item__order-detail">
                        <p class="line-item__product-price">$${product.price}</p>
                    </div>
                </div>
            `;

            template += itemTemplate;
        }
    );

    template += `
        </div>
    `;

    let checkoutTotal = 0;

    purchasedProductIds.forEach(
        function(productId)
        {
            let product = productList.get(productId);
            if(!product)
            {
                return;
            }

            checkoutTotal += product.price;
        }
    );

    template += `
        <div class="total-bar">
            <p class="total-bar__label">Total:</p>
            <p class="total-bar__total">$${checkoutTotal}</p>
        </div>
    `;

    render(pageContentContainer, template);
}

function buildContent()
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    // Redirect if the URL is invalid.
    let purchasedProductIds = parseUrlProductIds();
    if(purchasedProductIds.length == 0)
    {
        location.replace("index.html");
        return;
    }

    buildCheckoutSummary(purchasedProductIds);
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

async function main()
{
    productList = ProductList();
    await productList.load();

    cart = Cart();
    cart.load();

    buildContent();
    buildCart();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

