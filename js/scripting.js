/* global 
evaluate:false
*/

/**
 * Evaluates a single output value based off of the given options
 * 
 * @param {Selector | number | boolean | string} options Options is an input value to evaluate into a single value. It consists of an object whose 'type' value specifies the action based on what is passed. If a non-object value is passed the input value will be returned, otherwise a Selector template must be used.
 * 
 * * Template to select a value from a list
 * { pick: 1, from: [] }
 *
 * * Template to select 3 values from a list
 * { pick: 3, from: [] }
 * 
 * * Template to select between 1 and 3 values from a list
 * { upto: 3, from: [] }
 * 
 * * Template to select between 3 and 6 unique values from a list
 * { pick: 3, upto: 6, from: [] }
 * 
 * * Template to select 3 values from a list, allowing for repeated values
 * { pick: 3, from: [], unique: false }
 * 
 * * Template to select 3 values from a list with preference for lower/first values
 * { pick: 3, from: [], weight: 'low' }
 * 
 * * Template to select 3 values from a list with preference for lower/first values
 * { pick: 3, from: [], weight: 'high' }
 * 
 * * Template to select a value between 5 and 7, inclusive
 * { pick: 1, from: 3, add: 5}
 * 
 */
var evalutate = function (options) {
    if (Array.isArray(options) || typeof (options) != 'object') {
        return options;
    } else {
        let n = 1;
        let from = 0;
        let add = 0;
        let unique = true;
        let weight = null;
        let results = [];

        if (options.hasOwnProperty('unique')) {
            unique = Boolean(options.unique);
        }

        if (options.hasOwnProperty('weight')) {
            weight = options.weight.toLowerCase();
        }

        if (options.hasOwnProperty('add')) {
            add = parseInt(options.add);
        }

        if (options.hasOwnProperty('pick') && options.pick > 0) {
            n = parseInt(options.pick);
        }

        if (options.hasOwnProperty('upto') && options.upto > options.pick) {
            n += Math.floor(Math.random() * (1 + parseInt(options.upto) - n));
        }

        if (options.hasOwnProperty('from')) {
            from = Array.isArray(options.from) ?
                options.from
                : parseInt(options.from)
        }

        if (typeof (from) == 'number') {

            while (n-- > 0) {
                let r = Math.random();
                if (weight == 'low') { r = r * r; }
                else if (weight == 'high') { r = 1 - r * r }

                let value = Math.floor(r * from)
                results.push(add + value);
            }
        } else {
            while (n-- > 0 && from.length > 0) {
                let r = Math.random();
                if (weight == 'low') { r = r * r; }
                else if (weight == 'high') { r = 1 - r * r }

                let i = Math.floor(r * from.length);
                results.push(from[i]);

                if (!unique) {
                    from.splice(i, 1)
                }
            }
        }

        return results;
    }
}