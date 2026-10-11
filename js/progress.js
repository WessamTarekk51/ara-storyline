// ---------------------------------------------------------------------------
// CONFIGURATION — educational stages where feedBackDes = feedBackTxt
// ---------------------------------------------------------------------------
// To make a stage use the level's short text (feedBackTxt) as the feedback
// description (feedBackDes) instead of the detailed text from level.Feedback,
// add an entry here. Each entry may set any combination of grade/stage/term/
// language (parsed from Educational_stage, e.g. "1r_1a"); omitted keys match
// any value. Stages left out of this list keep the current behavior exactly.
// No changes to the functions below are needed to add or remove a stage.
//
// Examples:
//   { stage: "k" }                          // all kindergarten stages
//   { grade: 1, stage: "r", language: "a" }  // grade 1 rowda, Arabic only
const STAGES_USING_TXT_AS_DESCRIPTION = [
  // { stage: "r", grade: 1, language: "a" },
];

// Controls only the optional <p>{{Keyfeedback}}</p> line in Storyline Q.
// Set to true to show the level text, or false to keep that line empty.
const SHOW_KEY_FEEDBACK = false;

const levels = [
  {
    min: 0,
    max: 50,
    txtAr: "مقبول",
    txtEn: "Fair",
    Feedback: [
      {
        descriptionAr: "نريدُ الأفضل!",
        descriptionEn: "Keep going!",
      },
      {
        descriptionAr: "محاولة مقبولة! راجع الدرس، ثم حاول مرة أخرى",
        descriptionEn:
          "You tried well! Review the lesson and try again to improve your score",
      },
      {
        descriptionAr:
          "تدرَّب أكثر! ستساعدك مراجعة الدرس على الإجابة بثقة أكبر",
        descriptionEn:
          "Keep practicing! Reviewing the lesson will help you answer more confidently",
      },
      {
        descriptionAr:
          "راجع النقاط الرئيسة في الدرس، ثم حاول مرة أخرى لتحقق نتيجة أفضل",
        descriptionEn:
          "Review the key points of the lesson, then try again to achieve a better score",
      },
    ],
  },
  {
    min: 50,
    max: 65,
    txtAr: "جيد",
    txtEn: "Good",
    Feedback: [
      {
        descriptionAr: "هيه، أحسنت!",
        descriptionEn: "Yay, good!",
      },
      {
        descriptionAr: "جيد! واصل التدريب لتحسِّن أداءك",
        descriptionEn: "Good job! Keep practicing to improve your performance",
      },
      {
        descriptionAr: "أداء جيد! استمر في حل التدريبات لزيادة فهمك",
        descriptionEn:
          "Good work! Keep solving practice exercises to strengthen your understanding",
      },
      {
        descriptionAr: "مستواك جيد. واصل التدريب لتنمية مهاراتك وتحسين أدائك",
        descriptionEn:
          "Good progress. Continue practicing to develop your skills and performance",
      },
    ],
  },
  {
    min: 65,
    max: 85,
    txtAr: "جيد جدًّا",
    txtEn: "Very Good",
    Feedback: [
      {
        descriptionAr: "واو، رائع!",
        descriptionEn: "Wow, great!",
      },
      {
        descriptionAr: "جيد جدًّا! أنت مستعد للاختبار",
        descriptionEn:
          "Very good! You are ready to take the exam and test your knowledge",
      },
      {
        descriptionAr: "جيد جدًّا! أنت مستعد لخوض الاختبار",
        descriptionEn:
          "Very good! You are ready to take the exam and test your knowledge",
      },
      {
        descriptionAr: "مستواك جيد جدًّا. يمكنك الآن خوض الاختبار بثقة",
        descriptionEn:
          "Very good progress. You can now move on to the exam with confidence",
      },
    ],
  },
  {
    min: 85,
    max: 101,
    txtAr: "ممتاز",
    txtEn: "Excellent",
    Feedback: [
      {
        descriptionAr: "أنت نَجْم!",
        descriptionEn: "Super star!",
      },
      {
        descriptionAr: "ممتاز! لقد فهمت الدرس",
        descriptionEn: "Excellent! You understand the lesson very well",
      },
      {
        descriptionAr: "ممتاز! أنت مستعد تمامًا للانتقال إلى الدرس التالي",
        descriptionEn: "Excellent! You are fully ready for the next lesson",
      },
      {
        descriptionAr:
          "ممتاز. أنت مستعد تمامًا للانتقال إلى الدرس التالي",
        descriptionEn:
          "Excellent achievement. You are fully prepared to continue to the next lesson",
      },
    ],
  },
];

