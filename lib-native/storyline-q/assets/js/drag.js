class DragDropManager {
  constructor() {
    this.dropAnswers = [];
    this.dropResults = [];
    this.inlineDropAnswers = {};
    this.inlineDropResults = {};
  }

  setState(dropAnswers) {
    this.dropAnswers = dropAnswers;
  }

  checkClassification(question, assignments) {
    const drags = question.drags || [];
    const categories = question.categories || [];
    const results = {};
    drags.forEach((drag) => {
      const assigned = assignments[drag.id];
      const placed = categories.some((category) => category.id === assigned);
      // Only cards inside a table receive visual correctness feedback.
      if (placed) results[drag.id] = drag.categoryId !== null && assigned === drag.categoryId;
    });
    // Completion depends on each category's item count, not answer correctness.
    const complete = drags.some((drag) => drag.categoryId !== null &&
      categories.some((category) => category.id === drag.categoryId)) && categories.every((category) => {
      const expectedCount = drags.filter((drag) => drag.categoryId === category.id).length;
      const placedCount = drags.filter((drag) => assignments[drag.id] === category.id).length;
      return placedCount === expectedCount;
    });
    const correct = complete && drags.every((drag) => drag.categoryId === null
      ? !categories.some((category) => category.id === assignments[drag.id])
      : results[drag.id] === true);
    return { complete, correct, results };
  }

  revealClassification(question) {
    const assignments = {};
    (question.drags || []).forEach((drag) => {
      if (drag.categoryId !== null &&
          (question.categories || []).some((category) => category.id === drag.categoryId)) {
        assignments[drag.id] = drag.categoryId;
      }
    });
    return assignments;
  }

   revealAnswer(question) {
    return {
      dropAnswers: [],
      dropResults: [],
      correctAnswer: question.CorrectAnswer
    };
  }

  checkAnswers(drags) {
    let correct = true;
    this.dropResults = [];

    drags.forEach((drag, index) => {
      if (!this.dropAnswers[index] || this.dropAnswers[index].id !== drag.id) {
        this.dropResults[index] = false;
        correct = false;
      } else {
        this.dropResults[index] = true;
      }
    });

    return {
      correct,
      dropResults: this.dropResults,
    };
  }

  showCorrectAnswers(drags) {
    this.dropAnswers = [];
    this.dropResults = [];

    drags.forEach((drag, index) => {
      this.dropAnswers[index] = drag;
      this.dropResults[index] = true;
    });

    return {
      dropAnswers: this.dropAnswers,
      dropResults: this.dropResults,
    };
  }

  reset(drags) {
    this.dropAnswers = [];
    this.dropResults = [];

    drags.forEach((drag) => {
      drag.placed = false;
    });

    return {
      dropAnswers: [],
      dropResults: [],
    };
  }

  setInlinePassageState(dropAnswers) {
    this.inlineDropAnswers = {};
    const usedAnswerIds = new Set();

    Object.entries(dropAnswers || {}).forEach(([dropId, answer]) => {
      if (
        !dropId ||
        !answer ||
        answer.id === undefined ||
        answer.id === null ||
        (usedAnswerIds.has(answer.id) && answer.allowDuplicate !== true)
      ) {
        return;
      }
      this.inlineDropAnswers[dropId] = { ...answer };
      if (answer.allowDuplicate !== true) usedAnswerIds.add(answer.id);
    });

    return this.inlineDropAnswers;
  }

  placeInlineAnswer(dropId, answer) {
    if (
      !dropId ||
      !answer ||
      answer.id === undefined ||
      answer.id === null
    ) {
      return this.inlineDropAnswers;
    }

    const sourceDropId =
      answer.allowDuplicate === true
        ? null
        : Object.keys(this.inlineDropAnswers).find(
            (id) => this.inlineDropAnswers[id]?.id === answer.id,
          );
    if (sourceDropId && sourceDropId !== dropId) {
      delete this.inlineDropAnswers[sourceDropId];
      delete this.inlineDropResults[sourceDropId];
    }

    this.inlineDropAnswers[dropId] = { ...answer };
    delete this.inlineDropResults[dropId];
    return this.inlineDropAnswers;
  }

  removeInlineAnswer(dropId) {
    delete this.inlineDropAnswers[dropId];
    delete this.inlineDropResults[dropId];
    return this.inlineDropAnswers;
  }

  returnInlineAnswer(answerId) {
    const dropId = Object.keys(this.inlineDropAnswers).find(
      (id) => this.inlineDropAnswers[id]?.id === answerId,
    );
    if (dropId) this.removeInlineAnswer(dropId);
    return this.inlineDropAnswers;
  }

  checkInlinePassageAnswers(question) {
    const dropParts = (question?.passageParts || []).filter(
      (part) => part.type === "drop",
    );
    const dropResults = {};
    const missingDropIds = [];
    const incorrectDropIds = [];

    dropParts.forEach((part) => {
      const assignedAnswer = this.inlineDropAnswers[part.id];
      if (!assignedAnswer) {
        dropResults[part.id] = false;
        missingDropIds.push(part.id);
      } else if (assignedAnswer.id !== part.correctAnswerId) {
        dropResults[part.id] = false;
        incorrectDropIds.push(part.id);
      } else {
        dropResults[part.id] = true;
      }
    });

    this.inlineDropResults = dropResults;
    return {
      correct:
        dropParts.length > 0 &&
        missingDropIds.length === 0 &&
        incorrectDropIds.length === 0,
      dropResults: this.inlineDropResults,
      dropAnswers: this.inlineDropAnswers,
      missingDropIds,
      incorrectDropIds,
    };
  }

  showInlinePassageAnswers(question) {
    this.inlineDropAnswers = {};
    this.inlineDropResults = {};
    const answers = Array.isArray(question?.drags) ? question.drags : [];
    const usedAnswerIds = new Set();

    (question?.passageParts || [])
      .filter((part) => part.type === "drop")
      .forEach((part) => {
        const answer = answers.find(
          (item) => item.id === part.correctAnswerId,
        );
        if (
          !answer ||
          (usedAnswerIds.has(answer.id) && answer.allowDuplicate !== true)
        ) {
          return;
        }
        this.inlineDropAnswers[part.id] = { ...answer };
        this.inlineDropResults[part.id] = true;
        if (answer.allowDuplicate !== true) usedAnswerIds.add(answer.id);
      });

    return {
      dropAnswers: this.inlineDropAnswers,
      dropResults: this.inlineDropResults,
    };
  }

  resetInlinePassageAnswers() {
    this.inlineDropAnswers = {};
    this.inlineDropResults = {};
    return {
      dropAnswers: {},
      dropResults: {},
    };
  }

  getInlineAnswer(dropId) {
    return this.inlineDropAnswers[dropId] || null;
  }

  isInlineAnswerUsed(answerId) {
    return Object.values(this.inlineDropAnswers).some(
      (answer) => answer.id === answerId && answer.allowDuplicate !== true,
    );
  }
}

window.DragDropManager = DragDropManager;
