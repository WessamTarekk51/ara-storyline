const spaceTemplate = document.querySelector("#spaceTemplate");
const pageUrl = spaceTemplate.getAttribute("data-urlpage");

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}

new Vue({
  el: "#spaceTemplate",
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

    feedback: false,
    screenClick: 0,
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
    spaceStatus: false,
    answer: [],
    showAnswers: [],
    numsValues: 0,
    answertruecount: 0,
    result: 0,
    finalProgress: 0,
    Estimation: "",
    zokifeedback: false,
    firstQ: 0,
    hint: new Audio(),
    hintDuration: 0,
    activeQuestion: null,
    upper: null,
    isEng: null,
    infotmationClick: false,
    // --------------------------------------------------------
    isLoading: false,
    isSuccess: false,
    activityId: 0,
    dataLoaded: false,
    currentdate: "",
    data: null,
    scormStartTime: null,
    scormReported: false,
    scormPostScheduled: false,
    scormCompletionReady: false,
    numberOfAttemptInitialized: false,
    previousScormScore: 0,
    // --------------------------------------------------------
  },

  create() {},
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
    // console.log(window.location.hostname);
    await this.getData();
    this.shuffle(this.posts[0].items);
    // this.numOfQuestions();
    this.bgAudio.src = "../../../lib-native/space_26/assets/audio/music.mp3";
    this.wrongAnswer.src =
      "../../../lib-native/space_26/assets/audio/wronganswer.mp3";
    this.rightAnswer.src =
      "../../../lib-native/space_26/assets/audio/rightanswer.mp3";
    this.clickBtn.src =
      "../../../lib-native/space_26/assets/audio/click_btn.mp3";
    this.startBtn.src =
      "../../../lib-native/space_26/assets/audio/startclick2.mp3";

    finalResponse.submitData(JSON.stringify(this.posts[0]), 1, 0);
  },

  methods: {
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
          // console.log(this.data);
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

    muteMusic() {
      this.bgMusic = !this.bgMusic;
      this.bgAudio.loop = true;
      this.bgAudio.paused ? this.bgAudio.play() : this.bgAudio.pause();
    },

    isAllQuestionsRight() {
      const currentItem = this.posts[0].items[this.counter];
      if (currentItem && !currentItem.endTime) {
        currentItem.endTime = this.getQuestionTime();
      }
      this.posts[0].LOcorrectcounter += 1;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;

      this.finished();

      this.reset();
      this.spaceStatus = true;
      this.rightAnswer.play();
      document.querySelector(".check.hand")?.classList.remove("display");
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".check.hand")?.classList.add("hide");
      document.querySelectorAll(".check-button").forEach((el) => {
        el?.classList.add("disable");
      });

      document.querySelectorAll(".display-answer-button").forEach((el) => {
        el?.classList.add("disable");
      });
      document.querySelector(".next-button")?.classList.add("hide");
      setTimeout(() => {
        this.playtransition();
      }, 3000);
      setTimeout(() => {
        this.reset();
        this.feedback = !this.question;
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

    playtransition() {
      setTimeout(() => {
        document.querySelectorAll(".transition").forEach((el) => {
          el.classList.add("active");
        });
        transition.playSegments([0, 70], true);
        setTimeout(() => {
          if (this.loQuestions != this.counter) {
            transition.playSegments([70, 120], true);
            setTimeout(() => {
              document.querySelectorAll(".transition").forEach((el) => {
                el.classList.remove("active");
              });
            }, 1000);
          }
        }, 2000);
      }, 1500);
    },

    shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
      }
      this.shuffled = a.slice(0, this.posts.numberOfquestion);
    },

    reset() {
      this.qSound.pause();
      this.qSound.currentTime = 0;
      this.hint.pause();
      this.hint.currentTime = 0;
      clearInterval(this.setInterval);
      this.screenClick = 0;

      clearTimeout(this.setTimeOut);
    },

    isAllQuestionsFalse() {
      if (this.firstQ == 1) {
        document
          .querySelector(".display-answer.hand")
          ?.classList.remove("display");
        document.querySelector(".help.hand")?.classList.remove("display");
        document.querySelector(".check.hand")?.classList.remove("display");
      }

      document.querySelectorAll(".display-answer-button").forEach((el) => {
        el?.classList.add("disable");
      });
      document.querySelectorAll(".check-button").forEach((el) => {
        el?.classList.add("disable");
      });
      this.spaceStatus = false;
      this.reset();
      const currentItem = this.posts[0].items[this.counter];
      if (currentItem && !currentItem.endTime) {
        currentItem.endTime = this.getQuestionTime();
      }
      this.finished();
      setTimeout(() => {
        this.playtransition();
      }, 1100);

      setTimeout(() => {
        this.next();
      }, 3500);
    },

    next() {
      this.firstQ += 1;
      const finalizeFeedback = this.isFinalQuestionAttempt();
      this.calculate(finalizeFeedback);
      // this.clickBtn.play();
      // this.question = true;
      this.nextQuestion();
      if (finalizeFeedback) {
        this.scheduleFinalScormPost();
      }
      document.querySelector(".next.hand")?.classList.remove("display");
      document.querySelector(".next-button")?.classList.add("hide");
      this.reset();
    },

    start() {
      this.startBtn.play();
      this.posts[0].LOcorrectcounter = 0;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.startLo = true;
      this.muteMusic();
      document
        .querySelectorAll(".sectionSpace .information")
        .forEach((el) => {});
      if (this.posts[0].informationLO == "") {
        var informationblock = document.querySelector(
          ".sectionSpace .information",
        );
        informationblock.style.display = "none";
      }
      setTimeout(() => {
        if (this.posts[0].informationLO == "") {
          this.closePopup();
        } else {
          this.showInformation();
        }
        this.addFont();
      }, 200);
      this.nextQuestion();
      document.querySelectorAll(".display-answer-button").forEach((el) => {
        el?.classList.add("disable");
      });
      document.querySelectorAll(".check-button").forEach((el) => {
        el?.classList.add("disable");
      });
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

      ////////this.arrayanswer

      document.querySelectorAll(".main").forEach((el) => {
        if (!this.posts[0].upper) {
          document.querySelector(".grade")?.classList.add("lower");
          document.querySelector(".progress")?.classList.add("lower");
        }
        if (this.posts[0].isEng) {
          document.querySelector(".progress")?.classList.add("eng");
        }
      });

      document.querySelectorAll(".pic_left").forEach((el) => {
        el.classList.add("open");
      });
      document.querySelectorAll(".pic_right").forEach((el) => {
        el.classList.add("open");
      });

      const progressBar = document.querySelector("#progressbar");
      const stars = document.querySelector("#stars");
      if (this.posts[0].upper) {
        progressBar.classList.add("active");
      } else {
        stars.classList.add("active");
      }

      document
        .querySelectorAll(".container-space.active input")
        .forEach((el, i) => {
          if (i === 0) {
            const div = document.createElement("div");
            div.className = "help hand display";
            div.setAttribute("v-if", "helpHand");
            el.parentNode.insertBefore(div, el.nextSibling);
            if (this.upper || (!this.upper && this.isEng)) {
              document.querySelector(".help.hand")?.classList.add("handEng");
            }
          }
        });
    },

    nextQuestion() {
      this.firstQ += 1;
      this.test = 0;
      this.qSound.pause();
      document.querySelector(".next-button")?.classList.add("hide");
      this.answers = [];
      this.showAnswers = [];
      this.spaceStatus = false;
      this.border = document.getElementsByClassName("screen-question");
      // document.querySelector(".check.hand")?.classList.remove("hide");
      this.counter += 1;
      this.posts[0].counter = this.counter;
      if (this.loQuestions != this.counter) {
        this.feedback = this.question = false;

        if (this.counter > 0) {
          setTimeout(() => {
            if (this.posts[0].questionAudio) {
              this.qSound.src =
                "audio/q" + this.posts[0].items[this.counter].id + ".mp3";
              this.qSound.play();

              this.qSound.currentTime = 0;
            }
            this.infotmationClick = true;
          }, 2500);
        }
        this.questionSound(this.spaceStatus);

        this.posts[0].items.forEach((element) => {
          element.active = false;
        });

        this.posts[0].items[this.counter].active = true;
        this.activeQuestion = this.posts[0].items[this.counter];

        if (!this.posts[0].items[this.counter].startTime) {
          this.posts[0].items[this.counter].startTime = this.getQuestionTime();
        }
      } else {
        this.feedback = this.question = true;
        this.bgAudio.pause();
      }
    },

    questionSound(t) {
      this.qSound.currentTime = 0;

      this.qSound.addEventListener("loadedmetadata", (event) => {
        this.sec = this.qSound.duration + 10;
      });
      if (!t) {
        this.setInterval = setInterval(() => {
          this.screenClick += 1;
          // console.log(this.screenClick);
          if (this.screenClick == Math.floor(this.sec)) {
            if (!this.question) {
              this.setTimeOut = setTimeout(() => {
                if (this.posts[0].questionAudio) {
                  this.qSound.play();
                }
                this.screenClick = 0;
              }, 10000);
            }
          }
        }, 1000);
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
      }
    },

    showInformation() {
      this.reset();
      var overlay = document.getElementById("overlay");
      var popup = document.getElementById("popup");
      overlay.style.display = "block";
      popup.style.display = "block";
      document.body.classList.add("popup-open");
      if (this.posts[0].hint) {
        this.hint.src = "audio/hint.mp3";
        this.hint.play();
      }
      document.querySelector(".information")?.classList.add("disable");
    },

    closePopup() {
      this.reset();
      var overlay = document.getElementById("overlay");
      var popup = document.getElementById("popup");
      overlay.style.display = "none";
      popup.style.display = "none";
      document.body.classList.remove("popup-open");
      if (this.posts[0].hint) {
        this.hint.pause();
        this.hint.currentTime = 0;
      }

      if (this.firstQ == 1) {
        setTimeout(() => {
          if (this.posts[0].questionAudio) {
            this.qSound.src =
              "audio/q" + this.posts[0].items[this.counter].id + ".mp3";
            this.qSound.play();
            this.qSound.currentTime = 0;
          }
          this.infotmationClick = true;
        }, 1000);
        this.qSound.addEventListener("loadedmetadata", (event) => {
          this.sec = this.qSound.duration + 10;
        });
        this.setInterval = setInterval(() => {
          this.screenClick += 1;

          if (this.screenClick == Math.floor(this.sec)) {
            if (!this.question) {
              this.setTimeOut = setTimeout(() => {
                if (this.posts[0].questionAudio) {
                  this.qSound.play();
                }
                this.screenClick = 0;
              }, 10000);
            }
          }
        }, 1000);
        setTimeout(() => {
          document.querySelectorAll(".sectionSpace").forEach((el) => {
            el.classList.add("display");
          });
        }, 1000);
      } else {
        this.questionSound(this.spaceStatus);
      }
      setTimeout(() => {
        document.querySelector(".information")?.classList.remove("disable");
      }, 1500);
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
      return this.counter >= this.loQuestions - 1;
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
      this.reset();
      this.questionSound(this.spaceStatus);
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".help.hand.display")?.classList.remove("display");
    },
    changeValue() {
      // this.clickBtn.play();
      document.querySelector(".check.hand")?.classList.add("display");

      document.querySelectorAll(".check-button").forEach((el) => {
        el?.classList.remove("disable");
      });
      this.checkHand = true;
    },
    checkanswer() {
      document.querySelector(".check.hand")?.classList.remove("display");
      this.reset();
      this.clickBtn.play();
      this.checkHand = false;
      clearInterval(this.setInterval);
      numOfInput(this.activeQuestion);
      let Success = checkInputALL(this.activeQuestion, this.isEng);
      document.querySelectorAll(".check-button").forEach((el) => {
        el?.classList.add("disable");
      });
      Success ? this.trueAnswer() : this.falseAnswer();
      this.infotmationClick = false;
    },
    showAnswer() {
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      this.clickBtn.play();
      showAnswer(this.activeQuestion);
      document.querySelector(".check.hand")?.classList.add("hide");
      document.querySelector(".information")?.classList.add("disable");

      document.querySelectorAll(".display-answer-button").forEach((el) => {
        el?.classList.add("disable");
      });
      this.isAllQuestionsFalse();
      if (!this.isFinalQuestionAttempt()) {
        this.UpdateStudentActivity();
      }
      this.logPostAfterAnswerAttempt();
    },
    maxLength(event) {
      maxLength(
        event,
        this.activeQuestion,
        this.posts[0].isEng,
        this.posts[0].upper,
      );
    },
    trueAnswer() {
      document.querySelector(".information")?.classList.add("disable");
      this.posts[0].items[this.counter].numberOfTrial = 0;
      this.isAllQuestionsRight();
      this.result += 1;
      if (!this.isFinalQuestionAttempt()) {
        this.UpdateStudentActivity();
      }
      this.logPostAfterAnswerAttempt();
    },
    falseAnswer() {
      document.querySelectorAll(".display-answer-button").forEach((el) => {
        el?.classList.remove("disable");
      });
      document.querySelector(".display-answer.hand")?.classList.add("display");

      this.wrongAnswer.play();
      this.posts[0].items[this.counter].numberOfTrial = 1;
      this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());
      this.finished();

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
