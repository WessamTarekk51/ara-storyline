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
    setInterval: null,
    question: false,
    counter: 0,
    music: false,
    count: (number = 0),
    bgAudio: new Audio(),
    clickBtn: new Audio(),
    wrongAnswer: new Audio(),
    rightAnswer: new Audio(),
    sound: new Audio(),
    screenClick: (number = 0),
    sec: null,
    character: (boolean = true),
    border: null,
    shuffled: [],
    click: false,
    result: (number = 0),
    loQuestions: (number = null),
    finalProgress: null,
    Estimation: null,
    zokifeedback: false,
    hint: new Audio(),
    sechint: null,
    popupOpened: (boolean = false),
    correctChoose: "",
    correctChooseText: null,
    typeChoose: "",
    selectChoose: "",
    informationLO: "",
    upper: boolean,
    isEng: null,
    infotmationClick: false,
    // --------------------------------------------------------
    isLoading: false,
    isSuccess: false,
    activityId: 0,
    currentdate: "",
    date: null,
    QustionStart: false,
    firstQ: 0,
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
    this.wrongAnswer.src =
      "../../../lib-native/penguin_26/assets/audios/wronganswer.mp3";
    this.rightAnswer.src =
      "../../../lib-native/penguin_26/assets/audios/rightanswer.mp3";
    this.clickBtn.src =
      "../../../lib-native/penguin_26/assets/audios/click_btn.mp3";
    this.nextQuestion();

    finalResponse.submitData(JSON.stringify(this.posts[0]), 1, 0);
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
    // --------------------------------------------------------
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
          }, 1000)
        : (this.isLoading = false);
      // --------------------------------------------------------
      this.upper = this.posts[0].upper;
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
    checkChoose(event, answer) {
      this.sound.pause();
      this.sound.currentTime = 0;
      clearInterval(this.setInterval);
      this.clickBtn.play();
      let chooses = document.querySelectorAll(".active .choose");
      let correct = document.querySelectorAll(".active .choose.correct");
      this.infotmationClick = false;
      chooses.forEach((el) => {
        el.classList.remove("false");
      });

      const currentItem = this.posts[0].items[this.counter - 1];
      if (currentItem && !currentItem.endTime) {
        currentItem.endTime = this.getQuestionTime();
      }
      if (answer.answer) {
        this.result += 1;
        this.rightAnswer.play();
        this.typeChoose = "true";

        this.isAllQuestionsRight();
        correct.forEach((ela) => {
          ela.classList.add("true");
        });
        // console.log(this.counter)
        this.posts[0].items[this.counter - 1].numberOfTrial = 0;

        this.posts[0].items[this.counter - 1].choose.forEach((el) => {
          if (el.answer) {
            this.correctChoose = true;
            this.correctChooseText = el.select;
            this.selectChoose = answer.select;
            if (!this.posts[0].upper) {
              correct.forEach((ela) => {
                ela.classList.add("true");
              });
            }
          }
        });
      } else {
        event.target.classList.add("false");
        this.wrongAnswer.play();
        penguinCharacter.playSegments([265, 350], true);
        this.typeChoose = "false";
        this.posts[0].items[this.counter - 1].numberOfTrial = 1;
        this.finished();
        setTimeout(() => {
          const finalizeFeedback = this.isFinalQuestionAttempt();
          this.calculate(finalizeFeedback);
          this.nextQuestion();
          if (finalizeFeedback) {
            this.scheduleFinalScormPost();
          }
          if (this.counter != this.loQuestions) {
            this.mover();
          }
          this.character = false;
        }, 4000);

        this.posts[0].items[this.counter - 1].choose.forEach((el) => {
          setTimeout(() => {
            if (el.answer) {
              this.correctChoose = true;
              this.correctChooseText = el.select;
              this.selectChoose = answer.select;
              if (!this.posts[0].upper) {
                correct.forEach((ela) => {
                  ela.classList.add("true");
                });
              }
            }
          }, 1000);
        });
      }
      if (!this.isFinalQuestionAttempt()) {
        this.UpdateStudentActivity();
      }
      this.logPostAfterAnswerAttempt();
      chooses.forEach((el) => {
        el.style.cssText = "pointer-events:none";
      });
      this.firstQ += 1;
    },
    // --------------------------------------------------------
    start() {
      this.informationLO = this.posts[0].informationLO;
      this.bgAudio.src =
        "../../../lib-native/penguin_26/assets/audios/music.mp3";
      this.bgAudio.loop = true;
      this.startLo = true;
      this.showInformation();
      this.music = true;
      this.bgAudio.play();
      this.addFont();
    },
    muteMusic() {
      this.music = !this.music;
      // console.log(this.music);
      this.music ? this.bgAudio.play() : this.bgAudio.pause();
    },
    nextQuestion() {
      this.firstQ += 1;
      clearInterval(this.setInterval);
      this.screenClick = 0;
      this.question = false;
      this.click = false;
      if (this.counter <= this.loQuestions) {
        if (this.counter < this.loQuestions) {
          (this.posts[0].questionAudio
            ? (this.sound.src =
                "audio/q" + this.posts[0].items[this.counter].id + ".mp3")
            : "",
            (this.border = document.getElementsByClassName("border")));
        } else if (this.loQuestions == this.counter) {
          this.question = true;
          this.bgAudio.pause();
          clearInterval(this.setInterval);
          this.screenClick = 0;
        }
        setTimeout(() => {
          if (this.counter < this.loQuestions) {
            this.posts[0].items.forEach((element) => {
              element.active = false;
            });
            const currentItem = this.posts[0].items[this.counter];
            currentItem.active = true;
            if (!currentItem.startTime) {
              currentItem.startTime = this.getQuestionTime();
            }
          }
          this.counter += 1;
        }, 3500);
      }
      if (this.posts[0].isEng) {
        document.querySelector(".progress")?.classList.add("eng");
      }
      // --------------------------------------------------------
      penguinCharacter.playSegments([0, 50], true);
    },

    mover() {
      this.border[0]?.classList.remove("back");
      this.border[0]?.classList.add("go");
      setTimeout(() => {
        this.border[0]?.classList.remove("go");
        this.border[0]?.classList.add("back");
        this.correctChoose = false;
        this.selectChoose = "";
        this.typeChoose = "";
        let correct = document.querySelectorAll(".active .choose.correct");
        correct.forEach((ela) => {
          ela.classList.remove("true");
        });
        // --------------------------------------------------------
        let chooses = document.querySelectorAll(".active .choose");
        chooses.forEach((el) => {
          el.style.cssText = "pointer-events:unset";
        });
        setTimeout(() => {
          this.infotmationClick = true;
          this.sound.play();
          this.soundPlay();
          this.hint.pause();
          this.hint.currentTime = 0;
        }, 4000);
      }, 3500);
    },
    moverStart() {
      this.border[0]?.classList.remove("go");
      this.border[0]?.classList.add("back");
      this.QustionStart = true;
      this.selectChoose = "";
      this.typeChoose = "";
      let correct = document.querySelectorAll(".active .choose.correct");
      correct.forEach((ela) => {
        ela.classList.remove("true");
      });
      // --------------------------------------------------------
      let chooses = document.querySelectorAll(".active .choose");
      chooses.forEach((el) => {
        el.style.cssText = "pointer-events:unset";
      });
      setTimeout(() => {
        this.infotmationClick = true;
        this.sound.play();
        this.soundPlay();
        this.hint.pause();
        this.hint.currentTime = 0;
      }, 3000);
    },
    reload() {
      location.reload();
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
    isAllQuestionsRight() {
      this.posts[0].LOcorrectcounter += 1;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.character = true;
      this.finished();
      this.rightAnswer.play();
      penguinCharacter.playSegments([130, 195], true);
      setTimeout(() => {
        this.click = true;
        penguinCharacter.playSegments([0, 50], true);
        const finalizeFeedback = this.isFinalQuestionAttempt();
        this.calculate(finalizeFeedback);
        clearInterval(this.setInterval);
        this.screenClick = 0;
        this.nextQuestion();
        if (finalizeFeedback) {
          this.scheduleFinalScormPost();
        }
        if (this.counter != this.loQuestions) {
          this.mover();
        }
      }, 4000);
      // --------------------------------------------------------

      // --------------------------------------------------------
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
      return this.counter >= this.loQuestions;
    },
    scheduleFinalScormPost() {
      if (this.scormPostScheduled || this.scormReported) return;

      this.scormCompletionReady = true;
      this.scormPostScheduled = true;
      this.scormPost();
    },
    showInformation() {
      this.sound.pause();
      this.sound.currentTime = 0;
      clearInterval(this.setInterval);
      this.screenClick = 0;
      this.popupOpened = true;
      this.posts[0].hint
        ? [
            (this.hint.src = "audio/hint.mp3"),
            this.hint.play(),
            this.sound.pause(),
          ]
        : "";
    },
    closePopup() {
      this.popupOpened = false;
      this.posts[0].hint
        ? [(this.hint.src = "audio/hint.mp3"), this.hint.pause()]
        : "";
      if (this.firstQ == 1) {
        this.moverStart();
        penguinCharacter.playSegments([0, 50], true);
        this.firstQ += 1;
      } else {
        this.sound.play();
        this.soundPlay();
        this.hint.pause();
        this.hint.currentTime = 0;
      }
    },
    setclick() {
      this.hint.pause();
      // this.sound.pause();
      this.hint.currentTime = 0;
      // this.sound.currentTime = 0;
      this.screenClick = 0;
    },
    soundPlay() {
      this.sec = this.sound.duration + 25;
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
        this.scormCompletionReady || this.counter >= this.loQuestions;

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
