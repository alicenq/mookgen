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
        return new Promise(function (resolve, reject) {
            // Helper function
            let json = function (res) {
                return res.json();
            }

            // Fetch the corresponding JSON
            fetch('/encyclopedia/race/' + name + '.json')
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

                    // Fetch traits and load each
                    let promises = [
                        fetch('/encyclopedia/common/traits.json')
                            .then(json)
                            .then(function (data) {
                                let source = creature.traits;
                                creature.traits = [];

                                for (let i in source) {
                                    let trait = source[i];
                                    if (typeof (trait) == 'object') {
                                        creature.traits.push(trait);
                                    } else {
                                        creature.traits.push(data[trait]);
                                    }
                                }
                            })
                            .catch(reject)
                    ];

                    // Fetch each action as needed
                    let actions = creature.actions;
                    creature.actions = [];

                    for (let i in actions) {
                        let action = actions[i];

                        switch (action.type) {
                            case 'weapon':
                                promises.push(
                                    fetch('/encyclopedia/common/wp/' + action.name + '.json')
                                        .then(json)
                                        .then(function (data) {
                                            creature.actions.push(data);
                                        })
                                        .catch(reject)
                                );
                                break;
                            default:
                                creature.actions.push(action);
                        }
                    }


                    Promise.all(promises).then(function () {
                        resolve(creature);
                    }).catch(reject);
                })
                .catch(reject);
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