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
        <div class="content gallery" data-content></div>
    `;
}

function rebuildProductGrid()
{
    let content = document.querySelector("[data-content]");
    content.replaceChildren();

    photos.forEach(
        function(photo)
        {
            console.log(photo);
            console.log(photo.id);
            let photoItem = `
                <a href="photo.html?id=${photo.id}" class="photo">
                    <img src="${photo.url}" alt="${photo.description}">
                    <div class="info">
                        <p class="title">${photo.name}</p>
                        <p class="price">$${photo.price}</p>
                    </div>
                </a>
            `;
            content.innerHTML += photoItem;
        }
    );
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
    rebuildProductGrid();
}

////////////////////////////////
// Script Entry Point

window.addEventListener(
    "load",
    e => { main(); }
);

