async function timedFetch(resource, options = {})
{
    let SECONDS_TO_MILLISECONDS = 1000;

    let opts = Object.assign(
        {
            timeout: 8
        },
        options
    );

    let abortController = new AbortController();

    let timeout = setTimeout(
        () => { abortController.abort(); },
        SECONDS_TO_MILLISECONDS
    );

    let response = await fetch(
        resource,
        {
            ...options,
            signal: abortController.signal
        }
    );

    clearTimeout(timeout);

    return response;
}

export {
    timedFetch
};
