////////////////////////////////
// Constants

let SHOP_ITEMS_ENDPOINT = "https://vanillajsacademy.com/api/photos.json";

////////////////////////////////
// Variables

let photos = [];

////////////////////////////////
// Functions

function buildPageSkeleton()
{
    let page = document.querySelector("[data-page]");
    page.innerHTML = `
        <p class="hidden" data-notifier></p>
        <div class="content" data-content></div>
    `;
}

function rebuildProduct()
{
    let content = document.querySelector("[data-content]");
    content.replaceChildren();

    let url = new URL(window.location.href);
    let photoId = url.searchParams.get("id");
    
    if(photoId == null || photoId == "")
    {
        let notifier = document.querySelector("[data-notifier]");
        notifier.textContent = "Invalid photo request. Redirecting to the home page.";
        notifier.classList.remove("hidden");
        setTimeout((e) => { window.location.href = "/"; }, 3000);
        return;       
    }

    let photo = photos.find((photo) => { return photo.id == photoId; });
    let photoItem = `
        <div class="photo">
            <img src="${photo.url}" alt="${photo.description}">
            <div class="info">
                <p class="title">${photo.name}</p>
                <p class="price">$${photo.price}</p>
                <p class="description">${photo.description}</p>
            </div>
        </div>
    `;
    content.innerHTML += photoItem;
}

async function fetchAvailableProducts()
{
    let result = await fetch(SHOP_ITEMS_ENDPOINT);
    if(!result.ok)
    {
        let notifier = document.querySelector("[data-notifier]");
        notifier.textContent = "Unable to reach the server. Please notify the site adminitrator.";
        notifier.classList.remove("hidden");
        return;
    }

    try
    {
        let data = await result.json();
        photos = data;
    }
    catch(e)
    {
        let notifier = document.querySelector("[data-notifier]");
        notifier.textContent = "There was an error communicating with the server. Please notify the site adminitrator.";
        notifier.classList.remove("hidden");
        return;
    }
}

async function main()
{
    buildPageSkeleton();
    await fetchAvailableProducts();
    rebuildProduct();
}

////////////////////////////////
// Script Entry Point

window.addEventListener(
    "load",
    e => { main(); }
);

