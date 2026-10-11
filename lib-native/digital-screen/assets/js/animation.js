let zokicharecter = bodymovin.loadAnimation({
  container: document.getElementById("zokicharecter"),
  path: "../../../lib-native/digital-screen/assets/animations/zoki/data.json",
  renderer: "svg",
  loop: true,
  autoplay: false,
});

let robots = bodymovin.loadAnimation({
  container: document.getElementById("robots"),
  path: "../../../lib-native/digital-screen/assets/animations/robots/data.json",
  renderer: "svg",
  loop: false,
  autoplay: true,
});
robots.goToAndStop(0, false);
zokicharecter.goToAndStop(0, false);

let zokihappy = bodymovin.loadAnimation({
  container: document.getElementById("zokihappy"),
  path: "../../../lib-native/digital-screen/assets/animations/zoki/data.json",
  renderer: "svg",
  loop: true,
  autoplay: true,
  initialSegment: [65, 80],
});

let zokisad = bodymovin.loadAnimation({
  container: document.getElementById("zokisad"),
  path: "../../../lib-native/digital-screen/assets/animations/zoki/data.json",
  renderer: "svg",
  loop: true,
  autoplay: true,
  initialSegment: [95, 110],
});

let progressbar = bodymovin.loadAnimation({
  container: document.getElementById("progressbar"),
  path:  "../../../lib-native/digital-screen/assets/animations/progressbar/data.json",
  renderer: "svg",
  loop: false,
  autoplay: true,
});

let stars = bodymovin.loadAnimation({
  container: document.getElementById("stars"),
  path: "../../../lib-native/digital-screen/assets/animations/feedbackstar/stars.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
});

let transition = bodymovin.loadAnimation({
  container: document.getElementById("transition"),
  path: "../../../lib-native/digital-screen/assets/animations/transition/digital_screen_transition.json",
  renderer: "svg",
  loop: false,
  autoplay: false,
});
