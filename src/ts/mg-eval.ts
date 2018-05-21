/* global: NV:false */

import * as math from 'mathjs'
import { MGSelector, MGTemplate } from './mg-def';

export class MGEval {
    /**
     * Evaluates a single output value based off of the given options
     */
    static select = function (options: MGSelector | any | any[]) {
        if (typeof (options) == 'object') {
            let n: number = 1;
            let from: number | any[] = 0;
            let add: number | string = 0;
            let unique: boolean = true;
            let weight: string = null;
            let results: any[] = [];

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
                    options.from : parseInt(options.from);
            }

            if (typeof (from) == 'number') {

                while (n-- > 0) {
                    let r = Math.random();
                    if (weight == 'low') { r = r * r; }
                    else if (weight == 'high') { r = 1 - r * r; }

                    let value = Math.floor(r * from);
                    results.push(add + value);
                }
            } else {
                while (n-- > 0 && from.length > 0) {
                    let r = Math.random();
                    if (weight == 'low') { r = r * r; }
                    else if (weight == 'high') { r = 1 - r * r; }

                    let i = Math.floor(r * from.length);
                    results.push(from[i]);

                    if (!unique) {
                        from.splice(i, 1);
                    }
                }
            }

            return results;
        } else {
            return options;
        }
    };

    /**
     * Resolves a string template with a given context by expanding and calculating implicit functions. Anything inside ${...} is calculated with variables taken from the context object. Any strings in the form of '4 + 1d4' or similar will be expanded with their average.
     */
    static resolve = function (input: string, context?: Object) {
        if (typeof (input) != 'string') return input;

        // First pass looks for ${}-style evaluators
        let output = MGEval.__pass(input, /\$\{[^\}]*\}/g, function (raw) {
            // Extract expression and mode
            let opts = '';
            let expr = raw.substr(2, raw.length - 3);
            if (expr.lastIndexOf(',') > 0) {
                opts = expr.substr(expr.lastIndexOf(',') + 1).toLowerCase();
                expr = expr.substr(0, expr.length - opts.length - 1);
            }

            // Evaluate the expression
            let value: number | string = 0;
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
        });

        // Second pass looks for dice evaluator sequences
        let rx = /(\d+([dD]\d+)?[ +-]*)+/g;
        output = MGEval.__pass(output, rx, function (expr, match) {
            // Need at least one dice group
            if (expr.toLowerCase().indexOf('d') == -1) return expr;

            // Run a sub-expression to expand dice groups
            let rx = /\d+[dD]\d+/g;
            let cexpr = MGEval.__pass(expr, rx, function (dexpr) {
                let d = dexpr.toLowerCase().indexOf('d');

                let qty = parseInt(dexpr.substr(0, d));
                let die = parseInt(dexpr.substr(d + 1));
                let avg = qty * (die + 1) / 2;
                return dexpr[d] == 'D' ? Math.ceil(avg) : Math.floor(avg);
            });

            let avg = math.eval(cexpr);
            let r = `${avg} (${expr.trim()})`;

            if (/.*\s+^/.test(expr)) r += ' ';

            return r.toLowerCase();
        });

        return output;
    };

    /**
         * Helper function for parsing. Do not use if you don't know what it does!
         * 
         * @param {Regex} rx 
         * @param {Function} evaluate 
         * */
    private static __pass = function (input: string, rx: RegExp, evaluate: (raw: string, expr?: RegExpExecArray) => void) {
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
        matches.reverse();

        // Splice together each section, evaluating the match beforehand
        let parts = [];
        let index = 0;
        while (matches.length) {
            let match = matches.pop();
            let raw = match[0].toString();

            // Push prior text
            parts.push(input.substr(index, match.index - index));

            // Evaluate and push
            try { parts.push(evaluate(raw, match)); }
            catch (err) { parts.push('NaN'); }

            // Update index
            index = match.index + raw.length;
        }

        // Add the last bit
        if (index < input.length) {
            parts.push(input.substr(index));
        }

        // And return the compounded result!
        let firstPass = parts.join('');
        return parts.join('');
    };
}

export class MGBuilder {
    static build = function (
        basename: string,
        classname: string):
        Promise<MGTemplate> {
        return new Promise(function (
            resolve: (obj: MGTemplate) => void,
            reject: (err: any) => void) {

            // So much stuff to do.... Start by getting the required JSON templates
            let basedata, classdata;
            Promise.all([
                fetch('pub/dict/base/' + basename + '.json')
                    .then(res => res.json()),
                fetch('pub/dict/class/' + classname + '.json')
                    .then(res => res.json())
            ])
                .then(function (datas) {
                    // First pass expands both input templates
                    let basedata = MGBuilder.__first_pass(datas[0]);
                    let classdata = MGBuilder.__first_pass(datas[1]);

                    console.log(basedata, classdata);


                }).catch(reject)
        });
    }

    // Sifts through all the variables and expands any MGSelectors it finds
    private static __first_pass(template: object): MGTemplate {
        let result = Object.setPrototypeOf(template, MGTemplate);

        // Recurse through all keys
        let queue: (any[]) = [];
        queue.push(template);

        // Go through each key and eval the ones we can
        while (queue.length > 0) {
            let obj = queue.pop();
            for (let key in Object.keys(obj)) {
                if (!obj.hasOwnProperty(key)
                    || typeof (obj[key]) != 'object')
                    continue;

                if (obj.hasOwnProperty('from') || obj instanceof MGSelector) {
                    obj[key] = MGEval.select(obj[key]);
                }
                else {
                    queue.push(obj[key]);
                }
            }
        }

        return result;
    }
}