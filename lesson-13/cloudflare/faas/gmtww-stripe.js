/*******************************
* Create a PHP-style query string from a javascript object or value.
*
* @param  {Object} data   The data to serialize into a string.
* @param  {String} prefix The prefix to use before the string
* @return {String}        The serialized query string
**/
function buildQuery(data, prefix)
{
    // Determine the data type
    var type = Object.prototype.toString.call(data).slice(8, -1).toLowerCase();

    // Loop through the object and create the query string
    return Object.keys(data).map(
        function(key, index)
        {
            // Cache the value of the item
            var value = data[key];

            // Add the correct string if the object item is an array or object
            if (type === 'array') {
                key = prefix + '[' + index + ']';
            } else if (type === 'object') {
                key = prefix ? prefix + '[' + key + ']' : key;
            }

            // If the value is an array or object, recursively repeat the process
            if (typeof value === 'object') {
                return buildQuery(value, key);
            }

            // Join into a query string
            return key + '=' + encodeURIComponent(value);
        }
    ).join('&');
}

/*******************************
* Create the line items portion of the Stripe request data.
*
* @param  {Object} cart_items   The cart items to display.
* @param  {String} currency     The currency to display.
* @param  {String} product_list The list of available products.
* @return {Object}              An array of line items to display on the Stripe page.
**/
function buildStripeLineItem(cart_item, currency, product_list)
{
    let product = product_list.find(
        function(p)
        {
            return cart_item.product_id == p.id; 
        }
    );

    if(!product)
    {
        return {};
    }

    let line_item = {};
    line_item.quantity = cart_item.quantity;
    line_item.price_data = {};

    let price_data = line_item.price_data;
    price_data.currency = currency;
    price_data.product_data = {};
    price_data.unit_amount = product.price * 100;

    let product_data = price_data.product_data;
    product_data.name = product.name;
    product_data.description = product.description;
    product_data.images = [];

    let images = product_data.images;
    images.push(product.url);

    return line_item;
}

/*******************************
* Create a Stripe request object using the supplied checkout data.
*
* @param  {Object} checkoutData   The checkout data to use.
* @return {Object}                A valid request object.
**/
function buildStripeRequest(checkoutData, product_list)
{
    let {cart_items, currency, success_url, cancel_url} = checkoutData;

    let requestObject = {};

    // Method.
    requestObject.method = "POST";

    // Headers.
    requestObject.headers = {};
    requestObject.headers["Authorization"] = `Bearer ${API_TOKEN}`;
    requestObject.headers["Content-Type"] = "application/x-www-form-urlencoded";

    // Body.

    let line_items = [];

    cart_items.forEach(
        function(cart_item)
        {
            let line_item = buildStripeLineItem(cart_item, currency, product_list);
            line_items.push(line_item);
        }
    );

    let requestData = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,
        success_url,
        cancel_url
    }

    requestObject.body = buildQuery(requestData);

    return requestObject;
}

/*******************************
* Respond to the request
*
* @param {Request} request
**/
async function handleRequest(request)
{
    let headers = new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    });

    let origin = request.headers.get("origin");

    let allowedOrigins = [
        "https://mrjman006.github.io/gmt-webapps-workshop/lesson-13",
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

    // Catch-all for non-POST request types
    if(request.method !== 'POST')
    {
        return new Response(
            'ok',
            {
                status: 200,
                headers: headers
            }
        );
    }

    // Get the product list.
    let product_list_json = await GMTWW_STORAGE.get("PRODUCTS")
    let product_list = JSON.parse(product_list_json);

    // Get the checkout request data
    let checkoutData = await request.json();

    // Build the stripe request.
    let stripeRequest = buildStripeRequest(checkoutData, product_list);

    try
    {
        // Call the Stripe API
        let STRIPE_ENDPOINT = "https://api.stripe.com/v1/checkout/sessions";
        let stripeResponse = await fetch(
            STRIPE_ENDPOINT,
            stripeRequest
        );

        // Get the API response
        let stripeResponseData = await stripeResponse.json();

        // Return the data
        return new Response(
            JSON.stringify(stripeResponseData),
            {
                status: 200,
                headers: headers
            }
        );
    }
    catch(error)
    {
        return new Response(
            'Unable to reach API',
            {
                status: 500,
                headers: headers
            }
        );
    }
}

// Listen for API calls
addEventListener(
    'fetch',
    function(event)
    {
        event.respondWith(handleRequest(event.request));
    }
);
