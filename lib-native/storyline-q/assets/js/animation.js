

let stars = bodymovin.loadAnimation({
  container: document.getElementById('stars'),
  path: '../../../lib-native/storyline-q/assets/animations/feedbackstar/stars.json',
  renderer: 'svg',
  loop: false,
  autoplay: false,
});

(function initializeCharacterAnimation() {
  const container = document.getElementById('character');
  const app = window.app;

  if (!container || !app) return;

  const CHARACTER_NAME_PATTERN = /^[a-z0-9_-]+$/i;
  const AVAILABLE_CHARACTERS = new Set(['teacher']);
  // Idle-state cycle: any of these present in the loaded file are used, in this priority order
  // (older characters ship idle/thinking/bored; newer ones ship idle/bored only). Advances to
  // the next one only when the current segment finishes playing (not on a timer).
  const QUESTION_MARKER_ORDER = ['idle', 'thinking', 'bored'];
  // Correct/wrong feedback marker, preferring the newer happy/sad naming and falling
  // back to the older correct/wrong naming for existing characters.
  const FEEDBACK_MARKER_CANDIDATES = {
    correct: ['happy', 'correct'],
    wrong: ['sad', 'wrong'],
  };
  // Optional marker shown instead of the plain "correct" reaction once the learner has
  // answered two (or more) questions correctly in a row. Not used for a single correct
  // answer, and never used as a transition between the question and feedback states.
  const EXCITED_MARKER = 'excited';
  const EXCITED_STREAK_THRESHOLD = 2;
  const CHARACTER_ASSET_ROOT =
    '../../../lib-native/storyline-q/assets/animations/character';

  let animation = null;
  let activeCharacter = '';
  let isReady = false;
  let markerSegments = new Map();
  let questionMarkers = [];
  let feedbackMarkers = { correct: '', wrong: '', excited: '' };
  let correctStreak = 0;
  let questionStateIndex = 0;
  let currentMode = '';
  let currentMarker = '';

  container.hidden = true;
  container.setAttribute('aria-hidden', 'true');

  function getConfiguredCharacter() {
    const configuredCharacter =
      app.posts?.[0]?.character || app.localPosts?.[0]?.character || '';

    return typeof configuredCharacter === 'string'
      ? configuredCharacter.trim().toLowerCase()
      : '';
  }

  function hideCharacter() {
    container.hidden = true;
    container.setAttribute('aria-hidden', 'true');
    container.classList.remove('is-feedback');
    animation?.pause();
    currentMarker = '';
  }

  function destroyCharacter() {
    animation?.destroy();
    animation = null;
    isReady = false;
    markerSegments = new Map();
    questionMarkers = [];
    feedbackMarkers = { correct: '', wrong: '', excited: '' };
    correctStreak = 0;
    activeCharacter = '';
    currentMode = '';
    currentMarker = '';
    container.innerHTML = '';
    hideCharacter();
  }

  function getMarkerName(marker) {
    if (typeof marker?.cm !== 'string') return '';

    const comment = marker.cm.trim();
    if (!comment.startsWith('{')) return comment.toLowerCase();

    try {
      const markerData = JSON.parse(comment);
      return typeof markerData.name === 'string'
        ? markerData.name.trim().toLowerCase()
        : '';
    } catch (error) {
      return comment.toLowerCase();
    }
  }

  function collectMarkerSegments() {
    const segments = new Map();
    const markers = animation?.animationData?.markers;

    if (!Array.isArray(markers)) return segments;

    markers.forEach((marker) => {
      const name = getMarkerName(marker);
      const startFrame = Number(marker.tm);
      const duration = Number(marker.dr);

      if (
        !name ||
        !Number.isFinite(startFrame) ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        return;
      }

      segments.set(name, [startFrame, startFrame + duration]);
    });

    return segments;
  }

  function pickFeedbackMarker(candidates) {
    return candidates.find((name) => markerSegments.has(name)) || '';
  }

  function validateRequiredMarkers() {
    markerSegments = collectMarkerSegments();

    questionMarkers = QUESTION_MARKER_ORDER.filter((name) =>
      markerSegments.has(name)
    );
    feedbackMarkers = {
      correct: pickFeedbackMarker(FEEDBACK_MARKER_CANDIDATES.correct),
      wrong: pickFeedbackMarker(FEEDBACK_MARKER_CANDIDATES.wrong),
      excited: markerSegments.has(EXCITED_MARKER) ? EXCITED_MARKER : '',
    };

    const missingMarkers = [];
    if (questionMarkers.length === 0) missingMarkers.push('idle');
    if (!feedbackMarkers.correct) missingMarkers.push('happy/correct');
    if (!feedbackMarkers.wrong) missingMarkers.push('sad/wrong');

    if (missingMarkers.length === 0) return true;

    console.warn(
      `Character "${activeCharacter}" is missing Lottie markers: ${missingMarkers.join(', ')}`
    );
    return false;
  }

  function showCharacter(isFeedback) {
    container.hidden = false;
    container.setAttribute('aria-hidden', 'false');
    container.classList.toggle('is-feedback', isFeedback);
  }

  function playMarker(markerName, isFeedback) {
    const segment = markerSegments.get(markerName);

    if (!animation || !isReady || !segment) {
      hideCharacter();
      return;
    }

    currentMarker = markerName;
    showCharacter(isFeedback);
    animation.playSegments(segment, true);
  }

  function startQuestionCycle() {
    if (questionMarkers.length === 0) return;
    questionStateIndex = 0;
    playMarker(questionMarkers[questionStateIndex], false);
  }

  function advanceQuestionCycle() {
    if (questionMarkers.length === 0) return;
    questionStateIndex = (questionStateIndex + 1) % questionMarkers.length;
    playMarker(questionMarkers[questionStateIndex], false);
  }

  function isCurrentAnswerCorrect() {
    return app.homeButtonShow ? app.passLo : app.correctAnswer;
  }

  // Resolves which marker to play for this feedback entry AND updates the consecutive-
  // correct streak. Has side effects, so it must run exactly once per new feedback event
  // (guarded by the currentMode check in syncCharacterPlayback), never on re-evaluation.
  function resolveFeedbackMarker(isCorrect) {
    if (!isCorrect) {
      correctStreak = 0;
      return feedbackMarkers.wrong;
    }

    correctStreak += 1;
    if (correctStreak >= EXCITED_STREAK_THRESHOLD && feedbackMarkers.excited) {
      return feedbackMarkers.excited;
    }
    return feedbackMarkers.correct;
  }

  function syncCharacterPlayback(forceRestart) {
    if (!animation || !isReady || !app.start) {
      hideCharacter();
      currentMode = '';
      return;
    }

    if (app.feedback) {
      // The final lo-level pass/fail screen is not a "question answer" and never
      // takes part in the correct-answer streak or the excited marker.
      const isFinalScreen = app.homeButtonShow;
      const isCorrect = isCurrentAnswerCorrect();
      // Keyed by questionIndex (not just correctness) so two different questions that
      // happen to share the same outcome are never mistaken for the same feedback event
      // -- otherwise a genuinely new correct answer could be silently skipped.
      const nextMode = isFinalScreen
        ? `final-${isCorrect ? 'correct' : 'wrong'}`
        : `feedback-${app.questionIndex}-${isCorrect ? 'correct' : 'wrong'}`;

      // Note: forceRestart intentionally does NOT bypass this guard. Unlike the question
      // idle-cycle, resolveFeedbackMarker has a side effect (the streak counter), so it
      // must never run twice for the same feedback event even if a forced re-sync
      // (e.g. from the questionIndex watcher) lands in the same reactivity flush.
      if (currentMode !== nextMode) {
        currentMode = nextMode;
        const marker = isFinalScreen
          ? (isCorrect ? feedbackMarkers.correct : feedbackMarkers.wrong)
          : resolveFeedbackMarker(isCorrect);
        playMarker(marker, true);
      }
      return;
    }

    if (app.homeButtonShow) {
      hideCharacter();
      currentMode = '';
      return;
    }

    if (forceRestart || currentMode !== 'question') {
      currentMode = 'question';
      startQuestionCycle();
    }
  }

  function loadCharacter(characterName) {
    if (characterName === activeCharacter && animation) {
      syncCharacterPlayback();
      return;
    }

    destroyCharacter();

    if (!characterName) return;

    if (!CHARACTER_NAME_PATTERN.test(characterName)) {
      console.warn(`Invalid character name: ${characterName}`);
      return;
    }

    if (!AVAILABLE_CHARACTERS.has(characterName)) {
      console.warn(`Character does not exist: ${characterName}`);
      return;
    }

    activeCharacter = characterName;
    animation = bodymovin.loadAnimation({
      container,
      path: `${CHARACTER_ASSET_ROOT}/${characterName}.json`,
      renderer: 'svg',
      loop: false,
      autoplay: false,
    });

    animation.addEventListener('DOMLoaded', () => {
      if (activeCharacter !== characterName) return;

      if (!validateRequiredMarkers()) {
        animation.destroy();
        animation = null;
        container.innerHTML = '';
        hideCharacter();
        return;
      }

      isReady = true;
      syncCharacterPlayback(true);
    });

    animation.addEventListener('complete', () => {
      if (!animation || !isReady || !currentMarker) return;

      if (currentMode === 'question') {
        advanceQuestionCycle();
        return;
      }

      // Feedback (or the final pass/fail screen): loop the current marker until the
      // state changes.
      const segment = markerSegments.get(currentMarker);
      if (segment) animation.playSegments(segment, true);
    });

    animation.addEventListener('data_failed', () => {
      if (activeCharacter !== characterName) return;
      console.warn(`Character animation was not found: ${characterName}.json`);
      destroyCharacter();
    });
  }

  function syncConfiguredCharacter() {
    loadCharacter(getConfiguredCharacter());
  }

  app.$watch(getConfiguredCharacter, syncConfiguredCharacter);
  app.$watch('start', () => syncCharacterPlayback());
  app.$watch('feedback', () => syncCharacterPlayback());
  app.$watch('homeButtonShow', () => syncCharacterPlayback());
  app.$watch('correctAnswer', () => syncCharacterPlayback());
  app.$watch('passLo', () => syncCharacterPlayback());
  app.$watch('questionIndex', () => {
    syncCharacterPlayback(true);
  });

  window.addEventListener('beforeunload', destroyCharacter);
  syncConfiguredCharacter();
})();
