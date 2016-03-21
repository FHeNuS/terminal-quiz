jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

import Utils = TerminalQuiz.Tests.Utils;

import DummyQuestion = TerminalQuiz.Tests.DummyQuestion;

describe("Quiz", function() {

    var quiz: TerminalQuiz.Quiz = null;
    var container: JQuery = null;

    beforeEach(() => {

        loadFixtures('quizContainer.html');

        container = $("#container");

        quiz = new TerminalQuiz.Quiz(container.get(0));
    });

    afterEach(() => {

        quiz.destroy();
    });
    
    describe("start", function() {

        it("no questions added should throw an error", function() {

            expect(() => {

                quiz.start();

            }).toThrowError("The quiz cannot start because it has no questions!")

        });

        describe("with proper setup", function() {

            it("initializes correctly and waits for user input", function() {

                quiz.addQuestion(new DummyQuestion("something", quiz));

                quiz.start();

                expect(container.data('terminal-quiz')).not.toBeNull();

                spyOn(quiz, 'onUserCommand');

                Utils.type(container, "someCommand");

                expect(quiz.onUserCommand).toHaveBeenCalledWith("someCommand");
            });
        });
    });

    describe("onUserCommand", () => {

        var dummyQuestion = null;

        beforeEach(() => {

            dummyQuestion = new DummyQuestion("The sample question.", quiz);

            quiz.addQuestion(dummyQuestion);

            spyOn(dummyQuestion, 'ask');

            quiz.start();
        });

        it("user types start cmd, asks first question", function() {

            quiz.onUserCommand("start");

            expect(dummyQuestion.ask).toHaveBeenCalled();
        });

        it("user types unknown cmd, don't ask anything and display error", function() {

            spyOn(quiz, "echoFail");

            quiz.onUserCommand("something");

            expect(dummyQuestion.ask).not.toHaveBeenCalled();

            expect(quiz.echoFail).toHaveBeenCalledWith("Unknown command!");
        });
    });
});
