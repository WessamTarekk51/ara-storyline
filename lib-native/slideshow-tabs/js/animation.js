const grade = document.querySelector("#slide-show").getAttribute('grade')
let feedback = grade <= 3
    ? '../../../lib-native/slideshow-tabs/json/lower-grades-feedback.json'
    : '../../../lib-native/slideshow-tabs/json/upper-grades-feedback.json'

let progressbar = bodymovin.loadAnimation({
    container: document.getElementById('progressbar'),
    path: feedback,
    renderer: 'svg',
    loop: false,
    autoplay: false,
});

let coins = bodymovin.loadAnimation({
    container: document.getElementById('coins'),
    path: '../../../lib-native/slideshow-tabs/json/coin-grade-' + grade + '.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
    initialSegment: [0, 40]
});

let states = bodymovin.loadAnimation({
    container: document.getElementById('states'),
    path: '../../../lib-native/slideshow-tabs/json/states-grade-' + grade + '.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
});


progressbar.goToAndStop(0, false);
