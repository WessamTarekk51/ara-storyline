
let box = bodymovin.loadAnimation({
  container: document.getElementById('boxAnmation'),
  path: '../../../lib-native/glossary/assets/json/box.json', // required
  renderer: 'svg', // required
  loop: false, // optional
  autoplay: false, // optional
  // name: "Feed Right", // optional
  // initialSegment: [1, 50],

});
// console.log(box)