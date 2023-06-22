import { fetchProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showPageContentErrorMessage } from "./modules/errors.js";
import { component } from "./vendors/reef/reef.es.min.js";

function buildProductGallery(appState)
{
    let {productList, cart} = appState;

    let pageContentContainer = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    if(productList.length == 0)
    {
        let message = "There are no photos available at this time. Please check back later.";
        showPageContentErrorMessage(message);
        return;
    }

    //
    // Build product cards.
    //    

    pageContentContainer.classList.add("gallery");

    function buildProductCard(product)
    {
        let productElement = `
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card">
                <img class="product-card__image" src="${product.url}" alt="${product.description}">
                <p class="product-card__title">${product.name}</p>
            </a>
        `;
        pageContentContainer.innerHTML += productElement;
    }

    productList.forEach(buildProductCard);
}

function generateCartIconHtml(cart)
{
    let productCount = cart.items().length;

    let cartIconHtml = `
        <span aria-hidden="true">&#x1f6d2;</span> Cart <span>${productCount}</span>
    `;

    return cartIconHtml;
}

function buildCartIcon(cart)
{
    let cartIconContainer = document.querySelector("[data-cart-icon-container]");

    component(
        cartIconContainer,
        () =>{ return generateCartIconHtml(cart); }
    );
}

function cleanUpUrl()
{
    let regex = new RegExp("/index.html$");
    let url = location.href.replace(regex, "/")
    history.replaceState(history.state, null, url);
}

async function main()
{
    cleanUpUrl();

    let appState = {};

    appState.productList = await fetchProductList();

    appState.cart = Cart();
    appState.cart.load();

    buildProductGallery(appState);

    buildCartIcon(appState.cart);
}

window.addEventListener("load", main);

