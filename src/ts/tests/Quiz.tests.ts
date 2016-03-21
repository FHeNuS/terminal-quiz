jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

describe("Quiz", function() {

  describe("start", function() {

     describe("no questions added", function() {

      it("shoud not throw an error", function() {

        loadFixtures('quizContainer.html');

        var quiz = new TerminalQuiz.Quiz($("#container").get(0), {
          typeMessageDelay: 100 });

          quiz.start();
        });

        });

      });

});
