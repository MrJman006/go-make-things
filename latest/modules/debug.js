////////////////////////////////
// Constants

let ENDPOINTS = {
    "https://gmtww-auth.cfjcd.workers.dev": {
        POST: "00000000-0000-0000-0000-000000000000"
    },
    "https://gmtww-products.cfjcd.workers.dev": {
        GET: [
            {"id":"assassins-creed-2","name":"Assassins Creed 2","description":"","price":147,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/assassins-creed-2.jpg"},
            {"id":"assassins-creed","name":"Assassins Creed","description":"","price":94,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/assassins-creed.jpg"},
            {"id":"batman-2","name":"Batman 2","description":"","price":131,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/batman-2.jpg"},
            {"id":"batman","name":"Batman","description":"","price":247,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/batman.jpg"},
            {"id":"god-of-war","name":"God Of War","description":"","price":63,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/god-of-war.jpg"},
            {"id":"halo-odst","name":"Halo Odst","description":"","price":205,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/halo-odst.jpg"},
            {"id":"halo-reach","name":"Halo Reach","description":"","price":40,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/halo-reach.jpg"},
            {"id":"halo","name":"Halo","description":"","price":228,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/halo.jpg"},
            {"id":"horizon","name":"Horizon","description":"","price":187,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/horizon.jpg"},
            {"id":"mario-2","name":"Mario 2","description":"","price":221,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/mario-2.jpg"},
            {"id":"mario","name":"Mario","description":"","price":196,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/mario.jpg"},
            {"id":"mortal-kombat","name":"Mortal Kombat","description":"","price":63,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/mortal-kombat.jpg"},
            {"id":"nier-automata","name":"Nier Automata","description":"","price":28,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/nier-automata.jpg"},
            {"id":"pirates-2","name":"Pirates 2","description":"","price":67,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/pirates-2.jpg"},
            {"id":"pirates","name":"Pirates","description":"","price":173,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/pirates.jpg"},
            {"id":"titan-fall","name":"Titan Fall","description":"","price":99,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/titan-fall.jpg"},
            {"id":"tomb-raider-2","name":"Tomb Raider 2","description":"","price":197,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/tomb-raider-2.jpg"},
            {"id":"tomb-raider","name":"Tomb Raider","description":"","price":117,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/tomb-raider.jpg"},
            {"id":"witcher","name":"Witcher","description":"","price":141,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/witcher.jpg"},
            {"id":"world-of-war-craft","name":"World Of War Craft","description":"","price":253,"url":"https://mrjman006.github.io/gmt-webapps-workshop/latest/backend/images/world-of-war-craft.jpg"}
        ]
    },
    "https://gmtww-stripe.cfjcd.workers.dev": {
        GET: {
            url: "https://mrjman006.github.io/gmt-webapps-workshop/latest/success.html"
        }
    }
};

////////////////////////////////
// Functions

async function fetch(endpoint, details = {})
{
    details = Object.assign(
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        },
        details
    );

    console.log(`DEBUG: Mocked Fetch`);
    console.log(`DEBUG:     Endpoint: ${endpoint}`);

    if(!ENDPOINTS[endpoint])
    {
        console.log(`DEBUG: Endpoint not mocked.`);
        let promise = new Promise(
            function(resolve, reject)
            {
                reject();
            }
        );

        return promise;
    }

    let method = details.method;
    console.log(`DEBUG:     Method: ${method}`);

    if(!ENDPOINTS[endpoint][method])
    {
        console.log(`DEBUG: Endpoint method not mocked.`);
        let promise = new Promise(
            function(resolve, reject)
            {
                reject();
            }
        );

        return promise;
    }

    for(let key in details.headers)
    {
        console.log(`DEBUG:     Header: ${key},${details.headers[key]}`);
    }

    let response = {};
    let fail = details.fail;

    if(fail)
    {
        console.log(`DEBUG:     Expected Result: Fail`);
        let promise = new Promise(
            function(resolve, reject)
            {
                resolve(response);
            }
        );

        return promise;
    }

    console.log(`DEBUG:     Expected Result: Success`);
    
    response.ok = true;
    response["json"] = function()
    {
        let promise = new Promise(
            function(resolve, reject)
            {
                let json = ENDPOINTS[endpoint][method];
                resolve(json);
            }
        );

        return promise;
    }

    let promise = new Promise(
        function(resolve, reject)
        {
            resolve(response);
        }
    );
 
    return promise;
}

////////////////////////////////
// Exports

window.fetch = fetch;

export {
    fetch
}

