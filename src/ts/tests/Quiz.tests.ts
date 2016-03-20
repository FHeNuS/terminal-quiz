jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

describe("Quiz", function() {

  describe("when executes", function() {

    it("with no onEnd function does not trigger an error", function() {

      loadFixtures('quizContainer.html');

      var quiz = new TerminalQuiz.Quiz($("#container").get(0), {
         typeMessageDelay: 100
      });

      quiz.start();
    });

  });

});
