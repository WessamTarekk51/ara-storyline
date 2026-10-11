const digitalScreen = document.querySelector("#digital-screen");
const pageUrl = digitalScreen.getAttribute("data-urlpage");

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
    zokiStatus: false,
    answer: [],
    showAnswers: [],
    // test: 0,
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
    // --------------------------------------------------------
  },

  create() {},
  async mounted() {
    if (
      !window.location.hostname.includes(
        "127.0.0.1" || "stblobstrgeaccount.blob.core.windows.net"
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
    this.bgAudio.src =
      "../../../lib-native/digital-screen/assets/audio/music.mp3";
    this.wrongAnswer.src =
      "../../../lib-native/digital-screen/assets/audio/wronganswer.mp3";
    this.rightAnswer.src =
      "../../../lib-native/digital-screen/assets/audio/rightanswer.mp3";
    // this.robotsSound.src =
    //   "../../../lib-native/digital-screen/assets/audio/comedy.mp3";
    this.clickBtn.src =
      "../../../lib-native/digital-screen/assets/audio/click_btn.mp3";
    this.startBtn.src =
      "../../../lib-native/digital-screen/assets/audio/startclick2.mp3";
    this.zokiBoring.src =
      "../../../lib-native/digital-screen/assets/audio/knock-knock.mp3";
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

    getData: async function () {
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

      checkQuestions() ? (this.loQuestions = this.posts[0].items.length) : "";
      let params = getURLParameters();
      if (params.numberOfQuestions) {
        this.posts[0].upper = params.upper;
        this.posts[0].isEng = params.lang;
        this.posts[0].numberOfquestion = params.numberOfQuestions;
        this.loQuestions = params.numberOfQuestions;
        this.posts[0].hint = params.hint;
        this.posts[0].questionAudio = params.questionAudio;
      }
      this.upper = this.posts[0].upper;
      this.isEng = this.posts[0].isEng;
    },

    muteMusic() {
      this.bgMusic = !this.bgMusic;
      this.bgAudio.loop = true;
      this.bgAudio.paused ? this.bgAudio.play() : this.bgAudio.pause();
    },

    isAllQuestionsRight() {
      this.posts[0].endTime = this.posts[0].items[this.counter].endTime =
        this.getDate();
      this.posts[0].LOcorrectcounter += 1;

      this.finished();

      this.reset();
      this.zokiStatus = true;
      this.rightAnswer.play();
      zokicharecter.playSegments([65, 80], true);
      document.querySelector(".check.hand")?.classList.remove("display");
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".check.hand")?.classList.add("hide");
      document.querySelector(".check-button")?.classList.add("disable");
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      document.querySelector(".next-button")?.classList.add("hide");
      setTimeout(() => {
        this.playtransition();
      }, 3000);
      setTimeout(() => {
        this.reset();
        this.feedback = !this.question;
        zokicharecter.playSegments([0, 30], true);
        // this.question = true;
        this.nextQuestion();
        this.calculate();
      }, 5500);
    },
    // Remove wrong style ...
    home() {
      location.reload();
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
      setTimeout(() => {
        document.querySelector(".information")?.classList.remove("disable");
      }, 4500);
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
      this.zokiBoring.pause();
      clearTimeout(this.setTimeOut);
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
      // this.clickBtn.play();
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      document.querySelector(".check-button")?.classList.add("disable");
      this.zokiStatus = false;
      this.reset();
      this.posts[0].endTime = this.posts[0].items[this.counter].endTime =
        this.getDate();
      setTimeout(() => {
        this.playtransition();
      }, 1500);

      setTimeout(() => {
        zokicharecter.playSegments([0, 30], true);
        this.next();
      }, 3500);
    },

    next() {
      this.firstQ += 1;
      this.calculate();
      // this.clickBtn.play();
      // this.question = true;
      this.nextQuestion();
      document.querySelector(".next.hand")?.classList.remove("display");
      document.querySelector(".next-button")?.classList.add("hide");
      this.reset();
    },

    start() {
      this.startBtn.play();
      this.posts[0].LOcorrectcounter = 0;
      this.startLo = true;
      this.muteMusic();
      this.addFont();
      if (this.posts[0].informationLO != "") {
        setTimeout(() => {
          this.showInformation();
        }, 500);
      } else {
        // console.log("addstyle");
        document.querySelectorAll(".information").forEach((el) => {
          el.style.display = "none";
        });
        setTimeout(() => {
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
            // console.log(this.screenClick)
            if (this.screenClick == Math.floor(this.sec)) {
              setTimeout(() => {
                this.zokiBoring.loop = true;
                this.zokiBoring.play();
                zokicharecter.playSegments([30, 60], true);
              }, 150);

              if (!this.question) {
                this.setTimeOut = setTimeout(() => {
                  if (this.posts[0].questionAudio) {
                    this.qSound.play();
                  }
                  this.screenClick = 0;
                  this.zokiBoring.pause();
                }, 10000);
              }
            }
          }, 1000);
          setTimeout(() => {
            document.querySelectorAll(".zoki").forEach((el) => {
              el.classList.add("display");
            });
            document.querySelectorAll(".transition").forEach((el) => {
              el.classList.add("addGear");
            });
          }, 1000);
          document.querySelectorAll(".zoki").forEach((el) => {
            el.classList.add("display");
          });
          document.querySelectorAll(".transition").forEach((el) => {
            el.classList.add("addGear");
          });
        }, 500);
      }

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
      document.querySelectorAll(".transition").forEach((element) => {
        element.classList.add("active");
      });
      const progressBar = document.querySelector("#progressbar");
      const stars = document.querySelector("#stars");
      if (this.posts[0].upper) {
        progressBar.classList.add("active");
      } else {
        stars.classList.add("active");
      }

      document.querySelectorAll(".question.active input").forEach((el, i) => {
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
      zokicharecter.playSegments([0, 30], true);
      this.qSound.pause();
      // document
      //   .querySelector(".display-answer-button")
      //   ?.classList.remove("disable");
      // document.querySelector(".check-button")?.classList.remove("disable");
      document.querySelector(".next-button")?.classList.add("hide");
      this.answers = [];
      this.showAnswers = [];
      this.zokiStatus = false;
      this.border = document.getElementsByClassName("screen-question");
      // document.querySelector(".check.hand")?.classList.remove("hide");
      this.counter += 1;
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
        this.questionSound(this.zokiStatus);

        this.posts[0].items.forEach((element) => {
          element.active = false;
        });

        this.posts[0].items[this.counter].active = true;
        this.activeQuestion = this.posts[0].items[this.counter];

        if (this.posts[0].items[this.counter].active) {
          this.posts[0].items[this.counter].startTime = this.getDate();
        }
      } else {
        this.feedback = this.question = true;
        this.bgAudio.pause();
        this.zokiBoring.volume = 0
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
          // console.log(this.screenClick)
          if (this.screenClick == Math.floor(this.sec)) {
            setTimeout(() => {
              this.zokiBoring.loop = true;
              this.zokiBoring.play();
              zokicharecter.playSegments([30, 60], true);
            }, 150);

            if (!this.question) {
              this.setTimeOut = setTimeout(() => {
                if (this.posts[0].questionAudio) {
                  this.qSound.play();
                }
                this.screenClick = 0;
                this.zokiBoring.pause();
              }, 10000);
            }
          }
        }, 1000);
      }
    },

    calculate() {
      this.Estimation = calculate(
        this.result,
        this.loQuestions,
        this.isEng,
        this.upper
      )[0];
      this.finalProgress = calculate(
        this.result,
        this.loQuestions,
        this.isEng,
        this.upper
      )[1];
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
          // console.log(this.screenClick)
          if (this.screenClick == Math.floor(this.sec)) {
            setTimeout(() => {
              this.zokiBoring.loop = true;
              this.zokiBoring.play();
              zokicharecter.playSegments([30, 60], true);
            }, 150);

            if (!this.question) {
              this.setTimeOut = setTimeout(() => {
                if (this.posts[0].questionAudio) {
                  this.qSound.play();
                }
                this.screenClick = 0;
                this.zokiBoring.pause();
              }, 10000);
            }
          }
        }, 1000);
        setTimeout(() => {
          document.querySelectorAll(".zoki").forEach((el) => {
            el.classList.add("display");
          });
          document.querySelectorAll(".transition").forEach((el) => {
            el.classList.add("addGear");
          });
        }, 1000);
      } else {
        this.questionSound(this.zokiStatus);
      }
      setTimeout(() => {
        document.querySelector(".information")?.classList.remove("disable");
      }, 1500);
    },

    finished() {
      let result =
        (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) * 100;
      // console.log(result);
      this.posts[0].counterCorrect =
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
        (this.posts[0].counterCorrect * 4) / 10,
        this.posts[0].counterCorrect
      );
    },

    clickInput(event) {
      document.querySelector(".help.hand")?.classList.remove("display");
      this.clickBtn.play();
      zokicharecter.playSegments([0, 30], true);
      this.reset();
      this.questionSound(this.zokiStatus);
      document
        .querySelector(".display-answer.hand")
        ?.classList.remove("display");
      document.querySelector(".help.hand.display")?.classList.remove("display");
    },
    changeValue() {
      // this.clickBtn.play();
      document.querySelector(".check.hand")?.classList.add("display");
      document.querySelector(".check-button")?.classList.remove("disable");
      this.checkHand = true;
    },
    checkanswer() {
      document.querySelector(".check.hand")?.classList.remove("display");
      this.reset();
      this.clickBtn.play();
      this.checkHand = false;
      clearInterval(this.setInterval);
      numOfInput(this.activeQuestion);
      let Success = checkInputALL(this.activeQuestion, this.isEng, this.upper);
      document.querySelector(".check-button")?.classList.add("disable");
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
      document
        .querySelector(".display-answer-button")
        ?.classList.add("disable");
      this.isAllQuestionsFalse();
      this.UpdateStudentActivity();
      zokicharecter.playSegments([0, 30], true);
    },
    maxLength(event) {
      maxLength(
        event,
        this.activeQuestion,
        this.posts[0].isEng,
        this.posts[0].upper
      );
    },
    trueAnswer() {
      document.querySelector(".information")?.classList.add("disable");
      this.posts[0].items[this.counter].numberOfTrial = 0;
      this.isAllQuestionsRight();
      this.result += 1;
      this.UpdateStudentActivity();
    },
    falseAnswer() {
      document
        .querySelector(".display-answer-button")
        ?.classList.remove("disable");
      document.querySelector(".display-answer.hand")?.classList.add("display");

      this.wrongAnswer.play();
      zokicharecter.playSegments([95, 110], true);
      this.posts[0].items[this.counter].numberOfTrial = 1;
    },
    UpdateStudentActivity() {
      this.posts[0].items[this.counter].active
        ? (this.posts[0].items[this.counter].endTime = this.getDate())
        : "";
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
    chooseAnswer() {
      this.posts[0].items[this.counter].choose =
        !this.posts[0].items[this.counter].choose;
      this.posts[0].items[this.counter].choose_option.forEach((trueanswer) => {
        if (trueanswer.answer) {
          let answer =
            trueanswer.mark == this.posts[0].items[this.counter].answerSelect;
          choose_option(this.activeQuestion, answer);
        }
      });
    },
    selectOption(index) {
      this.posts[0].items[this.counter].answerSelect =
        this.posts[0].items[this.counter].choose_option[index].mark;

      this.posts[0].items[this.counter].choose_option.forEach(
        (option) => (option.choose = false)
      );

      this.posts[0].items[this.counter].choose_option[index].choose = true;
    },
  },
});
