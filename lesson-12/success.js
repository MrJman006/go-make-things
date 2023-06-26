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

            checkoutSummaryTableHtml += itemTemplate;
        }
    );

    checkoutSummaryTableHtml += `
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
        <div class="total-bar">
            <p class="total-bar__label">Total:</p>
            <p class="total-bar__total">$${checkoutTotal}</p>
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

