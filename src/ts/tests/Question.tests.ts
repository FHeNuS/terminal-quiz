jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

describe("Question", function() {

    var dummyQuestion: TerminalQuiz.Tests.DummyQuestion = null;
    var quiz: TerminalQuiz.Quiz = null;
    var container: JQuery = null;

    beforeEach(() => {

        loadFixtures('quizContainer.html');

        container = $("#container");

        quiz = new TerminalQuiz.Quiz(container.get(0));

        dummyQuestion = new DummyQuestion("Question1", quiz).withText("A simple question?");

        quiz.addQuestion(dummyQuestion);

        quiz.start();
    });

    afterEach(() => {

        quiz.destroy();
    });

    describe("ask", function() {

        it("no onAnswer defined show not throw an error", function() {

            dummyQuestion.ask(() => {

            });

            Utils.type(container, "");
        });
    });
});
