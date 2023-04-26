////////////////////////////////
// Objects

let LocalStorage = (function()
{
    function set(key, value)
    {
        let intermediate = JSON.stringify(value);
        localStorage.setItem(key, intermediate);
    }

    function get(key)
    {
        let value = null;
        let intermediate = localStorage.getItem(key);
        if(intermediate)
        {
            value = JSON.parse(intermediate);
        }
        return value;
    }

    function remove(key)
    {
        localStorage.removeItem(key);
    }

    function clear()
    {
        localStorage.clear();
    }

    return {
        "setItem": set,
        "getItem": get,
        "removeItem": remove,
        "clearAll": clear
    };
})();

let SessionStorage = (function()
{
    function set(key, value)
    {
        let intermediate = JSON.stringify(value);
        sessionStorage.setItem(key, intermediate);
    }

    function get(key)
    {
        let value = null;
        let intermediate = sessionStorage.getItem(key);
        if(intermediate)
        {
            value = JSON.parse(intermediate);
        }
        return value;
    }

    function remove(key)
    {
        sessionStorage.removeItem(key);
    }

    function clear()
    {
        sessionStorage.clear();
    }

    return {
        "setItem": set,
        "getItem": get,
        "removeItem": remove,
        "clearAll": clear
    };
})();

let Storage = {
    "session": SessionStorage,
    "local": LocalStorage
};

////////////////////////////////
// Exports

export {
    LocalStorage,
    SessionStorage,
    Storage
};

