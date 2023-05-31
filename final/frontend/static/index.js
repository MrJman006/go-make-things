import { render, component } from "./vendors/reef/reef.js";
import { getProducts } from "./modules/products.js";
import { Cart } from "./modules/cart.js";

function generateNoProductsHtml()
{
    let html = `
        <p class="message">There are no products available at this time. Please check back later.</p>
    `;

    return html;
}

function generateProductGalleryHtml(products)
{
    let galleryItemsHtml = "";

    products.forEach(
        function(product)
        {
            let params = new URLSearchParams();
            params.set("id", product.id);

            let productLink = `product.html?${params.toString()}`;

            galleryItemsHtml += `
                <a
                    href="${productLink}"
                    class="text-center"
                >
                    <img
                        src="${product.url}"
                        alt="${product.description}"
                        class="img-thumb-width img-thumb-height img-fit-cover"
                    >
                    <p
                        class="margin-top-xxsmall font-size-large font-color-default"
                    >${product.name}</p>
                </a>
            `;
        }
    );

    let html = `
        <div class="grid">
            ${galleryItemsHtml}
        </div>
    `;

    return html;
}

function buildProductGallery(products)
{
    let container = document.querySelector("[data-page-content]");

    let html;

    if(products.length == 0)
    {
        html = generateNoProductsHtml();
    }
    else
    {
        html = generateProductGalleryHtml(products); 
    }

    render(container, html);
}

function generateCartActionHtml(cart)
{
    let productCount = cart.productList().length;

    let html = `
        <span aria-hidden="true">&#x1f6d2;</span> Cart <span>${productCount}</span>
    `;

    return html;
}

function buildCartAction(cart)
{
    let container = document.querySelector("[data-action='show-cart']");

    component(
        container,
        ()=>{ return generateCartActionHtml(cart); }
    );
}

async function main()
{
    let products = await getProducts();

    let cart = Cart();

    buildProductGallery(products);

    buildCartAction(cart);
}

window.addEventListener("load", main);

