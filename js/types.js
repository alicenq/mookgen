var __commonTypes = {};

var __rootpath = document.path.substr(0, document.path.lastIndexOf('/'));
console.log(__rootpath);

function loadTypes() {
    let promises = [];
    let rx = /\/[^\/]+(?=\.json)/;

    [
        document.path + 'encyclopedia/common/trait.json',
        'encyclopedia/common/weapon.json',
        'encyclopedia/common/spell.json'
    ].forEach(function (path) {
        let name = rx.exec(path)[0].substr(1);
        promises.push(fetch(path)
            .then(function (res) { return res.json(); })
            .then(function (data) { __commonTypes[name] = data; })
        );
    })

    return Promise.all(promises)
};

class CreatureTemplate {
    constructor() {
        this.alignment = 'true neutral';
        this.armor = null;
        this.challenge = 0.125;
        this.attributes = [];
        this.hitdie = 6;
        this.immunities = [];
        this.languages = [];
        this.level = 1;
        this.name = "???"
        this.resistances = [];
        this.saves = [];
        this.senses = [];
        this.skills = [];
        this.size = "medium";
        this.speed = {
            run: 0,
            fly: 0,
            climb: 0,
            swim: 0
        }
        this.stat = {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10,

            finesse() { return Math.max(str, dex); }
        };
        this.type = 'humanoid';
        this.vulnerabilities = [];
        this.xp = 25;
    }

    /**
     * Applies all the elements from a CreatureModifier to this instance and returns it 
     */
    apply(modifier) {
        let merge = function (target, source) {
            if (!Array.isArray(source)) {
                if (source.options) {
                    if (source.count > 0) {
                        let arr = [];
                        let keys = Object
                            .keys(source.options)
                            .filter(k => source.options.hasOwnProperty(k));

                        let count = Math.min(source.count, keys.length);
                        for (let i = 0; i < count; i++) {
                            let index = Math.floor(Math.random() * keys.length);

                            arr.push(source.options[keys[index]]);
                            keys.splice(index, 1);
                        }

                        source = arr;
                    } else {
                        source = source.options;
                    }
                }
            }


            // Write in all the elements
            for (let i in source) {
                let item = source[i];

                // Look for slot conflicts
                if (item.slot) {
                    switch (item.slot) {
                        case 'melee1':
                            let c1 = target.findIndex(t => t.slot == 'melee1');
                            let c2 = target.findIndex(s => s.slot == 'melee2')
                            if (c1 >= 0) target[c1].slot = "melee2";
                            if (c2 >= 0) target.splice(c2, 1);
                            break;
                        default:
                            let c = target.findIndex(s => s.slot == item.slot);;
                            if (c >= 0) target.splice(c, 1);
                            break;
                    }
                }

                if (target.indexOf(item) == -1)
                    target.push(item);
            }
        };

        if (modifier.name) this.name += ' ' + modifier.name;
        if (modifier.armor) this.armor = modifier.armor;
        if (modifier.challenge) this.challenge += modifier.challenge;
        if (modifier.actions)
            merge(this.actions, modifier.actions);
        if (modifier.attributes)
            merge(this.attributes, modifier.attributes);
        if (modifier.hitdie > this.hitdie) this.hitdie = modifier.hitdie;
        if (modifier.bonus)
            merge(this.bonus, modifier.bonus);
        if (modifier.immunities)
            merge(this.immunities, modifier.immunities);
        if (modifier.languages)
            merge(this.languages, modifier.languages);
        if (modifier.level > this.level) this.level = modifier.level;
        if (modifier.reactions)
            merge(this.reactions, modifier.reactions);
        if (modifier.resistances)
            merge(this.resistances, modifier.resistances);
        if (modifier.saves)
            merge(this.saves, modifier.saves);
        if (modifier.senses)
            merge(this.senses, modifier.senses);
        if (modifier.skills)
            merge(this.skills, modifier.skills);
        if (modifier.speed) {
            if (modifier.speed.run) this.speed.run += modifier.speed.run;
            if (modifier.speed.fly) this.speed.fly += modifier.speed.fly;
            if (modifier.speed.swim) this.speed.swim += modifier.speed.swim;
            if (modifier.speed.climb) this.speed.climb += modifier.speed.climb;
        }
        if (modifier.stat) {
            if (modifier.stat.str) this.stat.str += modifier.stat.str;
            if (modifier.stat.dex) this.stat.dex += modifier.stat.dex;
            if (modifier.stat.con) this.stat.con += modifier.stat.con;
            if (modifier.stat.int) this.stat.int += modifier.stat.int;
            if (modifier.stat.wis) this.stat.wis += modifier.stat.wis;
            if (modifier.stat.cha) this.stat.cha += modifier.stat.cha;
        }
        if (modifier.traits)
            merge(this.traits, modifier.traits);
        if (modifier.vulnerabilities)
            merge(this.vulnerabilities, modifier.vulnerabilities);
        if (modifier.xp)
            this.xp += modifier.xp;

        return this;
    }

