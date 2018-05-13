/**
 * Fetches a json object
 * 
 * @param {string} resource 
 * @param {RequestInit} init 
 */
var fetchObject = function (resource, init) {
    let path = document.location.pathname;
    let root = path.lastIndexOf('/') > 0 ? path.substr(0, path.lastIndexOf('/')) : path

    return new Promise(function (resolve, reject) {
        fetch(root + resource.replace(/^\/+/, ''), init)
            .then(function (res) {
                if (res.ok) return res.json();
                else reject(MediaError(`${res.status} ${res.statusText}`))
            })
            .then(resolve)
            .catch(reject)
    })
}

/**
 * Fetches string data
 * 
 * @param {string} resource
 * @param {RequestInit} init 
 */
var fetchData = function (resource, init) {
    let path = document.location.pathname;
    let root = path.lastIndexOf('/') > 0 ? path.substr(0, path.lastIndexOf('/')) : path
    console.log(root);

    return new Promise(function (resolve, reject) {
        fetch(root + resource.replace(/^\/+/, ''), init)
            .then(function (res) {
                if (res.ok) return res.text();
                else reject(MediaError(`${res.status} ${res.statusText}`))
            })
            .then(resolve)
            .catch(reject)
    })
}