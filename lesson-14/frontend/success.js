import { render } from "./vendors/reef/reef.es.min.js"
import { fetchProductList } from "./modules/product-list.js";
import { Cart } from "./modules/cart.js";
import { buildCartIcon } from "./modules/nav-bar.js";
import { showPageContentErrorMessageAndRedirectHome } from "./modules/errors.js";

async function initProductListAppState(appState)
{
    appState.productList = await fetchProductList();
}

function initCartAppState(appState)
{
    appState.cart = Cart();
    appState.cart.load();
}

function generateCheckoutSummaryListingTableHeaderHtml(purchasedProductList)
{
    let html = `
        <div class="cart-listing-table__label-bar">
            <p class="cart-listing-table__label">Product</p>
            <p class="cart-listing-table__label">Price</p>
        </div>
    `;

    return html;
}

function generateCheckoutSummaryListingTableBodyHtml(purchasedProductList, appState)
{
    let {productList} = appState;

    let html = ``;

    purchasedProductList.forEach(
        function(productId)
        {
            let product = productList.find((product) => { return product.id == productId; });
            if(!product)
            {
                console.log("A product was removed from the summary because it could not be found.");
                return;
            }

            let itemHtml = `
                <div class="cart-listing-table-item">
                    <a href="product.html?id=${product.id}">
                        <img class="cart-listing-table-item__product-image" src="${product.url}" alt="${product.description}">
                        <p class="cart-listing-table-item__product-name">${product.name}</p>
                    </a>
                    <div class="cart-listing-table-item__order-detail">
                        <p class="cart-listing-table-item__product-price">$${product.price}</p>
                        <p class="cart-listing-table-item__remove-item-action-spacer"></p>
                    </div>
                </div>
            `;

            html += itemHtml;
        }
    );

    return html;
}

function generateCheckoutSummaryListingTableHtml(purchasedProductList, appState)
{
    let tableHeaderHtml = generateCheckoutSummaryListingTableHeaderHtml(purchasedProductList);

    let tableBodyHtml = generateCheckoutSummaryListingTableBodyHtml(purchasedProductList, appState);

    let tableHtml = `
        <div class="cart-listing-table">
            ${tableHeaderHtml}
            <div>
                ${tableBodyHtml}
            </div>
        </div>
    `;

    return tableHtml;
}

function generateCheckoutSummaryListingSummaryBar(purchasedProductList, appState)
{
    let {productList} = appState;

    //
    // Calculate the checkout total.
    //

    let checkoutTotal = 0;

    purchasedProductList.forEach(
        function(productId)
        {
            let product = productList.find((product) => { return product.id == productId; });
            if(!product)
            {
                return;
            }

            checkoutTotal += product.price;
        }
    );

    let summaryBarHtml = `
        <div class="cart-listing-summary-bar">
            <p class="cart-listing-summary-bar__total-label">Total:</p>
            <p class="cart-listing-summary-bar__total-value">$${checkoutTotal}</p>
            <p class="cart-listing-summary-bar__remove-item-action-spacer"></p>
        </div>
    `;

    return summaryBarHtml;
}

function generateCheckoutSummaryListingHtml(purchasedProductList, appState)
{
    let checkoutSummaryListingTableHtml = generateCheckoutSummaryListingTableHtml(purchasedProductList, appState);

    let checkoutSummaryListingSummaryBarHtml = generateCheckoutSummaryListingSummaryBar(purchasedProductList, appState);

    let checkoutSummaryListingHtml = `
        ${checkoutSummaryListingTableHtml}
        ${checkoutSummaryListingSummaryBarHtml}
    `;

    return checkoutSummaryListingHtml;
}

function buildCheckoutSummaryListing(appState)
{
    let pageContentContainer = document.querySelector("[data-page-content]");

    //
    // Ensure that products are available.
    //

    let {productList} = appState;

    if(productList.length == 0)
    {
        let message = "We encounted an error when generating your checkout summary. A copy should be in your email. We apologize for the inconvenience.";

        showPageContentErrorMessageAndRedirectHome(message);

        return;
    }

    //
    // Get the product list from the URL.
    //

    let url = new URL(window.location.href);
    let param = url.searchParams.get("purchasedItems");

    let purchasedProductIds;

    if(param)
    {
        purchasedProductIds = param.split(",");
    }

    if(purchasedProductIds && purchasedProductIds.length == 0)
    {
        let message = "We encounted an error when generating your checkout summary. A copy should be in your email. We apologize for the inconvenience.";

        showPageContentErrorMessageAndRedirectHome(message);

        return;
    }

    let checkoutSummaryListingHtml = generateCheckoutSummaryListingHtml(purchasedProductIds, appState);

    render(pageContentContainer, checkoutSummaryListingHtml);
}

async function main()
{
    let appState = {};

    await initProductListAppState(appState);

    initCartAppState(appState);

    buildCartIcon(appState.cart);

    buildCheckoutSummaryListing(appState);
}

window.addEventListener("load", main);
