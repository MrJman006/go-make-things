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

function generateCheckoutSummaryTableHtml(purchasedProductIds)
{
    let checkoutSummaryTableHtml = `
        <p class="message">Thank you for shopping with us! Below is a summary of your purchase.</p>
        <div class="cart-list">
            <div class="label-bar">
                <p class="product-name">Product</p>
                <p class="product-price">Price</p>
            </div>
            <div class="items">
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
                <div class="item">
                    <div class="product-detail">
                        <a href="product.html?id=${product.id}">
                            <img class="product-image" src="${product.url}" alt="${product.description}">
                            <p class="product-name">${product.name}</p>
                        </a>
                    </div>
                    <div class="order-detail">
                        <p class="product-price">$${product.price}</p>
                    </div>
                </div>
            `;

            checkoutSummaryTableHtml += itemTemplate;
        }
    );

    checkoutSummaryTableHtml += `
            </div>
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

    checkoutSummaryTableHtml += `
        <div class="cart-total-bar">
            <p class="label">Total:</p>
            <p class="value">$${checkoutTotal}</p>
        </div>
    `;

    return checkoutSummaryTableHtml;
}

function buildCheckoutSummaryTable()
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    // Redirect if the URL is invalid.
    let purchasedProductIds = parseUrlProductIds();
    if(purchasedProductIds.length == 0)
    {
        console.log("invalid url.");
        location.replace("index.html");
        return;
    }

    render(pageContentContainer, generateCheckoutSummaryTableHtml(purchasedProductIds));
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

async function main()
{
    productList = ProductList();
    await productList.load();

    cart = Cart();
    cart.load();

    buildCheckoutSummaryTable();

    buildCartIcon();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);

