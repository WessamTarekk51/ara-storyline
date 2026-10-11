let Question = document.querySelector("#Question");
let pageUrl = Question.getAttribute("data-urlpage");

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}

window.app = new Vue({
  el: "#Question",

  data() {
    return {
      posts: [],
      localPosts: [],
      currentQuestion: null,
      questionIndex: 0,
      shuffledQuestions: [],
      totalQuestions: 0,
      activityId: 0,
      dropResults: [],
      draggedItem: null,
      dropAnswers: [],
      touchElement: null,
      offsetX: 0,
      offsetY: 0,
      line: null,
      svgRect: null,
      lines: [],
      svg: null,
      lineCounter: 0,
      isDrawing: false,
      currentSourceEl: null,
      feedback: false,
      correctAnswer: false,
      numOfAttemp: 0,
      borderQuestion: null,
      titlePage: "",
      isMobile: false,
      numberOfAnswer: 0,
      finishLO: false,
      start: false,
      nextButtonShow: false,
      homeButtonShow: false,
      reloadButtonShow: false,
      questionAudio: new Audio(),
      titleAudio: new Audio(),
      AudioQ: false,
      AudioT: false,
      matchingRightShuffled: [],
      matchingLeftShuffled: [],
      DragShuffled: [],
      matchManager: null,
      dragDropManager: null,
      lengthQuestion: 0,
      userLengthQuestion: 0,
      wrongAudio: new Audio(),
      correctAudio: new Audio(),
      popupAudio: new Audio(),
      clickAudio: new Audio(),
      feedbackPassAudio: new Audio(),
      feedbackFailAudio: new Audio(),
      clickAudio: new Audio(),

      popupTxtCorrect: new Audio(),
      popupTxtWrong1: new Audio(),
      popupTxtWrong2: new Audio(),
      feedTxtCorrect: new Audio(),
      feedTxtWrong: new Audio(),
      timeouts: [],
      passLo: false,

      tryAgain: "حَاوِلْ مرَّةً أُخْرى.",
      feedbackwrong:
        "الإِجَاباتُ تحْتاجُ إلى مزيدٍ من المُراجعةِ، أَعِدِ المُحَاولةَ.",
      feedbackcorrect: "أَحْسنْتَ، لقدْ أتْمَمْتَ المُهِمَّةَ بنجاحٍ.",
      Keyfeedback: "",
      popupWrong: "إِجَابتُكَ غيْرُ صَحيحَةٍ",
      popupCorrect: "أَحْسنْتَ",
      correctanswer: "إِجَابةٌ صَحيحةٌ",
      count_q: 0,
      lang: "",
      // --------------------------------------------------------
      isLoading: false,
      isSuccess: false,
      dataLoaded: false,
      currentdate: "",
      date: null,
      scormStartTime: null,
      scormReported: false,
      numberOfAttemptInitialized: false,
      previousScormScore: 0,
      questionLogged: {},

      // --------------------------------------------------------
      // For Overlay
      toggleOverlay: false,
      overlayTexts: [],
    };
  },
  async mounted() {
    await this.resize();
    await this.getData();
    window.addEventListener("resize", this.resize);
    this.checkDevice();
    window.addEventListener("resize", this.checkDevice);
    this.matchManager = new MatchManager();
    this.dragDropManager = new DragDropManager();
  },

  computed: {
    currentPost() {
      return this.posts?.[0] || null;
    },
    questions() {
      return this.currentPost?.questions || [];
    },
  },

  methods: {
    /* ===================== BASIC ===================== */
    home() {
      location.reload();
    },

    getDate() {
      const now = new Date();
      return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
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

    /* ===================== RESIZE ===================== */
    resize() {
      const viewport = document.getElementById("Question");
      const safeArea = document.getElementById("safeArea");
      const ASPECT = 16 / 9;
      const MAX_W = 1920;
      const MAX_H = 1080;
      const availW = viewport.clientWidth;
      const availH = viewport.clientHeight;
      let finalW, finalH;

      const wFromWidth = Math.min(availW, MAX_W);
      const hFromWidth = wFromWidth / ASPECT;

      const hFromHeight = Math.min(availH, MAX_H);
      const wFromHeight = hFromHeight * ASPECT;

      if (hFromWidth <= availH) {
        finalW = wFromWidth;
        finalH = hFromWidth;
      } else {
        finalW = wFromHeight;
        finalH = hFromHeight;
      }

      safeArea.style.width = finalW + "px";
      safeArea.style.height = finalH + "px";
      this.updateLinesPosition();
    },

    checkDevice() {
      this.isMobile = window.matchMedia("(pointer: coarse)").matches;
    },

    /* ===================== DATA ===================== */

    async getData() {
      let restoredPost = null;
      if (direction == "2") {
        await returnData.then((response) => {
          this.isSuccess = response.isSuccess;
          this.data = response.value;
          this.activityId = this.data.activityId;
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
          }
        });
      } else {
        if (runPage) {
          this.isSuccess = true;
        } else {
          await returnData.then((response) => {
            this.isSuccess = response.value;
            this.getFeedBackJson();
          });
        }
      }
      await fetch(pageUrl + ".json")
        .then((res) => res.json())
        .then((data) => {
          this.localPosts = data;
        });
      if (this.posts.length == 0) {
        this.posts = this.localPosts;
        this.getFeedBackJson();
      }
      this.shuffledQuestions = this.shuffleQuestions(this.posts[0].questions);
      // console.log("Shuffled Questions:");
      this.shuffledQuestions.forEach((q, index) => {
        // console.log(
        //   `${index + 1}. Title: ${q.title} | Type: ${q.type || "N/A"} | Type: ${q.question || "N/A"} | SubType: ${q.subType || "N/A"}`,
        // );
      });
      this.posts[0].questions = this.shuffledQuestions;
      this.posts.length != 0
        ? setTimeout(() => {
            this.isLoading = true;
            this.posts[0].startTime = this.getDate();
            this.posts[0].numberOfquestion = this.posts[0].questions.length;
            this.posts[0].numberOfTotalQuestion =
              this.posts[0].questions.length;
            this.posts[0].studentPoint = 0;
            this.posts[0].scoreOutOf10 ??= 0;
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

            this.scormStartTime = Date.now();
          }, 1000)
        : (this.isLoading = false);
      this.lang = this.posts[0]?.langauge || "";
      this.titlePage = this.posts[0].navgations[0].title;
      this.totalQuestions = this.posts[0].questions.length;
      this.getAudios();
      this.posts[0].questions.forEach((q) => {
        if (q.type === "input" || q.type === "correct") {
          q.inputs.forEach((input) => {
            input.originalValid = [...input.valid]; // 🔥 تخزين نسخة أصلية
          });
        }
      });
    },

    getFeedBackJson() {
      if (this.posts[0]?.overrideFeedback) {
        this.tryAgain = this.posts[0].feedback.tryAgain;
        this.feedbackwrong = this.posts[0].feedback.feedbackwrong;
        this.feedbackcorrect = this.posts[0].feedback.feedbackcorrect;
        this.popupWrong = this.posts[0].feedback.popupWrong;
        this.popupCorrect = this.posts[0].feedback.popupCorrect;
        this.correctanswer = this.posts[0].feedback.correctanswer;
      }
    },

    getAudios() {
      this.correctAudio.src =
        "../../../lib-native/storyline-q/assets/audios/correct.mp3";
      this.wrongAudio.src =
        "../../../lib-native/storyline-q/assets/audios/wrong.mp3";
      this.clickAudio.src =
        "../../../lib-native/storyline-q/assets/audios/click.mp3";
      this.popupAudio.src =
        "../../../lib-native/storyline-q/assets/audios/popup.mp3";
      this.feedbackPassAudio.src =
        "../../../lib-native/storyline-q/assets/audios/feed-correct.mp3";
      this.feedbackFailAudio.src =
        "../../../lib-native/storyline-q/assets/audios/feed-wrong.mp3";

      this.popupTxtCorrect.src =
        "../../../lib-native/storyline-q/assets/audios/popup-correct" +
        this.lang +
        ".mp3";
      this.popupTxtWrong1.src =
        "../../../lib-native/storyline-q/assets/audios/popup-wrong1" +
        this.lang +
        ".mp3";
      this.popupTxtWrong2.src =
        "../../../lib-native/storyline-q/assets/audios/popup-wrong2" +
        this.lang +
        ".mp3";
      this.feedTxtCorrect.src =
        "../../../lib-native/storyline-q/assets/audios/feed-txt-correct" +
        this.lang +
        ".mp3";
      this.feedTxtWrong.src =
        "../../../lib-native/storyline-q/assets/audios/feed-txt-wrong" +
        this.lang +
        ".mp3";
    },

    /* ===================== NAVIGATION ===================== */
    startLo() {
      this.start = true;
      this.startQuestions();
      this.clickAudio.play();

      this.posts[0].LOcorrectcounter = 0;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;

      this.updateCurrentProgressFeedback(this.posts[0], 0);
    },
    /* ===================== QUESTIONS ===================== */
    startQuestions() {
      this.questionIndex = 0;
      this.count_q = 1;
      this.loadQuestion();
    },
    playTitleAudio() {
      this.questionAudio.pause();
      setTimeout(() => {
        this.titleAudio.src = this.currentQuestion.soundT;
        this.titleAudio.play();
        this.AudioT = true;
        this.titleAudio.addEventListener("ended", () => {
          this.AudioT = false;
          // this.playQuestionAudio();
        });
      }, 1000);
    },
    playQuestionAudio() {
      this.titleAudio.pause();
      setTimeout(() => {
        this.questionAudio.src = this.currentQuestion.soundQ;
        this.questionAudio.play();
        this.AudioQ = true;
        this.questionAudio.addEventListener("ended", () => {
          this.AudioQ = false;
        });
      }, 1000);
    },
    ToggleAudioT() {
      this.stopAllAudios();
      this.AudioT
        ? [this.titleAudio.pause(), (this.titleAudio.currentTime = 0)]
        : this.titleAudio.play();
      this.AudioT = !this.AudioT;
      this.titleAudio.addEventListener("ended", () => {
        this.AudioT = false;
      });
    },
    ToggleAudioQ() {
      this.stopAllAudios();
      this.questionAudio.src = this.currentQuestion.soundQ;
      this.AudioQ
        ? [this.questionAudio.pause(), (this.questionAudio.currentTime = 0)]
        : this.questionAudio.play();
      this.AudioQ = !this.AudioQ;
      this.questionAudio.addEventListener("ended", () => {
        this.AudioQ = false;
      });
    },

    loadQuestion() {
      this.borderQuestion = document.getElementById("lo-container");
      this.borderQuestion.classList.add("poniterEvent");
      setTimeout(() => {
        this.borderQuestion.classList.remove("poniterEvent");
      }, 1000);
      if (this.questionIndex < this.questions.length) {
        this.questions.forEach((q) => (q.active = false));
        this.questions[this.questionIndex].active = true;
        this.currentQuestion = this.questions[this.questionIndex];
        if (!this.currentQuestion.startTime) {
          this.currentQuestion.startTime = this.getQuestionTime();
        }
        this.shuffleAnswers();
        this.getNumOFLengthQuestion();
        this.titlePage = this.currentQuestion.title;
        this.currentQuestion.soundT ? this.playTitleAudio() : "";
      } else {
        const stars = document.querySelector("#stars");

        stars?.classList.add("active");
        this.homeButtonShow = true;
        this.feedback = true;
        this.posts[0].endTime = this.getDate();
        this.finishLO = true;
        this.finished();
      }
    },

    nextQuestion() {
      this.clearAllTimeouts(); // 🔥 مهم
      this.count_q++;
      this.stopAllFeedBackAudio();
      this.userLengthQuestion = 0;
      this.nextButtonShow = false;
      this.feedback = false;
      this.currentQuestion.type == "dragDrop" ? this.resetDragDrop() : "";
      this.currentQuestion.type == "match" ? this.resetMatching() : "";
      const question = this.posts[0].questions[this.questionIndex];
      if (question && !question.endTime) {
        question.endTime = this.getQuestionTime();
      }
      this.questionIndex++;
      this.numOfAttemp = 0;
      this.loadQuestion();
      this.clickAudio.play();
    },

    getNumOFLengthQuestion() {
      this.currentQuestion.type == "dragDrop"
        ? (this.lengthQuestion = this.currentQuestion.drags.length)
        : "";

      this.currentQuestion.type == "match"
        ? (this.lengthQuestion = this.currentQuestion.matchs.filter(
            (item) => item.textLeft || item.imgLeft,
          ).length)
        : "";
    },

    reloadQuestion() {
      this.clearAllTimeouts(); // 🔥 مهم جدا

      this.stopAllFeedBackAudio();
      this.userLengthQuestion = 0;
      this.reloadButtonShow = false;
      resetAnswer();
      this.shuffleAnswers();
      this.feedback = false;
      this.currentQuestion.type == "dragDrop" ? this.resetDragDrop() : "";
      this.currentQuestion.type == "match" ? this.resetMatching() : "";
      this.currentQuestion.type == "input" ? this.resetInput() : "";
      this.currentQuestion.type == "correct" ? this.resetInput() : "";

      this.clickAudio.play();
    },

    stopAllFeedBackAudio() {
      const audios = [
        this.popupTxtCorrect,
        this.popupTxtWrong1,
        this.popupTxtWrong2,
        this.feedTxtCorrect,
        this.feedTxtWrong,
      ];

      audios.forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.src = audio.src; // 🔥 يلغي أي play pending
        }
      });
    },

    home() {
      this.clickAudio.play();
      location.reload();
    },
    afterCheckAnswer() {
      this.stopAllAudios();
      this.numOfAttemp += 1;
      this.currentQuestion.numberOfTrial = this.numOfAttemp;
      this.checkStateFeedBack(this.numberOfAnswer);
      this.UpdateStudentActivity();
    },

    stopAllAudios() {
      this.titleAudio?.pause();
      this.titleAudio.currentTime = 0;
      this.AudioT = false;
      this.questionAudio?.pause();
      this.questionAudio.currentTime = 0;
      this.AudioQ = false;
    },
    checkStateFeedBack(numberOfChoose) {
      this.borderQuestion.classList.add("poniterEvent");

      if (!this.correctAnswer) {
        if (this.numOfAttemp == 1) {
          if (numberOfChoose <= 2) {
            this.setSafeTimeout(() => {
              this.getQuestionSolve();

              this.setSafeTimeout(() => {
                this.activateFinalFeedback();

                this.setSafeTimeout(() => {
                  this.popupTxtWrong2.play();
                }, 1000);
              }, 4000);
            }, 2000);
          } else {
            this.setSafeTimeout(() => {
              this.getFeedback();
              this.reloadButtonShow = true;

              this.setSafeTimeout(() => {
                this.popupTxtWrong1.play();
              }, 1000);
            }, 4000);
          }
        } else if (this.numOfAttemp == 2) {
          if (!this.currentQuestion.type == "correct") {
            this.setSafeTimeout(() => {
              this.getQuestionSolve();

              this.setSafeTimeout(() => {
                this.activateFinalFeedback();

                this.setSafeTimeout(() => {
                  this.popupTxtWrong2.play();
                }, 1000);
              }, 4000);
            }, 2000);
          } else {
            this.setSafeTimeout(() => {
              this.getQuestionSolve();

              this.setSafeTimeout(() => {
                this.activateFinalFeedback();

                this.setSafeTimeout(() => {
                  this.popupTxtWrong2.play();
                }, 2000);
              }, 4000);
            }, 2000);
          }
        }
      } else {
        if (this.currentQuestion.type == "correct") {
          this.setSafeTimeout(() => {
            showAnswer(this.currentQuestion);
          }, 1500);
          this.setSafeTimeout(() => {
            this.activateFinalFeedback();
            this.setSafeTimeout(() => {
              this.popupTxtCorrect.play();
            }, 3000);
          }, 4000);
        } else {
          this.setSafeTimeout(() => {
            showAnswer(this.currentQuestion);
          }, 1500);
          this.setSafeTimeout(() => {
            this.activateFinalFeedback();
            this.setSafeTimeout(() => {
              this.popupTxtCorrect.play();
            }, 1000);
          }, 2000);
        }
      }
    },
    activateFinalFeedback() {
      this.nextButtonShow = true;
      this.getFeedback();

      const question = this.posts[0].questions[this.questionIndex];
      if (question && !question.endTime) {
        question.endTime = this.getQuestionTime();
      }

      this.logAfterQuestionFinalFeedback(this.questionIndex);
    },
    setSafeTimeout(fn, delay) {
      const id = setTimeout(() => {
        // يتأكد إن السؤال لسه هو هو
        if (this.currentQuestion) {
          fn();
        }
      }, delay);

      this.timeouts.push(id);
    },

    clearAllTimeouts() {
      this.timeouts.forEach((id) => clearTimeout(id));
      this.timeouts = [];
    },
    getQuestionSolve() {
      this.currentQuestion.type == "dragDrop" ? this.shoWDragDropAnswer() : "";
      this.currentQuestion.type == "match" ? this.showCorrectMatching() : "";
      this.currentQuestion.type == "choose" ? getTrueAnswer() : "";
      this.currentQuestion.type == "trueFalse" ? getTrueAnswer() : "";
      this.currentQuestion.type == "input" ? this.showInputsAnswer() : "";
      this.currentQuestion.type == "correct" ? this.showCorrectAnswer() : "";
    },
    /* ===================== choose ===================== */
    selectChoose(event, answer) {
      const [isCorrect] = checkChoose(event, answer);
      this.correctAnswer = isCorrect;
      this.correctAnswer ? this.correctAnswerSolve() : this.falseAnswerSolve();
      this.numberOfAnswer = this.currentQuestion.answers.length;
      this.afterCheckAnswer();
    },

    /* ================= drag web ================= */
    dragstart(drag) {
      this.stopAllAudios();
      const index = this.dropAnswers.findIndex((d) => d && d.id === drag.id);
      if (index !== -1) {
        this.$set(this.dropAnswers, index, null);
        drag.placed = false;
        this.userLengthQuestion -= 1;
      }

      this.draggedItem = drag;
    },
    handleDrop(index) {
      if (!this.draggedItem) return;
      if (this.dropAnswers[index]) {
        this.dropAnswers[index].placed = false;
        this.userLengthQuestion -= 1;
      }
      this.$set(this.dropAnswers, index, this.draggedItem);
      this.draggedItem.placed = true;
      this.userLengthQuestion += 1;
      this.draggedItem = null;
    },
    removeFromDrop(index) {
      const item = this.dropAnswers[index];
      if (!item) return;
      item.placed = false;
      this.userLengthQuestion -= 1;
      this.$set(this.dropAnswers, index, null);
    },

    /* ================= drag mobile ================= */

    touchStartDrag(event, drag) {
      this.stopAllAudios();
      event.preventDefault();
      const index = this.dropAnswers.findIndex((d) => d && d.id === drag.id);
      if (index !== -1) {
        this.$set(this.dropAnswers, index, null);
        drag.placed = false;
        this.userLengthQuestion -= 1;
      }

      this.draggedItem = drag;
      this.touchElement = event.currentTarget;

      const rect = this.touchElement.getBoundingClientRect();
      this.offsetX = event.touches[0].clientX - rect.left;
      this.offsetY = event.touches[0].clientY - rect.top;

      this.touchElement.style.position = "fixed";
      this.touchElement.style.zIndex = "1000";
    },

    touchMoveDrag(event) {
      if (!this.touchElement) return;
      event.preventDefault();
      this.touchElement.style.left =
        event.touches[0].clientX - this.offsetX + "px";
      this.touchElement.style.top =
        event.touches[0].clientY - this.offsetY + "px";
    },

    touchEndDrag(event) {
      if (!this.touchElement) return;
      const touch = event.changedTouches[0];
      this.touchElement.style.display = "none";
      let dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
      this.touchElement.style.display = "";
      if (dropElement) {
        dropElement = dropElement.closest(".active .drop");
      }
      if (dropElement) {
        // console.log(dropElement);
        const drops = Array.from(document.querySelectorAll(".active .drop"));
        const index = drops.indexOf(dropElement);

        if (index !== -1) {
          this.handleDrop(index);
        }
      }
      this.touchElement.style.position = "";
      this.touchElement.style.left = "";
      this.touchElement.style.top = "";
      this.touchElement.style.zIndex = "";
      this.touchElement = null;
    },

    /* ================= check , reset , show answer drag ================= */
    checkDragDrop() {
      this.numberOfAnswer = this.currentQuestion.drags.length;
      this.dragDropManager.setState(this.dropAnswers);
      const result = this.dragDropManager.checkAnswers(
        this.currentQuestion.drags,
      );
      this.dropResults = result.dropResults;
      if (result.correct) {
        this.correctAnswer = true;
        this.correctAnswerSolve();
        this.showFullAnswerDrag();
      } else {
        this.correctAnswer = false;
        this.falseAnswerSolve();
      }
      this.afterCheckAnswer();
    },

    resetDragDrop() {
      if (this.count_q - 1 != this.questions.length) {
        const result = this.dragDropManager.reset(this.currentQuestion.drags);
        this.dropAnswers = result.dropAnswers;
        this.dropResults = result.dropResults;
        this.correctAnswer = false;
        this.draggedItem = null;
      }
    },
    showFullAnswerDrag() {
      if (!this.currentQuestion.ShowAnswerAfterFinished) return;

      const result = this.dragDropManager.revealAnswer(this.currentQuestion);

      this.dropAnswers = result.dropAnswers;
      this.dropResults = result.dropResults;

      this.$set(this.currentQuestion, "showCorrectAnswer", true);

      document.querySelectorAll(".active .drop").forEach((e) => e.remove());
    },

    shoWDragDropAnswer() {
      document.querySelectorAll(".active .drag-area-img")?.forEach((el) => {
        el.innerHTML = "";
      });
      document.querySelectorAll(".active .drag-area")?.forEach((el) => {
        el.innerHTML = "";
      });
      const result = this.dragDropManager.showCorrectAnswers(
        this.currentQuestion.drags,
      );

      this.dropAnswers = result.dropAnswers;
      this.dropResults = result.dropResults;
      this.showFullAnswerDrag();
    },

    /* ===================== Match web ===================== */

    drawLine(container) {
      if (!container) return;
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svgRect = container.getBoundingClientRect();
      this.svg.style.position = "absolute";
      this.svg.style.top = "0";
      this.svg.style.left = "0";
      this.svg.style.width = "100%";
      this.svg.style.height = "100%";
      this.svg.style.pointerEvents = "none";
      this.line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
    },
    createSVG(ev) {
      const container = document.querySelector(".active .svg-dist");
      this.drawLine(container);
      this.lineCounter++;
      this.svg.setAttribute("data-line-id", this.lineCounter);
      this.line.setAttribute("stroke", "#24445B");
      this.line.setAttribute("stroke-width", "3");
      this.svg.appendChild(this.line);
      container.appendChild(this.svg);
      this.lines.push({
        id: this.lineCounter,
        sourceEl: ev.currentTarget,
        targetEl: null,
        line: this.line,
        svg: this.svg,
      });
      this.lineCounter++;
      ev.currentTarget.dataset.activeLine = this.lineCounter;
    },

    dragStart(ev) {
      this.stopAllAudios();
      const sourceEl = ev.currentTarget;

      const index = this.lines.findIndex(
        (l) => l.sourceEl === sourceEl || l.targetEl === sourceEl,
      );

      if (index !== -1) {
        const oldLine = this.lines[index];
        oldLine.svg.remove();
        if (oldLine.targetEl) {
          delete oldLine.targetEl.dataset.activeLine;
        }
        this.lines.splice(index, 1);
      }

      this.createSVG(ev);

      const rect = sourceEl.getBoundingClientRect();

      let x = rect.left - this.svgRect.left + rect.width / 2;
      let y = rect.top - this.svgRect.top + rect.height / 2;

      this.line.setAttribute("x1", x);
      this.line.setAttribute("y1", y);
      this.line.setAttribute("x2", x);
      this.line.setAttribute("y2", y);
    },

    dragOver(ev) {
      ev.preventDefault();
      if (!this.line) return;

      const container = document.querySelector(".active .svg-dist");
      const svgRect = container.getBoundingClientRect();

      const x = ev.clientX - svgRect.left;
      const y = ev.clientY - svgRect.top;

      requestAnimationFrame(() => {
        this.line.setAttribute("x2", x);
        this.line.setAttribute("y2", y);
      });
    },

    dragEnd(ev, drag) {
      const dropZone = document.elementFromPoint(ev.clientX, ev.clientY);

      if (!dropZone || !dropZone.dataset.number) {
        this.removeline();
        return;
      }

      const sourceEl = ev.currentTarget;

      const sourceIsFlip = sourceEl.classList.contains("flip");
      const targetIsFlip = dropZone.classList.contains("flip");

      // منع التوصيل بين نفس النوع
      if (sourceIsFlip === targetIsFlip) {
        this.removeline();
        return;
      }

      this.drop(dropZone, drag);
    },

    drop(dropZone) {
      const currentLine = this.lines[this.lines.length - 1];

      const index = this.lines.findIndex(
        (l) =>
          (l.sourceEl === dropZone || l.targetEl === dropZone) &&
          l.id !== currentLine.id,
      );

      if (index !== -1) {
        const oldLine = this.lines[index];
        oldLine.svg.remove();

        if (oldLine.targetEl) {
          delete oldLine.targetEl.dataset.activeLine;
        }

        this.lines.splice(index, 1);
      }

      const rect = dropZone.getBoundingClientRect();

      let x = rect.left - this.svgRect.left + rect.width / 2;
      let y = rect.top - this.svgRect.top + rect.height / 2;

      this.line.setAttribute("x2", x);
      this.line.setAttribute("y2", y);

      currentLine.targetEl = dropZone;
      dropZone.dataset.activeLine = currentLine.id;
    },

    removeline() {
      if (!this.line) return;
      this.line.remove();
      const index = this.lines.findIndex((l) => l.line === this.line);
      if (index !== -1) this.lines.splice(index, 1);
      this.line = null;
    },

    removeExistingLine(pointID) {
      const index = this.lines.findIndex((l) => l.source == pointID);
      if (index !== -1) {
        this.lines[index].line.remove();
        this.lines.splice(index, 1);
      }
    },

    /* ===================== Match mobile ===================== */
    getTouchPosition(ev) {
      const touch = ev.changedTouches[0];
      return {
        x: touch.clientX,
        y: touch.clientY,
      };
    },
    touchStart(ev) {
      this.stopAllAudios();

      const target = ev.currentTarget;
      this.currentSourceEl = target;

      const index = this.lines.findIndex(
        (l) => l.sourceEl === target || l.targetEl === target,
      );

      if (index !== -1) {
        const oldLine = this.lines[index];
        oldLine.svg.remove();

        if (oldLine.targetEl) {
          delete oldLine.targetEl.dataset.activeLine;
        }

        this.lines.splice(index, 1);
      }

      this.createSVG({ currentTarget: target });

      const rect = target.getBoundingClientRect();

      let x = rect.left - this.svgRect.left + rect.width / 2;
      let y = rect.top - this.svgRect.top + rect.height / 2;

      this.line.setAttribute("x1", x);
      this.line.setAttribute("y1", y);
      this.line.setAttribute("x2", x);
      this.line.setAttribute("y2", y);

      this.isDrawing = true;
    },
    touchMove(ev) {
      if (!this.isDrawing || !this.line) return;

      const pos = this.getTouchPosition(ev);

      const x = pos.x - this.svgRect.left;
      const y = pos.y - this.svgRect.top;

      this.line.setAttribute("x2", x);
      this.line.setAttribute("y2", y);
    },
    touchEnd(ev) {
      if (!this.isDrawing) return;

      const pos = this.getTouchPosition(ev);
      const dropZone = document.elementFromPoint(pos.x, pos.y);

      if (!dropZone || !dropZone.dataset.number) {
        this.removeline();
        this.isDrawing = false;
        return;
      }

      const sourceEl = this.currentSourceEl;

      const sourceFlip = sourceEl.classList.contains("flip");
      const targetFlip = dropZone.classList.contains("flip");

      // منع التوصيل بين نفس النوع
      if (sourceFlip === targetFlip) {
        this.removeline();
        this.isDrawing = false;
        return;
      }

      this.drop(dropZone);

      this.isDrawing = false;
    },

    updateLinesPosition() {
      // console.log(this.lines);

      const container = document.querySelector(".active .svg-dist");
      if (!container) return;

      const svgRect = container.getBoundingClientRect();

      this.lines.forEach((l) => {
        if (!l.sourceEl || !l.targetEl || !l.line) return;

        const rect1 = l.sourceEl.getBoundingClientRect();
        const rect2 = l.targetEl.getBoundingClientRect();

        const x1 = rect1.left - svgRect.left + rect1.width / 2;
        const y1 = rect1.top - svgRect.top + rect1.height / 2;

        const x2 = rect2.left - svgRect.left + rect2.width / 2;
        const y2 = rect2.top - svgRect.top + rect2.height / 2;

        l.line.setAttribute("x1", x1);
        l.line.setAttribute("y1", y1);
        l.line.setAttribute("x2", x2);
        l.line.setAttribute("y2", y2);
      });
    },

    /* ===================== check , reset , show answer Match ===================== */
    resetMatching() {
      this.matchManager.reset();
      this.lines = [];
      this.lineCounter = 0;
      const elements = document.querySelectorAll(".active [data-active-line]");
      elements.forEach((el) => {
        delete el.dataset.activeLine;
      });
    },
    drawCorrectLine(sourceEl, targetEl) {
      const container = document.querySelector(".active .svg-dist");
      this.drawLine(container);
      this.line.setAttribute("stroke", "#2ECC71");
      this.line.setAttribute("stroke-width", "3");
      const rect1 = sourceEl.getBoundingClientRect();
      const rect2 = targetEl.getBoundingClientRect();
      const x1 = rect1.left - svgRect.left;
      const y1 = rect1.top - svgRect.top + rect1.height / 2;
      const x2 = rect2.right - svgRect.left;
      const y2 = rect2.top - svgRect.top + rect2.height / 2;
      this.line.setAttribute("x1", x1);
      this.line.setAttribute("y1", y1);
      this.line.setAttribute("x2", x2);
      this.line.setAttribute("y2", y2);
      this.svg.appendChild(this.line);
      container.appendChild(this.svg);
      this.lines.push({ svg: this.svg, line: this.line });
    },
    showCorrectMatching() {
      this.lines = this.matchManager.showCorrectAnswers(
        this.currentQuestion.matchs,
      );
    },
    checkAnswers() {
      const count = this.currentQuestion.matchs.filter(
        (item) => item.textLeft?.trim() !== "" || item.imgLeft?.trim() !== "",
      ).length;
      // console.log(count);
      this.numberOfAnswer = this.currentQuestion.matchs.length;
      this.matchManager.setLines(this.lines);
      const result = this.matchManager.checkAnswers(count);
      if (result.isAllCorrect) {
        this.correctAnswer = true;
        this.correctAnswerSolve();
      } else {
        this.correctAnswer = false;
        this.falseAnswerSolve();
      }
      this.afterCheckAnswer();
    },

    /* ===================== feedBack ===================== */
    getFeedback() {
      this.stopAllAudios();
      this.feedback = true;
      this.borderQuestion.classList.remove("poniterEvent");
      this.popupAudio.play();
    },
    UpdateStudentActivity() {
      const currentAttemptScore = this.calculateCurrentAttemptScore();
      this.updateCurrentProgressFeedback(this.posts[0], currentAttemptScore);
      this.updateScormScoreAfterAnswer(currentAttemptScore);
      direction != ""
        ? ((this.posts[0].title = this.data.title),
          (this.posts[0].bloomLevels = this.data.bloomLevels),
          (this.posts[0].learningObjectives = this.data.learningObjectives),
          (this.posts[0].loDegree = this.data.loDegree),
          (this.posts[0].keywords = this.data.keywords),
          (this.posts[0].type = this.data.type),
          (this.posts[0].unitId = this.data.unitId),
          !this.isFinalQuestionAttempt() &&
            globalFunctions.UpdateStudentActivity(
              this.activityId,
              this.posts[0],
            ))
        : "";
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
    normalizeScormScore(score) {
      const normalizedScore = Number(score);

      if (!Number.isFinite(normalizedScore) || normalizedScore < 0) {
        return 0;
      }

      return Math.min(normalizedScore, 100);
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
    isFinalQuestionAttempt() {
      return this.questionIndex >= this.questions.length - 1;
    },
    logAfterQuestionFinalFeedback(questionIndex) {
      if (this.isFinalQuestionAttempt()) return;
      if (this.questionLogged[questionIndex]) return;

      this.questionLogged[questionIndex] = true;

      this.logQaMetadata(this.posts[0]);
    },
    logPostAfterFinalFeedback() {
      if (this.isScormCloudEnvironment()) {
        this.logScormCloudSummary();
      } else {
        this.logQaMetadata(this.posts[0]);
      }
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
      const result = this.calculateCurrentAttemptScore();
      const isActivityComplete =
        this.finishLO && this.questionIndex >= this.questions.length;

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

    finished(score) {
      let result =
        (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) * 100;
      this.scormPost();

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
      result >= 50
        ? [
            (this.passLo = true),
            this.feedbackPassAudio.play(),
            setTimeout(() => {
              // this.feedTxtCorrect.play();
            }, 1000),
          ]
        : [
            (this.passLo = false),
            this.feedbackFailAudio.play(),
            setTimeout(() => {
              // this.feedTxtWrong.play();
            }, 1000),
          ];

      this.resolveFinalProgressFeedback(result);
    },
    resolveFinalProgressFeedback(finalProgressScore) {
      const post = this.posts?.[0];
      if (!post) return;

      if (typeof calculate === "function") {
        try {
          calculate(
            post.LOcorrectcounter,
            post.numberOfquestion,
            this.lang === "eng",
            false,
            post,
          );
        } catch (e) {
          console.error(e);
        }
      }

      const progressFeedback = this.updateCurrentProgressFeedback(
        post,
        finalProgressScore,
      );

      if (!progressFeedback) return;

      if (
        typeof post.feedBackTxt === "string" &&
        post.feedBackTxt.trim() !== ""
      ) {
        this.Keyfeedback = post.feedBackTxt;

        if (!this.passLo) {
          this.tryAgain = post.feedBackTxt;
        }
      }

      if (
        typeof post.feedBackDes === "string" &&
        post.feedBackDes.trim() !== ""
      ) {
        if (this.passLo) {
          this.feedbackcorrect = post.feedBackDes;
        } else {
          this.feedbackwrong = post.feedBackDes;
        }
      }
    },
    shuffleArray(arr) {
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    },
    shuffleAnswers() {
      this.currentQuestion.type == "choose"
        ? (this.currentQuestion.answers = this.shuffleArray(
            this.currentQuestion.answers,
          ))
        : "";
      this.currentQuestion.type == "dragDrop"
        ? (this.DragShuffled = this.shuffleArray(this.currentQuestion?.drags))
        : "";
      this.currentQuestion.type == "match"
        ? [
            (this.matchingRightShuffled = this.shuffleArray(
              this.currentQuestion?.matchs,
            )),
            (this.matchingLeftShuffled = this.shuffleArray(
              this.currentQuestion?.matchs,
            )),
          ]
        : "";
    },

    // For Overlay
    toggleoverlayHandler() {
      this.toggleOverlay = !this.toggleOverlay;
      this.overlayTexts = this.currentQuestion.popup;
    },
    closeOverlayHandler() {
      this.toggleOverlay = false;
    },

    correctAnswerSolve() {
      this.posts[0].LOcorrectcounter += 1;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      // console.log(this.posts[0].LOcorrectcounter);
      this.correctAudio.play();
    },
    falseAnswerSolve() {
      this.wrongAudio.play();
    },

    shuffleQuestions(questions) {
      // 1. جمع الأسئلة حسب type و subType
      const groups = {};
      questions.forEach((q) => {
        const type = q.type || "defaultType";
        const sub = q.subType || "defaultSub";
        if (!groups[type]) groups[type] = {};
        if (!groups[type][sub]) groups[type][sub] = [];
        groups[type][sub].push(q);
      });

      const shuffled = [];

      // 2. شيفل الـ types على مستوى الأساس
      const typeKeys = this.shuffleArray(Object.keys(groups));

      typeKeys.forEach((type) => {
        const subGroups = groups[type];

        // شيفل الـ subTypes نفسها
        const subKeys = this.shuffleArray(Object.keys(subGroups));

        subKeys.forEach((sub) => {
          // شيفل الأسئلة جوه كل subType
          const shuffledSub = this.shuffleArray(subGroups[sub]);
          shuffled.push(...shuffledSub);
        });
      });

      return shuffled;
    },

    /* ===================== check , reset , show answer Input ===================== */

    maxLength(event) {
      maxLength(event, this.currentQuestion);
    },

    changeValue() {
      this.stopAllAudios();
      const submitBtn = document.querySelector(".active .sumbit");
      if (allInputsFilled()) {
        submitBtn.classList.remove("dimmed");
      } else {
        submitBtn.classList.add("dimmed");
      }
    },
    showInputsAnswer() {
      showAnswer(this.currentQuestion);
    },
    showCorrectAnswer() {
      showAnswer(this.currentQuestion);
    },
    checkInputALL() {
      this.numberOfAnswer = 1000;
      numOfInput(this.currentQuestion);
      const result = checkInputALL(this.currentQuestion);
      // console.log(result);

      if (result) {
        this.correctAnswer = true;
        this.correctAnswerSolve();
      } else {
        this.correctAnswer = false;
        this.falseAnswerSolve();
      }
      this.afterCheckAnswer();
      // console.log(this.correctAnswer);
    },

    resetInput() {
      this.currentQuestion.counterCorrectQuestion = 0;
      this.currentQuestion.inputs.forEach((input, i) => {
        input.valid = [...input.originalValid];
      });
      resetInputs();
      this.changeValue();
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
