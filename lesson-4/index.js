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
                <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card">
                    <img class="product-card__image" src="${product.url}" alt="${product.description}">
                    <p class="product-card__title">${product.name}</p>
                </a>
            `;
            contentElement.innerHTML += productElement;
        }
    );
}

async function main()
{
    let products = await fetchProductData();
    buildProductGallery(products);
}

////////////////////////////////
// Script Entry Point

window.addEventListener("load", (e) => { main(); });

