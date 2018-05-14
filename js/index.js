
window.onload = function () {
    console.log(evaluate('The ${name} is a ${slvl,o}-level spellcaster. its spellcasting ability is Charisma (spell save DC ${8 + prof + cha}, ${prof + cha,s} to hit with spell attacks). It has the following bard spells prepared:', {
        name: 'asd',
        slvl: 3,
        prof: 2,
        cha: 3
    }));

    console.log(evaluate('Testing averages of 1d4, 1d6, 1d8, 3d10, 3D10, 3d10+5, 3D10+5 and 1d4+1d6+10'))

    console.log(evaluate('Sample health with con = 3, effective level = 13 is ${lvl}d8 + ${lvl * con}', {
        lvl: 13,
        con: 3
    }))
}