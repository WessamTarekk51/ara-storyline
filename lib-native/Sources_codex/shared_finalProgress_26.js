   let Estimation;
   function calculate(result,loQuestion,isEng,upper,post) {
       let finalProgress = (result / loQuestion) * 100;
       let feedbackDescription = "";
      if (finalProgress == 0) {
        stars.playSegments([0, 1], true);
      } else if (finalProgress > 0 && finalProgress < 50) {
        stars.playSegments([0, 1], true);
      } else if (finalProgress >= 50 && finalProgress <= 64 ) {
        stars.playSegments([0, 60], true);
      } else if (finalProgress >= 65 && finalProgress <= 84) {
        stars.playSegments([0, 75], true);
      } else if (finalProgress >= 84 && finalProgress <= 100) {
        stars.playSegments([0, 100], true);
      }

      if (post && typeof getProgressFeedback === "function") {
        const progressFeedback = getProgressFeedback(finalProgress, post);

        if (progressFeedback) {
          Estimation = progressFeedback.txt;
          feedbackDescription = progressFeedback.description;
        }
      }

      return [Estimation , finalProgress, feedbackDescription ] ;
    }

    