    static fetch(name) {
        return Template.fetch(new CreatureTemplate(), `encyclopedia/race/${name}.json`)
    }
}

class CreatureModifier {
    constructor() {
        this.name = '';
        this.description = '';
        this.attributes = [];
    }

    static fetch(name) {
        return Template.fetch(new CreatureModifier(), `encyclopedia/role/${name}.json`)
    }
}

class Template {
    static clone(template) {
        return JSON.parse(JSON.stringify(template));
    }

    static fetch(template, path) {
        // Helper function
        let json = function (res) {
            return res.json();
        }

        // Fetch the corresponding JSON
        return fetch(path)
            .then(json)
            .then(function (data) {
                // Copy over all the properties iteratively
                let queue = [{
                    source: data,
                    copy: template
                }];

                // Each queue item consists of a source object and a copy object
                while (queue.length > 0) {
                    let next = queue.pop();
                    let keys = Object.keys(next.source);

                    keys.forEach(function (key) {
                        if (next.source.hasOwnProperty(key)) {
                            if (typeof (next.source[key]) == 'object') {
                                let isArray = Array.isArray(next.copy[key]);
                                next.copy[key] = isArray ? [] : {};

                                queue.push({
                                    source: next.source[key],
                                    copy: next.copy[key]
                                })
                            } else {
                                next.copy[key] = next.source[key];
                            }
                        }
                    });
                }

                // Pre-sort the attributes if any
                if (template.attributes) {
                    let attributes = template.attributes;
                    delete template.attributes;

                    template.actions = [];
                    template.bonusactions = [];
                    template.reactions = [];
                    template.traits = [];

                    attributes.forEach(function (attr) {
                        if (attr.import) {
                            let src = __commonTypes[attr.import];
                            if (src && src.hasOwnProperty(attr.key)) {
                                attr = Object.assign(attr, src[attr.key])
                            }

                            delete attr.import;
                            delete attr.key;
                        }

                        let list = null;
                        switch (attr.type) {
                            case 'action': list = template.actions; break;
                            case 'bonus': list = template.bonusactions; break;
                            case 'reaction': list = template.reactions; break;
                            case 'trait':
                            case undefined: list = template.traits; break;
                            default:
                                console.warn(attr);
                                break;
                        }

                        list.push(attr);
                    })
                }

                return template;
            })
    }
}

class Dice {
    constructor(die, count) {
        this.die = die;
        this.count = count;
    };

    min() {
        return this.count;
    };

    max() {
        return this.count * this.die;
    };

    average() {
        return Math.floor((this.count / 2) * (this.die + 1));
    };

    toString() {
        return this.count + 'D' + this.die;
    }

    static parse(str) {
        let i = str.toLowerCase().indexOf('d');
        if (i < 0) {
            return new Dice(parseInt(str), 1);
        } else {
            let count = str.substr(0, i);
            let die = str.substr(i + 1);
            return new Dice(parseInt(count), parseInt(die));
        }
    };
}

signed = function (value) {
    if (value > 0) return '+' + value;
    else return '-' + (value * -1);
}
