export class MGBase {
    name: string;
    alignment: string;
    type: string;
    size: string;
    crbase: number;
    languages: string[];
    conditions: string[];
    resistances: string[];
    weaknesses: string[];
    senses: string[];
    speeds: {
        walk: number,
        fly: number,
        climb: number,
        swim: number
    };
    stats: {
        str: number,
        dex: number,
        con: number,
        int: number,
        wis: number,
        cha: number
    };
    traits: MGTrait[]
}

export class MGTrait {
    type: string;
    import: string;
    slot: string;
}