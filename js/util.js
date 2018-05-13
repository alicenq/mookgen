/* global fetchObject:false, fetchData:false */

/**
 * Fetches a json object
 * 
 * @param {string} resource 
 * @param {RequestInit} init 
 */
fetchObject = function (resource, init) {
    return new Promise(function (resolve, reject) {
        fetch(resource.replace(/^\/+/, ''), init)
            .then(function (res) {
                if (res.ok) return res.json();
                else throw MediaError(res.status + ' ' + res.statusText);
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
fetchData = function (resource, init) {
    return new Promise(function (resolve, reject) {
        fetch(resource.replace(/^\/+/, ''), init)
            .then(function (res) {
                if (res.ok) return res.text();
                else throw MediaError(res.status + ' ' + res.statusText);
            })
            .then(resolve)
            .catch(reject)
    })
}