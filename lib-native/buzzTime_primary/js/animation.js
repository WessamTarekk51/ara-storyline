export function loadAnimations() {
  let buzzScreen = bodymovin.loadAnimation({
    container: document.getElementById('buzzScreen'),
    path: '../../../lib-native/buzzTime_primary/json/buzzScreen.json',
    renderer: 'svg',
    loop: true,
    autoplay: true,
  });

  let girlStage = bodymovin.loadAnimation({
    container: document.getElementById('girlStage'),
    path: '../../../lib-native/buzzTime_primary/json/mychar-girl.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });

  let boyStage = bodymovin.loadAnimation({
    container: document.getElementById('boyStage'),
    path: '../../../lib-native/buzzTime_primary/json/boyStage.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });

  let introStage = bodymovin.loadAnimation({
    container: document.getElementById('introStage'),
    path: '../../../lib-native/buzzTime_primary/json/intro.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  // introStage.playSegments[0, 80,true];

  let chooseAvatar = bodymovin.loadAnimation({
    container: document.getElementById('chooseAvatar'),
    path: '../../../lib-native/buzzTime_primary/json/chooseAvatar.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  let boyVs = bodymovin.loadAnimation({
    container: document.getElementById('boyVs'),
    path: '../../../lib-native/buzzTime_primary/json/boy-vs.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  let girlVs = bodymovin.loadAnimation({
    container: document.getElementById('girlVs'),
    path: '../../../lib-native/buzzTime_primary/json/girl-vs.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });

  let BoyCharVs2 = bodymovin.loadAnimation({
    container: document.getElementById('BoyCharVs2'),
    path: '../../../lib-native/buzzTime_primary/json/BoyCharVs2.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });

  let GirlCharVs = bodymovin.loadAnimation({
    container: document.getElementById('GirlCharVs'),
    path: '../../../lib-native/buzzTime_primary/json/girl-char-vs.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  let BoyCharVs1 = bodymovin.loadAnimation({
    container: document.getElementById('BoyCharVs1'),
    path: '../../../lib-native/buzzTime_primary/json/BoyCharVs1.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  let Timer = bodymovin.loadAnimation({
    container: document.getElementById('Timer'),
    path: '../../../lib-native/buzzTime_primary/json/timer.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });

  let leftLight = bodymovin.loadAnimation({
    container: document.getElementById('leftLight'),
    path: '../../../lib-native/buzzTime_primary/json/leftLight.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  let vsLight = bodymovin.loadAnimation({
    container: document.getElementById('vsLight'),
    path: '../../../lib-native/buzzTime_primary/json/vsLight.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
  });

  let boyStageFeedback = bodymovin.loadAnimation({
    container: document.getElementById('boy'),
    path: '../../../lib-native/buzzTime_primary/json/boyStageFeedback.json',
    renderer: 'svg',
    loop: false,
    autoplay: true,
  });
  let girlStageFeedback = bodymovin.loadAnimation({
    container: document.getElementById('girl'),
    path: '../../../lib-native/buzzTime_primary/json/girlStageFeedback.json',
    renderer: 'svg',
    loop: false,
    autoplay: true,
  });

  let girlVsFeedback = bodymovin.loadAnimation({
    container: document.getElementById('computerGirl'),
    path: '../../../lib-native/buzzTime_primary/json/girlVsFeedback.json',
    renderer: 'svg',
    loop: false,
    autoplay: true,
  });
  let boyVs2Feedback = bodymovin.loadAnimation({
    container: document.getElementById('computerBoy2'),
    path: '../../../lib-native/buzzTime_primary/json/boyVs2Feedback.json',
    renderer: 'svg',
    loop: false,
    autoplay: true,
  });
  let boyVs1Feedback = bodymovin.loadAnimation({
    container: document.getElementById('computerBoy1'),
    path: '../../../lib-native/buzzTime_primary/json/boyVs1Feedback.json',
    renderer: 'svg',
    loop: false,
    autoplay: true,
  });
  let festival = bodymovin.loadAnimation({
    container: document.getElementById('festival'),
    path: '../../../lib-native/buzzTime_primary/json/Festival.json',
    renderer: 'svg',
    loop: false,
    autoplay: true,
  });
  let stars = bodymovin.loadAnimation({
    container: document.getElementById('stars'),
    path: '../../../lib-native/buzzTime_primary/js/feedbackstar/stars.json',

    renderer: 'svg',
    loop: false,
    autoplay: false,
  });
  return {
    buzzScreen,
    girlStage,
    boyStage,
    introStage,
    chooseAvatar,
    BoyCharVs2,
    GirlCharVs,
    BoyCharVs1,
    Timer,
    leftLight,
    vsLight,
    boyVs,
    girlVs,
    boyStageFeedback,
    girlStageFeedback,
    girlVsFeedback,
    boyVs2Feedback,
    boyVs1Feedback,
    festival,
    stars,
  };
}
