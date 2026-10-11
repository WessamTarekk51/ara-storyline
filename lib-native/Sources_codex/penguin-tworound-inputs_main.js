let Penguin = document.querySelector("#penguin");
let pageUrl = Penguin.getAttribute("data-urlpage");

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}

new Vue({
  el: "#penguin",
  data: {
    posts: [],
    startLo: false,
    informationLO: null,
    popupOpened: false,
    music: false,
    bgAudio: new Audio(),
    clickBtn: new Audio(),
    wrongAnswer: new Audio(),
    rightAnswer: new Audio(),
    hint: new Audio(),
    sound: new Audio(),
    firstQ: 0,
    questionStart: false,
    shuffled: [],
    counter: 0,
    content: null,
    activeQuestion: null,
    checkInput: true,
    feedBackShow: false,
    finalProgress: null,
    result: (number = 0),
    Estimation: null,
    zokifeedback: false,
    upper: null,
    isEng: null,
    checkbtn: null,
    answerbtn: null,
    screenClick: (number = 0),
    sec: null,
    checkHand: false,
    answerHand: false,
    helpHand: false,
    roundTwo: false,
    infotmationClick: false,
    roundNum: null,

    // --------------------------------------------------------
    isLoading: false,
    isSuccess: false,
    activityId: 0,
    currentdate: "",
    loQuestions: null,
    scormStartTime: null,
    scormReported: false,
    scormPostScheduled: false,
    scormCompletionReady: false,
    numberOfAttemptInitialized: false,
    previousScormScore: 0,
    // --------------------------------------------------------
  },
  created() {},
  async mounted() {
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
    this.nextQuestion();
    this.clickBtn.src =
      "../../../lib-native/penguin_26/assets/audios/click_btn.mp3";
    this.reSize();
    window.addEventListener("resize", this.reSize);
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

      const app = document.getElementById("penguin");
      if (app) {
        app.style.width = w + "px";
        app.style.height = h + "px";
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
      // --------------------------------------------------------
      let restoredPost = null;
      if (direction == "2") {
        await returnData.then((response) => {
          this.isSuccess = response.isSuccess;
          this.data = response.value;

          this.activityId = this.data.activityId;
          if (
            this.data.learningObjectAsJson != null &&
            this.data.learningObjectAsJson != ""
          ) {
            let jsonData = JSON.parse(this.data.learningObjectAsJson);
            restoredPost = Array.isArray(jsonData) ? jsonData[0] : jsonData;
            this.previousScormScore = this.normalizeScormScore(
              restoredPost?.cmi?.score?.raw,
            );

            // this.posts[0].items.forEach((e) => {
            //   e.correctCounter = 0;
            // });
            // this.posts[0].items = jsonData;
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
              this.loQuestions = this.posts[0].numberOfquestion;
            })
        : "";

      // --------------------------------------------------------
      this.posts[0].length != 0
        ? setTimeout(() => {
            this.isLoading = true;
            this.loQuestions = this.posts[0].numberOfquestion;
            if (
              typeof checkQuestions === "function" &&
              checkQuestions() &&
              this.posts[0].items
            ) {
              this.loQuestions = this.posts[0].items.length;
            }
          }, 1000)
        : (this.isLoading = false);
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
      return (this.posts[0].LOcorrectcounter / this.loQuestions) * 100;
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
    // addFont() {
    //   if (this.posts[0].isEng) {
    //     document.querySelectorAll("*").forEach((el) => {
    //       el.style.fontFamily = "ArialRounded";
    //     });
    //     document.querySelectorAll("input").forEach((el) => {
    //       el.style.fontFamily = "Amin";
    //     });
    //     document.querySelectorAll(".number").forEach((el) => {
    //       el.style.fontFamily = "Amin";
    //     });
    //     document.querySelectorAll(".text").forEach((el) => {
    //       el.style.fontFamily = "ArialRounded";
    //     });
    //   } else {
    //     if (this.posts[0].upper) {
    //       document.querySelectorAll("*").forEach((el) => {
    //         el.style.fontFamily = "samim";
    //       });
    //       document.querySelectorAll("input").forEach((el) => {
    //         el.style.fontFamily = "ArialRounded";
    //       });
    //       document.querySelectorAll(".number").forEach((el) => {
    //         el.style.fontFamily = "ArialRounded";
    //       });
    //       document.querySelectorAll(".text").forEach((el) => {
    //         el.style.fontFamily = "samim";
    //       });
    //     } else {
    //       document.querySelectorAll("*").forEach((el) => {
    //         el.style.fontFamily = "AraJozoor";
    //       });
    //     }
    //   }
    // },
    addFont() {
      let getupdatefont = document.querySelectorAll(".question.editFont");
      if (getupdatefont.length > 0) {
        if (this.posts[0].isEng) {
          document.querySelectorAll("*").forEach((el) => {
            el.style.fontFamily = "vazirmatn-light-upper";
          });
          document.querySelectorAll(".isSuccess").forEach((el) => {
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
    start() {
      this.informationLO = this.posts[0].informationLO;
      this.startLo = true;
      this.showInformation();
      this.muteMusic();
      this.addFont();
    },
    showInformation() {
      this.popupOpened = true;
      this.sound.pause();
      this.sound.currentTime = 0;
      clearInterval(this.setInterval);
      this.screenClick = 0;
      if (this.posts[0].hint) {
        this.hint.src = "audio/hint.mp3";
        this.hint.play();
      }
    },
    closePopup() {
      this.popupOpened = false;
      if (this.firstQ == 1) {
        this.moverStart();
        penguinCharacter.playSegments([0, 50], true);
        this.firstQ += 1;
      } else {
        this.sound.play();
        this.soundPlay();
        // console.log("this.soundPlay" + "1");
        this.hint.pause();
        this.hint.currentTime = 0;
      }
      if (this.posts[0].hint) {
        this.hint.pause();
      }
    },
    muteMusic() {
      this.bgAudio.src =
        "../../../lib-native/penguin_26/assets/audios/music.mp3";
      this.music = !this.music;
      this.bgAudio.loop = true;
      this.music ? this.bgAudio.play() : this.bgAudio.pause();
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
    nextQuestion() {
      this.firstQ += 1;
      clearInterval(this.setInterval);
      this.screenClick = 0;
      const finalizeFeedback = this.isFinalQuestionAttempt();
      this.calculate(finalizeFeedback);
      this.roundNum = 1;
      if (this.counter <= this.loQuestions) {
        if (this.counter < this.loQuestions) {
          (this.posts[0].questionAudio
            ? (this.sound.src =
                "audio/q" + this.posts[0].items[this.counter].id + ".mp3")
            : "",
            (this.border = document.getElementsByClassName("border")));
          this.posts[0].items.forEach((element) => {
            element.active = false;
          });
          const currentItem = this.posts[0].items[this.counter];
          currentItem.active = true;
          if (!currentItem.startTime) {
            currentItem.startTime = this.getQuestionTime();
          }

          this.activeQuestion = currentItem;
        } else if (this.loQuestions == this.counter) {
          this.feedBackShow = true;
          this.bgAudio.pause();
          clearInterval(this.setInterval);
          this.screenClick = 0;
          if (finalizeFeedback) {
            this.scheduleFinalScormPost();
          }
        }
      }
      // --------------------------------------------------------
      this.addFont();

      penguinCharacter.playSegments([0, 50], true);
    },
    moverStart() {
      this.border[0]?.classList.remove("go");
      this.border[0]?.classList.add("back");
      this.questionStart = true;
      setTimeout(() => {
        this.infotmationClick = true;
        if (this.posts[0].questionAudio) {
          this.sound.play();
          this.soundPlay();
          // console.log("this.soundPlay" + "2");
          this.hint.pause();
          this.hint.currentTime = 0;
          if (this.roundNum == 1) {
            this.helpHand = true;
          }
        }
        document
          .querySelector(".question.active")
          .classList.remove("disPointer");
      }, 3000);
    },
    clickInput() {
      this.helpHand = false;
      this.clickBtn.play();
      this.sound.currentTime = 0;
      this.sound.pause();
    },
    changeValue() {
      // this.clickBtn.play();
      this.checkbtn = document.querySelector(".check");
      this.checkbtn.classList.add("btn-check-active");
      this.checkbtn.classList.remove("btn-check");
      if (this.roundNum == 1) {
        this.checkHand = true;
      }
    },
    checkInputALL() {
      this.infotmationClick = false;
      this.checkHand = false;
      clearInterval(this.setInterval);
      this.screenClick = 0;
      this.clickBtn.play();
      this.checkbtn.classList.add("btn-check");
      this.checkbtn.classList.remove("btn-check-active");
      numOfInput(this.activeQuestion, this.roundNum);
      let Success = checkInputALL(this.activeQuestion, this.roundNum);
      if (this.roundNum == 1) {
        Success ? this.trueAnswerInput() : this.falseAnswerInput();
      } else if (this.roundNum == 2) {
        Success
          ? this.trueAnswerInputRoundTwo()
          : this.falseAnswerInputRoundTwo();
      }
    },
    showAnswer() {
      this.answerHand = false;
      this.posts[0].items[this.counter].numberOfTrial += 1;
      if (this.roundNum === 2) {
        const currentItem = this.posts[0].items[this.counter];
        if (currentItem && !currentItem.endTime) {
          currentItem.endTime = this.getQuestionTime();
        }
      }
      if (!(this.roundTwo && this.counter >= this.loQuestions - 1)) {
        this.UpdateStudentActivity();
      }
      this.clickBtn.play();
      showAnswer(this.activeQuestion, this.roundNum);
      penguinCharacter.playSegments([0, 50], true);
      this.answerbtn.classList.remove("btn-answer-active");
      this.answerbtn.classList.add("btn-answer");
      setTimeout(() => {
        let questionTerminal = false;
        if (this.roundNum == 1) {
          this.roundTwo = true;
          this.roundNum = 2;
          this.posts[0].questionAudioRoundTwo
            ? (this.sound.src =
                "audio/r" + this.posts[0].items[this.counter].id + ".mp3")
            : "";
          setTimeout(() => {
            this.infotmationClick = true;
            if (this.posts[0].questionAudioRoundTwo) {
              this.sound.play();
              this.soundPlay();
              // console.log("this.soundPlay" + "3");
              this.hint.pause();
              this.hint.currentTime = 0;
            }
          }, 3000);
          this.calculate();
        } else if (this.roundNum == 2) {
          questionTerminal = true;
          this.counter += 1;
          setTimeout(() => {
            this.mover();
          }, 3000);
        }
        this.finished();
        if (questionTerminal) {
          this.logPostAfterAnswerAttempt();
        }
        penguinCharacter.playSegments([0, 50], true);
      }, 3000);
    },
    trueAnswerInput() {
      this.result += 0.5;
      this.posts[0].LOcorrectcounter += 0.5;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.posts[0].items[this.counter].numberOfTrial += 0;
      this.UpdateStudentActivity();
      this.finished();
      penguinCharacter.playSegments([130, 195], true);
      this.rightAnswer.src =
        "../../../lib-native/penguin_26/assets/audios/rightanswer.mp3";
      this.rightAnswer.play();
      setTimeout(() => {
        this.roundTwo = true;
        this.roundNum = 2;
        this.calculate();
        penguinCharacter.playSegments([0, 50], true);
        this.posts[0].questionAudioRoundTwo
          ? (this.sound.src =
              "audio/r" + this.posts[0].items[this.counter].id + ".mp3")
          : "";
        setTimeout(() => {
          this.infotmationClick = true;
          if (this.posts[0].questionAudioRoundTwo) {
            this.sound.play();
            this.soundPlay();
            // console.log("this.soundPlay" + "4");
            this.hint.pause();
            this.hint.currentTime = 0;
          }
        }, 3000);
      }, 3000);
    },
    falseAnswerInput() {
      if (this.roundNum == 1) {
        this.answerHand = true;
      }
      penguinCharacter.playSegments([265, 350], true);
      this.answerbtn = document.querySelector(".answer");
      this.answerbtn.classList.add("btn-answer-active");
      this.answerbtn.classList.remove("btn-answer");
      this.wrongAnswer.src =
        "../../../lib-native/penguin_26/assets/audios/wronganswer.mp3";
      this.wrongAnswer.play();
      this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());
      this.finished();
   
    },
    mover() {
      if (this.counter < this.loQuestions) {
        this.border[0]?.classList.remove("back");
        this.border[0]?.classList.add("go");
      }
      // console.log("mover done");
      setTimeout(() => {
        this.nextQuestion();
        if (this.counter < this.loQuestions) {
          // console.log("mover done 2");

          this.border[0]?.classList.remove("go");
          this.border[0]?.classList.add("back");
          this.roundTwo = false;
          this.answerbtn?.classList.remove("btn-answer-active");
          this.answerbtn?.classList.add("btn-answer");
          this.checkbtn?.classList.remove("btn-check-active");
          this.checkbtn?.classList.add("btn-check");
          let inputs = document.querySelectorAll(".input");
          inputs.forEach((input) => {
            input.classList.remove("wrong");
            input.classList.remove("false");
            input.classList.remove("true");
            input.classList.remove("right");
          });
          setTimeout(() => {
            this.infotmationClick = true;
            if (this.posts[0].questionAudio) {
              this.sound.play();
              this.soundPlay();
              // console.log("this.soundPlay" + "5");
              this.hint.pause();
              this.hint.currentTime = 0;
            }
            document
              .querySelector(".question.active")
              .classList.remove("disPointer");
            // console.log("mover done 2");
          }, 3000);
        }
      }, 3500);
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
      }
    },
    finished() {
      let result = (this.posts[0].LOcorrectcounter / this.loQuestions) * 100;
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
      return this.counter >= this.loQuestions && this.roundTwo;
    },
    scheduleFinalScormPost() {
      if (this.scormPostScheduled || this.scormReported) return;

      this.scormCompletionReady = true;
      this.scormPostScheduled = true;
      this.scormPost();
    },
    setclick() {
      this.hint.pause();
      this.hint.currentTime = 0;

      this.screenClick = 0;
    },
    soundPlay() {
      this.sec = this.sound.duration + 20;
      this.setInterval = setInterval(() => {
        this.screenClick += 1;
        // console.log(this.screenClick);
        if (this.screenClick == Math.floor(this.sec)) {
          setTimeout(() => {
            this.sound.play();
            this.screenClick = 0;
            this.hint.pause();
            this.hint.currentTime = 0;
          }, 10);
        }
      }, 1000);
    },

    UpdateStudentActivity() {
      let result = this.calculateCurrentAttemptScore();
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
    finished() {
      let result = (this.posts[0].LOcorrectcounter / this.loQuestions) * 100;
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
        (this.counter >= this.loQuestions && this.roundTwo);

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
    maxLength(event) {
      maxLength(event, this.activeQuestion, this.roundNum);
    },
    reload() {
      location.reload();
    },

    trueAnswerInputRoundTwo() {
      this.result += 0.5;
      this.posts[0].LOcorrectcounter += 0.5;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.posts[0].items[this.counter].numberOfTrial += 0;
      const currentItem = this.posts[0].items[this.counter];
      if (currentItem && !currentItem.endTime) {
        currentItem.endTime = this.getQuestionTime();
      }
      if (this.counter < this.loQuestions - 1) {
        this.UpdateStudentActivity();
      }
      this.finished();
      this.counter += 1;
      this.logPostAfterAnswerAttempt();
      penguinCharacter.playSegments([130, 195], true);
      this.rightAnswer.src =
        "../../../lib-native/penguin_26/assets/audios/rightanswer.mp3";
      this.rightAnswer.play();
      setTimeout(() => {
        this.mover();
      }, 3000);
    },
    falseAnswerInputRoundTwo() {
      penguinCharacter.playSegments([265, 350], true);
      this.answerbtn = document.querySelector(".answer");
      this.answerbtn.classList.add("btn-answer-active");
      this.answerbtn.classList.remove("btn-answer");
      this.wrongAnswer.src =
        "../../../lib-native/penguin_26/assets/audios/wronganswer.mp3";
      this.wrongAnswer.play();
      this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());
      this.finished();
     
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
