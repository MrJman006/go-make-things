import { fetchProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { showPageContentErrorMessage } from "./modules/errors.js";
import { buildCartIcon } from "./modules/nav-bar.js";

function buildProductGallery(appState)
{
    let {productList} = appState;

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

async function buildInitialAppState()
{
    let appState = {};

    //
    // Product List
    //

    appState.productList = await fetchProductList();

    //
    // Cart
    //

    appState.cart = Cart();
    appState.cart.load();

    return appState;
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

    let appState = await buildInitialAppState();

    buildCartIcon(appState.cart);

    buildProductGallery(appState);
}

window.addEventListener("load", main);
