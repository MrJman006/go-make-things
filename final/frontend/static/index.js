////////////////////////////////
// Imports

import { bind } from "./modules/bind.js";
import { getProductList } from "./modules/products.js";

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

let cart;
let productList;

////////////////////////////////
// Functions

function buildProductGallery()
{
    let container = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        console.log(message);
        return;
    }

    //
    // Build product cards.
    //

    let galleryTemplate = `
        <div class="grid">
            <a
                tb-each-product="productList"
                tb-href="'product.html' | urlWithParams 'id' product.id"
                class="text-center"
            >
                <img
                    tb-src="product.url"
                    tb-alt="product.description"
                    class="img-thumb-width img-thumb-height img-fit-cover"
                >
                <p
                    class="margin-top-xxsmall font-size-large font-color-default"
                >{ product.name }</p>
            </a>
        </div>
    `;

    let data = {
        productList: productList
    };

    bind(container, galleryTemplate, data);
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

function cleanupUrl()
{
    let regex = new RegExp("/index.html$");
    let cleanUrl = location.href.replace(regex, "/")
    history.replaceState(history.state, null, cleanUrl);
}

async function main()
{
//    cleanupUrl();

    productList = await getProductList();

//    cartList = getCartList();

    buildProductGallery();

//    buildCartIcon();
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", main);

