import {HTTP_STATUS_CODES} from "../modules/http-status-codes.js";
import {hasAllowedOrigin, generateForbiddenOriginResponse} from "../modules/http-origin-access-control.js";
import {generateUnsupportedHttpMethodResponse} from "../modules/unsupported-http-methods.js";

/**
* The name of this API endpoint.
*
* @type {String}
*/
let API_NAME = "checkout";

/**
* Access control headers for the token API.
*
* @type {Headers}
*/
let API_HEADERS = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*'
});

/**
* Create a PHP-style query string from a javascript object or value.
*
* @param {Object} data - The data to serialize into a string.
* @param {String} prefix - The prefix to use before the string.
*
* @return {String} - The serialized query string.
*/
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
            if(type === 'array')
            {
                key = prefix + '[' + index + ']';
            }
            else if(type === 'object')
            {
                key = prefix ? prefix + '[' + key + ']' : key;
            }

            // If the value is an array or object, recursively repeat the process
            if(typeof value === 'object')
            {
                return buildQuery(value, key);
            }

            // Join into a query string
            return key + '=' + encodeURIComponent(value);
        }
    ).join('&');
}

/**
* Create the line items portion of the Stripe request data.
*
* @param {Object} cart_items - The cart items to display.
* @param {String} currency - The currency to display.
* @param {String} product_list - The list of available products.
*
* @return {Object} - An array of line items to display on the Stripe page.
*/
function buildStripeLineItem(cartItem, currency, productList)
{
    let product = productList.find(
        function(p)
        {
            return cartItem.productId == p.id; 
        }
    );

    if(!product)
    {
        return {};
    }

    let lineItem = {};
    lineItem.quantity = cartItem.quantity;
    lineItem.price_data = {};

    let priceData = lineItem.price_data;
    priceData.currency = currency;
    priceData.product_data = {};
    priceData.unit_amount = product.price * 100;

    let productData = priceData.product_data;
    productData.name = product.name;
    productData.description = product.description;
    productData.images = [];

    let images = productData.images;
    images.push(product.url);

    return lineItem;
}

/**
* Create a checkout Stripe request using the supplied cart data.
*
* @param {Object} cartData - The cart data.
* @param {Array} productList - The product list.
*
* @return {Request} - A request object.
*/
function buildStripeCheckoutRequest(cartData, productList)
{
    let {cartItems, currency, successUrl, cancelUrl} = cartData;

    let requestObject = {};

    // Method.
    requestObject.method = "POST";

    // Headers.
    requestObject.headers = {};
    requestObject.headers["Authorization"] = `Bearer ${STRIPE_API_KEY}`;
    requestObject.headers["Content-Type"] = "application/x-www-form-urlencoded";

    // Body.

    let lineItems = [];

    cartItems.forEach(
        function(cartItem)
        {
            let lineItem = buildStripeLineItem(cartItem, currency, productList);
            lineItems.push(lineItem);
        }
    );

    let requestData = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl
    }

    requestObject.body = buildQuery(requestData);

    return requestObject;
}

/**
* Handles HTTP POST requests.
*
* @param {Request} request - A request object.
*
* @return {Promise<Response>} - A response object.
*/
async function handlePOST(request)
{
    let response;

    //
    // Get the product list.
    //

    let productListJson = await STORAGE.get("productList")
    let productList = JSON.parse(productListJson);

    //
    // Get the cart data.
    //

    let cartData = await request.json();

    //
    // Build the checkout request.
    //

    let checkoutProviderRequest = buildStripeCheckoutRequest(cartData, productList); 

    //
    // Submit the checkout request to the checkout provider.
    //

    let CHECKOUT_PROVIDER_ENDPOINT = "https://api.stripe.com/v1/checkout/sessions";
    let checkoutProviderResponseData;

    try
    {
        let checkoutProviderResponse = await fetch(
            CHECKOUT_PROVIDER_ENDPOINT,
            checkoutProviderRequest
        );

        if(!checkoutProviderResponse.ok)
        {
            let error = "Issue connecting with the checkout provider.";

            throw error;
        }

        //
        // Parse the response.
        //

        checkoutProviderResponseData = await checkoutProviderResponse.json();
    }
    catch(error)
    {
        response = new Response(
            error,
            {
                status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
                headers: API_HEADERS
            }
        );

        return response;
    }

    //
    // Return the checkout provider url.
    //

    let data = {
        url: checkoutProviderResponseData.url
    };

    let responseBody = JSON.stringify(data);

    return new Response(
        responseBody,
        {
            status: HTTP_STATUS_CODES.OK,
            headers: API_HEADERS
        }
    );

    return response;
}

/**
* Handles fetch requests.
*
* @param {Request} request - A request object.
*
* @return {Promise<Response>} - A response object.
*/
async function handleRequest(request)
{
    let response;

    //
    // Only allow whitelisted origins.
    //

    let originAllowed = hasAllowedOrigin(request);

    if(!originAllowed)
    {
        response = generateForbiddenOriginResponse(API_HEADERS);
        return response;
    }

    //
    // Respond to HEAD and OPTIONS requests.
    //

    if(request.method === "HEAD" || request.method === "OPTIONS")
    {
        response = new Response(
            "Ok",
            {
                status: HTTP_STATUS_CODES.OK,
                headers: API_HEADERS
            }
        );

        return response;
    }

    //
    // Respond to POST requests.
    //

    if(request.method === "POST")
    {
        response = await handlePOST(request);
        return response;
    }

    //
    // Unsupported methods.
    //

    response = generateUnsupportedHttpMethodResponse(API_NAME, API_HEADERS);
    return response;
}

// Listen for API calls.
addEventListener(
    'fetch',
    function(event)
    {
        let request = event.request;
        let promise = handleRequest(request);
        event.respondWith(promise);
    }
);
