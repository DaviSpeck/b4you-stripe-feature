const SerializeQuestion = require('./Questions');

const resolveNestedAnswers = (questions) => {
  const questionsWithAnswers = questions.map((question) => {
    if (!Array.isArray(question.answers)) {
      question.datavalues.answers = [];
    } else {
      question.dataValues.answers.forEach((a) => {
        a.dataValues.answers = [];
      });
    }

    return question;
  });

  questionsWithAnswers.map(({ answers }) => {
    const duplicated = [];
    answers.map((answer) => {
      const topLevelIndex = answers.findIndex(
        (a) => a.id === answer.id_question,
      );
      if (topLevelIndex !== -1) {
        answers[topLevelIndex].dataValues.answers.push(
          new SerializeQuestion(answer).adapt(),
        );
        answers[topLevelIndex].dataValues.answers.sort((a, b) => a.id - b.id);
        duplicated.push(answer);
      }

      return answer;
    });
    duplicated.forEach((answer) => {
      const index = answers.findIndex((a) => a.id === answer.id);
      answers.splice(index, 1);
    });
    return answers;
  });

  questionsWithAnswers.map((question) => {
    question.dataValues.answers = new SerializeQuestion(
      question.dataValues.answers,
    ).adapt();
    return question;
  });

  return new SerializeQuestion(questionsWithAnswers).adapt();
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (!Array.isArray(this.data))
      throw new Error('Expect data to be an Array');

    return resolveNestedAnswers(this.data);
  }
};
