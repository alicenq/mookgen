/* global
select:false,
evaluate:false,
math:false,
NV:false
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
var select = function (options) {
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

/**
 * Resolves a string template with a given context by expanding and calculating implicit functions, eh anything inside ${...}. Any variables are taken from the context parameter.
 * 
 * Variable expansion is allowed, as is 
 * 
 * 
 * @param {*} input 
 * @param {*} context 
 */
var evaluate = function (input, context) {
    if (typeof (input) != 'string') return input;

    // First pass looks for ${}-style evaluators
    let output = __pass(input, /\$\{[^\}]*\}/g, function (raw) {
        // Extract expression and mode
        let opts = '';
        let expr = raw.substr(2, raw.length - 3)
        if (expr.lastIndexOf(',') > 0) {
            opts = expr.substr(expr.lastIndexOf(',') + 1).toLowerCase()
            expr = expr.substr(0, expr.length - opts.length - 1)
        }

        // Evaluate the expression
        let value = 0;
        try { value = math.eval(expr, context); }
        catch (err) { console.warn(err); }

        // Check for each option
        if (opts.indexOf('o') >= 0 && typeof (value) == 'number') {
            // Ordinal
            switch (value % 10) {
                case 1: value = value + 'st'; break;
                case 2: value = value + 'nd'; break;
                case 3: value = value + 'rd'; break;
                default: value = value + 'st'; break;
            }
        }
        if (opts.indexOf('s') >= 0 && typeof (value) == 'number') {
            // Signed
            if (value >= 0) value = '+' + value;
        }

        return value;
    })

    // Second pass looks for dice evaluator sequences
    let rx = /(\d+([dD]\d+)?[ +-]*)+/g;
    output = __pass(output, rx, function (expr, match) {
        // Need at least one dice group
        if (expr.toLowerCase().indexOf('d') == -1) return expr;

        // Run a sub-expression to expand dice groups
        let rx = /\d+[dD]\d+/g;
        let cexpr = __pass(expr, rx, function (dexpr) {
            let d = dexpr.toLowerCase().indexOf('d');

            let qty = parseInt(dexpr.substr(0, d))
            let die = parseInt(dexpr.substr(d + 1))
            let avg = qty * (die + 1) / 2;
            return dexpr[d] == 'D' ? Math.ceil(avg) : Math.floor(avg)
        })

        let avg = math.eval(cexpr)
        let r = `${avg} (${expr.trim()})`

        if (expr.endsWith(' ')) r += ' '

        return r.toLowerCase()
    })

    return output;

}

/**
     * Helper function for parsing. Do not use if you don't know what it does!
     * 
     * @param {Regex} rx 
     * @param {Function} evaluate 
     * */
var __pass = function (input, rx, evaluate) {
    // Extract all the groups inside ${} patterns
    let matches = [];
    if (rx.global) {
        for (let m = rx.exec(input);
            m != null;
            m = rx.exec(input)) {
            matches.push(m);
        }
    } else {
        matches.push(rx.exec(input));
        console.warn('Warning, pass expr is not global');
    }

    // Reverse match list to turn it into a queue
    matches.reverse()

    // Splice together each section, evaluating the match beforehand
    let parts = []
    let index = 0;
    while (matches.length) {
        let match = matches.pop();
        let raw = match[0].toString();

        // Push prior text
        parts.push(input.substr(index, match.index - index))

        // Evaluate and push
        try { parts.push(evaluate(raw, match)) }
        catch (err) { parts.push('NaN') }

        // Update index
        index = match.index + raw.length
    }

    // Add the last bit
    if (index < input.length) {
        parts.push(input.substr(index))
    }

    // And return the compounded result!
    let firstPass = parts.join('');
    return parts.join('')
}