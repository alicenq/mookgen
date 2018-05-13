/* global 
fetchObject:false, 
fetchData:false, 
merge:false, 
assign:false
*/

/**
 * Fetches a json object
 * 
 * @param {string} resource 
 * @param {RequestInit} init 
 */
var fetchObject = function (resource, init) {
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
var fetchData = function (resource, init) {
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

/**
 * A callback to use when resolving merge conflicts
 * 
 * @callback mergeStrategy
 * @param { any } targetVal
 * @param { any } sourceVal
 */

/**
 * Alias for merge(target, source, OURS)
 * 
 * @param {any} target 
 * @param {any} source 
 */
var assign = function (target, source) {
    return this.merge(target, source, Strategy.OURS)
}

/**
 * Performs a deep version of Object.assign, using a defined merge strategy to resolve conflifts
 * 
 * @param {any} target 
 * @param {any} source 
 * @param {mergeStrategy} strategy
 */
var merge = function (target, source, strategy) {
    let queue = [{
        target: target,
        source: source
    }];

    while (queue.length) {
        let next = queue.pop();
        let tgt = next.target;
        let src = next.source;

        Object.keys(src)
            .forEach(function (key) {
                if (!(key in src)) return

                if (typeof (src[key]) == 'object') {
                    if (typeof (tgt[key]) != 'object') {
                        tgt[key] = {}
                    }
                    queue.push({
                        target: tgt[key],
                        source: src[key]
                    })
                } else if (key in tgt) {
                    tgt[key] = strategy(tgt[key], src[key]);
                } else {
                    tgt[key] = src[key];
                }
            })
    }

    return target;
}

class Strategy {
    /**
     * Merge strategy that keeps the target value
     */
    static OURS(targetValue) {
        return targetValue;
    }

    /**
     * Merge strategy that takes the source value
     */
    static THEIRS(targetValue, sourceValue) {
        return sourceValue;
    }

    /**
     * Merge strategy that raises an error
     */
    static ERROR(targetValue, sourceValue) {
        if (targetValue === sourceValue) return targetValue;
        else throw SyntaxError('Unresolved merge conflict')
    }
}