export class MGTrait {
    type: string;
    import: string;
    slot: string;

    [key: string]: any;
}

export class MGTemplate {
    name: string;
    alignment?: string;
    type?: string;
    size?: string;
    cr?: number;
    lvl?: number;
    languages?: string[] | MGSelector;
    conditions?: string[] | MGSelector;
    resistances?: string[] | MGSelector;
    immunities?: string[] | MGSelector;
    weaknesses?: string[] | MGSelector;
    senses?: string[] | MGSelector;
    speeds?: {
        walk: number,
        fly?: number,
        climb?: number,
        swim?: number
    };
    stats?: {
        str: number,
        dex: number,
        con: number,
        int: number,
        wis: number,
        cha: number
    };
    traits?: MGTrait[];
    spells: (string[] | MGSelector)[];
    innate: (string[] | MGSelector)[];

    [key: string]: any;
}

/**
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
export class MGSelector {
    /**
     * Number of items to pick
     */
    pick: any = 1;
    from: any | any[] = []
    upto?: any;
    add?: any;
    weight?: 'low' | 'high';
    unique?: boolean;

    [key: string]: any;
}