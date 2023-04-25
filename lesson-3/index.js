////////////////////////////////
// Imports
import {fetchProductData} from "./api.js"

////////////////////////////////
// Constants

// N/A

////////////////////////////////
// Variables

// N/A

////////////////////////////////
// Functions

function buildProductGallery(products)
{
    let contentElement = document.querySelector("[data-content]");
    contentElement.replaceChildren();

    //
    // Ensure that products are available.
    //

    if(products.length == 0)
    {
        contentElement.innerHTML = `
            <p>There are no photos available at this time. Please check back later.</p>
        `;
        return;
    }

    contentElement.classList.add("gallery");
    products.forEach(
        function(product)
        {
            let productElement = `
                <a href="product.html?id=${encodeURIComponent(product.id)}" class="product">
                    <img src="${product.url}" alt="${product.description}">
                    <div class="info">
                        <p class="title">${product.name}</p>
                        <p class="price">$${product.price}</p>
                    </div>
                </a>
            `;
            contentElement.innerHTML += productElement;
        }
    );
}

function cleanupUrl()
{
    if(!window.history.replaceState)
    {
        return;
    }

    let regex = new RegExp("/index.html$");
    let cleanUrl = window.location.href.replace(regex, "/")
    window.history.replaceState(null, null, cleanUrl);
}

async function main()
{
    cleanupUrl();
    let products = await fetchProductData();
    buildProductGallery(products);
}

////////////////////////////////
// Script Entry Point

window.addEventListener(
    "load",
    e => { main(); }
);

