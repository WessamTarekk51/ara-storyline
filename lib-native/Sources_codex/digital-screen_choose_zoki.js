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
    // robotsSound: new Audio(),
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
    result: 0,
    finalProgress: 0,
    Estimation: "",
    zokifeedback: false,
    firstQ: 0,
    finshed: false,
    hint: new Audio(),
    hintDuration: 0,
    startSettimeout: null,
    isEng: null,
    upper: null,
    scormStartTime: null,
    scormPostScheduled: false,
    scormReported: false,
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
    if (this.posts && this.posts.length > 0) {
      this.numOfQuestions();
    } else {
      console.error("No posts data found!");
    }

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

      const app = document.getElementById("digital-screen");
      if (app) {
        app.style.width = w + "px";
        app.style.height = h + "px";
      }
    },
    shuffle(array) {
      var j, x, i;
      for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
      }
    },
    shuffleAnswers(item) {
      this.shuffle(item.answers);
    },
    shuffleItemsAndAnswers() {
      if (this.posts[0] && this.posts[0].items) {
        this.shuffle(this.posts[0].items);
        this.posts[0].items.forEach((item) => {
          this.shuffleAnswers(item);
        });
      } else {
        console.error("No items found to shuffle!");
      }
    },

    numOfQuestions() {
      if (this.posts[0]) {
        this.loQuestions = this.posts[0].numberOfquestion;
        this.shuffleItemsAndAnswers();
      } else {
        console.error("Posts data is not available.");
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
            // this.resetJsonData(jsonData)
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
          this.posts[0].startTime = this.getDate();
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

    resetJsonData(data) {
      data.items.forEach((item) => {
        item.answers.forEach((answer) => {
          answer.checked = false;
          answer.right = false;
        });
      });
    },

    muteMusic() {
      this.bgMusic = !this.bgMusic;
      this.bgAudio.loop = true;
      this.bgAudio.paused ? this.bgAudio.play() : this.bgAudio.pause();
    },

    chechedClicked: function (answer, e) {
      this.posts[0].endTime = this.getDate();
      let realtimenext = 0;
      this.posts[0].upper ? (realtimenext = 1000) : (realtimenext = 2000);
      this.clickBtn.play();
      this.reset();
      this.questionSound(this.zokiStatus);
      this.finshed = document.querySelectorAll(".active .answers");
      let questionTerminal = false;

      this.helpHand = false;

      e.answers.forEach((elem) => {
        elem.checked = false;
      });
      event.target.parentNode.classList.add("checked");
      event.target.parentNode.parentNode.classList.add("checked");
      event.target.style.cssText = "pointer-events: none;";
      this.posts[0].items.forEach((elem, i) => {
        if (elem.active) {
          elem.answers.forEach((eleme) => {
            if (elem.correctAnswer == eleme.numAnswer) {
              setTimeout(() => {
                if (!this.posts[0].upper) {
                  eleme.right = true;
                  eleme.checked = true;
                } else {
                  // eleme.right = false;
                  eleme.checked = false;
                }
              }, 1000);
            }
          });
        }
      });

      if (e.correctAnswer.length == 1) {
        questionTerminal = true;
        this.reset();
        this.finshed[0].style.cssText = "pointer-events: none;";
        document.querySelector(".information")?.classList.add("disable");
        e.correctAnswer.forEach((i, index) => {
          if (i === answer.numAnswer) {
            e.counter += 1;
            e.answerSelect = !e.answerSelect;
            answer.right = true;
            this.posts[0].LOcorrectcounter += 1;
            this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
            this.rightAnswer.play();
            e.numberOfTrial = 0;
            this.posts[0].items[this.counter].numberOfTrial = 0;
            this.isAllQuestionsRight();
            setTimeout(() => {
              this.playtransition();
            }, 3000);
          } else {
            answer.wrong = true;
            zokicharecter.playSegments([95, 110], true);
            this.wrongAnswer.play();
            e.numberOfTrial = 1;
            this.posts[0].items[this.counter].numberOfTrial = 1;
            setTimeout(() => {
              setTimeout(() => {
                this.playtransition();
              }, realtimenext);
              this.falsechoose();
            }, realtimenext);
            if (!this.isFinalQuestionAttempt()) {
              this.UpdateStudentActivity();
            }
          }
        });
      } else {
        var breakLoop = true;
        var breakLoopfalse = false;
        e.counter++;
        e.correctAnswer.forEach((i, index) => {
          if (breakLoop) {
            if (i === answer.numAnswer) {
              breakLoop = false;
              answer.right = true;
              event.target.classList.add("right");
              event.target.classList.remove("wrong");
            } else {
              answer.wrong = true;
              event.target.classList.add("wrong");
            }
            if (e.counter === e.correctAnswer.length) {
              questionTerminal = true;
              this.reset();
              this.finshed[0].style.cssText = "pointer-events: none;";
              e.answerSelect = !e.answerSelect;
              document.querySelector(".information")?.classList.add("disable");
              if (document.querySelectorAll(".active .wrong").length == 0) {
                e.answerSelect = !e.answerSelect;
                this.posts[0].LOcorrectcounter += 1;
                this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
                this.rightAnswer.play();
                e.numberOfTrial = 0;
                this.posts[0].items[this.counter].numberOfTrial = 0;

                this.isAllQuestionsRight();
                // console.log("isAllQuestionsRight")
                setTimeout(() => {
                  this.playtransition();
                }, 3000);
              } else {
                zokicharecter.playSegments([95, 110], true);
                this.wrongAnswer.play();
                e.numberOfTrial = 1;
                this.posts[0].items[this.counter].numberOfTrial = 1;
                setTimeout(() => {
                  if (
                    document.querySelectorAll(".active .wrong").length != 0 &&
                    !breakLoopfalse
                  ) {
                    setTimeout(() => {
                      this.playtransition();
                    }, realtimenext);
                    this.falsechoose();
                    if (!this.isFinalQuestionAttempt()) {
                      this.UpdateStudentActivity();
                    }
                    // console.log("UpdateStudentActivity")
                    breakLoopfalse = true;
                  }
                }, realtimenext);
              }
            }
          }
        });
      }

      if (questionTerminal) {
        this.posts[0].items[this.counter].endTime = this.getQuestionTime();
        this.logPostAfterAnswerAttempt();
      }
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
      }, 5000);
      setTimeout(() => {
        document.querySelector(".information")?.classList.remove("disable");
      }, 5500);
    },
    start() {
      this.startBtn.play();
      transition.playSegments([0, 50], true);
      this.posts[0].LOcorrectcounter = 0;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      this.startLo = true;
      this.muteMusic();
      this.addFont();
      setTimeout(() => {
        this.showInformation();
      }, 500);

      this.nextQuestion();
      zokicharecter.playSegments([0, 30], true);
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
        // if (!this.posts[0].upper) {
        //   document.querySelector(".grade")?.classList.add("lower");
        //   document.querySelector(".progress")?.classList.add("lower");
        // }
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

      setTimeout(() => {
        document.querySelectorAll(".transition").forEach((element) => {
          element.classList.add("active");
        });
      }, 2000);
      const progressBar = document.querySelector("#progressbar");
      const stars = document.querySelector("#stars");
      if (this.posts[0].upper) {
        progressBar.classList.add("active");
      } else {
        stars.classList.add("active");
      }
    },

    nextQuestion() {
      this.firstQ += 1;
      this.test = 0;
      zokicharecter.playSegments([0, 30], true);
      document
        .querySelector(".display-answer-button")
        ?.classList.remove("disable");
      document.querySelector(".check-button")?.classList.remove("disable");
      document.querySelector(".next-button")?.classList.add("hide");
      this.answers = [];
      this.showAnswers = [];
      this.zokiStatus = false;
      this.border = document.getElementsByClassName("screen-question");
      // document.querySelector(".check.hand")?.classList.remove("hide");
      this.counter += 1;
      this.feedback = this.question = false;
      this.questionsNumber = this.loQuestions;

      setTimeout(() => {
        if (this.firstQ != 1 && this.posts[0].questionAudio) {
          this.narrationsound();
        }
      }, 1500);

      if (this.questionsNumber != this.counter) {
        this.posts[0].items.forEach((element) => {
          element.active = false;
        });
      }
      this.posts[0].items[this.counter].active = true;
      if (this.posts[0].items[this.counter].active) {
        this.posts[0].items[this.counter].startTime = this.getQuestionTime();
      }
    },
    home() {
      location.reload();
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
          if (this.screenClick == Math.floor(this.sec)) {
            setTimeout(() => {
              this.zokiBoring.loop = true;
              this.zokiBoring.play();
              zokicharecter.playSegments([30, 60], true);
            }, 150);

            if (!this.question) {
              this.setTimeOut = setTimeout(() => {
                this.qSound.play();
                this.screenClick = 0;
                this.zokiBoring.pause();
              }, 10000);
            }
          }
        }, 1000);
      }
    },
    falsechoose() {
      let realtimenext = 2000;

      setTimeout(() => {
        this.reset();
        // zokicharecter.playSegments([0, 30], true);
        if (this.firstQ == this.loQuestions) {
          setTimeout(() => {
            this.question = true;
            this.bgAudio.pause();
            this.calculate(true);
            this.scheduleFinalScormPost();
          }, realtimenext);
        } else {
          setTimeout(() => {
            this.feedback = !this.question;
            this.nextQuestion();
          }, realtimenext);
          this.calculate();
        }
      }, realtimenext);
      this.zokiStatus = false;
      this.reset();
      if (!this.posts[0].upper) {
        this.posts[0].items.forEach((element) => {
          if (element.active) {
            element.correctAnswer.forEach((elem) => {
              element.answers.forEach((ele) => {
                if (elem == ele.numAnswer) {
                  ele.right = true;
                }
              });
            });
          }
        });
      }
    },

    isAllQuestionsRight() {
      this.reset();
      this.zokiStatus = true;
      this.rightAnswer.play();
      zokicharecter.playSegments([65, 80], true);
      document.querySelector(".check.hand")?.classList.remove("display");
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".check.hand")?.classList.add("hide");

      this.finished();
      if (!this.isFinalQuestionAttempt()) {
        this.UpdateStudentActivity();
      }
      setTimeout(() => {
        this.feedback = !this.question;
        this.reset();
        zokicharecter.playSegments([0, 30], true);

        if (this.firstQ == this.loQuestions) {
          this.question = true;
          this.bgAudio.pause();
          this.calculate(true);
          this.scheduleFinalScormPost();
        } else {
          this.nextQuestion();
          this.calculate();
        }
      }, 5500);
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
    narrationsound() {
      if (this.posts[0].questionAudio) {
        setTimeout(() => {
          this.qSound.src =
            "audio/q" + this.posts[0].items[this.counter].id + ".mp3";
          this.qSound.play();
          this.qSound.currentTime = 0;
          this.questionSound(this.zokiStatus);
        }, 1000);
      }
    },

    isFinalQuestionAttempt() {
      return this.firstQ === this.loQuestions;
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

    calculate(finalizeFeedback = false) {
      const progressResult = calculate(
        this.posts[0].LOcorrectcounter,
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
      zokicharecter.playSegments([0, 30], true);
      if (this.posts[0].hint) {
        this.hint.src = "audio/hint.mp3";
        this.hint.play();
      }
      document.querySelector(".information")?.classList.add("disable");
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
      // console.log(this.posts[0].counterCorrect);
    },
    UpdateStudentActivity() {
      let result = this.calculateCurrentAttemptScore();
      this.updateScormScoreAfterAnswer(result);
      direction != ""
        ? globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])
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
    scheduleFinalScormPost() {
      if (this.scormPostScheduled || this.scormReported) return;

      this.scormPostScheduled = true;
      this.scormPost();
    },
    scormPost() {
      let result = this.calculateCurrentAttemptScore();
      if (this.firstQ == this.loQuestions && !this.scormReported) {
        this.scormReported = true;
        this.posts[0].studentPoint = Number((result / 10).toFixed(1));
        this.posts[0].cmi.total_time = this.msToScormTime(
          Date.now() - this.scormStartTime,
        );

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
                  // window.ScormService.finish();
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
