jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

import Utils = TerminalQuiz.Tests.Utils;

import DummyQuestion = TerminalQuiz.Tests.DummyQuestion;

describe("Quiz", function() {

    var quiz: TerminalQuiz.Quiz = null;
    var container: JQuery = null;

    beforeEach(() => {

        loadFixtures('quizContainer.html');

        container = $("#container");

        quiz = new TerminalQuiz.Quiz(container.get(0), {});
    });

    afterEach(() => {

        quiz.destroy();
    });

    describe("initialize", function() {

        it("initializes correctly and expects user input", function() {

            quiz.initialize();

            Utils.type(container, "someCommand", false);

            expect($(container.find(".cmd").children().get(1)).text()).toBe("someCommand");
        });
    });

    describe("start", () => {

        beforeEach(() => {

            quiz.initialize();
        });

        it("no questions added should throw an error", function() {

            expect(() => {

                quiz.start();

            }).toThrowError("The quiz cannot start because it has no questions!")
        });

        describe("with questions added ", () => {

            var dummyQuestion = null;

            beforeEach(() => {

                dummyQuestion = new DummyQuestion("The sample question.", quiz);

                quiz.addQuestion(dummyQuestion);
            });

            it("should set the first question as the current", function() {

                quiz.start();

                expect(quiz.getCurrentQuestion()).toBe(dummyQuestion);
            });

            it("should set the quiz as started", function() {

                quiz.start();

                expect(quiz.hasStarted()).toBe(true);
            });

            it("should start the background audio", function() {

                spyOn(quiz, 'playAudio');

                quiz.start();

                expect(quiz["playAudio"]).toHaveBeenCalledWith(TerminalQuiz.Quiz.BACKGROUND_AUDIO_NAME, true);
            });
        });
    });

    describe("goToNextQuestion", () => {

        beforeEach(() => {

            quiz.initialize();
        });

        it("if did not start should throw an error", function() {

            expect(() => {

                quiz.goToNextQuestion();

            }).toThrowError("Cannot go to the next question because the quiz did not start yet! Did you call the start method?")
        });

        describe("it started", function() {

            var dummy1: TerminalQuiz.Question = null;
            var dummy2: TerminalQuiz.Question = null;

            beforeEach(() => {

                dummy1 = quiz.addQuestion(new DummyQuestion("Dummy1", quiz));
                dummy2 = quiz.addQuestion(new DummyQuestion("Dummy2", quiz));

                quiz.start();
            });

            describe("it's not last question", () => {

                it("should move to the next question", function() {

                    quiz.goToNextQuestion();

                    expect(quiz.getCurrentQuestion()).toBe(dummy2);
                });

                it("should return true", function() {

                    expect(quiz.goToNextQuestion()).toBe(true);
                });
            })

            describe("it's last question", () => {

                beforeEach(() => {

                    spyOn(quiz, 'end');

                    quiz.goToNextQuestion();
                    quiz.goToNextQuestion();
                });

                it("should call end method", function() {

                    expect(quiz.getCurrentQuestion()).toBe(dummy2);
                });

                it("should return false", function() {

                    expect(quiz.end).toHaveBeenCalled();
                });
            })
        });

        it("it started and is last question move to next question", function() {

            var dummy1 = quiz.addQuestion(new DummyQuestion("Dummy1", quiz));
            var dummy2 = quiz.addQuestion(new DummyQuestion("Dummy2", quiz));

            quiz.start();

            quiz.goToNextQuestion();

            expect(quiz.getCurrentQuestion()).toBe(dummy2);
        });
    });
});
