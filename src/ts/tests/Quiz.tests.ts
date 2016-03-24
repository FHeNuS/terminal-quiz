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

    describe("addQuestion", () => {

        describe("duplicated question name", () => {

            it("should throw an Error", () => {
                
                quiz.addQuestion(new DummyQuestion("sameName"));

                expect(() => {

                    quiz.addQuestion(new DummyQuestion("sameName"));

                }).toThrowError(`Cannot add a question named 'sameName' twice!`);
            });
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

                dummyQuestion = new DummyQuestion("The sample question.").withTitle("Title");

                quiz.addQuestion(dummyQuestion);
            });

            it("should set the first question as the current", function() {

                quiz.start();

                expect(quiz.getCurrentQuestion()).toBe(dummyQuestion);
            });

            it("should ask the current question", function() {

                spyOn(quiz, 'askCurrentQuestion');

                quiz.start();

                expect(quiz.askCurrentQuestion).toHaveBeenCalled();
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

        describe("it did start", function() {

            var dummy1: TerminalQuiz.Question = null;
            var dummy2: TerminalQuiz.Question = null;

            beforeEach(() => {

                dummy1 = quiz.addQuestion(new DummyQuestion("Dummy1")).withTitle("Title");
                dummy2 = quiz.addQuestion(new DummyQuestion("Dummy2")).withTitle("Title");

                quiz.start();
            });

            describe("it's not last question and current question is valid", () => {

                beforeEach(() => {

                    spyOn(quiz, 'validateCurrentAnswer').and.returnValue(true);

                    quiz.start();
                });

                it("should ask the next question", function() {

                    spyOn(quiz, 'askCurrentQuestion');

                    quiz.goToNextQuestion();

                    expect(quiz.askCurrentQuestion).toHaveBeenCalled();
                });

                it("should move to the next question", function() {

                    quiz.goToNextQuestion();

                    expect(quiz.getCurrentQuestion()).toBe(dummy2);
                });
            })

            describe("it's not last question and current question is not valid", () => {

                beforeEach(() => {

                    spyOn(quiz, 'validateCurrentAnswer').and.returnValue(false);

                    quiz.start();
                });

                it("should not ask the next question", function() {

                    spyOn(quiz, 'askCurrentQuestion');

                    quiz.goToNextQuestion();

                    expect(quiz.askCurrentQuestion).not.toHaveBeenCalled();
                });
            });

            describe("it's the last question", () => {

                beforeEach(() => {

                    spyOn(quiz, 'end');
                    spyOn(quiz, 'validateCurrentAnswer').and.returnValue(true);

                    quiz.goToNextQuestion();
                    quiz.goToNextQuestion();
                });

                it("should call end method", function() {

                    expect(quiz.getCurrentQuestion()).toBe(dummy2);
                });

                it("should not ask the next question", function() {

                    spyOn(quiz, 'askCurrentQuestion');

                    quiz.goToNextQuestion();

                    expect(quiz.askCurrentQuestion).not.toHaveBeenCalled();
                });
            })
        });
    });

    describe("validateCurrentAnswer", () => {

        describe("has current question", () => {

            var question: TerminalQuiz.Question = null;
            var answer: TerminalQuiz.QuestionAnswer = null;
            var processor: TerminalQuiz.QuestionProcessor = null;

            beforeEach(() => {

                question = new DummyQuestion("Dummy1");
                answer = new TerminalQuiz.QuestionAnswer();
                processor = new TerminalQuiz.QuestionProcessor(question);

                spyOn(quiz, 'getCurrentQuestion').and.returnValue(question);
                spyOn(quiz, 'getAnswer').and.returnValue(answer);
                spyOn(question, 'getProcessor').and.returnValue(processor);
            });

            it("question processor does not raise errors returns true", () => {

                spyOn(processor, 'validateAnswer').and.callFake((answer, messenger) => {

                });

                expect(quiz.validateCurrentAnswer()).toBe(true);
                expect(quiz.getAnswer).toHaveBeenCalledWith(question);
            });

            it("question processor does raise errors", () => {

                spyOn(quiz, 'echoFail');

                spyOn(processor, 'validateAnswer').and.callFake((answer, messenger) => {

                    (<TerminalQuiz.IMessenger>messenger).echoFail("someFailure");
                });

                expect(quiz.validateCurrentAnswer()).toBe(false);
                expect(quiz.getAnswer).toHaveBeenCalledWith(question);
            });
        });
    });

    describe("askCurrentQuestion", () => {

        var dummyQuestion: DummyQuestion = null;

        beforeEach(() => {

            quiz.initialize();
            dummyQuestion = quiz.addQuestion(new DummyQuestion("Dummy1").withTitle("Title"));
            quiz.start();
        });
    });
});
