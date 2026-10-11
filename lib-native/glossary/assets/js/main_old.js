let soltan = document.querySelector("#glossary");
let pageUrl = soltan.getAttribute("data-urlpage");
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
    // --------------------------------------------------------
  },

  async create() {},
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
  },
  async mounted() {
    this.Resize();
    window.addEventListener("resize", this.Resize);
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
      this.UpdateStudentActivity();
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
    UpdateStudentActivity() {
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
