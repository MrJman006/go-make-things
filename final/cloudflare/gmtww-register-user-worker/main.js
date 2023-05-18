import {HTTP_STATUS_CODES} from "../modules/http-status-codes.js";
import {hasAllowedOrigin, generateForbiddenOriginResponse} from "../modules/origin-access-control.js";
import {generateUnsupportedHttpMethodResponse} from "../modules/http-methods.js";
import {parseAuthorizationCredentials, BasicCredentials} from "../modules/authorization-headers.js";
import {bcrypt} from "../modules/bcrypt.js";

/**
* The name of this API endpoint.
*
* @type {String}
*/
let API_NAME = "register-user";

/**
* Access control headers for the token API.
*
* @type {Headers}
*/
let API_HEADERS = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*'
});

/**
* A list of users that are allowed to be registered.
*
* @type {Array}
*/
let ALLOWED_USERS = [
    "admin"
];

/**
* Handles HTTP PUT requests.
*
* @param {Request} request - A request object.
*
* @return {Promise<Response>} - A response object.
*/
async function handlePUT(request)
{
    let response;

    //
    // Parse basic credentials.
    //

    let credentials = parseAuthorizationCredentials(request);

    if(!credentials || credentials.type !== "basic")
    {
        response = new Response(
            "Missing authorization credentials or invalid format.",
            {
                status: HTTP_STATUS_CODES.BAD_REQUEST,
                headers: API_HEADERS
            }
        );

        return response;
    }

    let {username, password} = credentials;

    //
    // Make sure the requested user is in the allowed user list.
    //

    if(!ALLOWED_USERS.includes(username))
    {
        response = new Response(
            "The user is not eligible to be registered.",
            {
                status: HTTP_STATUS_CODES.BAD_REQUEST,
                headers: API_HEADERS
            }
        );

        return response;
    }

    //
    // Ensure the user does not already exist.
    //

    let user = await GMTWW_USERS.get(username);

    if(user)
    {
        response = new Response(
            "The user already exists.",
            {
                status: HTTP_STATUS_CODES.BAD_REQUEST,
                headers: API_HEADERS
            }
        );

        return response;
    }

    //
    // Register the user.
    //

    let hash = bcrypt.hashSync(password);

    await GMTWW_USERS.put(username, hash);

    user = await GMTWW_USERS.get(username);

    if(!user)
    {
        response = new Response(
            "Failed to register the user.",
            {
                status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
                headers: API_HEADERS
            }
        );

        return response;
    }

    response = new Response(
        "User registered.",
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
    // Respond to PUT requests.
    //

    if(request.method === "PUT")
    {
        response = await handlePUT(request);
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
