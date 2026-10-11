let Question = document.querySelector('#Question');
let pageUrl = Question.getAttribute('data-urlpage');
// Read the ordering choice before Vue compiles the template.
function findQuestionOrderMode(root) {
  for (const element of root.children) {
    const mode = element.getAttribute('v-for')?.match(/\b(?:in|of)\s+(shuffledQuestions|unshuffledQuestions|shuffleQuestionsBySubType)\s*$/)?.[1];
    if (mode) return mode;
    const nestedMode = findQuestionOrderMode(element.content || element);
    if (nestedMode) return nestedMode;
  }
  return null;
}
const questionOrderMode = findQuestionOrderMode(Question) || 'shuffledQuestions';

let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error('ScormService init error:', e);
}

const AnswerSoundControl = Vue.extend({
  props: {
    answer: {
      type: Object,
      required: true,
    },
    owner: {
      type: Object,
      required: true,
    },
  },
  methods: {
    toggleAudio(event) {
      event.preventDefault();
      event.stopPropagation();
      this.owner.ToggleAnswerAudio(this.answer);
    },
  },
  render(createElement) {
    const isPlaying = this.owner.isAnswerAudioPlaying(this.answer);
    const isIdle = this.owner.isAnswerAudioIdle(this.answer);

    return createElement('div', {
      class: {
        sound: true,
        'answer-sound': true,
        play: isPlaying,
        pause: isIdle,
      },
      attrs: {
        'aria-label': isPlaying ? 'Pause answer audio' : 'Play answer audio',
      },
      on: {
        click: this.toggleAudio,
      },
    });
  },
});

