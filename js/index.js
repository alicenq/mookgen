window.onload = function () {
    fetchObject('encyclopedia/common/spell.json')
        .then(console.log)

    let test = [
        1,
        2,
        'hello world',
        {
            pick: 1,
            from: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        {
            pick: 3,
            from: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        {
            pick: 1,
            upto: 3,
            from: ['a', 'b', 'c', 'd', 'e', 'f']
        },
        {
            pick: 4,
            from: 1000,
            weight: 'low'
        },
        {
            pick: 4,
            from: 1000,
            weight: 'high'
        },
        {
            pick: 3,
            from: 5,
            add: 2
        }
    ];
    test.forEach(function (template) {
        console.log(template);
        console.log(evalutate(template));
        console.log(evalutate(template));
        console.log(evalutate(template));
        console.log('------')
    });
}