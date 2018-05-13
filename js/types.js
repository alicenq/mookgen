/* global assign:false, merge:false */

/**
 * A callback to use when resolving merge conflicts
 *
 * @callback mergeStrategy
 * @param {any} targetVal
 * @param {any} sourceVal
 */

/**
 * Alias for merge(target, source, OURS)
 * 
 * @param {any} target 
 * @param {any} source 
 */
assign = function (target, source) {
    return this.merge(target, source, MergeStrategy.OURS)
}

/**
 * Performs a deep version of Object.assign, using a defined merge strategy to resolve conflifts
 * 
 * @param {any} target 
 * @param {any} source 
 * @param {MergeStrategy} strategy 
 */
merge = function (target, source, strategy) {
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

class MergeStrategy {
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