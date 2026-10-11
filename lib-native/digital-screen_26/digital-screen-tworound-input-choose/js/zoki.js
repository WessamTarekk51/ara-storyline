const digitalScreen = document.querySelector("#digital-screen");
const pageUrl = digitalScreen.getAttribute("data-urlpage");

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}

new Vue({
  el: "#digital-screen",
  data: {
    posts: [],
    loQuestions: 0,
    question: false,
    counter: -1,
    bgMusic: false,
    index: -1,
    rightBox: null,
    falseBox: null,
    count: 0,
    questionsNumber: -1,
    questionNumber: 0,
    bgAudio: new Audio(),
    clickBtn: new Audio(),
    startBtn: new Audio(),
    wrongAnswer: new Audio(),
    rightAnswer: new Audio(),
    zokiBoring: new Audio(),
    feedback: false,
    screenClick: (number = 0),
    screenInterval: null,
    qSound: new Audio(),
    sec: null,
    setInterval: null,
    startLo: false,
    attamps: 0,
    content: null,
    helpHand: true,
    border: null,
    shuffled: [],
    setTimeOut: null,
    zokiStatus: false,
    answer: [],
    showAnswers: [],
    test: 0,
    numsValues: 0,
    answertruecount: 0,
    result: 0,
    finalProgress: 0,
    Estimation: "",
    zokifeedback: false,
    firstQ: 0,
    roundTwo: false,
    hint: new Audio(),
    hintDuration: 0,
    startSettimeout: null,
    upper: null,
    isEng: null,
    activeQuestion: null,
    roundTwo: false,
    correctChoose: false,
    typeChoose: null,
    correctChooseText: null,
    selectChoose: null,
    infotmationClick: false,
    break: false,
    scormStartTime: null,
    scormReported: false,
    scormPostScheduled: false,
    scormCompletionReady: false,
    numberOfAttemptInitialized: false,
    previousScormScore: 0,

    // --------------------------------------------------------
    isLoading: false,
    isSuccess: false,
    activityId: 0,
    dataLoaded: false,
    currentdate: "",
    data: null,

    // --------------------------------------------------------
  },

  create() { },
  async mounted() {
    this.reSize();
    window.addEventListener("resize", this.reSize);
    if (
      !window.location.hostname.includes(
        "127.0.0.1" || "stblobstrgeaccount.blob.core.windows.net",
      )
    ) {
      document.addEventListener("contextmenu", function (event) {
        event.preventDefault();
      });
    }
    await this.getData();
    this.shuffle(this.posts[0].items);
    this.numOfQuestions();
    this.bgAudio.src =
      "../../../lib-native/digital-screen_26/assets/audio/music.mp3";
    this.wrongAnswer.src =
      "../../../lib-native/digital-screen_26/assets/audio/wronganswer.mp3";
    this.rightAnswer.src =
      "../../../lib-native/digital-screen_26/assets/audio/rightanswer.mp3";
    this.clickBtn.src =
      "../../../lib-native/digital-screen_26/assets/audio/click_btn.mp3";
    this.startBtn.src =
      "../../../lib-native/digital-screen_26/assets/audio/startclick2.mp3";
    this.zokiBoring.src =
      "../../../lib-native/digital-screen_26/assets/audio/knock-knock.mp3";
    finalResponse.submitData(JSON.stringify(this.posts[0]), 1, 0);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.reSize);
  },
  methods: {
    reSize: async function () {
      const aspect = 16 / 9;
      let w = window.innerWidth;
      let h = window.innerHeight;

      if (w / h > aspect) {
        w = h * aspect;
      } else {
        h = w / aspect;
      }

      const app = document.getElementById("digital-screen");
      if (app) {
        app.style.width = w + "px";
        app.style.height = h + "px";
      }
    },
    addFont() {
      let getupdatefont = document.querySelectorAll(".question.editFont");

      if (getupdatefont.length > 0) {
        if (this.posts[0].isEng) {
          document.querySelectorAll("*").forEach((el) => {
            el.style.fontFamily = "lexend-regular";
          });
          document.querySelectorAll(".isSuccess").forEach((el) => {
            el.classList.add("isEng");
          });
          document.querySelectorAll(".main").forEach((el) => {
            el.classList.add("isEng");
          });
        } else {
          if (this.posts[0].upper) {
            document.querySelectorAll("*").forEach((el) => {
              el.style.fontFamily = "vazirmatn-light-upper";
            });
          } else {
            document.querySelectorAll("*").forEach((el) => {
              el.style.fontFamily = "vazirmatn-light-lower";
            });
          }
        }
      } else {
        if (this.posts[0].isEng) {
          document.querySelectorAll("*").forEach((el) => {
            el.style.fontFamily = "ArialRounded";
          });
          document.querySelectorAll("input").forEach((el) => {
            el.style.fontFamily = "Amin";
          });
          document.querySelectorAll(".number").forEach((el) => {
            el.style.fontFamily = "Amin";
          });
          document.querySelectorAll(".text").forEach((el) => {
            el.style.fontFamily = "ArialRounded";
          });
        } else {
          if (this.posts[0].upper) {
            document.querySelectorAll("*").forEach((el) => {
              el.style.fontFamily = "samim";
            });
            document.querySelectorAll("input").forEach((el) => {
              el.style.fontFamily = "ArialRounded";
            });
            document.querySelectorAll(".number").forEach((el) => {
              el.style.fontFamily = "ArialRounded";
            });
            document.querySelectorAll(".text").forEach((el) => {
              el.style.fontFamily = "samim";
            });
          } else {
            document.querySelectorAll("*").forEach((el) => {
              el.style.fontFamily = "AraJozoor";
            });
          }
        }
      }
    },

    getDate() {
      this.currentdate = new Date();
      return (
        this.currentdate.getDate() +
        "/" +
        (this.currentdate.getMonth() + 1) +
        "/" +
        this.currentdate.getFullYear() +
        " " +
        this.currentdate.getHours() +
        ":" +
        this.currentdate.getMinutes() +
        ":" +
        this.currentdate.getSeconds()
      );
    },

    getQuestionTime() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours === 0 ? 12 : hours;
      const hoursStr = String(hours).padStart(2, "0");
      return `${hoursStr}:${minutes}:${seconds} ${period}`;
    },

    getData: async function () {
      let restoredPost = null;
      if (direction == "2") {
        await returnData.then((response) => {
          this.isSuccess = response.isSuccess;
          this.data = response.value;
          if (
            this.data.learningObjectAsJson != "" &&
            this.data.learningObjectAsJson != null
          ) {
            let jsonData = JSON.parse(this.data.learningObjectAsJson);
            restoredPost = Array.isArray(jsonData) ? jsonData[0] : jsonData;
            this.previousScormScore = this.normalizeScormScore(
              restoredPost?.cmi?.score?.raw,
            );
            // this.posts[0] = jsonData;
            // this.dataLoaded = true;
          }
        });
      } else {
        if (runPage) {
          this.isSuccess = true;
        } else {
          await returnData.then((response) => {
            this.isSuccess = response.value;
          });
        }
      }

      !this.dataLoaded
        ? await fetch(pageUrl + ".json")
          .then((res) => res.json())
          .then((data) => {
            this.posts = data;
            // console.log(
            //   "numberOfquestion = " + this.posts[0].numberOfquestion
            // );
          })
        : "";

      this.posts.length != 0
        ? setTimeout(() => {
          this.isLoading = true;
          this.loQuestions = this.posts[0].numberOfquestion;
        }, 1000)
        : (this.isLoading = false);
      if (
        typeof checkQuestions === "function" &&
        checkQuestions() &&
        this.posts[0].items
      ) {
        this.loQuestions = this.posts[0].items.length;
      }
      const isLocalDevelopment =
        window.location.protocol === "file:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const isDevMedia = window.location.href.startsWith(
        "https://stblobstrgeaccount.blob.core.windows.net/dev-media/",
      );

      if (
        (isLocalDevelopment || isDevMedia) &&
        typeof getURLParameters === "function"
      ) {
        let params = getURLParameters();
        if (params.numberOfQuestions) {
          this.posts[0].upper = params.upper;
          this.posts[0].isEng = params.lang;
          this.posts[0].numberOfquestion = params.numberOfQuestions;
          this.loQuestions = params.numberOfQuestions;
          this.posts[0].hint = params.hint;
          this.posts[0].questionAudio = params.questionAudio;
        }
      }
      this.upper = this.posts[0].upper;
      this.isEng = this.posts[0].isEng;

      this.posts[0].numberOfTotalQuestion = this.posts[0].items.length;
      this.posts[0].studentPoint = 0;
      if (!this.posts[0].cmi) {
        this.posts[0].cmi = {
          completion_status: "unknown",
          success_status: "unknown",
          total_time: "00:00:00",
          score: {
            raw: 0,
            min: 0,
            max: 100,
            scaled: 0,
          },
        };
      }
      if (!this.posts[0].studentProgress) {
        this.posts[0].studentProgress = {
          infoDetails: {
            info: {
              id: null,
              status: null,
              timestamp: null,
            },
          },
          videos: {
            video: {
              duration: null,
              percent: null,
              status: null,
              time: null,
            },
          },
        };
      }
      this.posts[0].scoreOutOf10 ??= 0;
      const post = this.posts?.[0];
      if (!post) return;
      this.restorePersistedCmi(post, restoredPost);
      this.restoreScormServiceStatus(post);
      this.initializeNumberOfAttempt(post, restoredPost);

      if (typeof preparePostFeedbackMetadata === "function") {
        preparePostFeedbackMetadata(post);
      }
      this.updateCurrentProgressFeedback(
        post,
        this.normalizeScormScore(post.cmi?.score?.raw),
      );
      post.startTime = this.getDate();
      this.scormStartTime = Date.now();
    },
    msToScormTime(ms) {
      const diffMs = new Date() - this.scormStartTime;
      const totalSeconds = Math.floor(diffMs / 1000);
      const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0",
      );
      const ss = String(totalSeconds % 60).padStart(2, "0");

      return `${hh}:${mm}:${ss}`;
    },
    formatSecondsToScormTime(totalSeconds) {
      const safeSeconds = Math.max(0, Math.floor(totalSeconds));
      const hh = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
      const mm = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
      const ss = String(safeSeconds % 60).padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    },
    parseScormTimeToSeconds(timeValue) {
      if (timeValue == null) return 0;

      if (typeof timeValue === "number") {
        return Number.isFinite(timeValue)
          ? Math.max(0, Math.floor(timeValue))
          : 0;
      }

      if (typeof timeValue === "string") {
        const hhmmss = timeValue.match(/^(\d+):(\d{2}):(\d{2})$/);
        if (hhmmss) {
          return (
            Number(hhmmss[1]) * 3600 +
            Number(hhmmss[2]) * 60 +
            Number(hhmmss[3])
          );
        }

        const isoDuration = timeValue.match(/^PT(\d+)H(\d+)M(\d+)S$/);
        if (isoDuration) {
          return (
            Number(isoDuration[1]) * 3600 +
            Number(isoDuration[2]) * 60 +
            Number(isoDuration[3])
          );
        }

        const numeric = Number(timeValue);
        if (Number.isFinite(numeric)) return Math.max(0, Math.floor(numeric));
      }

      return 0;
    },
    restorePersistedCmi(post, restoredPost) {
      const persistedCmi = restoredPost?.cmi;
      if (!post || !persistedCmi) return;

      post.cmi ??= {};
      post.cmi.score ??= {};

      if (persistedCmi.completion_status != null) {
        post.cmi.completion_status = persistedCmi.completion_status;
      }

      if (persistedCmi.success_status != null) {
        post.cmi.success_status = persistedCmi.success_status;
      }

      if (persistedCmi.total_time != null) {
        post.cmi.total_time = persistedCmi.total_time;
      }

      if (persistedCmi.score?.raw != null) {
        post.cmi.score.raw = this.normalizeScormScore(persistedCmi.score.raw);
      }

      const minScore = Number(persistedCmi.score?.min);
      if (Number.isFinite(minScore)) {
        post.cmi.score.min = minScore;
      }

      const maxScore = Number(persistedCmi.score?.max);
      if (Number.isFinite(maxScore)) {
        post.cmi.score.max = maxScore;
      }

      const scaledScore = Number(persistedCmi.score?.scaled);
      if (Number.isFinite(scaledScore)) {
        post.cmi.score.scaled = scaledScore;
      }

      this.previousScormScore = this.normalizeScormScore(post.cmi.score.raw);
    },
    restoreScormServiceStatus(post) {
      if (!post || !post.cmi) return;
      if (!this.isScormServiceConnected()) return;

      if (typeof window.ScormService.getBestScore === "function") {
        post.cmi.score ??= {};
        const restoredScore = Math.max(
          this.normalizeScormScore(post.cmi.score.raw),
          this.normalizeScormScore(this.previousScormScore),
          this.normalizeScormScore(window.ScormService.getBestScore()),
        );
        post.cmi.score.raw = Number(restoredScore.toFixed(1));
        post.cmi.score.scaled = Number((restoredScore / 100).toFixed(1));
        this.previousScormScore = restoredScore;
      }

      if (typeof window.ScormService.getPersistedStatus !== "function") return;

      const persisted = window.ScormService.getPersistedStatus();
      if (!persisted || !persisted.hasFinalStatus) return;

      const alreadyRestored =
        post.cmi.completion_status !== "unknown" ||
        post.cmi.success_status !== "unknown";
      if (alreadyRestored) return;

      post.cmi.completion_status = persisted.completionStatus;
      post.cmi.success_status = persisted.successStatus;
    },
    initializeNumberOfAttempt(post, restoredPost) {
      if (!post || this.numberOfAttemptInitialized) return;

      const previousAttemptCount = Number(
        restoredPost?.NumberOfAttempt ?? post.NumberOfAttempt,
      );
      post.NumberOfAttempt =
        Number.isFinite(previousAttemptCount) && previousAttemptCount >= 0
          ? Math.floor(previousAttemptCount) + 1
          : 1;
      this.numberOfAttemptInitialized = true;
    },
    normalizeScormScore(score) {
      const normalizedScore = Number(score);

      if (!Number.isFinite(normalizedScore) || normalizedScore < 0) {
        return 0;
      }

      return Math.min(normalizedScore, 100);
    },
    calculateCurrentAttemptScore() {
      return (
        (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) * 100
      );
    },
    updateCurrentProgressFeedback(post, currentScore) {
      if (!post || typeof getProgressFeedback !== "function") {
        return null;
      }
      if (!Number.isFinite(currentScore)) {
        return null;
      }
      try {
        return getProgressFeedback(currentScore, post);
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    isScormServiceConnected() {
      return (
        window.ScormService &&
        typeof window.ScormService.isConnected === "function" &&
        window.ScormService.isConnected()
      );
    },
    getHighestScormScore(currentAttemptScore) {
      const post = this.posts?.[0];
      const scormBestScore =
        window.ScormService &&
          typeof window.ScormService.getBestScore === "function"
          ? window.ScormService.getBestScore()
          : 0;
      const highestScore = Math.max(
        this.normalizeScormScore(this.previousScormScore),
        this.normalizeScormScore(scormBestScore),
        this.normalizeScormScore(post?.cmi?.score?.raw),
        this.normalizeScormScore(currentAttemptScore),
      );

      return Number(highestScore.toFixed(1));
    },
    applyHighestScormScore(currentAttemptScore, options = {}) {
      const post = this.posts?.[0];
      if (!post?.cmi?.score)
        return this.normalizeScormScore(currentAttemptScore);

      const highestScore = this.getHighestScormScore(currentAttemptScore);
      post.cmi.score.raw = highestScore;
      post.cmi.score.min = 0;
      post.cmi.score.max = 100;

      if (options.updateScaled) {
        post.cmi.score.scaled = Number((highestScore / 100).toFixed(1));
      }

      if (
        options.markIncomplete &&
        post.cmi.completion_status === "unknown"
      ) {
        post.cmi.completion_status = "incomplete";
      }

      if (options.updateStatus) {
        if (highestScore >= 50) {
          post.cmi.success_status = "passed";
          post.cmi.completion_status = "completed";
        } else if (options.finalStatus) {
          post.cmi.success_status = "failed";
          post.cmi.completion_status = "incomplete";
        }
      }

      this.previousScormScore = highestScore;
      return highestScore;
    },
    updateScormScoreAfterAnswer(currentAttemptScore) {
      if (
        this.isScormServiceConnected() &&
        typeof window.ScormService.updateScore === "function"
      ) {
        try {
          window.ScormService.updateScore(currentAttemptScore);
        } catch (e) {
          console.error(e);
        }
      }

      return this.applyHighestScormScore(currentAttemptScore, {
        updateScaled: true,
        markIncomplete: true,
      });
    },
    getQuestionCollectionName(post) {
      if (!post) return "";

      const collectionNames = ["questions", "items", "slides", "words", "tabs"];
      return collectionNames.find((name) => Array.isArray(post[name])) || "";
    },
    isScormCloudEnvironment() {
      return window.location.hostname.includes("cloud.scorm");
    },
    logQaMetadata(post) {
      if (this.isScormCloudEnvironment()) return;

      const questionCollection = this.getQuestionCollectionName(post);
      const sessionQuestionCount = Number(post.numberOfquestion);
      const runtimeQuestions = questionCollection
        ? Number.isFinite(sessionQuestionCount) && sessionQuestionCount > 0
          ? post[questionCollection].slice(0, sessionQuestionCount)
          : post[questionCollection]
        : [];
      const questionItems = runtimeQuestions.map((question) => ({
        numberOfTrial: question.numberOfTrial ?? null,
        questionlevel: question.questionlevel ?? "",
        questionType: question.questionType ?? "",
        answersType: question.answersType ?? "",
        startTime: question.startTime ?? "",
        endTime: question.endTime ?? "",
      }));

      const qaObject = {
        loDegree: post.loDegree,
        numberOfquestion: post.numberOfquestion,
        numberOfTotalQuestion: post.numberOfTotalQuestion,
        counterCorrect: post.counterCorrect,
        NumberOfAttempt: post.NumberOfAttempt,
        studentPoint: post.studentPoint,
        startTime: post.startTime,
        endTime: post.endTime,
        subjectId: post.subjectId,
        cmi: {
          completion_status: post.cmi?.completion_status,
          success_status: post.cmi?.success_status,
          total_time: post.cmi?.total_time,
          score: {
            raw: post.cmi?.score?.raw,
            min: post.cmi?.score?.min,
            max: post.cmi?.score?.max,
            scaled: post.cmi?.score?.scaled,
          },
        },
        [questionCollection || "questions"]: questionItems,
        studentProgress: post.studentProgress,
        lang: post.lang,
        feedBackTxt: post.feedBackTxt,
        feedBackDes: post.feedBackDes,
      };

      console.log(qaObject);
    },
    logScormCloudSummary() {
      if (!this.isScormCloudEnvironment()) return;

      const cmi = this.posts[0].cmi;
      console.log(
        `Score: ${cmi.score.raw} | Completion: ${cmi.completion_status} | Success: ${cmi.success_status}`,
      );
    },
    logPostAfterAnswerAttempt() {
      if (!this.isFinalQuestionAttempt()) {
        this.logQaMetadata(this.posts[0]);
      }
    },
    logPostAfterFinalFeedback() {
      if (this.isScormCloudEnvironment()) {
        this.logScormCloudSummary();
      } else {
        this.logQaMetadata(this.posts[0]);
      }
    },

    muteMusic() {
      this.bgMusic = !this.bgMusic;
      this.bgAudio.loop = true;
      this.bgAudio.paused ? this.bgAudio.play() : this.bgAudio.pause();
    },

    // Get answer maxlength ...
    // suitable for both input types ...

    isAllQuestionsRight() {
      const currentItem = this.posts[0].items[this.counter];
      if (currentItem && !currentItem.endTime) {
        currentItem.endTime = this.getQuestionTime();
      }
      this.posts[0].LOcorrectcounter += 0.5;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      const currentAttemptScore = this.calculateCurrentAttemptScore();
      this.updateCurrentProgressFeedback(this.posts[0], currentAttemptScore);
      this.updateScormScoreAfterAnswer(currentAttemptScore);
      // --------------------------------------------------------
      if (!this.isFinalQuestionAttempt()) {
        direction != ""
          ? ((this.posts[0].title = this.data.title),
            (this.posts[0].bloomLevels = this.data.bloomLevels),
            (this.posts[0].learningObjectives = this.data.learningObjectives),
            (this.posts[0].loDegree = this.data.loDegree),
            (this.posts[0].keywords = this.data.keywords),
            (this.posts[0].type = this.data.type),
            (this.posts[0].unitId = this.data.unitId),
            globalFunctions.UpdateStudentActivity(
              this.activityId,
              this.posts[0],
            ))
          : "";
      }
      // --------------------------------------------------------
      this.reset();
      document.querySelector(".check.hand")?.classList.remove("display");
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".check.hand")?.classList.add("hide");
      document.querySelector(".check-button")?.classList.add("disable");
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      setTimeout(() => {
        this.playtransition();
      }, 3000);
      setTimeout(() => {
        this.reset();
        this.feedback = !this.question;
        zokicharecter.playSegments([0, 30], true);
        // this.question = true;
        const finalizeFeedback = this.isFinalQuestionAttempt();
        this.nextQuestion();
        this.calculate(finalizeFeedback);
        if (finalizeFeedback) {
          this.scheduleFinalScormPost();
        }
      }, 5500);
    },

    // Remove wrong style ...

    home() {
      location.reload();
    },

    // Get number of questions
    numOfQuestions() {
      this.loQuestions = this.posts[0].numberOfquestion;
    },
    playtransition() {
      let addtransition = document.querySelectorAll(".transition");
      addtransition.forEach((element) => {
        element.classList.remove("active");
      });
      setTimeout(() => {
        let addtransition = document.querySelectorAll(".pic_right");
        addtransition.forEach((element) => {
          element.classList.add("close");
          element.classList.remove("open");
        });
      }, 1000);
      setTimeout(() => {
        let addtransition = document.querySelectorAll(".pic_left");
        addtransition.forEach((element) => {
          element.classList.add("close");
          element.classList.remove("open");
        });
      }, 1000);

      setTimeout(() => {
        let addtransition = document.querySelectorAll(".pic_left");
        addtransition.forEach((element) => {
          if (!this.question) {
            element.classList.remove("close");
            element.classList.add("open");
            zokicharecter.playSegments([0, 30], true);
          }
        });
      }, 4000);
      setTimeout(() => {
        let addtransition = document.querySelectorAll(".pic_right");
        addtransition.forEach((element) => {
          if (!this.question) {
            element.classList.remove("close");
            element.classList.add("open");
            zokicharecter.playSegments([0, 30], true);
          }
        });
      }, 4000);

      setTimeout(() => {
        let addtransition = document.querySelectorAll(".transition");
        addtransition.forEach((element) => {
          element.classList.add("active");
        });
      }, 4000);
    },

    shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
      }
      this.shuffled = a.slice(0, this.loQuestions);
    },

    reset() {
      this.qSound.pause();
      this.qSound.currentTime = 0;
      this.hint.pause();
      this.hint.currentTime = 0;
      clearInterval(this.setInterval);
      this.screenClick = 0;
      this.zokiBoring.pause();
      clearTimeout(this.setTimeOut);
    },

    start() {
      this.startBtn.play();
      transition.playSegments([0, 50], true);
      this.posts[0].LOcorrectcounter = 0;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.updateCurrentProgressFeedback(this.posts[0], 0);
      this.startLo = true;
      this.muteMusic();
      this.addFont();
      setTimeout(() => {
        this.showInformation();
      }, 500);
      this.nextQuestion();
      zokicharecter.playSegments([0, 30], true);
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      document.querySelector(".check-button")?.classList.add("disable");
      if (direction == "2") {
        this.posts[0].title = this.data.title;
        this.activityId = this.data.activityId;
        this.posts[0].bloomLevels = this.data.bloomLevels;
        this.posts[0].learningObjectives = this.data.learningObjectives;
        this.posts[0].loDegree = this.data.loDegree;
        this.posts[0].keywords = this.data.keywords;
        this.posts[0].type = this.data.type;
        this.posts[0].unitId = this.data.unitId;
      }

      document.querySelectorAll(".main").forEach((el) => {
        if (this.posts[0].isEng) {
          document.querySelector(".progress")?.classList.add("eng");
          document.querySelector("#digital-screen")?.classList.add("eng");
        } else {
          document.querySelector("#digital-screen")?.classList.add("ara");

        }

      });

      document.querySelectorAll(".pic_left").forEach((el) => {
        el.classList.add("open");
      });
      document.querySelectorAll(".pic_right").forEach((el) => {
        el.classList.add("open");
      });
      document.querySelectorAll(".transition").forEach((element) => {
        element.classList.add("active");
      });
      const stars = document.querySelector("#stars");
      stars.classList.add("active");
      this.arrayanswer = this.posts[0].items.map((item) => {
        if (item.type == 2) {
          return {
            content: item.content.map((contentObj) => {
              return {
                input: {
                  valid: contentObj.input.valid,
                  useranswer: [],
                },
              };
            }),
          };
        }
      });
    },

    nextQuestion() {
      this.break = false;
      this.infotmationClick = false;
      this.typeChoose = null;
      this.selectChoose = null;
      this.correctChooseText = null;
      clearInterval(this.setInterval);
      document.querySelector(".information")?.classList.remove("disable");
      this.roundTwo = false;
      this.correctChoose = false;
      this.firstQ += 1;
      this.counter += 1;
      this.test = 0;
      this.answers = [];
      this.showAnswers = [];
      this.zokiStatus = false;
      this.border = document.getElementsByClassName("screen-question");
      if (this.loQuestions != this.counter) {
        this.feedback = this.question = false;
        this.questionsNumber = this.loQuestions;
        if (this.questionsNumber != this.counter) {
          this.posts[0].items.forEach((element) => {
            element.active = false;
          });
        }
        const currentItem = this.posts[0].items[this.counter];
        currentItem.active = true;

        this.activeQuestion = currentItem;
        if (!currentItem.startTime) {
          currentItem.startTime = this.getQuestionTime();
        }
        setTimeout(() => {
          if (this.firstQ != 1 && this.posts[0].questionAudio) {
            this.narrationsound();
          }
        }, 1500);
      } else {
        this.feedback = this.question = true;
        clearInterval(this.setInterval);
        zokicharecter.playSegments([0, 30], true);
        this.zokiBoring.pause();
        this.zokiBoring.volume = 0;
        this.bgAudio.pause();
      }
    },

    questionSound(t) {
      this.qSound.currentTime = 0;
      this.zokiBoring.currentTime = 0;
      this.qSound.addEventListener("loadedmetadata", (event) => {
        this.sec = this.qSound.duration + 10;
      });
      if (!t) {
        this.setInterval = setInterval(() => {
          this.screenClick += 1;
          // console.log("this.screenClick = " + this.screenClick);
          if (this.screenClick == Math.floor(this.sec)) {
            setTimeout(() => {
              this.zokiBoring.loop = true;
              this.zokiBoring.play();
              zokicharecter.playSegments([30, 60], true);
            }, 150);

            if (!this.question) {
              this.setTimeOut = setTimeout(() => {
                if (!this.break) {
                  this.qSound.play();
                  this.hint.pause();
                  this.screenClick = 0;
                  setTimeout(() => {
                    this.infotmationClick = true;
                  }, 500);
                  this.zokiBoring.pause();
                }
              }, 10000);
            }
          }
        }, 1000);
      }
    },

    narrationsound() {
      this.reset();
      const check_disable = document.querySelector(".display-answer-button");
      if (check_disable && check_disable.classList.contains("disable")) {
        if (this.roundTwo && this.posts[0].question_two_Audio) {
          setTimeout(() => {
            if (!this.break) {
              this.qSound.src =
                "audio/r" + this.posts[0].items[this.counter].id + ".mp3";
              this.qSound.play();
              this.hint.pause();
              this.qSound.currentTime = 0;
              setTimeout(() => {
                this.infotmationClick = true;
              }, 500);
              this.questionSound(this.zokiStatus);
            }
          }, 1000);
        } else if (this.posts[0].questionAudio) {
          setTimeout(() => {
            if (!this.break) {
              this.qSound.src =
                "audio/q" + this.posts[0].items[this.counter].id + ".mp3";
              this.qSound.play();
              this.hint.pause();
              this.qSound.currentTime = 0;
              setTimeout(() => {
                this.infotmationClick = true;
              }, 500);
              this.questionSound(this.zokiStatus);
            }
          }, 1000);
        }
      }
    },

    calculate(finalizeFeedback = false) {
      const progressResult = calculate(
        this.result,
        this.loQuestions,
        this.isEng,
        this.upper,
        finalizeFeedback ? this.posts[0] : null,
      );

      this.Estimation = progressResult[0];
      this.finalProgress = progressResult[1];
      if (finalizeFeedback) {
        this.zokifeedback = progressResult[2];
        this.updateCurrentProgressFeedback(
          this.posts[0],
          this.calculateCurrentAttemptScore(),
        );
      }
    },
    showInformation() {
      this.reset();
      this.zokiStatus = true;
      var overlay = document.getElementById("overlay");
      var popup = document.getElementById("popup");

      overlay.style.display = "block";
      popup.style.display = "block";

      document.body.classList.add("popup-open");

      zokicharecter.playSegments([0, 30], true);
      if (this.posts[0].hint) {
        this.hint.src = "audio/hint.mp3";
        this.hint.play();
      }
    },

    closePopup() {
      this.reset();
      this.zokiStatus = false;
      setTimeout(() => {
        if (this.firstQ != 1) {
          this.questionSound(this.zokiStatus);
        }
      }, 1000);
      var overlay = document.getElementById("overlay");
      var popup = document.getElementById("popup");

      overlay.style.display = "none";
      popup.style.display = "none";
      document.body.classList.remove("popup-open");

      if (this.firstQ == 1) {
        setTimeout(() => {
          document.querySelectorAll(".zoki").forEach((el) => {
            el.classList.add("display");
          });
          document.querySelectorAll(".transition").forEach((el) => {
            el.classList.add("addGear");
          });
        }, 1000);
        this.narrationsound();
      }
    },

    finished() {
      let result =
        (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) * 100;
      this.posts[0].studentPoint = Number((result / 10).toFixed(1));
      this.posts[0].scoreOutOf10 =
        result == 0
          ? 0
          : result == 0
            ? 0
            : result <= 25
              ? 2.5
              : result <= 50
                ? 5
                : result <= 75
                  ? 7.5
                  : 10;
      finalResponse.submitData(
        JSON.stringify(this.posts[0]),
        (this.posts[0].scoreOutOf10 * 4) / 10,
        this.posts[0].scoreOutOf10,
      );
    },
    isFinalQuestionAttempt() {
      return this.firstQ == this.loQuestions && this.roundTwo;
    },
    scheduleFinalScormPost() {
      if (this.scormPostScheduled || this.scormReported) return;

      this.scormCompletionReady = true;
      this.scormPostScheduled = true;
      this.scormPost();
    },

    clickInput(event) {
      document.querySelector(".help.hand")?.classList.remove("display");
      this.clickBtn.play();
      zokicharecter.playSegments([0, 30], true);
      this.reset();
      this.questionSound(this.zokiStatus);
      // event.target.classList.remove("false");
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".help.hand.display")?.classList.remove("display");
    },
    changeValue() {
      // this.clickBtn.play();
      document.querySelector(".check.hand")?.classList.add("display");
      document.querySelector(".check-button")?.classList.remove("disable");
      // this.checkHand = true;
    },
    checkanswer() {
      this.break = true;
      this.infotmationClick = false;
      document.querySelector(".check.hand")?.classList.remove("display");
      this.reset();
      this.clickBtn.play();
      // this.checkHand = false;
      clearInterval(this.setInterval);
      numOfInput(this.activeQuestion);
      let Success = checkInputALL(this.activeQuestion, this.isEng, this.upper);
      document.querySelector(".check-button")?.classList.add("disable");
      Success ? this.trueAnswerInput() : this.falseAnswerInput();
    },
    showAnswer() {
      clearInterval(this.setInterval);
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      this.clickBtn.play();
      showAnswer(this.activeQuestion);
      document.querySelector(".check.hand")?.classList.add("hide");
      document.querySelector(".information")?.classList.add("disable");
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      this.UpdateStudentActivity();
      this.logPostAfterAnswerAttempt();
      zokicharecter.playSegments([0, 30], true);
      const finalizeFeedback = this.isFinalQuestionAttempt();
      setTimeout(() => {
        this.roundTwo = true;
        this.break = false;
        document.querySelector(".information")?.classList.remove("disable");
        this.narrationsound();
        this.calculate(finalizeFeedback);
        if (finalizeFeedback) {
          this.scheduleFinalScormPost();
        }
      }, 3000);
    },
    maxLength(event) {
      maxLength(event, this.activeQuestion);
    },
    trueAnswerInput() {
      document.querySelector(".information")?.classList.add("disable");
      const finalizeFeedback = this.isFinalQuestionAttempt();
      this.result += 0.5;
      this.rightAnswer.play();
      zokicharecter.playSegments([65, 80], true);
      this.posts[0].LOcorrectcounter += 0.5;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.posts[0].items[this.counter].numberOfTrial += 0;
      this.UpdateStudentActivity();
      setTimeout(() => {
        this.roundTwo = true;
        this.break = false;
        document.querySelector(".information")?.classList.remove("disable");
        this.narrationsound();
        this.calculate(finalizeFeedback);
        if (finalizeFeedback) {
          this.scheduleFinalScormPost();
        }
        zokicharecter.playSegments([0, 30], true);
      }, 3000);
      this.finished();
      this.logPostAfterAnswerAttempt();
    },
    falseAnswerInput() {
      document
        .querySelector(".display-answer-button")
        ?.classList.remove("disable");
      document.querySelector(".display-answer.hand")?.classList.add("display");
      this.posts[0].items[this.counter].numberOfTrial += 1;
      this.wrongAnswer.play();
      zokicharecter.playSegments([95, 110], true);
      this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());
      this.finished();
    },
    checkChoose(event, answer) {
      this.break = true;
      this.infotmationClick = false;
      clearInterval(this.setInterval);
      let typeC = checkChoose(
        event,
        answer,
        this.upper,
        this.activeQuestion,
      )[0];
      let correct = checkChoose(
        event,
        answer,
        this.upper,
        this.activeQuestion,
      )[1];

      if (typeC && correct) {
        this.typeChoose = typeC;
        this.correctChoose = correct;
        this.selectChoose = checkChoose(
          event,
          answer,
          this.upper,
          this.activeQuestion,
        )[2];
      }

      setTimeout(() => {
        this.correctChooseText = checkChoose(
          event,
          answer,
          this.upper,
          this.activeQuestion,
        )[3];
        if (!typeC && correct) {
          this.typeChoose = typeC;
          this.correctChoose = correct;
          this.selectChoose = checkChoose(
            event,
            answer,
            this.upper,
            this.activeQuestion,
          )[2];
        }
      }, 1000);

      this.clickBtn.play();
      this.typeChoose ? this.trueAnswerChoose() : this.falseAnswerChoose();
    },

    trueAnswerChoose() {
      this.result += 0.5;
      this.posts[0].items[this.counter].numberOfTrial += 0;
      this.rightAnswer.play();
      zokicharecter.playSegments([65, 80], true);
      this.isAllQuestionsRight();
      document.querySelector(".information")?.classList.add("disable");
      this.finished();
      this.logPostAfterAnswerAttempt();
    },
    falseAnswerChoose() {
      document.querySelector(".information")?.classList.add("disable");
      this.posts[0].items[this.counter].numberOfTrial += 1;
      this.wrongAnswer.play();
      zokicharecter.playSegments([95, 110], true);
      if (!this.isFinalQuestionAttempt()) {
        this.UpdateStudentActivity();
      }
      this.isAllQuestionsFalse();
      this.finished();
      this.logPostAfterAnswerAttempt();
    },
    isAllQuestionsFalse() {
      if (this.firstQ == 1) {
        document
          .querySelector(".display-answer.hand")
          ?.classList.remove("display");
        document.querySelector(".help.hand")?.classList.remove("display");
        document.querySelector(".check.hand")?.classList.remove("display");
        // document.querySelector(".next.hand")?.classList.add("display");
      }
      this.robots = document.getElementById("robots");
      zokicharecter.playSegments([95, 110], true);
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      document.querySelector(".check-button")?.classList.add("disable");
      this.zokiStatus = false;
      this.reset();
      const currentItem = this.posts[0].items[this.counter];
      if (currentItem && !currentItem.endTime) {
        currentItem.endTime = this.getQuestionTime();
      }
      setTimeout(() => {
        this.playtransition();
      }, 1500);

      setTimeout(() => {
        zokicharecter.playSegments([0, 30], true);
        const finalizeFeedback = this.isFinalQuestionAttempt();
        this.nextQuestion();
        this.calculate(finalizeFeedback);
        if (finalizeFeedback) {
          this.scheduleFinalScormPost();
        }
      }, 3500);
    },
    UpdateStudentActivity() {
      let result = this.calculateCurrentAttemptScore();
      this.updateCurrentProgressFeedback(this.posts[0], result);
      this.updateScormScoreAfterAnswer(result);
      direction != ""
        ? ((this.posts[0].title = this.data.title),
          (this.posts[0].bloomLevels = this.data.bloomLevels),
          (this.posts[0].learningObjectives = this.data.learningObjectives),
          (this.posts[0].loDegree = this.data.loDegree),
          (this.posts[0].keywords = this.data.keywords),
          (this.posts[0].type = this.data.type),
          (this.posts[0].unitId = this.data.unitId),
          globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0]))
        : "";
    },
    persistFinalActivityState() {
      if (
        typeof direction !== "undefined" &&
        direction !== "" &&
        typeof globalFunctions !== "undefined" &&
        typeof globalFunctions.UpdateStudentActivity === "function" &&
        this.posts?.[0]
      ) {
        try {
          globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0]);
        } catch (e) {
          console.error(e);
        }
      }
    },
    scormPost() {
      let result = this.calculateCurrentAttemptScore();
      const isActivityComplete =
        this.scormCompletionReady ||
        (this.firstQ == this.loQuestions && this.roundTwo);

      if (isActivityComplete && !this.scormReported) {
        this.scormReported = true;
        this.posts[0].studentPoint = Number((result / 10).toFixed(1));
        const previousTotalSeconds = this.parseScormTimeToSeconds(
          this.posts[0].cmi.total_time,
        );
        const currentSessionSeconds = Math.floor(
          (Date.now() - this.scormStartTime) / 1000,
        );
        this.posts[0].cmi.total_time = this.formatSecondsToScormTime(
          previousTotalSeconds + currentSessionSeconds,
        );
        if (!this.posts[0].endTime) {
          this.posts[0].endTime = this.getDate();
        }

        if (this.isScormServiceConnected()) {
          setTimeout(() => {
            try {
              if (typeof window.ScormService.reportResult === "function") {
                window.ScormService.reportResult(result);
              }
            } catch (e) {
              console.error(e);
            }

            this.applyHighestScormScore(result, {
              updateScaled: true,
              updateStatus: true,
              finalStatus: true,
            });
            this.persistFinalActivityState();
            this.logPostAfterFinalFeedback();

            try {
              if (typeof window.ScormService.completeSession === "function") {
                window.ScormService.completeSession();
              }
            } catch (e) {
              console.error(e);
            }

            try {
              if (typeof window.ScormService.finish === "function") {
                setTimeout(() => {
                  //window.ScormService.finish();
                }, 1000);
              }
            } catch (e) {
              console.error(e);
            }
          }, 1000);
        } else {
          this.applyHighestScormScore(result, {
            updateScaled: true,
            updateStatus: true,
            finalStatus: true,
          });
          this.persistFinalActivityState();
          this.logPostAfterFinalFeedback();
        }
      }
    },
  },
});

window.addEventListener("beforeunload", () => {
  try {
    if (window.ScormService && window.ScormService.isConnected()) {
      //window.ScormService.finish();
    }
  } catch (err) {
    console.error(err);
  }
});
