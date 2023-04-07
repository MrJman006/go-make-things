////////////////////////////////
// Constants

let PRODUCTS_ENDPOINT = "https://vanillajsacademy.com/api/photos.json";

////////////////////////////////
// Variables

let products = undefined;

////////////////////////////////
// Functions

function buildProductGallery()
{
    let contentElement = document.querySelector("[data-content]");
    contentElement.replaceChildren();

    //
    // Ensure the server returned product data.
    //

    if(!products || !products.length)
    {
        contentElement.innerHTML = `
            <p>There was a server communication error. Please check back later.</p>
        `;
        return;
    }

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

async function fetchProductData()
{
    try
    {
        let result = await fetch(PRODUCTS_ENDPOINT);
        if(!result.ok)
        {
            throw result;
        }
    
        let json = await result.json();
        products = json;
    }
    catch(error)
    {
        console.warn(error);
    }
}

async function main()
{
    await fetchProductData();
    buildProductGallery();
}

////////////////////////////////
// Script Entry Point

window.addEventListener(
    "load",
    e => { main(); }
);

