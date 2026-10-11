 

let progressbar = bodymovin.loadAnimation({
  container: document.getElementById("progressbar"),
  path:  "../../../lib-native/space_26/assets/animations/progressbar/data.json",
  renderer: "svg",
  loop: false,
  autoplay: true,
});

let stars = bodymovin.loadAnimation({
  container: document.getElementById("stars"),
  path: "../../../lib-native/space_26/assets/animations/feedbackstar/stars.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
});

let transition = bodymovin.loadAnimation({
  container: document.getElementById("transition"),
  path: "../../../lib-native/space_26/assets/animations/transition/rocket_final.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
});
