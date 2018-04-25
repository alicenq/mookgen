window.onload = function () {
    loadTypes()
        .then(function () {
            console.log('Types loaded successfully');
            console.log(__commonTypes);
        })
        .catch(console.log);

    let app = new Vue({
        el: "#vue-app"
    });

    CreatureTemplate.fetch('kobold')
        .then(function (kobold) {
            CreatureModifier.fetch('fire-sorc')
                .then(function (sorc) {
                    let result = kobold.apply(sorc);
                    console.log(result);

                    document.getElementById('sample1').innerText = JSON.stringify(result, null, 4);
                })
                .catch(console.log);
        })
        .catch(console.log);

    CreatureTemplate.fetch('kobold')
        .then(function (kobold) {
            CreatureModifier.fetch('thug')
                .then(function (sorc) {
                    let result = kobold.apply(sorc);
                    console.log(result);

                    document.getElementById('sample2').innerText = JSON.stringify(result, null, 4);
                })
                .catch(console.log);
        })
        .catch(console.log);

}

