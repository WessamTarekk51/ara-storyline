let Estimation;
function calculate(result, loQuestion, isEng, upper, post) {
  const rawProgress = Number(loQuestion) > 0 ? (Number(result) / Number(loQuestion)) * 100 : 0;
  const finalProgress = Number.isFinite(rawProgress) ? Math.min(100, Math.max(0, Math.round(rawProgress))) : 0;
  let feedbackDescription = "";
  if (finalProgress < 50) {
    stars.playSegments([0, 1], true);
  } else if (finalProgress < 65) {
    stars.playSegments([0, 60], true);
  } else if (finalProgress < 85) {
    stars.playSegments([0, 75], true);
  } else {
    stars.playSegments([0, 100], true);
  }

  if (post && typeof getProgressFeedback === "function") {
    const progressFeedback = getProgressFeedback(finalProgress, post);

    if (progressFeedback) {
      Estimation = progressFeedback.txt;
      feedbackDescription = progressFeedback.description;
    }
  }

  return [Estimation, finalProgress, feedbackDescription];
}