function parseEducationalStage(educationalStage) {
  const match = String(educationalStage || "").match(
    /^(\d+)([krp])_(\d+)([ae])$/i,
  );

  if (!match) {
    return null;
  }

  return {
    grade: Number(match[1]),
    stage: match[2].toLowerCase(),
    term: Number(match[3]),
    language: match[4].toLowerCase(),
  };
}

function getFeedbackIndexByEducationalStage(educationalStage) {
  const metadata = parseEducationalStage(educationalStage);

  if (!metadata) {
    return null;
  }

  if (metadata.stage === "k") {
    return 0;
  }

  if (metadata.stage === "r") {
    if (metadata.grade >= 1 && metadata.grade <= 3) {
      return 1;
    }

    if (metadata.grade >= 4 && metadata.grade <= 6) {
      return 2;
    }
  }

  if (metadata.stage === "p") {
    return 3;
  }

  return null;
}

function preparePostFeedbackMetadata(post) {
  if (!post) {
    return null;
  }

  const metadata = parseEducationalStage(post.Educational_stage);

  if (!metadata) {
    return post;
  }

  if (metadata.language === "a") {
    post.lang = "ara";
  } else if (metadata.language === "e") {
    post.lang = "eng";
  }

  const feedbackIndex = getFeedbackIndexByEducationalStage(
    post.Educational_stage,
  );

  if (feedbackIndex !== null) {
    post.feedbackIndex = feedbackIndex;
  }

  return post;
}

function matchesStageConfig(metadata, config) {
  return (
    (config.grade === undefined || config.grade === metadata.grade) &&
    (config.stage === undefined || config.stage === metadata.stage) &&
    (config.term === undefined || config.term === metadata.term) &&
    (config.language === undefined || config.language === metadata.language)
  );
}

function shouldUseTxtAsDescription(metadata) {
  if (!metadata) {
    return false;
  }

  return STAGES_USING_TXT_AS_DESCRIPTION.some((config) =>
    matchesStageConfig(metadata, config),
  );
}

function getLevel(score) {
  return levels.find((level) => score >= level.min && score < level.max);
}

function getProgressFeedbackConfig(postOrEducationalStage) {
  const post =
    postOrEducationalStage && typeof postOrEducationalStage === "object"
      ? postOrEducationalStage
      : null;
  const educationalStage = post
    ? post.Educational_stage
    : postOrEducationalStage;
  const preparedPost = post ? preparePostFeedbackMetadata(post) : null;
  const metadata = parseEducationalStage(educationalStage);

  if (!metadata) {
    return null;
  }

  const isArabic =
    (preparedPost?.lang || "") === "ara" || metadata.language === "a";

  return {
    textKey: isArabic ? "txtAr" : "txtEn",
    descriptionKey: isArabic ? "descriptionAr" : "descriptionEn",
    feedbackIndex: Number.isInteger(preparedPost?.feedbackIndex)
      ? preparedPost.feedbackIndex
      : getFeedbackIndexByEducationalStage(educationalStage),
    metadata,
    post: preparedPost,
  };
}

function getProgressFeedback(score, postOrEducationalStage) {
  const feedbackConfig = getProgressFeedbackConfig(postOrEducationalStage);
  const level = getLevel(score);

  if (!feedbackConfig || feedbackConfig.feedbackIndex === null || !level) {
    return null;
  }

  const txt = level[feedbackConfig.textKey];
  const rawDescription =
    level.Feedback[feedbackConfig.feedbackIndex]?.[
      feedbackConfig.descriptionKey
    ];
  const description = shouldUseTxtAsDescription(feedbackConfig.metadata)
    ? txt
    : rawDescription;

  if (feedbackConfig.post) {
    feedbackConfig.post.feedBackTxt = txt;
    feedbackConfig.post.feedBackDes = description;
  }

  return {
    txt,
    description,
    keyFeedback: SHOW_KEY_FEEDBACK ? txt : "",
    level,
    feedbackIndex: feedbackConfig.feedbackIndex,
    metadata: feedbackConfig.metadata,
  };
}
