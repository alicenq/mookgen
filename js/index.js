window.onload = function () {
    loadTypes()
        .then(function () {
            console.log('Types loaded successfully');
            console.log(__commonTypes);
        })
        .catch(console.log);

    new Vue({
        el: "#vue-app"
    });

    CreatureTemplate.fetch('kobold')
        .then(console.log)
        .catch(console.log);

    CreatureModifier.fetch('fire-sorc')
        .then(console.log)
        .catch(console.log);
}

