/*******************************
* Respond to the request
* @param {Request} request
**/
async function handleRequest(request)
{
    let headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'HEAD, GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    });

    let origin = request.headers.get("origin");

    let allowedOrigins = [
        "https://mrjman006.github.io/gmt-webapps-workshop/lesson-11",
        "https://mrjman006.github.io"
    ];

    if(!allowedOrigins.includes(origin))
    {
        return new Response(
            "Not allowed",
            {
                status: 403,
                headers: headers
            }
        );
    }

    if(request.method !== "GET")
    {
        return new Response(
            null,
            {
                status: 200,
                headers: headers
            }
        );
    }

    let responseBody = await GMTWW_STORAGE.get("PRODUCTS");

    // return a Response object
    return new Response(
        responseBody,
        {
            status: 200,
            headers: headers
        }
    );
}

// Listen for API calls
addEventListener(
    'fetch',
    function(event)
    {
        event.respondWith(handleRequest(event.request));
    }
);

