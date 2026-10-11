let soltan = document.querySelector("#glossary");
let pageUrl = soltan.getAttribute("data-urlpage");

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}

new Vue({
  el: "#glossary",
  data: {
    posts: [],
    gates: [
      {
        id: 1,
        name: "الْمَعْنَى",
        classname: "mean",
        active: false,
      },
      {
        id: 2,
        name: "الْمُضَاد",
        classname: "reverse",
        active: false,
      },
      {
        id: 3,
        name: "الْجَمْع",
        classname: "plural",
        active: false,
      },
      {
        id: 4,
        name: "الْمُفْرَد",
        classname: "single",
        active: false,
      },
    ],
    isActive: false,
    round: 1,
    gatesOpened: null,
    words: [],
    wordsActive: [],
    wordSelected: null,
    startX: null,
    startY: null,
    dropBox: null,
    pageSize: 16,
    currentPage: 1,
    playMusic: false,
    bgAudio: new Audio(),
    clickAudio: new Audio(),
    answerAudio: new Audio(),
    poniterNone: false,
    activeText: null,
    soundBG: false,
    // --------------------------------------------------------
    isLoading: false,
    isSuccess: false,
    activityId: 0,
    dataLoaded: false,
    currentdate: "",
    date: null,
    scormStartTime: null,
    scormReported: false,
    numberOfAttemptInitialized: false,
    previousScormScore: 0,
    // --------------------------------------------------------
  },

  async create() {},
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
  },
  async mounted() {
    this.reSize();
    window.addEventListener("resize", this.reSize);
    await this.getData();
    this.bgAudio.src = "../../../lib-native/glossary_26/assets/audio/bgAudio.mp3";
    this.clickAudio.src =
      "../../../lib-native/glossary_26/assets/audio/clickAudio.mp3";
    this.answerAudio.src =
      "../../../lib-native/glossary_26/assets/audio/answerAudio.mp3";
    const urlParams = new URLSearchParams(window.location.search);
    const environment =
      urlParams.get("environment") || this.posts[0].environment;
    const linkTag = document.createElement("link");
    linkTag.rel = "stylesheet";
    linkTag.href = `../../../lib-native/glossary_26/assets/environment/${environment}/images.css`;
    if (environment) {
      document.head.appendChild(linkTag);
    }
    window.addEventListener("resize", this.reSize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.reSize);
  },

  methods: {
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
            restoredPost = jsonData;
            this.previousScormScore = this.normalizeScormScore(
              restoredPost?.cmi?.score?.raw,
            );
          }
          // console.log(this.data);
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
      await fetch(pageUrl + ".json")
        .then((res) => res.json())
        .then((data) => {
          this.localPosts = data;
        });
      if (this.posts.length == 0) {
        this.posts = this.localPosts;
      } else {
        // this.posts[0].items = this.localPosts[0].items;
      }
      this.posts[0].LOcorrectcounter = 0;
      this.posts[0].counterCorrect = 0;
      this.posts[0].items.forEach((item) => {
        item.check = false;
      });
      this.posts.length != 0
        ? setTimeout(() => {
            this.isLoading = true;
          }, 1000)
        : (this.isLoading = false);
      this.posts[0].startTime = this.getDate();

      let params = 0;

      if (params) {
        const count = Math.min(
          Math.max(parseInt(params.numberOfQuestions), 1),
          4,
        );

        this.gates.forEach((gate, index) => {
          if (index < count) {
            gate.classname = gate.classname.replace("none", "").trim();
          } else {
            if (!gate.classname.includes("none")) {
              gate.classname += " none";
            }
          }
        });
      } else {
        this.posts.forEach((post) => {
          this.gates.forEach((gate) => {
            const gateClassname = gate.classname.replace("none", "").trim();
            const matchedIndex = post.items.findIndex(
              (item) =>
                item.item === gateClassname && Array.isArray(item.words),
            );

            if (matchedIndex !== -1) {
              // Restored activity data can contain placeholder items or use a
              // different order, so retain the item's real array position.
              gate.id = matchedIndex + 1;
              gate.classname = gateClassname;
            } else {
              gate.id = null;
              gate.classname = `${gateClassname} none`;
            }
          });
        });
      }

      const count = this.posts[0].items.filter(
        (item) => item.item && item.item !== "" && Array.isArray(item.words),
      ).length;

      this.posts[0].numberOfquestion = count;
      this.posts[0].numberOfTotalQuestion = count;
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

      this.scormStartTime = Date.now();
    },
    openTable(gate) {
      const selectedItem = this.posts[0].items[gate.id - 1];
      if (!gate.id || !selectedItem || !Array.isArray(selectedItem.words)) {
        return;
      }

      box.stop();
      this.answerAudio.pause();
      this.clickAudio.play();
      this.currentPage = 1;
      this.isActive = true;
      this.activeText = null;

      let getId;
      this.gates.forEach((gate) => {
        if (gate.active == true && gate.id) {
          getId = gate.id;
          const previousItem = this.posts[0].items[getId - 1];
          if (previousItem && !previousItem.endTime) {
            previousItem.endTime = this.getQuestionTime();
          }
        }
      });

      this.gates.forEach((gate) => {
        gate.active = false;
      });
      gate.active = true;
      const currentItem = this.posts[0].items[gate.id - 1];
      if (currentItem && !currentItem.startTime) {
        currentItem.startTime = this.getQuestionTime();
      }

      gate.active = true;
      this.gatesOpened = gate.id - 1;
      this.getSlideWords();
      this.removeAllParag();
      this.appendText();

      if (this.posts[0].items[this.gatesOpened].check) {
        if (this.posts[0].LOcorrectcounter == this.posts[0].items.length) {
          this.scormPost();
        }
      } else {
        this.posts[0].LOcorrectcounter += 1;
        this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
        this.posts[0].scoreOutOf10 =
          (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) *
          10;

        this.posts[0].items[this.gatesOpened].check = true;
        !this.soundBG ? this.musicToggle() : "";
        this.scormPost();
        if (!this.isFinalQuestionAttempt()) {
          this.UpdateStudentActivity();
        }
      }
    },
    getSlideWords() {
      const item = this.posts[0].items[this.gatesOpened];
      this.words = item && Array.isArray(item.words) ? item.words : [];
      let startIndex = (this.currentPage - 1) * this.pageSize;
      let endIndex = startIndex + this.pageSize;
      this.wordsActive = this.words.slice(startIndex, endIndex);
      // console.log(this.activeText);
    },
    backHome() {
      this.activeText = null;
      this.clickAudio.play();
      this.isActive = false;
      this.gates.forEach((gate) => {
        gate.active = false;
      });
    },
    musicToggle() {
      this.soundBG = true;
      this.playMusic = !this.playMusic;
      // console.log(this.playMusic);
      this.bgAudio.loop = true;
      this.playMusic ? this.bgAudio.play() : this.bgAudio.pause();
    },

    //drag web
    dragstart(event, word) {
      this.wordSelected = word;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.activeText = null;
      this.removeAllParag();
      event.target.style.opacity = "0.5";
    },
    drag(event) {
      event.target.style.left = event.clientX - this.startX + "px";
      event.target.style.top = event.clientY - this.startY + "px";
    },
    dragend(event, index) {
      const p = document.createElement("p");
      event.target.style.left = "";
      event.target.style.top = "";
      this.dropBox = document.elementFromPoint(event.clientX, event.clientY);
      if (this.dropBox != null) {
        if (this.dropBox.classList.contains("drop")) {
          this.poniterNone = true;
          box.playSegments([0, 100], true);
          this.answerAudio.play();
          p.textContent = this.wordSelected.answer;
          p.classList.add("dropWord");
          this.dropBox.appendChild(p);
          this.activeText = index + this.currentPage * this.pageSize;
        }
      }
      setTimeout(() => {
        this.poniterNone = false;
      }, 2000);
      event.target.style.opacity = "";
    },
    //drag mobile
    touchstart(event, word) {
      this.wordSelected = word;
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
      this.activeText = null;
      this.removeAllParag();
    },
    touchmove(event) {
      event.preventDefault();
      event.target.style.left = event.touches[0].clientX - this.startX + "px";
      event.target.style.top = event.touches[0].clientY - this.startY + "px";
    },
    touchend(event, index) {
      event.preventDefault();
      const p = document.createElement("p");
      event.target.style.top = "";
      event.target.style.left = "";
      this.dropBox = document.elementFromPoint(
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY,
      );
      if (this.dropBox != null) {
        if (this.dropBox.classList.contains("drop")) {
          this.poniterNone = true;
          box.playSegments([0, 100], true);
          this.answerAudio.play();
          // soltanDoor.playSegments([0, 60], true);
          p.textContent = this.wordSelected.answer;
          p.classList.add("dropWord");
          this.dropBox.appendChild(p);
          this.activeText = index + this.currentPage * this.pageSize;
        }
      }
      setTimeout(() => {
        this.poniterNone = false;
      }, 2000);
    },

    removeAllParag() {
      var boxDIV = document.querySelector(".dropWord");
      if (boxDIV != null) {
        boxDIV.remove();
      }
      var activeColor = document.querySelector(".activeColor");
      if (activeColor != null) {
        activeColor.classList.remove("activeColor");
      }

      var divNone = document.querySelector(".noneTranstion");
      if (divNone != null) {
        divNone.remove();
      }
    },
    appendText() {
      var boxDIV = document.querySelector(".drop");
      if (boxDIV != null) {
        const p = document.createElement("p");
        p.textContent = "اسحب هنا الكلمة ";
        p.classList.add("noneTranstion");
        boxDIV.appendChild(p);
      }
    },
    next() {
      this.clickAudio.play();
      this.currentPage += 1;
      this.getSlideWords();
    },
    prev() {
      this.clickAudio.play();
      this.currentPage -= 1;
      this.getSlideWords();
    },
    reSize() {
      // console.log("innerWidth" + window.innerWidth);
      // console.log("innerHeight" + window.innerHeight);
      const aspect = 16 / 9;
      let w = window.innerWidth;
      let h = window.innerHeight;

      if (w / h > aspect) {
        w = h * aspect;
      } else {
        h = w / aspect;
      }

      const app = document.getElementById("glossary");
      if (app) {
        app.style.width = w + "px";
        app.style.height = h + "px";
      }
    },
    UpdateStudentActivity() {
      const currentAttemptScore = this.calculateCurrentAttemptScore();
      this.updateCurrentProgressFeedback(this.posts[0], currentAttemptScore);
      this.updateScormScoreAfterAnswer(currentAttemptScore);
      this.logPostAfterAnswerAttempt();
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
      if (Number.isFinite(minScore)) post.cmi.score.min = minScore;
      const maxScore = Number(persistedCmi.score?.max);
      if (Number.isFinite(maxScore)) post.cmi.score.max = maxScore;
      const scaledScore = Number(persistedCmi.score?.scaled);
      if (Number.isFinite(scaledScore)) post.cmi.score.scaled = scaledScore;

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
      const post = this.posts?.[0];
      if (!post || !post.numberOfquestion) return 0;
      return (post.LOcorrectcounter / post.numberOfquestion) * 100;
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
        [questionCollection || "items"]: questionItems,
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
      return this.posts[0].LOcorrectcounter >= this.posts[0].numberOfquestion;
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
    scormPost() {
      const post = this.posts?.[0];
      if (!post) return;

      let result = this.calculateCurrentAttemptScore();
      const isActivityComplete = post.LOcorrectcounter >= post.numberOfquestion;

      if (isActivityComplete && !this.scormReported) {
        this.scormReported = true;
        post.studentPoint = Number((result / 10).toFixed(1));

        const previousTotalSeconds = this.parseScormTimeToSeconds(
          post.cmi.total_time,
        );
        const currentSessionSeconds = Math.floor(
          (Date.now() - this.scormStartTime) / 1000,
        );
        post.cmi.total_time = this.formatSecondsToScormTime(
          previousTotalSeconds + currentSessionSeconds,
        );
        if (!post.endTime) {
          post.endTime = this.getDate();
        }

        this.applyHighestScormScore(result, {
          updateScaled: true,
          updateStatus: true,
          finalStatus: true,
        });
        this.updateCurrentProgressFeedback(post, result);

        if (this.isScormServiceConnected()) {
          setTimeout(() => {
            try {
              if (typeof window.ScormService.reportResult === "function") {
                window.ScormService.reportResult(result);
              }
            } catch (e) {
              console.error(e);
            }

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
              setTimeout(() => {
                //window.ScormService.finish();
              }, 1000);
            } catch (e) {
              console.error(e);
            }
          }, 1000);
        } else {
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
