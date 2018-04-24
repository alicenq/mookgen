var __commonTypes = {};

function loadTypes() {
    let promises = [];
    let rx = /\/[^\/]+(?=\.json)/;

    [
        '/encyclopedia/common/trait.json',
        '/encyclopedia/common/weapon.json',
        '/encyclopedia/common/spell.json'
    ].forEach(function (path) {
        let name = rx.exec(path)[0].substr(1);
        promises.push(fetch(path)
            .then(function (res) { return res.json(); })
            .then(function (data) { __commonTypes[name] = data; })
        );
    })

    return Promise.all(promises)
};

class WeaponTemplate {
    constructor() {
        this.name = '';
        this.stat = ''
        this.melee = null;
        this.melee2 = null;
        this.ranged = null;
    }
}

class TraitTemplate {
    constructor() {
        this.name = '';
        this.description = '';
    }
}

class CreatureTemplate {
    constructor() {
        this.alignment = 'true neutral';
        this.challenge = 0.125;
        this.attributes = [];
        this.hitdie = 6;
        this.immunities = [];
        this.languages = [];
        this.modifiers = {};
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

    static fetch(name) {
        // Helper function
        let json = function (res) {
            return res.json();
        }

        // Fetch the corresponding JSON
        return fetch('/encyclopedia/race/' + name + '.json')
            .then(json)
            .then(function (data) {
                // Populate the defaults
                let creature = new CreatureTemplate();

                // Copy over all the properties iteratively
                let queue = [{
                    source: data,
                    copy: creature
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

                // Pre-sort the attributes
                let attributes = creature.attributes;
                delete creature.attributes;
                creature.actions = [];
                creature.bonusactions = [];
                creature.reactions = [];
                creature.traits = [];

                attributes.forEach(function (attr) {
                    if (attr.import) {
                        let src = __commonTypes[attr.import];
                        if (src && src.hasOwnProperty(attr.key)) {
                            attr = Object.assign(attr, src[attr.key])
                        }
                    }

                    switch (attr.type) {
                        case 'action':
                            creature.actions.push(attr);
                            break;
                        case 'bonus':
                            creature.bonusactions.push(attr);
                            break;
                        case 'reaction':
                            creature.reactions.push(attr);
                            break;
                        case 'trait':
                        case undefined:
                            creature.traits.push(attr);
                            break;
                        default:
                            console.warn(attr);
                            break;
                    }
                })

                return creature;
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
