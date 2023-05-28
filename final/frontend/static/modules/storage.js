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

    function removeAllItems()
    {
        storage.clear();
    }

    return {
        setItem: setItem,
        getItem: getItem,
        removeItem: removeItem,
        removeAllItems: removeAllItems
    };
};

let SessionStorage = _StorageActions(sessionStorage);

let LocalStorage = _StorageActions(localStorage);

let Storage = {
    session: SessionStorage,
    local: LocalStorage
};

export {
    LocalStorage,
    SessionStorage,
    Storage
};

