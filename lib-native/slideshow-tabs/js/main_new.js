let slideShow = document.querySelector("#slide-show");
let pageUrl = slideShow.getAttribute("data-urlpage");

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}

new Vue({
  el: "#slide-show",
  data: {
    posts: {},
    loQuestions: 6,
    counter: 0,
    muteSound: false,
    startLo: false,
    slideCounter: 0,
    maxLengthSlide: 0,
    maxLengthAllSlide: 0,
    maxLengthQuestions: 0,
    slide: true,
    startClick: new Audio(),
    slideSound: new Audio(),
    rightClick: new Audio(),
    wrongClick: new Audio(),
    win: new Audio(),
    loss: new Audio(),
    isRight: null,
    checked: false,
    questionCounter: 0,
    feedbackText: "",
    progressPercentage: 0,
    result: 0,
    upper: null,
    isDown: false,
    startX: null,
    scrollLeft: null,
    touchStartX: 0,
    touchEndX: 0,
    tabSlideCounter: -1,
    tabActive: 0,
    startTab: false,
    isDragging: false,
    // --------------------------------------------------------
    isLoading: false,
    isSuccess: false,
    activityId: 0,
    currentdate: "",
    date: null,
    shuffledQuestion: [],
    playRight: false,
    ended: false,
    hint: false,
    currentdate: "",
    dataLoaded: false,
    scormStartTime: null,
    scormReported: false,
    numberOfAttemptInitialized: false,
    previousScormScore: 0,
    // --------------------------------------------------------
  },

  create() {},

  async mounted() {
    await this.reSize();
    await this.getData();
    this.shuffle();
    this.checkurl();
     window.addEventListener("resize", this.reSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.reSize);
  },
  methods: {
    reSize: async function () {
          if (window.innerHeight >= window.innerWidth) {
        document.getElementById("slide-show").classList.add("resize");
        document
          .getElementsByClassName("inner-container")[0]
          .classList.add("resize");
      }
      const aspect = 16 / 9;
      let w = window.innerWidth;
      let h = window.innerHeight;

      if (w / h > aspect) {
        w = h * aspect;
      } else {
        h = w / aspect;
      }

      const app = document.getElementById("slide-show");
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

    getData: async function () {
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

      if (!this.dataLoaded) {
        await fetch(pageUrl + ".json")
          .then((res) => res.json())
          .then((data) => {
            this.posts = data;
            this.posts.questions.forEach((question) => {
              question.numberOfTrial = 0;
            });
          });
      }

      this.posts.length != 0
        ? setTimeout(() => {
            this.isLoading = true;
            this.posts.LOcorrectcounter = 0;
            this.posts.counterCorrect = 0;
            this.posts.numberOfquestion = this.shuffledQuestion.length;
            this.maxLengthSlide = this.posts.slides.length;
            this.maxLengthAllSlide = this.maxLengthSlide;
            this.posts.tabs.forEach((tab) => {
              this.maxLengthAllSlide += tab.slides.length;
            });
            this.posts.questions.forEach((question) => {
              question.numberOfTrial = 0;
            });
            this.posts.numberOfTotalQuestion = this.shuffledQuestion.length;
            this.posts.studentPoint = 0;
            this.posts.scoreOutOf10 ??= 0;
            if (!this.posts.cmi) {
              this.posts.cmi = {
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
            if (!this.posts.studentProgress) {
              this.posts.studentProgress = {
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
            const post = this.posts;
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
      if (!this.posts.numberOfquestion) return 0;
      return (this.posts.LOcorrectcounter / this.posts.numberOfquestion) * 100;
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
      const post = this.posts;
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
      const post = this.posts;
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
    isScormCloudEnvironment() {
      return window.location.hostname.includes("cloud.scorm");
    },
    logQaMetadata(post) {
      if (this.isScormCloudEnvironment()) return;

      const questionItems = this.shuffledQuestion.map((question) => ({
        numberOfTrial: question.numberOfTrial ?? null,
        questionlevel: question.questionlevel ?? "",
        questionType: question.subtype ?? "",
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
        questions: questionItems,
        studentProgress: post.studentProgress,
        lang: post.lang,
        feedBackTxt: post.feedBackTxt,
        feedBackDes: post.feedBackDes,
      };

      console.log(qaObject);
    },
    logScormCloudSummary() {
      if (!this.isScormCloudEnvironment()) return;

      const cmi = this.posts.cmi;
      console.log(
        `Score: ${cmi.score.raw} | Completion: ${cmi.completion_status} | Success: ${cmi.success_status}`,
      );
    },
    isFinalQuestionAttempt() {
      return this.questionCounter >= this.maxLengthQuestions;
    },
    logPostAfterAnswerAttempt() {
      if (!this.isFinalQuestionAttempt()) {
        this.logQaMetadata(this.posts);
      }
    },
    logPostAfterFinalFeedback() {
      if (this.isScormCloudEnvironment()) {
        this.logScormCloudSummary();
      } else {
        this.logQaMetadata(this.posts);
      }
    },
    UpdateStudentActivity() {
      const result = this.calculateCurrentAttemptScore();
      this.updateCurrentProgressFeedback(this.posts, result);
      this.updateScormScoreAfterAnswer(result);
      direction != ""
        ? ((this.posts.title = this.data.title),
          (this.posts.bloomLevels = this.data.bloomLevels),
          (this.posts.learningObjectives = this.data.learningObjectives),
          (this.posts.loDegree = this.data.loDegree),
          (this.posts.keywords = this.data.keywords),
          (this.posts.type = this.data.type),
          (this.posts.unitId = this.data.unitId),
          globalFunctions.UpdateStudentActivity(this.activityId, this.posts))
        : "";
    },
    persistFinalActivityState() {
      if (
        typeof direction !== "undefined" &&
        direction !== "" &&
        typeof globalFunctions !== "undefined" &&
        typeof globalFunctions.UpdateStudentActivity === "function" &&
        this.posts
      ) {
        try {
          globalFunctions.UpdateStudentActivity(this.activityId, this.posts);
        } catch (e) {
          console.error(e);
        }
      }
    },

    checkurl() {
      let urlParams = new URLSearchParams(window.location.search);
      let grad = urlParams.get("grad");
      let links = document.getElementsByTagName("link");
      for (let i = 0; i < links.length; i++) {
        let link = links[i];
        if (link.rel === "stylesheet" && link.href.includes("/imgs.css")) {
          if (grad) {
            let basePath = "../../../lib-native/slideshow-tabs/style/";
            link.href = `${basePath}imgs-grade-${grad}/imgs.css`;
        
          }
          break;
        }
      }
      if (grad) {
        let slideShow = document.getElementById("slide-show");
        if (slideShow) {
          slideShow.setAttribute("grade", grad);
      
        }
      }
    },

    start() {
      if (direction == "2") {
        this.posts.title = this.data.title;
        this.posts.bloomLevels = this.data.bloomLevels;
        this.posts.learningObjectives = this.data.learningObjectives;
        this.posts.loDegree = this.data.loDegree;
        this.posts.keywords = this.data.keywords;
        this.posts.type = this.data.type;
        this.posts.unitId = this.data.unitId;
      }
      this.startClick.src =
        "../../../lib-native/slideshow-tabs/sound/startclick.mp3";
      this.startClick.play();
      this.startLo = true;
      this.slide = true;
      const counter = this.slideCounter + 1;
      this.slideSound.src = "sound/s" + counter + ".mp3";
      this.slideSound.play();
      this.slideCounter = 0;
      this.hint = true;
      this.posts.startTime = this.getDate();
      var div = document.getElementById("slide-show");
      var grade = div.getAttribute("grade");
      grade <= 3 ? (this.upper = false) : (this.upper = true);
    },

    goHome() {
      this.startLo = false;
      this.slideSound.pause();
      this.slideCounter = 0;
      this.questionCounter = 0;
      this.muteSound = false;
      this.hint = true;
      this.resetData();
    },

    next() {
      this.slideCounter += 1;
      this.hint = false;
      if (this.slideCounter < this.maxLengthSlide) {
        this.newSlideSound(this.slideCounter + 1, false);
      } else if (
        this.slideCounter >= this.maxLengthSlide &&
        this.slideCounter < this.maxLengthAllSlide
      ) {
        if (
          this.tabSlideCounter + 1 <
          this.posts.tabs[this.tabActive].slides.length
        ) {
          this.startTab = true;
          this.tabSlideCounter += 1;
        } else if (
          this.posts.tabs[this.tabActive].slides.length ==
          this.tabSlideCounter + 1
        ) {
          this.tabActive += 1;
          this.tabSlideCounter = 0;
        }
        this.getTab(this.tabActive, false);
        this.newSlideSound(this.tabSlideCounter + 1, true);
      } else if (this.slideCounter == this.maxLengthAllSlide) {
        this.slideSound.pause();
      }
    },

    prev() {
      if (this.slideCounter > 0) {
        this.slideCounter -= 1;
        this.hint = false;
        if (this.slideCounter < this.maxLengthSlide) {
          this.startTab = false;
          this.tabActive = 0;
          this.tabSlideCounter = -1;
          this.getTab(null, false);
          this.newSlideSound(this.slideCounter + 1, false);
        } else if (
          this.slideCounter >= this.maxLengthSlide &&
          this.slideCounter < this.maxLengthAllSlide
        ) {
          if (this.tabSlideCounter > 0) {
            this.tabSlideCounter -= 1;
            this.startTab = true;
          } else if (this.tabSlideCounter == 0 && this.tabActive > 0) {
            this.tabActive -= 1;
            const prevTabSlides = this.posts.tabs[this.tabActive].slides.length;
            this.tabSlideCounter = prevTabSlides - 1;
            this.startTab = true;
          }
          this.getTab(this.tabActive, false);
          this.newSlideSound(this.tabSlideCounter + 1, true);
        }
      } else {
        this.slideCounter = 0;
      }
    },
    getTab(index, slideMusic) {
      if (this.isDragging) return;
      this.posts.tabs.forEach((tab) => {
        tab.active = false;
      });
      if (index != null) {
        this.posts.tabs[index].active = true;
        let get_slide = document.querySelector(".slides");

        this.$nextTick(() => {
          const tabsContainer = this.$el.querySelector(".tabs");
          const activeTab = tabsContainer.querySelector(".tab.active");
          if (activeTab) {
            activeTab.scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }
        });
        if (slideMusic) {
          get_slide.classList.add("fadeIn");
          get_slide.classList.remove("fadeOut");
          setTimeout(() => {
            this.tabActive = index;
            this.tabSlideCounter = 0;
            this.startTab = true;
            this.slideCounter = this.getGlobalSlideIndex(index, 0);
            this.newSlideSound(this.tabSlideCounter + 1, true);
            get_slide.classList.remove("fadeIn");
            get_slide.classList.add("fadeOut");
          }, 500);
        }
      }
    },

    getGlobalSlideIndex(tabIndex, slideIndexInTab) {
      const baseCount = this.posts.slides.length;
      const slidesBeforeThisTab = this.posts.tabs
        .slice(0, tabIndex)
        .reduce((sum, tab) => sum + tab.slides.length, 0);
      return baseCount + slidesBeforeThisTab + slideIndexInTab;
    },
    newSlideSound(sCounter, tab) {
      this.slideSound.pause();
      tab
        ? (this.slideSound.src =
            "sound/t" + (this.tabActive + 1) + "/s" + sCounter + ".mp3")
        : (this.slideSound.src = "sound/s" + sCounter + ".mp3");
      console.log(this.slideSound.src);
      if (!this.muteSound) {
        this.slideSound.play();
      }
    },

    newQuestionSound(qCounter) {
      this.slideSound.pause();
      this.slideSound.src = this.shuffledQuestion[qCounter].sound;
      if (!this.muteSound) {
        this.slideSound.play();
      }
    },

    mute() {
      this.muteSound = !this.muteSound;
      this.muteSound ? this.slideSound.pause() : this.slideSound.play();
    },

    getUserSelection(answer) {
      this.isRight = answer.isRight;
      this.checked = true;
      answer.checked = true;
      this.slideSound.pause();

      if (this.isRight) {
        this.rightClick.src =
          "../../../lib-native/slideshow-tabs/sound/right-click.mp3";
        this.rightClick.play();
        this.playRight = true;
        this.posts.LOcorrectcounter += 1;
        this.posts.counterCorrect = this.posts.LOcorrectcounter;
        coins.playSegments([0, 30], true);
        setTimeout(() => {
          if (this.posts.LOcorrectcounter == 1) {
            states.playSegments([0, 4], true);
          } else if (this.posts.LOcorrectcounter == 2) {
            states.playSegments([4, 7], true);
          } else if (this.posts.LOcorrectcounter == 3) {
            states.playSegments([8, 11], true);
          } else if (this.posts.LOcorrectcounter == 4) {
            states.playSegments([12, 15], true);
          } else if (this.posts.LOcorrectcounter == 5) {
            states.playSegments([16, 18], true);
          } else if (this.posts.LOcorrectcounter == 6) {
            states.playSegments([19, 21], true);
          }
        }, 1900);
      } else {
        this.shuffledQuestion[this.questionCounter].numberOfTrial += 1;
        this.wrongClick.src =
          "../../../lib-native/slideshow-tabs/sound/wrong-click.mp3";
        this.wrongClick.play();
      }
      // --------------------------------------------------------
      if (this.questionCounter < this.maxLengthQuestions - 1) {
        this.UpdateStudentActivity();
      }
      // --------------------------------------------------------
      setTimeout(() => {
        this.nextQuestion();
      }, 2000);
    },

    nextQuestion() {
      this.questionCounter += 1;
      const answeredItem = this.shuffledQuestion[this.questionCounter - 1];
      if (answeredItem && !answeredItem.endTime) {
        answeredItem.endTime = this.getQuestionTime();
      }
      if (this.questionCounter < this.shuffledQuestion.length) {
        const nextItem = this.shuffledQuestion[this.questionCounter];
        if (nextItem && !nextItem.startTime) {
          nextItem.startTime = this.getQuestionTime();
        }
      }
      this.logPostAfterAnswerAttempt();
      if (this.questionCounter < this.maxLengthQuestions) {
        this.slideSound.pause();
        this.playRight = false;
        this.checked = false;
        this.shuffledQuestion[this.questionCounter - 1].active = false;
        this.shuffledQuestion[this.questionCounter].active = true;
        this.newQuestionSound(this.questionCounter);
      } else {
        this.feedback();
      }
    },

    startQuestions() {
      this.slideCounter = 0;
      this.maxLengthQuestions = this.shuffledQuestion.length;
      this.slideSound.pause();
      this.slide = false;
      this.questionCounter = 0;
      this.shuffledQuestion[this.questionCounter].active = true;
      this.newQuestionSound(this.questionCounter);
      if (!this.shuffledQuestion[0].startTime) {
        this.shuffledQuestion[0].startTime = this.getQuestionTime();
      }
    },

    playQuestionSound($event) {
      let audio = $event.target.querySelector("audio");
      if (audio.paused && event.target.classList.contains("paused")) {
        let stopSound = document.querySelectorAll(".play_sound  audio");
        for (var i = 0; i < stopSound.length; ++i) {
          stopSound[i].pause();
          stopSound[i].parentElement.classList.add("paused");
        }
        audio.play();
        event.target.classList.remove("paused");
      } else {
        audio.pause();
        event.target.classList.add("paused");
      }
      audio.onended = function () {
        event.target.parentElement.classList.add("paused");
      };
    },

    feedback() {
      this.progressPercentage =
      (this.posts.LOcorrectcounter / this.posts.numberOfquestion) * 100;
      if (!this.posts.endTime) {
        this.posts.endTime = this.getDate();
      }
      this.finished(this.progressPercentage);
      this.feedbackSound(this.progressPercentage);
      this.calculateProgress(this.progressPercentage);
 document.getElementsByClassName("home")[0].style.display = "none";
 document.getElementsByClassName("sound")[0].style.display = "none";
    },

    calculateProgress(progress) {
      if (progress == 0) {
        console.log(progress);
        if (this.upper) {
          this.feedbackText = "ضعيف";
          progressbar.playSegments([0, 1], true);
        } else {
          progressbar.playSegments([0, 1], true);
        }
      }
      if (progress > 0 && progress <= 50) {
        if (this.upper) {
          this.feedbackText = "ضعيف";
          progressbar.playSegments([0, progress], true);
        } else {
          progressbar.playSegments([0, 1], true);
        }
      }
      if (progress >= 51 && progress <= 64) {
        if (this.upper) {
          this.feedbackText = "مقبول";
          progressbar.playSegments([0, progress], true);
        } else {
          progressbar.playSegments([59, 60], true);
        }
      }
      if (progress >= 65 && progress <= 84) {
        if (this.upper) {
          progressbar.playSegments([0, progress], true);
          this.feedbackText = "جيد";
        } else {
          progressbar.playSegments([74, 75], true);
        }
      }
      if (progress >= 85 && progress <= 100) {
        if (this.upper) {
          progressbar.playSegments([0, progress], true);
          this.feedbackText = "يفوق التوقعات ";
        } else {
          progressbar.playSegments([90, 100], true);
        }
      }
    },

    feedbackSound(score) {
      if (score <= 51) {
        this.loss.src = "../../../lib-native/slideshow-tabs/sound/loss.mp3";
        this.loss.play();
      } else {
        this.win.src = "../../../lib-native/slideshow-tabs/sound/win.mp3";
        this.win.play();
      }
    },
    msToScormTime(ms) {
      const diffMs = new Date() - this.scormStartTime;
      const totalSeconds = Math.floor(diffMs / 1000);
      const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0"
      );
      const ss = String(totalSeconds % 60).padStart(2, "0");

      return `${hh}:${mm}:${ss}`;
    },
    scormPost(score) {
      const result = score;
      const isActivityComplete =
        this.questionCounter >= this.maxLengthQuestions;

      if (isActivityComplete && !this.scormReported) {
        this.scormReported = true;
        this.posts.studentPoint = Number((result / 10).toFixed(1));
        const previousTotalSeconds = this.parseScormTimeToSeconds(
          this.posts.cmi.total_time,
        );
        const currentSessionSeconds = Math.floor(
          (Date.now() - this.scormStartTime) / 1000,
        );
        this.posts.cmi.total_time = this.formatSecondsToScormTime(
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
      this.posts.studentPoint = Number((score / 10).toFixed(1));
      this.posts.scoreOutOf10 =
        score == 0
          ? 0
          : score <= 25
            ? 2.5
            : score <= 50
              ? 5
              : score <= 75
                ? 7.5
                : 10;
      this.updateCurrentProgressFeedback(this.posts, score);
      this.scormPost(score);
    },

    resetData() {
      this.shuffledQuestion.forEach((element) => {
        element.active = false;
        element.numberOfTrial = 0;
        element.answers.forEach((answer) => {
          answer.checked = false;
        });
      });
      this.checked = false;
      this.isRight = false;
      this.playRight = false;
      this.progressPercentage = 0;
      this.feedbackText = "";
      this.posts.LOcorrectcounter = 0;
      this.posts.counterCorrect = 0;
      states.playSegments([0, 1], true);
      location.reload();
    },

    randomData(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    },

    shuffle() {
      let typeText = this.posts.questions.filter((el) => el.subtype === "text");
      let typeImages = this.posts.questions.filter(
        (el) => el.subtype === "images"
      );
      let typetrueFlase = this.posts.questions.filter(
        (el) => el.subtype === "truefalse"
      );

      typeText = typeText.sort(() => Math.random() - 0.5);
      typeImages = typeImages.sort(() => Math.random() - 0.5);
      typetrueFlase = typetrueFlase.sort(() => Math.random() - 0.5);

      let groupedTypes = [typeText, typeImages, typetrueFlase].filter(
        (group) => group.length > 0
      );

      let shuffledGroups = groupedTypes.sort(() => Math.random() - 0.5);

      let allQuestions = shuffledGroups.flat();

      allQuestions.forEach((question) => {
        if (question.subtype === "text" || question.subtype === "images") {
          question.answers = question.answers.sort(() => Math.random() - 0.5);
        }
      });

      this.shuffledQuestion = allQuestions.slice(
        0,
        Math.min(6, allQuestions.length)
      );
    },

    mousedown(e) {
      const tabs = this.$el.querySelector(".tabs");
      this.isDown = true;
      this.isDragging = false;
      tabs.classList.add("dragging");
      this.startX = e.pageX - tabs.offsetLeft;
      this.scrollLeft = tabs.scrollLeft;
    },

    mouseleave(e) {
      const tabs = this.$el.querySelector(".tabs");
      this.isDown = false;
      this.isDragging = false;
      tabs.classList.remove("dragging");
    },

    mouseup(e) {
      const tabs = this.$el.querySelector(".tabs");
      this.isDown = false;
      tabs.classList.remove("dragging");
      this.isDown = false;
    },

    mousemove(e) {
      const tabs = this.$el.querySelector(".tabs");
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.pageX - tabs.offsetLeft;
      const walk = (x - this.startX) * 1.5;
      tabs.scrollLeft = this.scrollLeft - walk;
      if (Math.abs(walk) > 5) this.isDragging = true;
    },

    onTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
    },
    onTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    },
    handleSwipe() {
      const diff = this.touchStartX - this.touchEndX;
      if (Math.abs(diff) < 50) return;
      const activeIndex = this.posts.tabs.findIndex((t) => t.active);
      if (diff > 0 && activeIndex < this.posts.tabs.length - 1) {
        this.getTab(activeIndex + 1);
      } else if (diff < 0 && activeIndex > 0) {
        this.getTab(activeIndex - 1);
      }
    },
  },
});


window.addEventListener("beforeunload", () => {
  try {
    if (window.ScormService && window.ScormService.isConnected()) {
    }
  } catch (err) {
    console.error(err);
  }
});
