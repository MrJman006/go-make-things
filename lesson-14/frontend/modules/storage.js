let _StorageActions = function(storage)
{
    function setItem(key, value)
    {
        let intermediate = JSON.stringify(value);
        storage.setItem(key, intermediate);
    }

    function getItem(key)
    {
        let value = null;
        let intermediate = storage.getItem(key);
        if(intermediate)
        {
            value = JSON.parse(intermediate);
        }
        return value;
    }

    function removeItem(key)
    {
        storage.removeItem(key);
    }

    function clear()
    {
        storage.clear();
    }

    return {
        setItem: setItem,
        getItem: getItem,
        removeItem: removeItem,
        clear: clear
    };
};

let _sessionStorage = _StorageActions(sessionStorage);

let _siteStorage = _StorageActions(localStorage);

let storage = {
    session: _sessionStorage,
    site: _siteStorage
};

export {
    storage
};