window.app = new Vue({
  el: '#Question',

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
      classificationAssignments: {},
      classificationResults: {},
      classificationLocked: false,
      classificationResetKey: 0,
      inlineDropAnswers: {},
      inlineDropResults: {},
      inlinePassageSubmitDisabled: true,
      activeInlineDrag: null,
      activeInlineSourceDropId: null,
      inlineDragOverDropId: null,
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
      multiChoiceHandDismissed: false,
      multiChoiceSubmitHandDismissed: false,
      countMultiGuidance: null,
      numOfAttemp: 0,
      borderQuestion: null,
      titlePage: '',
      isMobile: false,
      numberOfAnswer: 0,
      finishLO: false,
      start: false,
      nextButtonShow: false,
      homeButtonShow: false,
      reloadButtonShow: false,
      questionAudio: new Audio(),
      titleAudio: new Audio(),
      passageAudio: new Audio(),
      subTitleAudio: new Audio(),
      playingAnswer: null,
      answerAudioRequestId: 0,
      passageAudioRequestId: 0,
      subTitleAudioRequestId: 0,
      passageAudioSource: '',
      passageAudioStarted: false,
      passagePausedByOverlay: false,
      AudioQ: false,
      AudioT: false,
      AudioP: false,
      isPassageAudioPlaying: false,
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
      status_for_caracters: null,
      popupTxtCorrect: new Audio(),
      popupTxtWrong1: new Audio(),
      popupTxtWrong2: new Audio(),
      feedTxtCorrect: new Audio(),
      feedTxtWrong: new Audio(),
      finalfeedback1: new Audio(),
      finalfeedback2: new Audio(),
      finalfeedback3: new Audio(),
      finalfeedback4: new Audio(),
      timeouts: [],
      showHand: false,
      firstQuestionGuidanceTimer: null,
      firstQuestionGuidanceRequestId: 0,
      passLo: false,

      tryAgain: 'حَاوِلْ مرَّةً أُخْرى',
      feedbackwrong: 'الإِجَاباتُ تحْتاجُ إلى مزيدٍ من المُراجعةِ، أَعِدِ المُحَاولةَ.',
      feedbackcorrect: 'أَحْسنْتَ، لقدْ أتْمَمْتَ المُهِمَّةَ بنجاحٍ.',
      Keyfeedback: '',
      popupWrong: 'إِجَابتُكَ غيْرُ صَحيحَةٍ',
      popupCorrect: 'أَحْسنْتَ',
      correctanswer: 'إِجَابةٌ صَحيحةٌ',
      count_q: 0,
      lang: '',
      // --------------------------------------------------------
      isLoading: false,
      isSuccess: false,
      dataLoaded: false,
      currentdate: '',
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
    this.matchManager = new MatchManager();
    this.dragDropManager = new DragDropManager();
    this.passageAudio.addEventListener('play', this.handlePassageAudioPlay);
    this.passageAudio.addEventListener('pause', this.handlePassageAudioPause);
    this.passageAudio.addEventListener('ended', this.handlePassageAudioEnded);
    this._inlineTouchDrag = null;
    this._inlineTouchSuppressClickUntil = 0;
    this._inlineMouseDragSource = null;
    this._classicMouseDragSource = null;
    document.addEventListener('dragstart', this.startClassicDragVisual, true);
    document.addEventListener('dragend', this.endClassicDragVisual, true);
    await this.resize();
    await this.getData();
    window.addEventListener('resize', this.resize);
    this.checkDevice();
    window.addEventListener('resize', this.checkDevice);
  },

  beforeDestroy() {
    document.removeEventListener('dragstart', this.startClassicDragVisual, true);
    document.removeEventListener('dragend', this.endClassicDragVisual, true);
    this.passageAudio.removeEventListener('play', this.handlePassageAudioPlay);
    this.passageAudio.removeEventListener('pause', this.handlePassageAudioPause);
    this.passageAudio.removeEventListener('ended', this.handlePassageAudioEnded);
    this.clearFirstQuestionGuidance();
    this.resetPassageAudio();
    this.stopAndResetSubTitleAudio();
    this.restoreClassicMouseDragSource();
  },
  updated() {
    // Vue يعيد كتابة class العنصر بعد أي re-render، فنرجّع كلاسات الفيدباك النهائي
    this.applyFinalFeedbackClasses();
  },

  computed: {
    shuffleQuestionsBySubType() {
      return this.shuffledQuestions;
    },
    unshuffledQuestions() {
      return this.shuffledQuestions;
    },
    currentPost() {
      return this.posts?.[0] || null;
    },
    questions() {
      return this.currentPost?.questions || [];
    },
    passageSound() {
      const sound = this.currentQuestion?.passageSound;
      return typeof sound === 'string' ? sound.trim() : '';
    },
    popupListenSound() {
      const sound = this.currentQuestion?.popupListen;
      return typeof sound === 'string' ? sound.trim() : '';
    },
    subTitleSound() {
      const sound = this.currentQuestion?.subTitleSound;
      return typeof sound === 'string' ? sound.trim() : '';
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
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours === 0 ? 12 : hours;
      const hoursStr = String(hours).padStart(2, '0');
      return `${hoursStr}:${minutes}:${seconds} ${period}`;
    },

    /* ===================== RESIZE ===================== */
    resize() {
      const viewport = document.getElementById('Question');
      const safeArea = document.getElementById('safeArea');
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

      safeArea.style.width = finalW + 'px';
      safeArea.style.height = finalH + 'px';
      this.updateLinesPosition();
    },

    checkDevice() {
      this.isMobile = window.matchMedia('(pointer: coarse)').matches;
    },

    /* ===================== DATA ===================== */

    async getData() {
      if (this.dragDropManager) this.resetInlinePassageQuestion();
      let restoredPost = null;
      if (direction == '2') {
        await returnData.then((response) => {
          this.isSuccess = response.isSuccess;
          this.data = response.value;
          this.activityId = this.data.activityId;
          if (this.data.learningObjectAsJson != '' && this.data.learningObjectAsJson != null) {
            let jsonData = JSON.parse(this.data.learningObjectAsJson);
            restoredPost = Array.isArray(jsonData) ? jsonData[0] : jsonData;
            this.previousScormScore = this.normalizeScormScore(restoredPost?.cmi?.score?.raw);
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
      await fetch(pageUrl + '.json')
        .then((res) => res.json())
        .then((data) => {
          this.localPosts = data;
        });
      if (this.posts.length == 0) {
        this.posts = this.localPosts;
        this.getFeedBackJson();
      }
      const availableQuestions = this.posts[0].questions;
      const totalQuestionCount = availableQuestions.length;
      const showAllQuestions = typeof checkQuestions === 'function' && checkQuestions();
      const displayedQuestionCount = this.getQuestionDisplayCount(
        totalQuestionCount,
        showAllQuestions
      );
      this.shuffledQuestions = this.orderQuestions(availableQuestions).slice(0, displayedQuestionCount);
      this.logQuestionOrder(this.shuffledQuestions, totalQuestionCount);
      this.posts[0].questions = this.shuffledQuestions;
      this.posts.length != 0
        ? setTimeout(() => {
          this.isLoading = true;
          this.posts[0].startTime = this.getDate();
          this.posts[0].numberOfquestion = this.posts[0].questions.length;
          this.posts[0].numberOfTotalQuestion = totalQuestionCount;
          this.posts[0].studentPoint = 0;
          this.posts[0].scoreOutOf10 ??= 0;
          if (!this.posts[0].cmi) {
            this.posts[0].cmi = {
              completion_status: 'unknown',
              success_status: 'unknown',
              total_time: '00:00:00',
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

          if (typeof preparePostFeedbackMetadata === 'function') {
            preparePostFeedbackMetadata(post);
          }

          this.updateCurrentProgressFeedback(post, this.normalizeScormScore(post.cmi?.score?.raw));

          this.scormStartTime = Date.now();
        }, 1000)
        : (this.isLoading = false);
      this.lang = this.posts[0]?.langauge || '';
      this.titlePage = this.posts[0].navgations[0].title;
      this.totalQuestions = this.posts[0].questions.length;

      this.posts[0].questions.forEach((q) => {
        if (q.type === 'input' || q.type === 'correct') {
          q.inputs.forEach((input) => {
            input.originalValid = [...input.valid]; // 🔥 تخزين نسخة أصلية
          });
        }
      });
      // if (this.posts[0]?.character?.trim()) {
      //   document.getElementById("border-content").classList.add("add_character")
      // }

      this.getAudios();
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
      this.correctAudio.src = '../../../lib-native/storyline-q/assets/audios/correct.mp3';
      this.wrongAudio.src = '../../../lib-native/storyline-q/assets/audios/wrong.mp3';
      this.clickAudio.src = '../../../lib-native/storyline-q/assets/audios/click.mp3';
      this.popupAudio.src = '../../../lib-native/storyline-q/assets/audios/popup.mp3';
      this.feedbackPassAudio.src = '../../../lib-native/storyline-q/assets/audios/feed-correct.mp3';
      this.feedbackFailAudio.src = '../../../lib-native/storyline-q/assets/audios/feed-wrong.mp3';
      this.feedTxtCorrect.src = '../../../lib-native/storyline-q/assets/audios/feed-txt-correct' + this.lang + '.mp3';
      this.feedTxtWrong.src = '../../../lib-native/storyline-q/assets/audios/feed-txt-wrong' + this.lang + '.mp3';
      const project = this.posts[0]?.projectId?.[0];

      if (project?.nameProject == "oman") {
        this.popupTxtCorrect.src = '../../../lib-native/storyline-q/assets/audios/oman/popup-correct' + this.lang + '.mp3';
        this.popupTxtWrong1.src = '../../../lib-native/storyline-q/assets/audios/oman/popup-wrong1' + this.lang + '.mp3';
        this.popupTxtWrong2.src = '../../../lib-native/storyline-q/assets/audios/oman/popup-wrong2' + this.lang + '.mp3';
        this.finalfeedback1.src = '../../../lib-native/storyline-q/assets/audios/oman/finalfeedback1' + this.lang + '.mp3';
        this.finalfeedback2.src = '../../../lib-native/storyline-q/assets/audios/oman/finalfeedback2' + this.lang + '.mp3';
        this.finalfeedback3.src = '../../../lib-native/storyline-q/assets/audios/oman/finalfeedback3' + this.lang + '.mp3';
        this.finalfeedback4.src = '../../../lib-native/storyline-q/assets/audios/oman/finalfeedback4' + this.lang + '.mp3';

      } else {
        this.popupTxtCorrect.src = '../../../lib-native/storyline-q/assets/audios/popup-correct' + this.lang + '.mp3';
        this.popupTxtWrong1.src = '../../../lib-native/storyline-q/assets/audios/popup-wrong1' + this.lang + '.mp3';
        this.popupTxtWrong2.src = '../../../lib-native/storyline-q/assets/audios/popup-wrong2' + this.lang + '.mp3';
      }
    },

    /* ===================== NAVIGATION ===================== */
    startLo() {
      this.start = true;
      this.startQuestions();
      this.clickAudio.play();

      this.posts[0].LOcorrectcounter = 0;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      let activestart = document.querySelectorAll('#Question');
      const project = this.posts[0]?.projectId?.[0];
      activestart.forEach((element) => {
        element.classList.add('activestart');
        if (project?.nameProject === 'oman' && project.language === 'ara') {
          element.classList.add('oman_ara');
        }
      });

      this.updateCurrentProgressFeedback(this.posts[0], 0);
    },
    /* ===================== QUESTIONS ===================== */
    startQuestions() {
      this.questionIndex = 0;
      this.count_q = 1;
      this.loadQuestion();
    },
    clearFirstQuestionGuidance() {
      this.firstQuestionGuidanceRequestId += 1;

      if (this.firstQuestionGuidanceTimer !== null) {
        clearTimeout(this.firstQuestionGuidanceTimer);
        this.firstQuestionGuidanceTimer = null;
      }

      this.showHand = false;
    },
    startFirstQuestionGuidance() {
      this.clearFirstQuestionGuidance();

      if (this.questionIndex !== 0 || !this.currentQuestion || this.toggleOverlay) return;

      const guidedQuestion = this.currentQuestion;
      const requestId = ++this.firstQuestionGuidanceRequestId;
      this.showHand = true;

      this.firstQuestionGuidanceTimer = setTimeout(() => {
        if (this.firstQuestionGuidanceRequestId !== requestId) return;

        this.firstQuestionGuidanceTimer = null;
        if (
          this.questionIndex !== 0 ||
          this.currentQuestion !== guidedQuestion ||
          this.toggleOverlay
        ) {
          this.showHand = false;
          return;
        }

        this.showHand = false;

        // Wait until Vue removes the hand before starting instruction audio.
        this.$nextTick(() => {
          if (
            this.firstQuestionGuidanceRequestId !== requestId ||
            this.questionIndex !== 0 ||
            this.currentQuestion !== guidedQuestion ||
            this.toggleOverlay
          ) {
            return;
          }

          this.playSubTitleSound();
        });
      }, 8000);
    },
    playTitleAudio() {
      this.stopAllAudios();
      const requestId = this.answerAudioRequestId;
      setTimeout(() => {
        if (this.answerAudioRequestId !== requestId) return;
        this.titleAudio.src = this.currentQuestion.soundT;
        this.titleAudio.play();
        this.AudioT = true;
        this.titleAudio.addEventListener('ended', () => {
          this.AudioT = false;
          // this.playQuestionAudio();
        });
      }, 1000);
    },
    playQuestionAudio() {
      this.stopAllAudios();
      const requestId = this.answerAudioRequestId;
      setTimeout(() => {
        if (this.answerAudioRequestId !== requestId) return;
        this.questionAudio.src = this.currentQuestion.soundQ || this.currentQuestion.audio;
        this.questionAudio.play();
        this.AudioQ = true;
        this.questionAudio.addEventListener('ended', () => {
          this.AudioQ = false;
        });
      }, 100);
    },
    ToggleAudioT() {
      this.stopAllAudios();
      this.AudioT ? [this.titleAudio.pause(), (this.titleAudio.currentTime = 0)] : this.titleAudio.play();
      this.AudioT = !this.AudioT;
      this.titleAudio.addEventListener('ended', () => {
        this.AudioT = false;
      });
    },
    ToggleAudioQ() {
      this.stopAllAudios();
      this.questionAudio.src = this.currentQuestion.soundQ || this.currentQuestion.audio;
      this.AudioQ ? [this.questionAudio.pause(), (this.questionAudio.currentTime = 0)] : this.questionAudio.play();
      this.AudioQ = !this.AudioQ;
      this.questionAudio.addEventListener('ended', () => {
        this.AudioQ = false;
      });
    },
    handlePassageAudioPlay() {
      this.isPassageAudioPlaying = !this.passageAudio.paused && !this.passageAudio.ended;
    },
    handlePassageAudioPause() {
      this.isPassageAudioPlaying = false;
    },
    handlePassageAudioEnded() {
      this.isPassageAudioPlaying = false;
    },
    TogglePassageAudio() {
      if (!this.passageSound) {
        this.resetPassageAudio();
        return;
      }

      if (this.AudioP && !this.passageAudio.paused) {
        this.pausePassageAudio();
        return;
      }

      this.playPassageAudio();
    },
    playPassageAudioFromStart() {
      const sound = this.popupListenSound;
      if (!sound) {
        this.resetPassageAudio();
        return;
      }

      // The popup owns this playback session, so every open gets a fresh start.
      this.resetPassageAudio();
      this.passageAudio.currentTime = 0;
      this.playPassageAudio(sound);
    },
    playPassageAudio(audioSource = this.passageSound) {
      const sound = typeof audioSource === 'string' ? audioSource.trim() : '';
      if (!sound) {
        this.resetPassageAudio();
        return;
      }

      // Keep all narration mutually exclusive while preserving the passage position.
      this.stopAllAudios();
      const requestId = ++this.passageAudioRequestId;

      this.passageAudio.onended = () => {
        if (this.passageAudioRequestId !== requestId) return;
        this.AudioP = false;
        this.isPassageAudioPlaying = false;
        this.passageAudioStarted = false;
        this.passagePausedByOverlay = false;
        this.passageAudio.currentTime = 0;
      };
      this.passageAudio.onerror = () => {
        if (this.passageAudioRequestId !== requestId) return;
        this.AudioP = false;
        this.isPassageAudioPlaying = false;
        this.passageAudioStarted = false;
        this.passagePausedByOverlay = false;
      };

      if (this.passageAudioSource !== sound) {
        this.passageAudio.src = sound;
        this.passageAudioSource = sound;
        this.passageAudio.currentTime = 0;
        this.passageAudioStarted = false;
      }

      let playback;
      try {
        playback = this.passageAudio.play();
        this.AudioP = true;
        this.passageAudioStarted = true;
        this.passagePausedByOverlay = false;
      } catch (error) {
        this.AudioP = false;
        this.passageAudioStarted = false;
        console.warn('Unable to play passage audio', error);
        return;
      }

      if (playback?.catch) {
        playback.catch((error) => {
          if (this.passageAudioRequestId !== requestId) return;
          this.passageAudio.pause();
          this.AudioP = false;
          this.isPassageAudioPlaying = false;
          this.passageAudioStarted = false;
          this.passagePausedByOverlay = false;
          console.warn('Unable to play passage audio', error);
        });
      }
    },
    pausePassageAudio(resumeOnOverlayOpen = false) {
      const wasPlaying = this.AudioP && !this.passageAudio.paused;
      this.passageAudioRequestId += 1;
      this.passageAudio.pause();
      this.AudioP = false;
      this.isPassageAudioPlaying = false;
      this.passagePausedByOverlay = resumeOnOverlayOpen && wasPlaying;
    },
    resetPassageAudio() {
      this.pausePassageAudio();
      this.passageAudio.currentTime = 0;
      this.passageAudioSource = '';
      this.passageAudioStarted = false;
      this.passagePausedByOverlay = false;
      this.passageAudio.onended = null;
      this.passageAudio.onerror = null;
    },
    stopAndResetSubTitleAudio() {
      this.subTitleAudioRequestId += 1;
      if (!this.subTitleAudio) return;

      this.subTitleAudio.pause();
      this.subTitleAudio.currentTime = 0;
    },
    playSubTitleSound(audioSource = this.subTitleSound) {
      const sound = typeof audioSource === 'string' ? audioSource.trim() : '';
      if (!sound || !this.subTitleAudio) return;
      if (this.toggleOverlay) {
        this.stopAndResetSubTitleAudio();
        return;
      }

      this.stopAllAudios();
      const requestId = ++this.subTitleAudioRequestId;
      this.subTitleAudio.src = sound;
      this.subTitleAudio.currentTime = 0;

      let playback;
      try {
        playback = this.subTitleAudio.play();
      } catch (error) {
        if (this.subTitleAudioRequestId === requestId) {
          this.stopAndResetSubTitleAudio();
          console.warn('Unable to play subtitle audio', error);
        }
        return;
      }

      if (playback?.catch) {
        playback.catch((error) => {
          if (this.subTitleAudioRequestId !== requestId) return;
          this.stopAndResetSubTitleAudio();
          console.warn('Unable to play subtitle audio', error);
        });
      }
    },
    ToggleAnswerAudio(answer) {
      const sound = typeof answer?.sound === 'string' ? answer.sound.trim() : '';

      if (!sound) return;

      if (this.playingAnswer === answer && !this.questionAudio.paused) {
        this.stopAllAudios();
        return;
      }

      // Question and answer audio share one player so they cannot overlap.
      this.stopAllAudios();
      this.questionAudio.src = sound;
      this.playingAnswer = answer;
      this.refreshAnswerSoundControls();
      const requestId = this.answerAudioRequestId;

      const resetAnswerAudioState = () => {
        if (this.answerAudioRequestId === requestId && this.playingAnswer === answer) {
          this.playingAnswer = null;
          this.refreshAnswerSoundControls();
        }
      };

      this.questionAudio.onended = resetAnswerAudioState;
      this.questionAudio.onerror = resetAnswerAudioState;

      let playback;
      try {
        playback = this.questionAudio.play();
      } catch (error) {
        this.questionAudio.pause();
        this.questionAudio.currentTime = 0;
        resetAnswerAudioState();
        return;
      }

      if (playback?.catch) {
        playback.catch(() => {
          if (this.answerAudioRequestId === requestId) {
            this.questionAudio.pause();
            this.questionAudio.currentTime = 0;
            resetAnswerAudioState();
          }
        });
      }
    },
    isAnswerAudioPlaying(answer) {
      return this.playingAnswer === answer;
    },
    isAnswerAudioIdle(answer) {
      return !this.isAnswerAudioPlaying(answer);
    },
    refreshAnswerSoundControls() {
      (this._answerSoundControls || []).forEach((control) => {
        control.$forceUpdate();
      });
    },
    clearAnswerSoundControls() {
      (this._answerSoundControls || []).forEach((control) => {
        const element = control.$el;
        control.$destroy();
        element?.remove();
      });
      this._answerSoundControls = [];
    },
    renderAnswerSoundControls() {
      this.$nextTick(() => {
        this.clearAnswerSoundControls();

        const answerElements = document.querySelectorAll('.chooseQuestion.active .chooses > .choose');
        const answers = this.currentQuestion?.answers || [];

        answerElements.forEach((answerElement, index) => {
          const answer = answers[index];
          const sound = typeof answer?.sound === 'string' ? answer.sound.trim() : '';

          if (!sound) return;

          const control = new AnswerSoundControl({
            propsData: {
              answer,
              owner: this,
            },
          }).$mount();

          answerElement.appendChild(control.$el);
          this._answerSoundControls.push(control);
        });
      });
    },

    loadQuestion() {
      this.clearFirstQuestionGuidance();
      this.countMultiGuidance = null;
      this.resetPassageAudio();
      this.stopAndResetSubTitleAudio();
      this.toggleOverlay = false;
      this.overlayTexts = [];
      this.borderQuestion = document.getElementById('lo-container');
      this.borderQuestion.classList.add('poniterEvent');
      setTimeout(() => {
        this.borderQuestion.classList.remove('poniterEvent');
      }, 1000);
      this.posts[0].endTime = this.getDate();
      if (this.questionIndex < this.questions.length) {
        this.resetClassification();
        this.questions.forEach((q) => (q.active = false));
        this.questions[this.questionIndex].active = true;
        this.currentQuestion = this.questions[this.questionIndex];
        if (this.currentQuestion.type === 'countMulti') {
          (this.currentQuestion.groups || []).forEach((group) => {
            if (!Array.isArray(group.selected)) {
              this.$set(group, 'selected', []);
            }
          });
          this.countMultiGuidance = 'node';
        }
        if (this.isInlinePassageQuestion(this.currentQuestion)) {
          this.inlinePassageSubmitDisabled = true;
          this.updateInlinePassageSubmitState();
        }
        if (!this.currentQuestion.startTime) {
          this.currentQuestion.startTime = this.getQuestionTime();
        }
        this.shuffleAnswers();
        this.getNumOFLengthQuestion();
        this.titlePage = this.currentQuestion.title;
        this.currentQuestion.soundT ? this.playTitleAudio() : '';
        this.renderAnswerSoundControls();
        this.startFirstQuestionGuidance();
      } else {
        this.clearAnswerSoundControls();
        const stars = document.querySelector('#stars');

        stars?.classList.add('active');
        this.homeButtonShow = true;
        this.feedback = true;
        setTimeout(() => {
          this.finalSoundfeedback();
        }, 1000);

        this.finishLO = true;
        try {
          this.finished();
        } catch (e) {
          console.error(e);
        } finally {
          // نستنى Vue يرسم الفيدباك النهائي، وبعدين نضيف الكلاسات
          this.finalFeedbackClasses = ['activeFinal', 'teacher', this.status_for_caracters].filter(Boolean);
          this.$nextTick(() => this.applyFinalFeedbackClasses());
        }
      }
    },
    finalSoundfeedback() {
      const project = this.posts[0]?.projectId?.[0];

      if (project?.nameProject === 'oman') {
        const score = this.roundFinalFeedbackScore(
          this.calculateCurrentAttemptScore()
        );

        if (score < 50) {
          this.finalfeedback1.play();
        } else if (score < 65) {
          this.finalfeedback2.play();
        } else if (score < 85) {
          this.finalfeedback3.play();
        } else {
          this.finalfeedback4.play();
        }
      }
    },

    nextQuestion() {
      const isClassification = this.isClassificationQuestion(this.currentQuestion);
      if (isClassification && this.finishLO) return;
      const preserveClassification = isClassification && this.questionIndex === this.questions.length - 1;
      this.clearAllTimeouts(); // 🔥 مهم
      this.count_q++;
      this.stopAllFeedBackAudio();
      this.userLengthQuestion = 0;
      this.nextButtonShow = false;
      this.feedback = false;
      if (preserveClassification) {
        this.classificationLocked = true;
        this.reloadButtonShow = false;
      } else if (this.currentQuestion.type == 'dragDrop' || isClassification) {
        this.resetDragDrop();
      }
      this.isInlinePassageQuestion(this.currentQuestion) ? this.resetInlinePassageQuestion() : '';
      this.currentQuestion.type == 'match' ? this.resetMatching() : '';
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
      this.currentQuestion.type == 'dragDrop' || this.isClassificationQuestion(this.currentQuestion)
        ? (this.lengthQuestion = this.currentQuestion.drags.length)
        : '';

      this.currentQuestion.type == 'match'
        ? (this.lengthQuestion = this.currentQuestion.matchs.filter((item) => item.textLeft || item.imgLeft).length)
        : '';

      this.isInlinePassageQuestion(this.currentQuestion)
        ? (this.lengthQuestion = (this.currentQuestion.passageParts || []).filter(
          (part) => part.type === 'drop'
        ).length)
        : '';
    },

    reloadQuestion() {
      if (this.isClassificationQuestion(this.currentQuestion)) {
        if (this.finishLO) return;
        // A completed last question advances to the activity feedback, not a retry.
        if (this.questionIndex === this.questions.length - 1 && this.nextButtonShow) {
          this.nextQuestion();
          return;
        }
      }
      this.clearAllTimeouts(); // 🔥 مهم جدا

      this.stopAllFeedBackAudio();
      this.userLengthQuestion = 0;
      this.reloadButtonShow = false;
      resetAnswer();
      this.shuffleAnswers();
      this.feedback = false;
      this.currentQuestion.type == 'dragDrop' || this.isClassificationQuestion(this.currentQuestion) ? this.resetDragDrop() : '';
      this.isInlinePassageQuestion(this.currentQuestion) ? this.resetInlinePassageQuestion() : '';
      this.currentQuestion.type == 'match' ? this.resetMatching() : '';
      this.currentQuestion.type == 'input' ? this.resetInput() : '';
      this.currentQuestion.type == 'correct' ? this.resetInput() : '';
      this.currentQuestion.type == 'countMulti' ? this.resetCountMulti() : '';
      this.renderAnswerSoundControls();

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

    applyFinalFeedbackClasses() {
      if (!this.finishLO || !this.finalFeedbackClasses) return;
      document.querySelectorAll('.feedBack').forEach((e) => e.classList.add(...this.finalFeedbackClasses));
    },

    home() {
      this.clickAudio.play();
      if (this.isInlinePassageQuestion(this.currentQuestion)) {
        this.resetInlinePassageQuestion();
      }
      location.reload();
    },
    afterCheckAnswer() {
      this.stopAllAudios();
      this.numOfAttemp += 1;
      if (!this.correctAnswer) {
        this.currentQuestion.numberOfTrial = (this.currentQuestion.numberOfTrial || 0) + 1;
      }
      this.checkStateFeedBack(this.numberOfAnswer);
      this.UpdateStudentActivity();
    },

    stopAllAudios() {
      this.answerAudioRequestId += 1;
      this.playingAnswer = null;
      this.refreshAnswerSoundControls();
      this.titleAudio?.pause();
      this.titleAudio.currentTime = 0;
      this.AudioT = false;
      this.questionAudio?.pause();
      this.questionAudio.currentTime = 0;
      this.AudioQ = false;
      this.pausePassageAudio();
      this.stopAndResetSubTitleAudio();
    },
    checkStateFeedBack(numberOfChoose) {
      this.borderQuestion.classList.add('poniterEvent');

      if (this.currentQuestion.type === 'multichoice') {
        this.setSafeTimeout(() => {
          this.activateFinalFeedback();

          this.setSafeTimeout(() => {
            const feedbackAudio = this.correctAnswer ? this.popupTxtCorrect : this.popupTxtWrong2;
            feedbackAudio.play();
          }, 1000);
        }, 2000);
        return;
      }

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
          if (!this.currentQuestion.type == 'correct') {
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
        if (this.currentQuestion.type == 'correct') {
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
      this.clearFirstQuestionGuidance();
      this.timeouts.forEach((id) => clearTimeout(id));
      this.timeouts = [];
    },
    getQuestionSolve() {
      this.currentQuestion.type == 'dragDrop' || this.isClassificationQuestion(this.currentQuestion) ? this.shoWDragDropAnswer() : '';
      this.isInlinePassageQuestion(this.currentQuestion)
        ? this.showCorrectInlinePassageAnswers(this.currentQuestion)
        : '';
      this.currentQuestion.type == 'match' ? this.showCorrectMatching() : '';
      this.currentQuestion.type == 'choose' ? getTrueAnswer() : '';
      this.currentQuestion.type == 'trueFalse' ? getTrueAnswer() : '';
      this.currentQuestion.type == 'input' ? this.showInputsAnswer() : '';
      this.currentQuestion.type == 'correct' ? this.showCorrectAnswer() : '';
    },
    /* ===================== choose ===================== */
    selectChoose(event, answer) {
      const [isCorrect] = checkChoose(event, answer);
      this.correctAnswer = isCorrect;
      this.correctAnswer ? this.correctAnswerSolve() : this.falseAnswerSolve();
      this.numberOfAnswer = this.currentQuestion.answers.length;
      this.afterCheckAnswer();
      this.clearFirstQuestionGuidance();
    },

    selectMultiChoice(question, answerIndex) {
      this.clickAudio.currentTime = 0
      if (!question || question !== this.currentQuestion) return;

      const didChange = toggleMultiChoiceAnswer(
        question.answers,
        answerIndex,
        question.multichoiceSubmitted
      );

      if (didChange) {
        if (this.questionIndex === 0) {
          this.multiChoiceHandDismissed = true;
        }

        this.clearFirstQuestionGuidance();

        this.clickAudio.play();
      }
    },

    hasMultiChoiceSelection(question) {
      return Boolean(
        question && hasSelectedMultiChoiceAnswer(question.answers)
      );
    },

    submitMultiChoice(question) {
      if (
        !question ||
        question !== this.currentQuestion ||
        question.multichoiceSubmitted ||
        !hasSelectedMultiChoiceAnswer(question.answers)
      ) {
        return;
      }

      this.multiChoiceSubmitHandDismissed = true;
      this.$set(question, 'multichoiceSubmitted', true);
      question.answers.forEach((answer) => {
        answer.solve = Boolean(answer.select);
      });

      this.correctAnswer = checkMultiChoiceAnswers(question.answers);
      this.$set(question, 'multichoiceCorrect', this.correctAnswer);
      this.correctAnswer ? this.correctAnswerSolve() : this.falseAnswerSolve();
      this.numberOfAnswer = question.answers.length;
      this.afterCheckAnswer();
      this.clearFirstQuestionGuidance();

    },

    /* ================= drag web ================= */
    syncUserLengthQuestion() {
      this.userLengthQuestion = this.dropAnswers.filter((item) => item !== null && item !== undefined).length;
    },

    setItemPlaced(item, value) {
      if (!item) return;

      this.$set(item, 'placed', value);
    },

    removeItemFromAllDrops(item, exceptIndex = -1) {
      if (!item) return;

      this.dropAnswers.forEach((dropItem, index) => {
        if (index !== exceptIndex && dropItem && dropItem.id === item.id) {
          this.$set(this.dropAnswers, index, null);
        }
      });
    },

    dragstart(drag) {
      this.stopAllAudios();

      if (!drag) return;

      // امسحي أي نسخة موجودة لنفس العنصر في الـ drops
      this.removeItemFromAllDrops(drag);

      // رجعي حالته أثناء السحب
      this.setItemPlaced(drag, false);

      this.syncUserLengthQuestion();

      this.draggedItem = drag;
    },

    handleDrop(index) {
      if (!this.draggedItem) return;

      const item = this.draggedItem;

      // منع وجود نفس العنصر في أكتر من drop
      this.removeItemFromAllDrops(item, index);

      const oldItem = this.dropAnswers[index];

      // لو فيه عنصر قديم في المكان
      if (oldItem && oldItem.id !== item.id) {
        this.setItemPlaced(oldItem, false);
      }

      // حطي العنصر في الـ drop
      this.$set(this.dropAnswers, index, item);

      // اخفيه من القائمة الأصلية
      this.setItemPlaced(item, true);

      this.syncUserLengthQuestion();

      this.draggedItem = null;
    },

    removeFromDrop(index) {
      const item = this.dropAnswers[index];

      if (!item) return;

      // مهم:
      // امسحي العنصر من الـ drop الأول
      this.$set(this.dropAnswers, index, null);

      // ولو حصل duplicate لأي سبب امسحي أي نسخة تانية
      this.dropAnswers.forEach((dropItem, i) => {
        if (dropItem && dropItem.id === item.id) {
          this.$set(this.dropAnswers, i, null);
        }
      });

      // لو العنصر لسه محفوظ كـ draggedItem امسحيه
      if (this.draggedItem && this.draggedItem.id === item.id) {
        this.draggedItem = null;
      }

      // رجعي العنصر للقائمة الأصلية
      this.setItemPlaced(item, false);

      // تنظيف أي drag visual موجود
      this.restoreClassicMouseDragSource();

      this.syncUserLengthQuestion();
    },

    startClassicDragVisual(event) {
      const sourceElement = event.target?.closest('.DragQuestion.active .drag, .DragQuestion.active .drag-img');

      if (!sourceElement || !event.dataTransfer || typeof event.dataTransfer.setDragImage !== 'function') {
        return;
      }

      this.restoreClassicMouseDragSource();

      const rect = sourceElement.getBoundingClientRect();
      const dragVisual = this.createDragVisual(sourceElement);
      const transparentDragImage = document.createElement('div');

      dragVisual.style.left = rect.left + 'px';
      dragVisual.style.top = rect.top + 'px';

      transparentDragImage.style.position = 'fixed';
      transparentDragImage.style.left = '-10000px';
      transparentDragImage.style.top = '-10000px';
      transparentDragImage.style.width = '1px';
      transparentDragImage.style.height = '1px';
      transparentDragImage.style.opacity = '0';

      document.body.appendChild(transparentDragImage);

      event.dataTransfer.setDragImage(transparentDragImage, 0, 0);

      this._classicMouseDragSource = {
        element: sourceElement,
        visibility: sourceElement.style.visibility,
        visual: dragVisual,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };

      document.addEventListener('dragover', this.moveClassicDragVisual, true);

      const mouseDragSource = this._classicMouseDragSource;

      setTimeout(() => {
        if (this._classicMouseDragSource === mouseDragSource) {
          mouseDragSource.element.style.visibility = 'hidden';
        }

        transparentDragImage.remove();
      }, 0);
    },

    moveClassicDragVisual(event) {
      const source = this._classicMouseDragSource;

      if (!source?.visual || (!event.clientX && !event.clientY)) {
        return;
      }

      source.visual.style.left = event.clientX - source.offsetX + 'px';

      source.visual.style.top = event.clientY - source.offsetY + 'px';
    },

    endClassicDragVisual() {
      this.restoreClassicMouseDragSource();
    },

    restoreClassicMouseDragSource() {
      document.removeEventListener('dragover', this.moveClassicDragVisual, true);

      const source = this._classicMouseDragSource;

      if (source?.element) {
        source.element.style.visibility = source.visibility;
      }

      source?.visual?.remove();

      this._classicMouseDragSource = null;
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

      this.touchElement.style.position = 'fixed';
      this.touchElement.style.zIndex = '1000';
    },

    touchMoveDrag(event) {
      if (!this.touchElement) return;
      event.preventDefault();
      this.touchElement.style.left = event.touches[0].clientX - this.offsetX + 'px';
      this.touchElement.style.top = event.touches[0].clientY - this.offsetY + 'px';
    },

    touchEndDrag(event) {
      if (!this.touchElement) return;
      const touch = event.changedTouches[0];
      this.touchElement.style.display = 'none';
      let dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
      this.touchElement.style.display = '';
      if (dropElement) {
        dropElement = dropElement.closest('.active .drop');
      }
      if (dropElement) {
        // console.log(dropElement);
        const drops = Array.from(document.querySelectorAll('.active .drop'));
        const index = drops.indexOf(dropElement);

        if (index !== -1) {
          this.handleDrop(index);
        }
      }
      this.touchElement.style.position = '';
      this.touchElement.style.left = '';
      this.touchElement.style.top = '';
      this.touchElement.style.zIndex = '';
      this.touchElement = null;
    },
    isClassificationQuestion(question) {
      return [question?.type, question?.subType, question?.SubType].includes('classification');
    },
    resetClassification() {
      this.classificationAssignments = {};
      this.classificationResults = {};
      this.classificationLocked = false;
      this.classificationResetKey += 1;
    },
    updateClassification(assignments) {
      if (this.classificationLocked || !this.isClassificationQuestion(this.currentQuestion)) return;
      this.classificationAssignments = { ...assignments };
    },
    classificationCanSubmit() {
      return !this.classificationLocked && this.isClassificationQuestion(this.currentQuestion) &&
        this.dragDropManager.checkClassification(this.currentQuestion, this.classificationAssignments).complete;
    },
    checkClassification() {
      if (!this.classificationCanSubmit()) return;
      this.classificationLocked = true;
      const result = this.dragDropManager.checkClassification(this.currentQuestion, this.classificationAssignments);
      this.classificationResults = result.results;
      this.numberOfAnswer = this.currentQuestion.drags.length;
      this.correctAnswer = result.correct;
      result.correct ? this.correctAnswerSolve() : this.falseAnswerSolve();
      this.afterCheckAnswer();
      this.clearFirstQuestionGuidance();
    },

    /* ================= check , reset , show answer drag ================= */
    checkDragDrop() {
      this.numberOfAnswer = this.currentQuestion.drags.length;
      this.dragDropManager.setState(this.dropAnswers);
      const result = this.dragDropManager.checkAnswers(this.currentQuestion.drags);
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
      this.clearFirstQuestionGuidance();
    },

    resetDragDrop() {
      if (this.isClassificationQuestion(this.currentQuestion)) {
        this.resetClassification();
        return;
      }
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

      this.$set(this.currentQuestion, 'showCorrectAnswer', true);

      document.querySelectorAll('.active .drop').forEach((e) => e.remove());
    },

    shoWDragDropAnswer() {
      if (this.isClassificationQuestion(this.currentQuestion)) {
        this.classificationAssignments = this.dragDropManager.revealClassification(this.currentQuestion);
        this.classificationResults = this.dragDropManager.checkClassification(this.currentQuestion, this.classificationAssignments).results;
        this.classificationLocked = true;
        return;
      }
      document.querySelectorAll('.active .drag-area-img')?.forEach((el) => {
        el.innerHTML = '';
      });
      document.querySelectorAll('.active .drag-area')?.forEach((el) => {
        el.innerHTML = '';
      });
      const result = this.dragDropManager.showCorrectAnswers(this.currentQuestion.drags);

      this.dropAnswers = result.dropAnswers;
      this.dropResults = result.dropResults;
      this.showFullAnswerDrag();
    },

    /* ================= inline passage drag and drop ================= */
    isInlinePassageQuestion(question) {
      return [question?.type, question?.SubType, question?.subType].includes('inlinePassageDragDrop');
    },

    updateInlinePassageSubmitState() {
      if (!this.isInlinePassageQuestion(this.currentQuestion)) return;

      const requiredDrops = (this.currentQuestion.passageParts || []).filter((part) => part.type === 'drop');
      this.inlinePassageSubmitDisabled =
        requiredDrops.length === 0 || requiredDrops.some((part) => !this.inlineDropAnswers[part.id]);
    },

    syncInlineDropAnswers(dropAnswers) {
      Object.keys(this.inlineDropAnswers).forEach((dropId) => {
        if (!dropAnswers[dropId]) this.$delete(this.inlineDropAnswers, dropId);
      });
      Object.entries(dropAnswers).forEach(([dropId, answer]) => {
        this.$set(this.inlineDropAnswers, dropId, { ...answer });
      });
      this.updateInlinePassageSubmitState();
    },

    syncInlineDropResults(dropResults) {
      Object.keys(this.inlineDropResults).forEach((dropId) => {
        if (!(dropId in dropResults)) {
          this.$delete(this.inlineDropResults, dropId);
        }
      });
      Object.entries(dropResults).forEach(([dropId, result]) => {
        this.$set(this.inlineDropResults, dropId, result);
      });
    },

    createDragVisual(sourceElement) {
      const clone = sourceElement.cloneNode(true);
      const sourceElements = [sourceElement, ...sourceElement.querySelectorAll('*')];
      const cloneElements = [clone, ...clone.querySelectorAll('*')];

      sourceElements.forEach((source, index) => {
        const computedStyle = window.getComputedStyle(source);
        for (let i = 0; i < computedStyle.length; i += 1) {
          const property = computedStyle[i];
          cloneElements[index].style.setProperty(
            property,
            computedStyle.getPropertyValue(property),
            computedStyle.getPropertyPriority(property)
          );
        }
      });

      const rect = sourceElement.getBoundingClientRect();
      clone.removeAttribute('draggable');
      clone.setAttribute('aria-hidden', 'true');
      clone.style.position = 'fixed';
      clone.style.boxSizing = 'border-box';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      clone.style.left = '-10000px';
      clone.style.top = '-10000px';
      clone.style.margin = '0';
      clone.style.zIndex = '2147483647';
      clone.style.pointerEvents = 'none';
      clone.style.setProperty('opacity', '1', 'important');
      clone.style.setProperty('visibility', 'visible', 'important');
      document.body.appendChild(clone);
      return clone;
    },

    startInlineDrag(answer, event, sourceDropId = null) {
      if (!answer) return;
      if (event?.dataTransfer && (this._inlineTouchDrag || Date.now() < this._inlineTouchSuppressClickUntil)) {
        event.preventDefault();
        return;
      }
      this.stopAllAudios();
      this.activeInlineDrag = answer;
      this.activeInlineSourceDropId = sourceDropId;
      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(answer.id));
        if (
          typeof event.dataTransfer.setDragImage === 'function' &&
          event.currentTarget?.classList.contains('inline-passage-drag-card')
        ) {
          this.restoreInlineMouseDragSource();
          const dragVisual = this.createDragVisual(event.currentTarget);
          const transparentDragImage = document.createElement('div');
          const rect = event.currentTarget.getBoundingClientRect();

          dragVisual.style.left = rect.left + 'px';
          dragVisual.style.top = rect.top + 'px';
          transparentDragImage.style.position = 'fixed';
          transparentDragImage.style.left = '-10000px';
          transparentDragImage.style.top = '-10000px';
          transparentDragImage.style.width = '1px';
          transparentDragImage.style.height = '1px';
          transparentDragImage.style.opacity = '0';
          document.body.appendChild(transparentDragImage);

          event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
          this._inlineMouseDragSource = {
            element: event.currentTarget,
            visibility: event.currentTarget.style.visibility,
            visual: dragVisual,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
          };
          document.addEventListener('dragover', this.moveInlineMouseDrag, true);
          const mouseDragSource = this._inlineMouseDragSource;
          setTimeout(() => {
            if (this._inlineMouseDragSource === mouseDragSource) {
              mouseDragSource.element.style.visibility = 'hidden';
            }
            transparentDragImage.remove();
          }, 0);
        }
      }
    },

    moveInlineMouseDrag(event) {
      const source = this._inlineMouseDragSource;
      if (!source?.visual || (!event.clientX && !event.clientY)) return;
      source.visual.style.left = event.clientX - source.offsetX + 'px';
      source.visual.style.top = event.clientY - source.offsetY + 'px';
    },

    endInlineDrag() {
      this.restoreInlineMouseDragSource();
      this.inlineDragOverDropId = null;
      this.activeInlineDrag = null;
      this.activeInlineSourceDropId = null;
    },

    restoreInlineMouseDragSource() {
      const source = this._inlineMouseDragSource;
      document.removeEventListener('dragover', this.moveInlineMouseDrag, true);
      if (source?.element) source.element.style.visibility = source.visibility;
      if (source?.visual?.parentNode) {
        source.visual.parentNode.removeChild(source.visual);
      }
      this._inlineMouseDragSource = null;
    },

    startInlineTouchDrag(answer, event, sourceDropId = null) {
      if (!answer || event.touches.length !== 1 || (sourceDropId == null && this.isInlineAnswerUsed(answer.id))) {
        return;
      }

      if (this._inlineTouchDrag) this.cleanupInlineTouchDrag();
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      this._inlineTouchDrag = {
        answer,
        sourceDropId,
        sourceElement: event.currentTarget,
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
        active: false,
        ghost: null,
      };
    },

    moveInlineTouchDrag(event) {
      const drag = this._inlineTouchDrag;
      if (!drag) return;
      const touch = Array.from(event.touches).find((item) => item.identifier === drag.identifier);
      if (!touch) return;

      if (!drag.active) {
        const distance = Math.hypot(touch.clientX - drag.startX, touch.clientY - drag.startY);
        if (distance < 6) return;

        this.startInlineDrag(drag.answer, null, drag.sourceDropId);
        const ghost = this.createDragVisual(drag.sourceElement);
        drag.ghost = ghost;
        drag.active = true;
        if (drag.sourceElement.classList.contains('inline-passage-drag-card')) {
          drag.sourceVisibility = drag.sourceElement.style.visibility;
          drag.sourceElement.style.visibility = 'hidden';
        }
      }

      event.preventDefault();
      drag.ghost.style.left = touch.clientX - drag.offsetX + 'px';
      drag.ghost.style.top = touch.clientY - drag.offsetY + 'px';
      this.inlineDragOverDropId = this.getInlineTouchDropId(touch.clientX, touch.clientY);
    },

    endInlineTouchDrag(event) {
      const drag = this._inlineTouchDrag;
      if (!drag) return;
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === drag.identifier);
      if (!touch) return;

      if (drag.active) {
        event.preventDefault();
        const dropId = this.getInlineTouchDropId(touch.clientX, touch.clientY);
        if (dropId !== null) this.placeInlineAnswer(dropId, drag.answer);
        this._inlineTouchSuppressClickUntil = Date.now() + 500;
      }
      this.cleanupInlineTouchDrag();
    },

    cancelInlineTouchDrag() {
      const drag = this._inlineTouchDrag;
      if (!drag) return;
      if (drag.active) this._inlineTouchSuppressClickUntil = Date.now() + 500;
      this.cleanupInlineTouchDrag();
    },

    getInlineTouchDropId(clientX, clientY) {
      const element = document.elementFromPoint(clientX, clientY);
      const dropElement = element?.closest('.inline-passage-drag-question.active .inline-passage-drop-zone');
      if (!dropElement) return null;
      const dropElements = Array.from(
        document.querySelectorAll('.inline-passage-drag-question.active .inline-passage-drop-zone')
      );
      const dropPart = (this.currentQuestion?.passageParts || []).filter((part) => part.type === 'drop')[
        dropElements.indexOf(dropElement)
      ];
      return dropPart?.id ?? null;
    },

    cleanupInlineTouchDrag() {
      const drag = this._inlineTouchDrag;
      if (drag?.ghost?.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
      if (drag?.sourceVisibility !== undefined) {
        drag.sourceElement.style.visibility = drag.sourceVisibility;
      }
      this._inlineTouchDrag = null;
      this.inlineDragOverDropId = null;
      this.activeInlineDrag = null;
      this.activeInlineSourceDropId = null;
    },

    shouldSuppressInlineClick(event) {
      return !!event && Date.now() < this._inlineTouchSuppressClickUntil;
    },

    allowInlineDrop(dropId, event) {
      event.preventDefault();
      this.inlineDragOverDropId = dropId;
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    },

    leaveInlineDrop(dropId) {
      if (this.inlineDragOverDropId === dropId) {
        this.inlineDragOverDropId = null;
      }
    },

    handleInlineDrop(dropId, event) {
      event.preventDefault();
      this.inlineDragOverDropId = null;
      const transferredAnswerId = event.dataTransfer?.getData('text/plain');
      const transferredAnswer = (this.currentQuestion?.drags || []).find(
        (answer) => String(answer.id) === transferredAnswerId
      );
      const answer = this.activeInlineDrag || transferredAnswer;
      if (answer) this.placeInlineAnswer(dropId, answer);
      this.restoreInlineMouseDragSource();
    },

    selectInlineAnswer(answer, event) {
      if (this.shouldSuppressInlineClick(event)) return;
      if (this.isInlineAnswerUsed(answer.id)) return;
      if (this.activeInlineDrag?.id === answer.id) {
        this.activeInlineDrag = null;
        this.activeInlineSourceDropId = null;
        return;
      }
      this.activeInlineDrag = answer;
      this.activeInlineSourceDropId = null;
    },

    selectInlineDrop(dropId, event) {
      if (this.shouldSuppressInlineClick(event)) return;
      if (this.activeInlineDrag) {
        this.placeInlineAnswer(dropId, this.activeInlineDrag);
      }
    },

    placeInlineAnswer(dropId, answer) {
      const question = this.currentQuestion;
      const validDrop = (question?.passageParts || []).some((part) => part.type === 'drop' && part.id === dropId);
      const validAnswer = (question?.drags || []).some((item) => item.id === answer?.id);
      if (!validDrop || !validAnswer) return;

      this.dragDropManager.setInlinePassageState(this.inlineDropAnswers);
      const state = this.dragDropManager.placeInlineAnswer(dropId, answer);
      this.syncInlineDropAnswers(state);
      this.syncInlineDropResults({});
      this.activeInlineDrag = null;
      this.activeInlineSourceDropId = null;
    },

    removeInlineAnswer(dropId, event) {
      if (this.shouldSuppressInlineClick(event)) return;
      this.dragDropManager.setInlinePassageState(this.inlineDropAnswers);
      const state = this.dragDropManager.removeInlineAnswer(dropId);
      this.syncInlineDropAnswers(state);
      this.$delete(this.inlineDropResults, dropId);
      this.activeInlineDrag = null;
      this.activeInlineSourceDropId = null;
    },

    isInlineAnswerUsed(answerId) {
      const answerDefinition = (this.currentQuestion?.drags || []).find((answer) => answer.id === answerId);
      if (answerDefinition?.allowDuplicate === true) return false;
      return Object.values(this.inlineDropAnswers).some((answer) => answer.id === answerId);
    },

    getInlineDropAnswer(dropId) {
      return this.inlineDropAnswers[dropId] || null;
    },

    getInlineDropResult(dropId) {
      return this.inlineDropResults[dropId];
    },

    checkInlinePassageQuestion(question) {
      this.updateInlinePassageSubmitState();
      if (this.inlinePassageSubmitDisabled) return;

      this.numberOfAnswer = (question.drags || []).length;
      this.dragDropManager.setInlinePassageState(this.inlineDropAnswers);
      const result = this.dragDropManager.checkInlinePassageAnswers(question);
      this.syncInlineDropAnswers(result.dropAnswers);
      this.syncInlineDropResults(result.dropResults);
      this.correctAnswer = result.correct;
      result.correct ? this.correctAnswerSolve() : this.falseAnswerSolve();
      this.afterCheckAnswer();
    },

    showCorrectInlinePassageAnswers(question) {
      const result = this.dragDropManager.showInlinePassageAnswers(question);
      this.syncInlineDropAnswers(result.dropAnswers);
      this.syncInlineDropResults(result.dropResults);
      this.activeInlineDrag = null;
      this.activeInlineSourceDropId = null;
      this.inlineDragOverDropId = null;
    },

    resetInlinePassageQuestion() {
      if (!this.dragDropManager) return;
      this.inlinePassageSubmitDisabled = true;
      const result = this.dragDropManager.resetInlinePassageAnswers();
      this.syncInlineDropAnswers(result.dropAnswers);
      this.syncInlineDropResults(result.dropResults);
      this.activeInlineDrag = null;
      this.activeInlineSourceDropId = null;
      this.inlineDragOverDropId = null;
      this.correctAnswer = false;
    },

    /* ===================== Match web ===================== */

    drawLine(container) {
      if (!container) return;
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svgRect = container.getBoundingClientRect();
      this.svg.style.position = 'absolute';
      this.svg.style.top = '0';
      this.svg.style.left = '0';
      this.svg.style.width = '100%';
      this.svg.style.height = '100%';
      this.svg.style.pointerEvents = 'none';
      this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    },
    createSVG(ev) {
      const container = document.querySelector('.active .svg-dist');
      this.drawLine(container);
      this.lineCounter++;
      this.svg.setAttribute('data-line-id', this.lineCounter);
      const project = this.posts[0]?.projectId?.[0];
      if (project?.nameProject === 'oman') {
        this.line.setAttribute('stroke', '#5497d3');
      } else {
        this.line.setAttribute('stroke', '#24445B');
      }

      this.line.setAttribute('stroke-width', '3');
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

      const index = this.lines.findIndex((l) => l.sourceEl === sourceEl || l.targetEl === sourceEl);

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

      this.line.setAttribute('x1', x);
      this.line.setAttribute('y1', y);
      this.line.setAttribute('x2', x);
      this.line.setAttribute('y2', y);
    },


    dragOver(ev) {
      ev.preventDefault();

      const line = this.line;
      if (!line) return;

      const container = document.querySelector('.active .svg-dist');
      if (!container) return;

      const svgRect = container.getBoundingClientRect();

      const x = ev.clientX - svgRect.left;
      const y = ev.clientY - svgRect.top;

      requestAnimationFrame(() => {
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
      });
    },
    dragEnd(ev, drag) {
      const dropZone = document.elementFromPoint(ev.clientX, ev.clientY);

      if (!dropZone || !dropZone.dataset.number) {
        this.removeline();
        return;
      }

      const sourceEl = ev.currentTarget;

      const sourceIsFlip = sourceEl.classList.contains('flip');
      const targetIsFlip = dropZone.classList.contains('flip');

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
        (l) => (l.sourceEl === dropZone || l.targetEl === dropZone) && l.id !== currentLine.id
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

      this.line.setAttribute('x2', x);
      this.line.setAttribute('y2', y);

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

      const index = this.lines.findIndex((l) => l.sourceEl === target || l.targetEl === target);

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

      this.line.setAttribute('x1', x);
      this.line.setAttribute('y1', y);
      this.line.setAttribute('x2', x);
      this.line.setAttribute('y2', y);

      this.isDrawing = true;
    },
    touchMove(ev) {
      if (!this.isDrawing || !this.line) return;

      const pos = this.getTouchPosition(ev);

      const x = pos.x - this.svgRect.left;
      const y = pos.y - this.svgRect.top;

      this.line.setAttribute('x2', x);
      this.line.setAttribute('y2', y);
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

      const sourceFlip = sourceEl.classList.contains('flip');
      const targetFlip = dropZone.classList.contains('flip');

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

      const container = document.querySelector('.active .svg-dist');
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

        l.line.setAttribute('x1', x1);
        l.line.setAttribute('y1', y1);
        l.line.setAttribute('x2', x2);
        l.line.setAttribute('y2', y2);
      });
    },

    /* ===================== check , reset , show answer Match ===================== */
    resetMatching() {
      this.matchManager.reset();
      this.lines = [];
      this.lineCounter = 0;
      const elements = document.querySelectorAll('.active [data-active-line]');
      elements.forEach((el) => {
        delete el.dataset.activeLine;
      });
    },
    drawCorrectLine(sourceEl, targetEl) {
      const container = document.querySelector('.active .svg-dist');
      this.drawLine(container);
      this.line.setAttribute('stroke', '#2ECC71');
      this.line.setAttribute('stroke-width', '3');
      const rect1 = sourceEl.getBoundingClientRect();
      const rect2 = targetEl.getBoundingClientRect();
      const x1 = rect1.left - svgRect.left;
      const y1 = rect1.top - svgRect.top + rect1.height / 2;
      const x2 = rect2.right - svgRect.left;
      const y2 = rect2.top - svgRect.top + rect2.height / 2;
      this.line.setAttribute('x1', x1);
      this.line.setAttribute('y1', y1);
      this.line.setAttribute('x2', x2);
      this.line.setAttribute('y2', y2);
      this.svg.appendChild(this.line);
      container.appendChild(this.svg);
      this.lines.push({ svg: this.svg, line: this.line });
    },
    showCorrectMatching() {
      this.lines = this.matchManager.showCorrectAnswers(this.currentQuestion.matchs);
    },
    checkAnswers() {
      const count = this.currentQuestion.matchs.filter(
        (item) => item.textLeft?.trim() !== '' || item.imgLeft?.trim() !== ''
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
      this.$nextTick(() => {
        if (this.correctAnswer) return;
        if (!(this.numOfAttemp === 1 && this.numberOfAnswer > 2)) return;
        const block = document.querySelector('.feedBackTxt');
        if (!block) return;
        const paragraphs = Array.from(block.children)
          .filter((el) => el.tagName === 'P');
        if (paragraphs.length !== 2) return;
        const popupWrongParagraph = paragraphs.find(
          (p) => p.textContent.trim() === this.popupWrong.trim()
        );
        const tryAgainParagraph = paragraphs.find(
          (p) => p.textContent.trim() === this.tryAgain.trim()
        );
        if (!popupWrongParagraph || !tryAgainParagraph) return;
        popupWrongParagraph.style.order = '1';
        tryAgainParagraph.style.order = '2';
      });
      this.borderQuestion.classList.remove('poniterEvent');
      this.popupAudio.play();
      setTimeout(() => {
        const get_feed = document.querySelectorAll('.feedBack');
        // console.log(document.querySelectorAll('.feedBack'));
        get_feed.forEach((e) => e.classList.add('teacher', this.status_for_caracters))
      }, 10);
    },
    UpdateStudentActivity() {
      const currentAttemptScore = this.calculateCurrentAttemptScore();
      this.posts[0].studentPoint = Number((currentAttemptScore / 10).toFixed(1));
      this.updateCurrentProgressFeedback(this.posts[0], currentAttemptScore);
      this.updateScormScoreAfterAnswer(currentAttemptScore);
      direction != ''
        ? ((this.posts[0].title = this.data.title),
          (this.posts[0].bloomLevels = this.data.bloomLevels),
          (this.posts[0].learningObjectives = this.data.learningObjectives),
          (this.posts[0].loDegree = this.data.loDegree),
          (this.posts[0].keywords = this.data.keywords),
          (this.posts[0].type = this.data.type),
          (this.posts[0].unitId = this.data.unitId),
          !this.isFinalQuestionAttempt() && globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0]))
        : '';
    },
    calculateCurrentAttemptScore() {
      return (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) * 100;
    },
    roundFinalFeedbackScore(score) {
      const numericScore = Number(score);

      if (!Number.isFinite(numericScore)) {
        return 0;
      }

      return Math.min(100, Math.max(0, Math.round(numericScore)));
    },
    updateCurrentProgressFeedback(post, currentScore) {
      if (!post || typeof getProgressFeedback !== 'function') {
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
        typeof window.ScormService.isConnected === 'function' &&
        window.ScormService.isConnected()
      );
    },
    getHighestScormScore(currentAttemptScore) {
      const post = this.posts?.[0];
      const scormBestScore =
        window.ScormService && typeof window.ScormService.getBestScore === 'function'
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
      if (!post?.cmi?.score) return this.normalizeScormScore(currentAttemptScore);

      const highestScore = this.getHighestScormScore(currentAttemptScore);
      post.cmi.score.raw = highestScore;
      post.cmi.score.min = 0;
      post.cmi.score.max = 100;

      if (options.updateScaled) {
        post.cmi.score.scaled = Number((highestScore / 100).toFixed(1));
      }

      if (options.markIncomplete && post.cmi.completion_status === 'unknown') {
        post.cmi.completion_status = 'incomplete';
      }

      if (options.updateStatus) {
        if (highestScore >= 50) {
          post.cmi.success_status = 'passed';
          post.cmi.completion_status = 'completed';
        } else if (options.finalStatus) {
          post.cmi.success_status = 'failed';
          post.cmi.completion_status = 'incomplete';
        }
      }

      this.previousScormScore = highestScore;
      return highestScore;
    },
    updateScormScoreAfterAnswer(currentAttemptScore) {
      if (this.isScormServiceConnected() && typeof window.ScormService.updateScore === 'function') {
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

      if (typeof window.ScormService.getBestScore === 'function') {
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

      if (typeof window.ScormService.getPersistedStatus !== 'function') return;

      const persisted = window.ScormService.getPersistedStatus();
      if (!persisted || !persisted.hasFinalStatus) return;

      const alreadyRestored = post.cmi.completion_status !== 'unknown' || post.cmi.success_status !== 'unknown';
      if (alreadyRestored) return;

      post.cmi.completion_status = persisted.completionStatus;
      post.cmi.success_status = persisted.successStatus;
    },
    initializeNumberOfAttempt(post, restoredPost) {
      if (!post || this.numberOfAttemptInitialized) return;

      const previousAttemptCount = Number(restoredPost?.NumberOfAttempt ?? post.NumberOfAttempt);
      post.NumberOfAttempt =
        Number.isFinite(previousAttemptCount) && previousAttemptCount >= 0 ? Math.floor(previousAttemptCount) + 1 : 1;
      this.numberOfAttemptInitialized = true;
    },
    getQuestionCollectionName(post) {
      if (!post) return '';

      const collectionNames = ['questions', 'items', 'slides', 'words', 'tabs'];
      return collectionNames.find((name) => Array.isArray(post[name])) || '';
    },
    isScormCloudEnvironment() {
      return window.location.hostname.includes('cloud.scorm');
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
        questionlevel: question.questionlevel ?? '',
        questionType: question.questionType ?? '',
        answersType: question.answersType ?? '',
        startTime: question.startTime ?? '',
        endTime: question.endTime ?? '',
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
        [questionCollection || 'questions']: questionItems,
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
      console.log(`Score: ${cmi.score.raw} | Completion: ${cmi.completion_status} | Success: ${cmi.success_status}`);
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
      const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const ss = String(totalSeconds % 60).padStart(2, '0');

      return `${hh}:${mm}:${ss}`;
    },
    formatSecondsToScormTime(totalSeconds) {
      const safeSeconds = Math.max(0, Math.floor(totalSeconds));
      const hh = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
      const mm = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
      const ss = String(safeSeconds % 60).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    },
    parseScormTimeToSeconds(timeValue) {
      if (timeValue == null) return 0;

      if (typeof timeValue === 'number') {
        return Number.isFinite(timeValue) ? Math.max(0, Math.floor(timeValue)) : 0;
      }

      if (typeof timeValue === 'string') {
        const hhmmss = timeValue.match(/^(\d+):(\d{2}):(\d{2})$/);
        if (hhmmss) {
          return Number(hhmmss[1]) * 3600 + Number(hhmmss[2]) * 60 + Number(hhmmss[3]);
        }

        const isoDuration = timeValue.match(/^PT(\d+)H(\d+)M(\d+)S$/);
        if (isoDuration) {
          return Number(isoDuration[1]) * 3600 + Number(isoDuration[2]) * 60 + Number(isoDuration[3]);
        }

        const numeric = Number(timeValue);
        if (Number.isFinite(numeric)) return Math.max(0, Math.floor(numeric));
      }

      return 0;
    },
    persistFinalActivityState() {
      if (
        typeof direction !== 'undefined' &&
        direction !== '' &&
        typeof globalFunctions !== 'undefined' &&
        typeof globalFunctions.UpdateStudentActivity === 'function' &&
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
      const isActivityComplete = this.finishLO && this.questionIndex >= this.questions.length;

      if (isActivityComplete && !this.scormReported) {
        this.scormReported = true;
        this.posts[0].studentPoint = Number((result / 10).toFixed(1));
        const previousTotalSeconds = this.parseScormTimeToSeconds(this.posts[0].cmi.total_time);
        const currentSessionSeconds = Math.floor((Date.now() - this.scormStartTime) / 1000);
        this.posts[0].cmi.total_time = this.formatSecondsToScormTime(previousTotalSeconds + currentSessionSeconds);

        if (this.isScormServiceConnected()) {
          setTimeout(() => {
            try {
              if (typeof window.ScormService.reportResult === 'function') {
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
              if (typeof window.ScormService.completeSession === 'function') {
                window.ScormService.completeSession();
              }
            } catch (e) {
              console.error(e);
            }

            try {
              if (typeof window.ScormService.finish === 'function') {
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
      const result = (this.posts[0].LOcorrectcounter / this.posts[0].numberOfquestion) * 100;
      const finalFeedbackScore = this.roundFinalFeedbackScore(result);

      this.scormPost();

      this.posts[0].scoreOutOf10 =
        result == 0 ? 0 : result <= 25 ? 2.5 : result <= 50 ? 5 : result <= 75 ? 7.5 : 10;
      finalResponse.submitData(
        JSON.stringify(this.posts[0]),
        (this.posts[0].scoreOutOf10 * 4) / 10,
        this.posts[0].scoreOutOf10
      );

      if (finalFeedbackScore >= 50) {
        this.passLo = true;
        this.feedbackPassAudio.play();
        this.status_for_caracters = 'happy';
      } else {
        this.passLo = false;
        this.feedbackFailAudio.play();
        this.status_for_caracters = 'sad';
      }

      this.resolveFinalProgressFeedback(finalFeedbackScore);
    },
    resolveFinalProgressFeedback(finalProgressScore) {
      const post = this.posts?.[0];
      if (!post) return;

      const feedbackScore = this.roundFinalFeedbackScore(finalProgressScore);

      if (typeof calculate === 'function') {
        try {
          calculate(feedbackScore, 100, this.lang === 'eng', false, post);
        } catch (e) {
          console.error(e);
        }
      }

      const progressFeedback = this.updateCurrentProgressFeedback(post, feedbackScore);

      if (!progressFeedback) return;
      this.Keyfeedback =
        typeof progressFeedback.keyFeedback === 'string' ? progressFeedback.keyFeedback : '';

      if (typeof post.feedBackTxt === 'string' && post.feedBackTxt.trim() !== '') {
        if (!this.passLo) {
          this.tryAgain = post.feedBackTxt;
        }
      }

      if (typeof post.feedBackDes === 'string' && post.feedBackDes.trim() !== '') {
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
      this.currentQuestion.type == 'choose'
        ? (this.currentQuestion.answers = this.shuffleArray(this.currentQuestion.answers))
        : '';
      this.currentQuestion.type == 'dragDrop' || this.isClassificationQuestion(this.currentQuestion)
        ? (this.DragShuffled = this.shuffleArray(this.currentQuestion?.drags))
        : '';
      this.currentQuestion.type == 'match'
        ? [
          (this.matchingRightShuffled = this.shuffleArray(this.currentQuestion?.matchs)),
          (this.matchingLeftShuffled = this.shuffleArray(this.currentQuestion?.matchs)),
        ]
        : '';
    },

    // For Overlay
    toggleoverlayHandler() {
      if (this.toggleOverlay) {
        this.closeOverlayHandler();
        return;
      }

      // Subtitle narration is only allowed after the popup has closed.
      this.clearFirstQuestionGuidance();
      this.stopAndResetSubTitleAudio();
      this.toggleOverlay = true;
      this.overlayTexts = this.currentQuestion?.popup || [];

      // passageAudio is created with the Vue instance, so it is ready in this
      // user gesture and does not depend on the popup DOM being rendered.
      this.playPassageAudioFromStart();
    },
    closeOverlayHandler() {
      if (!this.toggleOverlay) return;

      const closingQuestion = this.currentQuestion;
      const sound = this.subTitleSound;

      // Stop first so audio cannot continue while Vue removes the popup.
      this.resetPassageAudio();
      this.stopAndResetSubTitleAudio();
      this.toggleOverlay = false;

      // Missing or empty subtitle sources do not affect the popup flow.
      if (!sound) return;

      const requestId = ++this.subTitleAudioRequestId;
      this.$nextTick(() => {
        if (
          this.subTitleAudioRequestId !== requestId ||
          this.toggleOverlay ||
          this.currentQuestion !== closingQuestion
        ) {
          return;
        }

        this.playSubTitleSound(sound);
      });
    },

    correctAnswerSolve() {
      this.posts[0].LOcorrectcounter += 1;
      this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;
      // console.log(this.posts[0].LOcorrectcounter);
      this.correctAudio.play();
      this.status_for_caracters = 'happy';
    },
    falseAnswerSolve() {
      this.wrongAudio.play();
      this.status_for_caracters = 'sad';
    },

    orderQuestions(questions) {
      if (questionOrderMode === 'unshuffledQuestions') return this.preserveQuestionOrder(questions);
      if (questionOrderMode === 'shuffleQuestionsBySubType') return this.buildSubTypeShuffledQuestions(questions);
      return this.buildShuffledQuestions(questions);
    },

    getQuestionDisplayCount(totalQuestionCount, showAllQuestions = false) {
      if (showAllQuestions) return totalQuestionCount;
      if (totalQuestionCount >= 20) return 20;
      if (totalQuestionCount >= 8) return 8;
      return totalQuestionCount;
    },

    logQuestionOrder(questions, totalQuestionCount) {
      const localHostnames = ['127.0.0.1', 'localhost', '::1', '[::1]'];
      if (!localHostnames.includes(window.location.hostname)) return;

      console.group(`Question order: ${questionOrderMode} (${questions.length}/${totalQuestionCount})`);
      console.table(
        questions.map((question, index) => {
          const answerSummary = this.getQuestionAnswerSummary(question);

          return {
            order: index + 1,
            type: question.type || 'defaultType',
            subType: this.getQuestionSubType(question),
            question: question.question || question.title || '',
            answers: answerSummary.answers,
            correctAnswers: answerSummary.correctAnswers,
          };
        })
      );
      console.groupEnd();
    },

    getQuestionAnswerSummary(question) {
      const joinValues = (values, separator = ' | ') =>
        values.filter((value) => value !== '' && value != null).join(separator);
      const getItemLabel = (item) => {
        if (item == null) return '';
        if (typeof item !== 'object') return String(item);

        const textValue = item.choose ?? item.toChoose ?? item.text ?? item.label ?? item.title;
        if (textValue !== '' && textValue != null) return String(textValue);
        if (item.img) return `[image: ${item.img}]`;
        return item.id != null ? String(item.id) : '';
      };
      const getMatchSide = (item, side) => {
        const text = item?.[`text${side}`];
        if (text !== '' && text != null) return String(text);
        const image = item?.[`img${side}`];
        return image ? `[image: ${image}]` : '';
      };
      const emptySummary = { answers: '', correctAnswers: '' };

      if (!question) return emptySummary;

      if (question.type === 'choose' || question.type === 'trueFalse') {
        const answers = Array.isArray(question.answers) ? question.answers : [];
        return {
          answers: joinValues(answers.map(getItemLabel)),
          correctAnswers: joinValues(
            answers.filter((answer) => answer.answer === true).map(getItemLabel)
          ),
        };
      }

      if (question.type === 'input' || question.type === 'correct') {
        const inputs = Array.isArray(question.inputs) ? question.inputs : [];
        const acceptedValues = inputs.map((input, index) => {
          const validValues = Array.isArray(input.valid) ? input.valid.map(String) : [];
          return validValues.length ? `${index + 1}: ${validValues.join(' / ')}` : '';
        });
        const formattedValues = joinValues(acceptedValues);
        return { answers: formattedValues, correctAnswers: formattedValues };
      }

      if (question.type === 'match') {
        const matches = Array.isArray(question.matchs) ? question.matchs : [];
        const leftAnswers = joinValues(matches.map((item) => getMatchSide(item, 'Left')));
        const rightAnswers = joinValues(matches.map((item) => getMatchSide(item, 'Right')));
        return {
          answers: joinValues([
            leftAnswers ? `Left: ${leftAnswers}` : '',
            rightAnswers ? `Right: ${rightAnswers}` : '',
          ]),
          correctAnswers: joinValues(
            matches.map((item) => {
              const left = getMatchSide(item, 'Left');
              const right = getMatchSide(item, 'Right');
              return left || right ? `${left} ↔ ${right}` : '';
            })
          ),
        };
      }

      if (question.type === 'classification') {
        const drags = Array.isArray(question.drags) ? question.drags : [];
        const categories = Array.isArray(question.categories) ? question.categories : [];
        return {
          answers: joinValues(drags.map(getItemLabel)),
          correctAnswers: joinValues(
            drags.map((drag) => {
              const category = categories.find((item) => item.id === drag.categoryId);
              const categoryLabel = getItemLabel(category) || drag.categoryId || '';
              return `${getItemLabel(drag)} → ${categoryLabel}`;
            })
          ),
        };
      }

      if (this.isInlinePassageQuestion(question)) {
        const drags = Array.isArray(question.drags) ? question.drags : [];
        const dropParts = Array.isArray(question.passageParts)
          ? question.passageParts.filter((part) => part.type === 'drop')
          : [];
        return {
          answers: joinValues(drags.map(getItemLabel)),
          correctAnswers: joinValues(
            dropParts.map((part) => {
              const answer = drags.find((drag) => drag.id === part.correctAnswerId);
              return `${part.label || part.id || 'drop'} → ${getItemLabel(answer)}`;
            })
          ),
        };
      }

      if (question.type === 'dragDrop') {
        const drags = Array.isArray(question.drags) ? question.drags : [];
        const dragLabels = drags.map(getItemLabel).filter(Boolean);
        const correctAnswer =
          question.CorrectAnswer !== '' && question.CorrectAnswer != null
            ? String(question.CorrectAnswer)
            : dragLabels.join(' → ');
        return {
          answers: joinValues(dragLabels),
          correctAnswers: correctAnswer,
        };
      }

      if (question.type === 'countMulti') {
        const groups = Array.isArray(question.groups) ? question.groups : [];
        return {
          answers: joinValues(
            groups.map((group) => `${getItemLabel(group)}: 1-${group.optionCount || 6}`)
          ),
          correctAnswers: joinValues(
            groups.map((group) => `${getItemLabel(group)} → ${group.answer}`)
          ),
        };
      }

      return emptySummary;
    },

    getQuestionSubType(question) {
      const subTypeKey = Object.keys(question || {}).find(
        (key) => key.toLowerCase() === 'subtype'
      );

      return subTypeKey && question[subTypeKey] ? question[subTypeKey] : 'defaultSub';
    },

    buildShuffledQuestions(questions) {
      // Group by subType first, then by type, preserving first-seen order.
      const groups = new Map();
      questions.forEach((q) => {
        const sub = this.getQuestionSubType(q);
        const type = q.type || 'defaultType';

        if (!groups.has(sub)) groups.set(sub, new Map());

        const typeGroups = groups.get(sub);
        if (!typeGroups.has(type)) typeGroups.set(type, []);
        typeGroups.get(type).push(q);
      });

      const shuffled = [];

      groups.forEach((typeGroups) => {
        typeGroups.forEach((typeQuestions) => {
          // Shuffle only questions sharing both subType and type.
          shuffled.push(...this.shuffleArray(typeQuestions));
        });
      });

      return shuffled;
    },
    buildSubTypeShuffledQuestions(questions) {
      const groups = {};
      questions.forEach((q) => {
        const type = q.type || 'defaultType';
        const sub = this.getQuestionSubType(q);
        if (!groups[type]) groups[type] = {};
        if (!groups[type][sub]) groups[type][sub] = [];
        groups[type][sub].push(q);
      });
      const shuffled = [];
      const typeKeys = this.shuffleArray(Object.keys(groups));
      typeKeys.forEach((type) => {
        const subGroups = groups[type];
        const subKeys = this.shuffleArray(Object.keys(subGroups));
        subKeys.forEach((sub) => {
          const shuffledSub = this.shuffleArray(subGroups[sub]);
          shuffled.push(...shuffledSub);
        });
      });
      return shuffled;
    },
    preserveQuestionOrder(questions) {
      return [...questions];
    },

    /* ===================== check , reset , show answer Input ===================== */

    maxLength(event) {
      maxLength(event, this.currentQuestion);
    },

    changeValue() {
      this.stopAllAudios();
      const submitBtn = document.querySelector('.active .sumbit');
      if (allInputsFilled()) {
        submitBtn.classList.remove('dimmed');
      } else {
        submitBtn.classList.add('dimmed');
      }
    },
    countMultiFilled(question) {
      return CountMulti.filled(question);
    },
    countMultiHasAnySelection(question) {
      return Boolean(
        question?.groups?.some(
          (group) => Array.isArray(group.selected) && group.selected.length > 0
        )
      );
    },
    countMultiGroupCorrect(question, group) {
      return CountMulti.groupCorrect(question, group);
    },
    isCountMultiFirstWrongAttempt(question) {
      return Boolean(
        question?.countMultiSubmitted &&
        question?.countMultiSubmittedAttempt === 1 &&
        question?.countMultiSubmissionCorrect === false
      );
    },
    selectCountMulti(group, number) {
      if (!group || this.currentQuestion.countMultiSubmitted) return;
      const selected = CountMulti.nextSelection(group, number);
      if (!selected) return;

      this.$set(group, 'selected', selected);
      if (this.countMultiGuidance === 'node') {
        this.countMultiGuidance = 'waitingForSubmit';
      }
      this.stopAllAudios();
    },
    checkCountMulti() {
      const question = this.currentQuestion;
      if (!question || question.type !== 'countMulti' || !this.countMultiHasAnySelection(question)) return;

      this.countMultiGuidance = null;
      const result = CountMulti.check(question);
      const submittedAttempt = this.numOfAttemp + 1;

      this.$set(question, 'countMultiSubmittedAttempt', submittedAttempt);
      this.$set(question, 'countMultiSubmissionCorrect', result.isCorrect);
      this.$set(question, 'countMultiSubmitted', true);
      this.correctAnswer = result.isCorrect;
      this.numberOfAnswer = result.numberOfAnswer;

      this.$nextTick(() => {
        this.correctAnswer ? this.correctAnswerSolve() : this.falseAnswerSolve();
        this.afterCheckAnswer();
      });
    },
    resetCountMulti() {
      CountMulti.reset(this.currentQuestion);
      this.countMultiGuidance = 'node';
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

window.addEventListener('beforeunload', () => {
  try {
    if (window.ScormService && window.ScormService.isConnected()) {
      //window.ScormService.finish();
    }
  } catch (err) {
    console.error(err);
  }
});
