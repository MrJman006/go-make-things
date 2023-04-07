////////////////////////////////
// Constants

let PRODUCTS_ENDPOINT = "https://vanillajsacademy.com/api/photos.json";

////////////////////////////////
// Variables

let products = [];

////////////////////////////////
// Functions

function getProductId()
{
    let url = new URL(window.location.href);
    let id = url.searchParams.get("id");
    return id;
}

function getProductData(id)
{
    let productData = products.find((p) => { return p.id == id; });
    return productData;
}

function buildProductContent()
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

    //
    // Ensure a product was requested.
    //
 
    let productId = getProductId();
    if(!productId || productId == "")
    {
        contentElement.innerHTML = `
            <p>The requested product could not be located. Redirecting to the product gallery.</p>
        `;
        setTimeout((e) => { window.location.href = "/"; }, 3000);
        return;       
    }

    //
    // Ensure the product exists.
    //

    let productData = getProductData(productId);
    if(!productData)
    {
        contentElement.innerHTML = `
            <p>The requested product could not be located. Redirecting to the product gallery.</p>
        `;
        setTimeout((e) => { window.location.href = "/"; }, 3000);
        return;
    }

    //
    // Display the product.
    //

    // Update the page title.
    document.title = `${productData.name} | ${document.title}`;

    let productElement = `
        <div class="product">
            <img src="${productData.url}" alt="${productData.description}">
            <div class="info">
                <p class="title">${productData.name}</p>
                <p class="price">$${productData.price}</p>
                <p class="description">${productData.description}</p>
            </div>
        </div>
    `;
    contentElement.innerHTML += productElement;
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
    buildProductContent();
}

////////////////////////////////
// Script Entry Point

window.addEventListener(
    "load",
    e => { main(); }
);

