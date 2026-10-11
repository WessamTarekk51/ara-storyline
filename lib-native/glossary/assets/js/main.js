let soltan = document.querySelector("#glossary");
let pageUrl = soltan.getAttribute("data-urlpage");

let scormConnected = false;
// Resolve shared libraries from this script, independently of the activity HTML.
// glossary's main.js lives one folder deeper (assets/js), so climb four levels.
const scormLibraryBase = new URL("../../../../js/", document.currentScript.src);
const scormReady = (async function () {
  function loadScormScript(filename) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error("SCORM script load timed out: " + filename));
      }, 10000);
      script.src = new URL(filename, scormLibraryBase).href;
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error("SCORM script load failed: " + filename));
      };
      document.head.appendChild(script);
    });
  }

  try {
    if (!window.ScormService) {
      if (!window.pipwerks || !window.pipwerks.SCORM) {
        await loadScormScript("scorm.js");
      }
      await loadScormScript("scorm-lo.js");
    }
    scormConnected = !!window.ScormService.init();
  } catch (e) {
    // Keep the activity available when SCORM libraries or the LMS are unavailable.
    console.error("ScormService init error:", e);
  }
})();

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
    data: null,
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
    this.Resize();
    window.addEventListener("resize", this.Resize);
    await scormReady;
    await this.getData();
    this.bgAudio.src = "../../../lib-native/glossary/assets/audio/bgAudio.mp3";
    this.clickAudio.src =
      "../../../lib-native/glossary/assets/audio/clickAudio.mp3";
    this.answerAudio.src =
      "../../../lib-native/glossary/assets/audio/answerAudio.mp3";
    const environment = this.posts[0].environment;
    const linkTag = document.createElement("link");
    linkTag.rel = "stylesheet";
    linkTag.href = `../../../lib-native/glossary/assets/environment/${environment}/images.css`;
    environment ? document.head.appendChild(linkTag) : false;
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
            restoredPost = Array.isArray(jsonData) ? jsonData[0] : jsonData;
            this.previousScormScore = this.normalizeScormScore(
              restoredPost?.cmi?.score?.raw
            );
            this.posts[0] = jsonData;
            this.posts[0].LOcorrectcounter = 0;
            this.posts[0].counterCorrect = 0;
            this.posts[0].items.forEach((item) => {
              item.check = false;
            });
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
      this.posts.length != 0
        ? setTimeout(() => {
            this.isLoading = true;
          }, 1000)
        : (this.isLoading = false);
      this.posts[0].startTime = this.getDate();

      this.posts.forEach((post) => {
        let newId = 1;
        this.gates.forEach((gate) => {
          const matched = post.items.find(
            (item) => item.item === gate.classname
          );
          if (matched) {
            gate.id = newId++;
            gate.classname = gate.classname.replace("none", "").trim();
          } else {
            // console.log("else matched");
            if (!gate.classname.includes("none")) {
              gate.classname = "";
              gate.classname += " none";
            }
            post.items.push({
              item: gate.classname.replace(" none", "").trim(),
            });
          }
        });
      });

      const count = this.posts[0].items.filter(
        (item) => item.item && item.item !== ""
      ).length;

      this.posts[0].numberOfquestion = count;

      // ---------------------- SCORM restore ----------------------
      this.posts[0].LOcorrectcounter ??= 0;
      this.posts[0].counterCorrect ??= 0;
      this.posts[0].studentPoint ??= 0;
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
      const post = this.posts[0];
      this.restorePersistedCmi(post, restoredPost);
      this.restoreScormServiceStatus(post);
      this.initializeNumberOfAttempt(post, restoredPost);
      this.scormStartTime = Date.now();
      // ----------------------------------------------------------
    },
    openTable(gate) {
      box.stop();
      this.answerAudio.pause();
      this.clickAudio.play();
      this.currentPage = 1;
      this.isActive = true;
      this.activeText = null;

      let getId;
      this.gates.forEach((gate) => {
        gate.active == true
          ? [
              (getId = gate.id),
              (this.posts[0].items[getId - 1].endTime = this.getDate()),
            ]
          : "";
      });

      this.gates.forEach((gate) => {
        gate.active = false;
      });
      gate.active = true;
      this.posts[0].items[gate.id - 1].startTime = this.getDate();

      gate.active = true;
      this.gatesOpened = gate.id - 1;
      this.getSlideWords();
      this.removeAllParag();
      this.appendText();
      this.posts[0].endTime = this.getDate();
      if (this.posts[0].items[this.gatesOpened].check) {
      } else {
        this.posts[0].LOcorrectcounter += 1;
        this.posts[0].counterCorrect =
          (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) *
          10;
        this.posts[0].items[this.gatesOpened].check = true;
        !this.soundBG ? this.musicToggle() : "";
      }

      if (this.isGlossaryComplete() && !this.scormReported) {
        this.posts[0].endTime = this.getDate();
        this.scormPost();
      } else {
        this.UpdateStudentActivity();
      }
    },
    getSlideWords() {
      this.words = this.posts[0].items[this.gatesOpened].words;
      let startIndex = (this.currentPage - 1) * this.pageSize;
      let endIndex = startIndex + this.pageSize;
      this.wordsActive = this.words.slice(startIndex, endIndex);
      // console.log(this.activeText);
    },
    backHome() {
      this.activeText = null;
      this.clickAudio.play();
      this.isActive = false;
      this.posts[0].endTime = this.getDate();
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
        event.changedTouches[0].clientY
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
    Resize() {
      const glossaryContent = document.getElementById("glossaryContent");
      const width = window.innerWidth;
      const height = window.innerHeight;
      glossaryContent.style.width = (height / 2) * 3 + "px";
      glossaryContent.style.height = height + "px";
      // if (height < width || height / width < 1.5) {
      //   console.log("1")
      //   glossaryContent.style.width = (height / 2) * 3 + "px";
      //   glossaryContent.style.height = height + "px";
      // } else if (width < height || width / height < 1.5) {
      //   console.log("2")
      //   glossaryContent.style.width = width + "px";
      //   glossaryContent.style.height = (width / 3) * 2 + "px";
      // }
    },
    // ============================ SCORM ============================
    calculateCurrentAttemptScore() {
      const post = this.posts?.[0];
      if (!post || !post.numberOfquestion) return 0;
      return (post.LOcorrectcounter / post.numberOfquestion) * 100;
    },
    isGlossaryComplete() {
      const post = this.posts?.[0];
      if (!post) return false;
      const total = Number(post.numberOfquestion);
      if (!Number.isFinite(total) || total <= 0) return false;
      return Number(post.LOcorrectcounter) >= total;
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
    isScormCloudEnvironment() {
      return window.location.hostname.includes("cloud.scorm");
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
        this.normalizeScormScore(currentAttemptScore)
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

      if (options.markIncomplete && post.cmi.completion_status === "unknown") {
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
          this.normalizeScormScore(window.ScormService.getBestScore())
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
        restoredPost?.NumberOfAttempt ?? post.NumberOfAttempt
      );
      post.NumberOfAttempt =
        Number.isFinite(previousAttemptCount) && previousAttemptCount >= 0
          ? Math.floor(previousAttemptCount) + 1
          : 1;
      this.numberOfAttemptInitialized = true;
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
            Number(hhmmss[1]) * 3600 + Number(hhmmss[2]) * 60 + Number(hhmmss[3])
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
    logQaMetadata(post) {
      if (this.isScormCloudEnvironment()) return;

      const gateItems = (post.items || []).map((item) => ({
        item: item.item ?? "",
        check: item.check ?? false,
        startTime: item.startTime ?? "",
        endTime: item.endTime ?? "",
      }));

      const qaObject = {
        loDegree: post.loDegree,
        numberOfquestion: post.numberOfquestion,
        LOcorrectcounter: post.LOcorrectcounter,
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
        items: gateItems,
        studentProgress: post.studentProgress,
      };

      console.log(qaObject);
    },
    logScormCloudSummary() {
      if (!this.isScormCloudEnvironment()) return;

      const cmi = this.posts[0].cmi;
      console.log(
        `Score: ${cmi.score.raw} | Completion: ${cmi.completion_status} | Success: ${cmi.success_status}`
      );
    },
    logPostAfterFinalFeedback() {
      if (this.isScormCloudEnvironment()) {
        this.logScormCloudSummary();
      } else {
        this.logQaMetadata(this.posts[0]);
      }
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
      const isActivityComplete = this.isGlossaryComplete();

      if (isActivityComplete && !this.scormReported) {
        this.scormReported = true;
        this.posts[0].studentPoint = Number((result / 10).toFixed(1));
        const previousTotalSeconds = this.parseScormTimeToSeconds(
          this.posts[0].cmi.total_time
        );
        const currentSessionSeconds = Math.floor(
          (Date.now() - this.scormStartTime) / 1000
        );
        this.posts[0].cmi.total_time = this.formatSecondsToScormTime(
          previousTotalSeconds + currentSessionSeconds
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
    // ==============================================================
    UpdateStudentActivity() {
      this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());
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
