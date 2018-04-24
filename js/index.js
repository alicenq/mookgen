window.onload = function () {
    new Vue({
        el: "#vue-app"
    });

    run();
}

function run() {
    CreatureTemplate.fetch('kobold').then(console.log).catch(console.log);
    console.log(Dice.parse('11d9').average());
}
