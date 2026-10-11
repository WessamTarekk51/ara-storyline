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
    await this.getData();
    if (this.posts && this.posts.length > 0) {
      this.numOfQuestions();
    } else {
      console.error("No posts data found!");
    }

    this.bgAudio.src =
      "../../../lib-native/digital-screen/assets/audio/music.mp3";
    this.wrongAnswer.src =
      "../../../lib-native/digital-screen/assets/audio/wronganswer.mp3";
    this.rightAnswer.src =
      "../../../lib-native/digital-screen/assets/audio/rightanswer.mp3";
    this.clickBtn.src =
      "../../../lib-native/digital-screen/assets/audio/click_btn.mp3";
    this.startBtn.src =
      "../../../lib-native/digital-screen/assets/audio/startclick2.mp3";
    this.zokiBoring.src =
      "../../../lib-native/digital-screen/assets/audio/knock-knock.mp3";
    finalResponse.submitData(JSON.stringify(this.posts[0]), 1, 0);
  },

  methods: {
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
          if (
            this.data.learningObjectAsJson != "" &&
            this.data.learningObjectAsJson != null
          ) {
            let jsonData = JSON.parse(this.data.learningObjectAsJson);
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
        this.reset();
        this.finshed[0].style.cssText = "pointer-events: none;";
        document.querySelector(".information")?.classList.add("disable");
        e.correctAnswer.forEach((i, index) => {
          if (i === answer.numAnswer) {
            e.counter += 1;
            e.answerSelect = !e.answerSelect;
            answer.right = true;
            this.posts[0].LOcorrectcounter += 1;
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
            this.UpdateStudentActivity();
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
              this.reset();
              this.finshed[0].style.cssText = "pointer-events: none;";
              e.answerSelect = !e.answerSelect;
              document.querySelector(".information")?.classList.add("disable");
              if (document.querySelectorAll(".active .wrong").length == 0) {
                e.answerSelect = !e.answerSelect;
                this.posts[0].LOcorrectcounter += 1;
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
                    this.UpdateStudentActivity();
                    // console.log("UpdateStudentActivity")
                    breakLoopfalse = true;
                  }
                }, realtimenext);
              }
            }
          }
        });
      }

      this.posts[0].items[this.counter].endTime = this.posts[0].endTime;
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
        this.posts[0].items[this.counter].startTime = this.getDate();
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
          }, realtimenext);
        } else {
          setTimeout(() => {
            this.feedback = !this.question;
            this.nextQuestion();
          }, realtimenext);
        }
        this.calculate();
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
      this.UpdateStudentActivity();
      setTimeout(() => {
        this.feedback = !this.question;
        this.reset();
        zokicharecter.playSegments([0, 30], true);

        if (this.firstQ == this.loQuestions) {
          this.question = true;
          this.bgAudio.pause();
        } else {
          this.nextQuestion();
        }
        this.calculate();
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

    calculate() {
      this.Estimation = calculate(
        this.posts[0].LOcorrectcounter,
        this.loQuestions,
        this.isEng,
        this.upper
      )[0];
      this.finalProgress = calculate(
        this.posts[0].LOcorrectcounter,
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
      // console.log(this.posts[0].counterCorrect);
    },
    UpdateStudentActivity() {
      direction != ""
        ? globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])
        : "";
    },
  },
});
