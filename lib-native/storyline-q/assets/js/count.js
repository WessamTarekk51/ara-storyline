const CountMulti = {
  filled(question) {
    if (!question || question.type !== "countMulti") return false;
    return question.groups.every(
      (group) => group.selected && group.selected.length > 0
    );
  },

  groupCorrect(question, group) {
    return Boolean(
      question &&
        group &&
        group.selected &&
        group.selected.length === group.answer
    );
  },

  nextSelection(group, number) {
    if (!group) return null;

    const selected = Array.isArray(group.selected) ? [...group.selected] : [];
    const nextNumber = selected.length + 1;

    if (number === nextNumber) {
      selected.push(number);
    } else if (number === selected.length && selected.length > 0) {
      selected.pop();
    } else {
      return null;
    }

    return selected;
  },

  check(question) {
    if (!question || question.type !== "countMulti") return null;

    const isCorrect = question.groups.every(
      (group) => group.selected.length === group.answer
    );

    question.groups.forEach((group) => {
      group.solve = group.selected.length === group.answer;
    });

    return {
      isCorrect: isCorrect,
      numberOfAnswer: question.groups.length,
    };
  },

  reset(question) {
    if (!question || !Array.isArray(question.groups)) return;

    question.groups.forEach((group) => {
      group.selected = [];
    });
    question.countMultiSubmitted = false;
  },
};
