let Path = ''
innerHeight > innerWidth ? Path = '../../../lib-native/dictation_5r/json/portrait/' : Path = '../../../lib-native/dictation_5r/json/landscape/';
let infoScreen = bodymovin.loadAnimation({
    container: document.getElementById('infoScreen'),
    path: Path + 'infonext.json', // required
    renderer: 'svg', // required
    loop: false, // optional
    autoplay: false, // optional
    name: "Feed Right", // optional
});
let answer_player = bodymovin.loadAnimation({
    container: document.getElementById('answer_player'),
    path: Path + 'infoscreenone.json', // required
    renderer: 'svg', // required
    loop: false, // optional
    autoplay: false, // optional
    name: "Feed Right", // optional
});
let finshed = bodymovin.loadAnimation({
    container: document.getElementById('finshed'),
    path: '../../../lib-native/dictation_5r/json/portrait/feedend.json', // required
    renderer: 'svg', // required
    loop: false, // optional
    autoplay: false, // optional
    name: "Feed Right", // optional
});

let progressBar = bodymovin.loadAnimation({
    container: document.getElementById('progressbar'),
    path: '../../../lib-native/dictation_5r/json/progressbar.json', // required
    renderer: 'svg', // required
    loop: false, // optional
    autoplay: false, // optional
    name: "progressBar", // optional
});

infoScreen.goToAndStop(0, false);
// infoScreen.playSegments([0, 80], true);
answer_player.goToAndStop(0, false);
// answer_player.playSegments([0, 80], true);
finshed.goToAndStop(0, false);
// finshed.playSegments([0, 80], true);
progressBar.goToAndStop(0, false);
// progressBar.playSegments([0, 80], true);