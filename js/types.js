var __commonTypes = {};

function loadTypes() {
    let promises = [];
    let rx = /\/[^\/]+(?=\.json)/;

    [
        '/encyclopedia/common/traits.json',
        ' /encyclopedia/common/weapons.json'
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
        this.actions = [];
        this.alignment = 'true neutral';
        this.challenge = 1;
        this.hitdie = 6;
        this.immune = [];
        this.languages = [];
        this.modifiers = {};
        this.resists = [];
        this.senses = [];
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
        this.traits = [];
        this.type = 'humanoid';
        this.vulnerable = [];
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

                let actions = creature.actions;
                let traits = creature.traits;

                creature.actions = [];
                creature.traits = [];

                // Load all creature actions
                actions.forEach(function (action) {
                    let source = {};
                    switch (action.type.toLowerCase()) {
                        case 'weapon':
                            source = __commonTypes.weapons;
                            break;
                    }

                    if (source.hasOwnProperty(action.name)) {
                        // We have a match! Load it
                        creature.actions.push(source[action.name]);
                    } else {
                        // No idea, we'll figure it out later
                        creature.actions.push(action);
                    }
                });

                // Load all creature traits
                traits.forEach(function (trait) {
                    let source = __commonTypes.traits;

                    if (typeof (trait) == 'object') {
                        creature.traits.push(trait);
                    } else if (source.hasOwnProperty(trait)) {
                        creature.traits.push(source[trait]);
                    }
                });

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