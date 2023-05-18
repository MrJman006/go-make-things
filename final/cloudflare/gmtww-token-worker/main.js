import {HTTP_STATUS_CODES} from "../modules/http-status-codes.js";
import {hasAllowedOrigin, generateForbiddenOriginResponse} from "../modules/origin-access-control.js";
import {generateUnsupportedHttpMethodResponse} from "../modules/http-methods.js";
import {parseAuthorizationCredentials, BearerCredentials, BasicCredentials} from "../modules/authorization-headers.js";
import {bcrypt} from "../modules/bcrypt.js";

/**
* The name of this API endpoint.
*
* @type {String}
*/
let API_NAME = "token";

/**
* Access control headers for the token API.
*
* @type {Headers}
*/
let API_HEADERS = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, DELETE, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': '*'
});

/**
* A token lifefime of two minutes.
*
* @type {Number}
*/
let TWO_MINUTE_TOKEN_LIFEFIME_IN_SECONDS = 60 * 2;

/**
* A token lifefime of two weeks.
*
* @type {Number}
*/
let TWO_WEEK_TOKEN_LIFEFIME_IN_SECONDS = 60 * 60 * 24 * 14;

/**
* The lifetime to use for tokens in seconds.
*
* @type {Number}
*/
let TOKEN_LIFETIME = TWO_MINUTE_TOKEN_LIFEFIME_IN_SECONDS;

/**
* Create a token. The token is guaranteed to be unique from all other
* registered tokens.
*
* @return {Promise<String>} - A token.
*/
async function createToken()
{
    //
    // Create a token.
    //

    let token = crypto.randomUUID();

    //
    // If not unique, generate it again.
    //

    let user = await GMTWW_TOKENS.get(token);

    if(user)
    {
        return await createToken();
    }

    let promise = new Promise(
        function(resolve, reject)
        {
            resolve(token);
        }
    );

    return promise;
}

/**
* Handles POST requests.
*
* @param {Request} request - A request object.
*
* @return {Promise<Response>} - A response object.
*/
async function handlePOST(request)
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
    // Authorize the user.
    //

    let passwordMatch = false;

    let passwordHash = await GMTWW_USERS.get(username);

    if(passwordHash)
    {
        passwordMatch = bcrypt.compareSync(password, passwordHash);
    }

    if(!passwordMatch)
    {
        response = new Response(
            "Invalid credentials supplied.",
            {
                status: HTTP_STATUS_CODES.UNAUTHORIZED,
                headers: API_HEADERS
            }
        );

        return response;
    }

    //
    // Create and save a token for the user.
    //

    let token = await createToken();

    await GMTWW_TOKENS.put(
        token,
        username,
        {
            expirationTtl: TOKEN_LIFETIME
        }
    );


    //
    // Return the token.
    //

    let data = {
        token: token
    };

    let responseBody = JSON.stringify(data);

    response = new Response(
        responseBody,
        {
            status: HTTP_STATUS_CODES.OK,
            headers: API_HEADERS
        }
    );

    return response;
}

/**
* Handles DELETE requests.
*
* @param {Request} request - A request object.
*
* @return {Promise<Response>} - A response object.
*/
async function handleDELETE(request)
{
    let response;

    //
    // Parse bearer credentials.
    //

    let credentials = parseAuthorizationCredentials(request);

    console.log("TMP:> A1", credentials);
    if(!credentials || credentials.type !== "bearer")
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

    let {token} = credentials;

    //
    // Delete the token.
    //

    await GMTWW_TOKENS.delete(token);

    response = new Response(
        'Token deleted.',
        {
            status: 200,
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
    // Respond to DELETE requests.
    //

    if(request.method === "DELETE")
    {
        response = await handleDELETE(request);
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
