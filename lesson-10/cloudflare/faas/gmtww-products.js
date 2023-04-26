/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request)
{

    let headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    });

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

