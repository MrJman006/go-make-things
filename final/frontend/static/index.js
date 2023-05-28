import { bind } from "./modules/bind.js";
import { getProducts } from "./modules/products.js";
import { getCartItems } from "./modules/cart.js";

function buildProductGallery(products)
{
    let container = document.querySelector("[data-page-content]");

    let template;

    if(products.length == 0)
    {
        template = `
            <p class="message">There are no products available at this time. Please check back later.</p>
        `;
    }
    else
    {
        template = `
            <div class="grid">
                <a
                    tb-each-product="products"
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
    }

    let data = {
        products: products
    };

console.log(data);
    bind(container, template, data);
}

function generateCartIconHtml()
{
    let productCount = cart.items().length;

    let cartIconHtml = `
    `;

    return cartIconHtml;
}

function buildCartAction(cartItems)
{
    let cartAction = document.querySelector("[data-action='show-cart']");

    let template = `
        <span aria-hidden="true">&#x1f6d2;</span> Cart <span>{ cartItems.length }</span>
    `;

    let data = {
        cartItems: cartItems
    };

    bind(cartAction, template, data);
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

    let products = await getProducts();
console.log(products);

    let cartItems = getCartItems();
console.log(cartItems);

    buildProductGallery(products);

    buildCartAction(cartItems);
}

window.addEventListener("load", main);

