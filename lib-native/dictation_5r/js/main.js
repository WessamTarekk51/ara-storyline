var inputValidation = document.querySelector("#Dictation");
var pageUrl = inputValidation.getAttribute("data-urlpage");

let scormConnected = false;
// Resolve shared libraries from this script, independently of the activity HTML.
const scormLibraryBase = new URL("../../../js/", document.currentScript.src);
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
  el: "#Dictation",
  data: {
    posts: [
      {
        LOcorrectcounter: 0,
        counterCorrect: 0,
        loTargets: null,
        numberOfquestion: null,
        start: false,
        show_info_content: false,
        screen_content: false,
        keybord: [""],
        kebord_active: false,
        info_start: [""],
        info_content: "",
        countItem: 0,
        count_true: "",
        active_next: false,
        sound_play_word: "",
        title_endScreen: "",
        partArray: [],
        evaluation: "",
        language: true,
        comparison_player: [
          {
            originalWord: "",
            doWord: "",
            resultWord: null,
            answerShow: false,
            startTime: "",
            endTime: "",
          },
        ],
        // --------------------------------------------------------
        id: "",
        subjectId: "",
        conceptId: "",
        unitId: "",
        lessonId: "",
        title: "",
        keywords: "",
        learningObjectives: "",
        BloomLevels: [],
        type: "",
        loDegree: null,
        UserDegree: null,
        SubType: "Input",
        startTime: "",
        endTime: "",
        // --------------------------------------------------------
      },
    ],
    // --------------------------------------------------------
    isLoaded: false,
    isSuccess: false,
    activityId: 0,
    dataLoaded: false,
    currentdate: "",
    data: null,
    scormStartTime: null,
    scormReported: false,
    numberOfAttemptInitialized: false,
    previousScormScore: 0,
    // --------------------------------------------------------
  },

  async mounted() {
    await scormReady;
    await this.getData();
    // this.getUnits();
  },
  created() {
    window.addEventListener("keydown", this.handleKeyDown);
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
        // let data;
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
              restoredPost?.cmi?.score?.raw
            );
            this.posts[0] = jsonData;
            this.dataLoaded = true;

            // ((this.posts[0] = jsonData), (this.dataLoaded = true))
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
      !this.dataloaded
        ? fetch(pageUrl + ".json")
          .then((res) => res.json())
          .then((data) => {
            // resData = data
            this.posts = data;
            this.posts[0].partArray = this.posts[0].info_content
              .trim()
              .split(" ");
            const arrayWatch = [];
            this.posts[0].partArray.map(function (element, i) {
              var comparison_player = {};
              comparison_player.originalWord = element;
              comparison_player.doWord = "";
              comparison_player.resultWord = null;
              comparison_player.answerShow = false;
              comparison_player.startTime = "";
              comparison_player.endTime = "";
              // --------------------------------------------------------
              comparison_player.numberOfTrial = 0;
              comparison_player.questionlevel = 0;
              comparison_player.questionType = "text";
              comparison_player.answersType = "text";
              comparison_player.BloomLevel = 1;
              // --------------------------------------------------------
              arrayWatch.push(comparison_player);
            });
            this.posts[0].comparison_player = arrayWatch;
            this.posts[0].numberOfquestion = this.posts[0].partArray.length;
          })
        : "";
      this.posts.length != 0
        ? setTimeout(() => {
          this.isLoaded = true;
          this.posts[0].startTime = this.getDate();

          // ---------------------- SCORM restore ----------------------
          this.posts[0].LOcorrectcounter ??= 0;
          this.posts[0].counterCorrect ??= 0;
          this.posts[0].count_true ??= 0;
          this.posts[0].studentPoint ??= 0;
          this.posts[0].scoreOutOf10 ??= 0;
          if (!this.posts[0].cmi) {
            this.posts[0].cmi = {
              completion_status: "unknown",
              success_status: "unknown",
              total_time: "00:00:00",
              score: { raw: 0, min: 0, max: 100, scaled: 0 },
            };
          }
          if (!this.posts[0].studentProgress) {
            this.posts[0].studentProgress = {
              infoDetails: { info: { id: null, status: null, timestamp: null } },
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
        }, 1000)
        : (this.isLoaded = false);
      // this.posts = resData;
    },
    // getUnits: function () {
    //   const loading = document.getElementById("loading");
    //   loading.classList.add("none");
    // },

    play_effect: function () {
      const answer_player_screen = document.getElementById("answer_player");
      const keybord_active = document.getElementById("keybord_control");
      const keybord_active_screen = document.getElementById("t_key");
      const deActive2 = document.getElementById("infoScreen");
      if (innerHeight > innerWidth) {
        setTimeout(() => {
          deActive2.classList.remove("disabled");
          answer_player_screen.classList.add("active");
          answer_player.playSegments([0, 45], true);
        }, 1000);
        setTimeout(() => {
          keybord_active.classList.add("active");
          keybord_active_screen.classList.add("active");
        }, 2500);
        setTimeout(() => {
          this.sound_word();
        }, 4000);
      } else {
        deActive2.classList.remove("disabled");
        answer_player_screen.classList.add("active");
        answer_player.playSegments([0, 45], true);
        setTimeout(() => {
          keybord_active.classList.add("active");
          keybord_active_screen.classList.add("active");
        }, 2000);
        setTimeout(() => {
          answer_player_screen.classList.add("activeKey");
          this.sound_word();
        }, 4000);
      }
    },

    clickstart() {
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
      this.posts[0].start = true;
      this.posts[0].show_info_content = true;
      infoScreen.playSegments([0, 80], true);
      const deActive = document.getElementById("content_active");
      const deActive_bg = document.querySelectorAll(".first_bg");
      deActive_bg.forEach((deActive) => {
        deActive.classList.add("none");
      });

      setTimeout(() => {
        deActive.classList.remove("none");
      }, 1000);
      /**/
      var ply = document.getElementById("audio");
      document.getElementById("audio").setAttribute("autoplay", "auto");
      var new_audio = "./audio/hint/click_btn.mp3";
      ply.src = new_audio;
      /**/
      finalResponse.submitData(
        JSON.stringify(this.posts),
        1,
        this.posts[0].counterCorrect
      );
    },

    click_show_info_content: function () {
      this.posts[0].show_info_content = false;
      const timerElement = document.getElementById("timing");
      const deActive = document.getElementById("content_active");
      let timer;
      let change = this.posts[0];
      animation_play = false;

      if (!this.posts[0].active_next) {
        this.posts[0].active_next = true;
        this.posts[0].info_start = "";
        const message = this.posts[0].info_content;
        const typingPromises = (message, timeout) =>
          [...message].map(
            (ch, i) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(message.substring(0, i + 1));
                }, timeout * i);
              })
          );

        typingPromises(message, 140).forEach((promise) => {
          promise.then((portion) => {
            document.getElementById("timeTest").innerHTML = portion;
          });
        });

        function startTimeCountDown() {
          var str = JSON.stringify(change.info_content);
          const numWords = str.trim().split(/\s+/).length;
          timer = numWords;
          const timeCountdown = setInterval(() => countdown(), 1000);
        }

        function countdown() {
          if (timer == 0) {
            timerElement.classList.add("disabled");
            clearTimeout(timer);
          } else {
            timerElement.innerHTML = timer;
            timer--;
          }
          if (timer == 0 && animation_play == false) {
            animation_play = true;
            setTimeout(() => {
              innerHeight > innerWidth
                ? infoScreen.playSegments([80, 0], true)
                : false;
              deActive.classList.add("none");
              const answer_player_screen =
                document.getElementById("answer_player");
              const keybord_active = document.getElementById("keybord_control");
              const keybord_active_screen = document.getElementById("t_key");
              const deActive2 = document.getElementById("infoScreen");
              if (innerHeight > innerWidth) {
                setTimeout(() => {
                  deActive2.classList.remove("disabled");
                  answer_player_screen.classList.add("active");
                  answer_player.playSegments([0, 45], true);
                }, 1000);
                setTimeout(() => {
                  keybord_active.classList.add("active");
                  keybord_active_screen.classList.add("active");
                }, 2500);
              } else {
                deActive2.classList.remove("disabled");
                answer_player_screen.classList.add("active");
                answer_player.playSegments([0, 45], true);
                setTimeout(() => {
                  keybord_active.classList.add("active");
                  keybord_active_screen.classList.add("active");
                }, 2000);
              }
            }, 1000);
            setTimeout(() => {
              countItem_2 = 1;
              var ply = document.getElementById("audio");
              var keybord_control = document.getElementById("keybord_control");
              document.getElementById("audio").setAttribute("autoplay", "auto");
              const answer_player_screen =
                document.getElementById("answer_player");
              var oldSrc = ply.src;
              if (keybord_control.classList.contains("disable")) {
                var new_audio = "./audio/hint/a100.mp3";
              } else {
                var new_audio = "./audio/hint/a" + countItem_2 + ".mp3";
              }
              ply.src = new_audio;
              change.comparison_player[0].startTime =
                new Date().toLocaleTimeString();
              // console.log(change.comparison_player[0].startTime);
              answer_player_screen.classList.add("activeKey");
            }, 4000);
          }
        }
        startTimeCountDown();
      } else {
        deActive.classList.add("none");
        if (animation_play == false) {
          animation_play = true;
          innerHeight > innerWidth
            ? infoScreen.playSegments([80, 0], true)
            : infoScreen.playSegments([45, 45], true);
        }

        this.play_effect();
      }
    },
    /**/

    answer_player_letter: function (event, parag) {
      this.posts[0].comparison_player[this.posts[0].countItem].doWord += parag;
      length_doWord =
        this.posts[0].comparison_player[this.posts[0].countItem].doWord.length;
      length_originalWord =
        this.posts[0].comparison_player[this.posts[0].countItem].originalWord
          .length;
      this.posts[0].language = "Ara";

      if (length_doWord == length_originalWord + 2) {
        this.remove_letter();
      }

      const boxes = document.querySelectorAll(".show_hint");
      boxes.forEach((box) => {
        box.classList.add("none");
      });
    },

    handleKeyDown(event) {
      el = event.key;
      merged = this.posts[0].keybord;
      event.key ? event.preventDefault() : conaole.log();
      if (
        document.getElementById("answer_player").classList.contains("activeKey")
      ) {
        if (merged.includes(el)) {
          this.posts[0].comparison_player[this.posts[0].countItem].doWord +=
            event.key;
          length_doWord =
            this.posts[0].comparison_player[this.posts[0].countItem].doWord
              .length;
          length_originalWord =
            this.posts[0].comparison_player[this.posts[0].countItem]
              .originalWord.length;
          this.posts[0].language = true;
          if (length_doWord == length_originalWord + 2) {
            this.remove_letter();
            this.posts[0].language = true;
          }
        } else if (event.keyCode == 8) {
          this.remove_letter();
          this.posts[0].language = true;
        } else if (event.which == 13 || event.which == 32) {
          this.answer_click();
          this.posts[0].language = true;
        } else if (
          event.which == 18 ||
          event.which == 16 ||
          event.which == 17 ||
          event.which == 27
        ) {
          event.preventDefault();
        } else {
          function checkRTL(event) {
            var ltrChars =
              "A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF" +
              "\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF",
              rtlChars = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC",
              rtlDirCheck = new RegExp(
                "^[^" + ltrChars + "]*[" + rtlChars + "]"
              );

            return rtlDirCheck.test(el);
          }
          var isRTL = checkRTL(String.fromCharCode(el.charCode));
          this.posts[0].language = isRTL;
        }
      } else {
        event.preventDefault();
      }
      const boxes = document.querySelectorAll(".show_hint");
      boxes.forEach((box) => {
        box.classList.add("none");
      });
    },
    // ============================ SCORM ============================
    calculateCurrentAttemptScore() {
      const post = this.posts?.[0];
      if (!post || !post.numberOfquestion) return 0;
      const correct = Number(post.count_true) || 0;
      return (correct / post.numberOfquestion) * 100;
    },
    isFinalWordAttempt() {
      const post = this.posts?.[0];
      if (!post || !Array.isArray(post.partArray) || post.partArray.length === 0) {
        return false;
      }
      return Number(post.countItem) >= post.partArray.length - 1;
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

      const wordItems = (post.comparison_player || []).map((word) => ({
        originalWord: word.originalWord ?? "",
        resultWord: word.resultWord ?? false,
        answerShow: word.answerShow ?? false,
        numberOfTrial: word.numberOfTrial ?? 0,
        startTime: word.startTime ?? "",
        endTime: word.endTime ?? "",
      }));

      const qaObject = {
        loDegree: post.loDegree,
        numberOfquestion: post.numberOfquestion,
        count_true: post.count_true,
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
        words: wordItems,
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
      const isActivityComplete = this.isFinalWordAttempt();

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
        ? globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])
        : "";
    },
    answer_click: function () {
      let index = this.posts[0].countItem;
      let doWord = this.posts[0].comparison_player[index].doWord
        .toString()
        .trim();
      originalWord = this.posts[0].comparison_player[index].originalWord
        .toString()
        .trim();
      this.posts[0].language = "Ara";

      Verification = doWord == originalWord;
      if (doWord == "") {
        doWord = ".....";
      }
      this.posts[0].comparison_player[index].doWord = doWord;
      this.posts[0].comparison_player[index].resultWord = Verification;
      this.posts[0].comparison_player[index].answerShow = true;
      if (Verification) {
        this.posts[0].count_true++;
        this.posts[0].LOcorrectcounter = this.posts[0].count_true

        let result =
          (this.posts[0].count_true / this.posts[0].numberOfquestion) * 100;

        this.posts[0].counterCorrect =
          result == 0
            ? 0
            : result <= 25
              ? 2.5
              : result <= 50
                ? 5
                : result <= 75
                  ? 7.5
                  : 10;

        this.posts[0].endTime = this.getDate();


      }else{
        this.posts[0].LOcorrectcounter = this.posts[0].count_true;
        let result =
        (this.posts[0].count_true / this.posts[0].numberOfquestion) * 100;

      this.posts[0].counterCorrect =
        result == 0
          ? 0
          : result <= 25
          ? 2.5
          : result <= 50
          ? 5
          : result <= 75
          ? 7.5
          : 10;

      this.posts[0].endTime = this.getDate();

        this.posts[0].comparison_player[index].numberOfTrial = 1;
    
      }
      finalResponse.submitData(
        JSON.stringify(this.posts),
        1,
        this.posts[0].counterCorrect
      );
      if (this.posts[0].partArray.length - 1 == this.posts[0].countItem) {
        const keybord_active = document.getElementById("keybord_control");
        const keybord_active_screen = document.getElementById("t_key");
        const endScreen_active = document.getElementById("endScreen");
        const evaluation_progress = document.getElementById(
          "evaluation_progress"
        );
        const answer_player_screen = document.getElementById("answer_player");
        const finsh = document.getElementById("finshed");
        const finsh_but = document.getElementById("finshed_but");
        keybord_active.classList.add("disable");
        answer_player_screen.classList.remove("activeKey");
        this.sound_word();
        this.posts[0].comparison_player[index].endTime =
          new Date().toLocaleTimeString();
        // console.log(this.posts[0].comparison_player[index].endTime);
        setTimeout(() => {
          keybord_active.classList.add("none");
          keybord_active_screen.classList.add("none");
          endScreen_active.classList.add("active");
          evaluation_progress.classList.add("active");
        }, 1000);
        const percent = Math.round(
          (this.posts[0].count_true / this.posts[0].partArray.length) * 100
        )
          .toString()
          .trim();
        if (percent >= 85) {
          this.posts[0].evaluation = "يفوق التوقعات";
          setTimeout(() => {
            progressBar.playSegments([0, 45], true);
          }, 1000);

          setTimeout(() => {
            answer_player.playSegments([80, 0], true);
            endScreen_active.classList.remove("active");
            keybord_active_screen.classList.remove("active");
            answer_player_screen.classList.add("none");
            finsh.classList.add("active");
            const deActive_bg = document.querySelectorAll(".first_bg");
            deActive_bg.forEach((deActive) => {
              deActive.classList.remove("none");
            });
          }, 8000);
          setTimeout(() => {
            finshed.playSegments([0, 20], true);
          }, 9000);
          setTimeout(() => {
            finsh_but.classList.add("active");
          }, 10000);
          finalResponse.submitData(
            JSON.stringify(this.posts),
            4,
            this.posts[0].counterCorrect
          );
        } else {
          if (percent <= 84 && percent > 65) {
            setTimeout(() => {
              progressBar.playSegments([0, 38], true);
            }, 1000);
            this.posts[0].evaluation = "جيد";
          } else if (percent <= 65 && percent >= 50) {
            this.posts[0].evaluation = "مقبول";
            setTimeout(() => {
              progressBar.playSegments([0, 29], true);
            }, 1000);
          } else if (percent < 50 && percent > 0) {
            this.posts[0].evaluation = "ضعيف";
            setTimeout(() => {
              progressBar.playSegments([0, 23], true);
            }, 1000);
          } else if (percent == 0) {
            this.posts[0].evaluation = "ضعيف";
            setTimeout(() => {
              progressBar.playSegments([0, 1], true);
            }, 1000);
          }
        
        }
        this.scormPost();
      } else {
        this.posts[0].countItem++;
        this.sound_word();
        this.posts[0].comparison_player[index].endTime =
          new Date().toLocaleTimeString();
        // console.log(this.posts[0].comparison_player[index].endTime);

        this.UpdateStudentActivity();
      }
    },

    click_letter: function (event, index) {
      const boxes = document.querySelectorAll(".show_hint");
      boxes.forEach((box) => {
        box.classList.add("none");
      });
      event.target.classList.remove("none");
      event.target.classList.add("show_hint");
    },

    remove_letter: function () {
      let arr = [];
      arr = this.posts[0].comparison_player[this.posts[0].countItem].doWord
        .toString()
        .trim()
        .split("");
      arr.splice(-1, 1);
      this.posts[0].comparison_player[this.posts[0].countItem].doWord =
        arr.join("");
      this.posts[0].language = "Ara";
    },

    sound_word: function () {
      countItem_2 = this.posts[0].countItem + 1;
      var ply = document.getElementById("audio");
      var keybord_control = document.getElementById("keybord_control");
      document.getElementById("audio").setAttribute("autoplay", "auto");
      var oldSrc = ply.src;
      if (keybord_control.classList.contains("disable")) {
        var new_audio = "./audio/hint/a100.mp3";
      } else {
        var new_audio = "./audio/hint/a" + countItem_2 + ".mp3";
        this.posts[0].comparison_player[countItem_2 - 1].startTime =
          new Date().toLocaleTimeString();
        // console.log(this.posts[0].comparison_player[countItem_2 - 1].startTime);
        // console.log(this.posts[0].comparison_player);
      }
      ply.src = new_audio;

      // let audio = document.querySelector('audio');
      // let playSoundimg = document.querySelector('.sound_repeat');
      // if (audio.paused && playSoundimg.classList.contains("paused")) {
      //     audio.pause();
      //     playSoundimg.classList.remove("paused");
      // } else {
      //     audio.play();
      //     playSoundimg.classList.add("paused");

      // }
      // audio.onended = function() {
      //     playSoundimg.classList.remove("paused");
      // };
    },

    reload: function () {
      window.location.reload();
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
