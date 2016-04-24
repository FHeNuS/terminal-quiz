jasmine.getFixtures().fixturesPath = 'base/src/ts/tests/fixtures';

import Utils = TerminalQuiz.Tests.Utils;

import DummyQuestion = TerminalQuiz.Tests.DummyQuestion;

describe("Quiz", function() {

    var quiz: TerminalQuiz.Quiz = null;
    var options: TerminalQuiz.IQuizOptions = {};
    var container: JQuery = null;

    beforeEach(() => {

        loadFixtures('quizContainer.html');

        container = $("#container");

        quiz = new TerminalQuiz.Quiz(container.get(0), options);
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

    describe("ask", () => {

        describe("duplicated question name", () => {

            it("should throw an Error", () => {

                quiz.ask(new DummyQuestion("sameName"));

                expect(() => {

                    quiz.ask(new DummyQuestion("sameName"));

                }).toThrowError(`Cannot add a question named 'sameName' twice!`);
            });
        });
    });

    describe("askCurrentQuestion", () => {

        var question: TerminalQuiz.Question = null;

        beforeEach(() => {

            quiz.initialize();

            question = new DummyQuestion("someName");

            spyOn(quiz, 'getCurrentQuestion').and.returnValue(question);

            spyOn(quiz, 'moveToNextQuestion');

            spyOn(quiz, 'renderQuestion');
        });

        describe("has no if clause", () => {

            it("should render question", () => {

                quiz.askCurrentQuestion();

                expect(quiz.renderQuestion).toHaveBeenCalledWith(question);
            });
        });

        describe("if clause returns true", () => {

            it("should render question", () => {

                spyOn(question, 'getIfCallback').and.returnValue(() => true);

                quiz.askCurrentQuestion();

                expect(quiz.renderQuestion).toHaveBeenCalledWith(question);
            });
        });

        describe("question should not be asked", () => {

            beforeEach(() => {

                spyOn(question, 'getIfCallback').and.returnValue(() => false);

                quiz.askCurrentQuestion();
            });

            it("should not render question", () => {

                expect(quiz.renderQuestion).not.toHaveBeenCalled();
            });

            it("should go to next question", () => {

                expect(quiz.moveToNextQuestion).toHaveBeenCalled();
            })
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

                quiz.ask(dummyQuestion);
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

                expect(quiz["playAudio"]).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.Background, true);
            });

            it("should call onStart callback", function() {

                options.onStart = (): void => { }

                spyOn(options, 'onStart');

                quiz.start();

                expect(options.onStart).toHaveBeenCalled();
            });
        });
    });

    describe("moveToNextQuestion", () => {

        var dummy1: TerminalQuiz.Question = null;
        var dummy2: TerminalQuiz.Question = null;

        beforeEach(() => {

            dummy1 = quiz.ask(new DummyQuestion("Dummy1")).withTitle("Title");
            dummy2 = quiz.ask(new DummyQuestion("Dummy2")).withTitle("Title");

            quiz.initialize();
            quiz.start();
        });

        describe("it's not the last question", () => {

            beforeEach(() => {

                spyOn(quiz, 'askCurrentQuestion');

                quiz.moveToNextQuestion();
            })

            it("should ask the next question", function() {

                expect(quiz.askCurrentQuestion).toHaveBeenCalled();
            });

            it("should move to the next question", function() {

                expect(quiz.getCurrentQuestion()).toBe(dummy2);
            });
        })
    })

    describe("validateCurrentQuestion", () => {

        var question = null;

        beforeEach(() => {

            question = new DummyQuestion("someQuestion");

            spyOn(quiz, "getCurrentQuestion").and.returnValue(question);

            spyOn(quiz, 'playAudio');

            spyOn(quiz, 'onQuestionAnswered');

            spyOn(quiz, 'moveToNextQuestion');
        });

        describe("current question is valid", () => {

            beforeEach(() => {

                spyOn(quiz, 'validateAnswer').and.returnValue(true);

                quiz.validateCurrentQuestion();
            })

            it("should raise onQuestionAnswered event", function() {

                expect(quiz.onQuestionAnswered).toHaveBeenCalledWith(question);
            });

            it("should move to next question", function() {

                expect(quiz.moveToNextQuestion).toHaveBeenCalled();
            });

            it("should play the RightAnswer sound", function() {

                expect(quiz.playAudio).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.RightAnswer);
            });
        })

        describe("current question is invalid", () => {

            beforeEach(() => {

                spyOn(quiz, 'validateAnswer').and.returnValue(false);

                quiz.validateCurrentQuestion();
            })

            it("should not ask the next question", function() {

                expect(quiz.moveToNextQuestion).not.toHaveBeenCalled();

                expect(quiz.onQuestionAnswered).not.toHaveBeenCalled();
            });

            it("should play the WrongAnswer sound", function() {

                expect(quiz.playAudio).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.WrongAnswer);
            });
        });
    });

    describe("validateAnswer", () => {

        describe("has current question", () => {

            var question: TerminalQuiz.Question = null;
            var answer: TerminalQuiz.Answer = null;
            var processor: TerminalQuiz.QuestionProcessor<any> = null;

            beforeEach(() => {

                question = new DummyQuestion("Dummy1");
                answer = new TerminalQuiz.Answer();
                processor = new TerminalQuiz.QuestionProcessor(question);
                quiz.initialize();

                spyOn(quiz, 'getAnswer').and.returnValue(answer);
                spyOn(question, 'getProcessor').and.returnValue(processor);
            });

            it("question processor does not raise errors returns true", () => {

                spyOn(processor, 'validateAnswer').and.callFake((answer, messenger) => {

                });

                expect(quiz.validateAnswer(question)).toBe(true);
                expect(quiz.getAnswer).toHaveBeenCalledWith(question);
            });

            it("question processor does raise errors", () => {

                spyOn(quiz, 'echoFail');

                spyOn(processor, 'validateAnswer').and.callFake(() => {

                    answer.isValid = false;
                });

                expect(quiz.validateAnswer(question)).toBe(false);
                expect(quiz.getAnswer).toHaveBeenCalledWith(question);
            });
        });
    });

    describe("end", () => {

        describe("quiz has started", () => {

            beforeEach(() => {

                quiz.initialize();
                quiz.ask(new DummyQuestion("Dummy").withTitle("Title"));
                quiz.start();
            });

            it("should stop the background audio", function() {

                spyOn(quiz, 'clear');

                quiz.end();

                expect(quiz.clear).toHaveBeenCalled();
            });

            it("should stop the background audio", function() {

                spyOn(quiz, 'stopAudio');

                quiz.end();

                expect(quiz["stopAudio"]).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.Background);
            });

            it("should notify end event listeners", function() {

                spyOn(quiz, 'onEnd');

                quiz.end();

                expect(quiz["onEnd"]).toHaveBeenCalled();
            });

            it("should mark the test as not started", function() {

                quiz.end();

                expect(quiz.hasStarted()).toBe(false);
            });
        });

        describe("quiz did not initialize", () => {

            it("should throw an error", () => {

                expect(() => {

                    quiz.end();

                }).toThrowError("Cannot end the quiz because it did not initialize!");
            })
        });

        describe("quiz did not start", () => {

            it("should throw an error", () => {

                expect(() => {

                    quiz.initialize();

                    quiz.end();

                }).toThrowError("Cannot end the quiz because it did not start!");
            })
        });
    });

    describe("onQuestionAnswered", () => {

        describe("onQuestionAnswered", () => {

            var question = null;
            var answer = null;

            beforeEach(() => {

                question = jasmine.createSpyObj("Question", ["getWhenAnsweredCallback"]);
                answer = {
                    parsedAnswer: {}
                };
            });

            it("should call onQuestionAnswered callback", () => {

                options.onQuestionAnswered = () => {};

                spyOn(options, 'onQuestionAnswered');
                spyOn(quiz, 'getAnswer').and.returnValue(answer);

                quiz.onQuestionAnswered(question);

                expect(quiz.getAnswer).toHaveBeenCalledWith(question);
                expect(options.onQuestionAnswered).toHaveBeenCalledWith(question, answer.parsedAnswer);
            });
        });
    });

    describe("renderQuestion", () => {

        var element = null;

        var question = null;

        beforeEach(() => {

            spyOn(quiz, 'clear');

            spyOn(quiz, 'echo');

            spyOn(quiz, 'onQuestionRendered');

            element = {};

            question = jasmine.createSpyObj("Question", ["render", "getProcessor"]);
        });

        it("should echo the question render result", () => {

            (<jasmine.Spy>question.render).and.callFake(() => {

                // Should clear before rendering
                expect(quiz.clear).toHaveBeenCalled();

                return element;
            });

            quiz.renderQuestion(question);

            expect(quiz.echo).toHaveBeenCalled();

            var echoCallArgs = (<jasmine.Spy>quiz.echo).calls.mostRecent().args;

            expect(echoCallArgs[0]).toBe(element);

            // Should not call onQuestionRendered before echo animates
            expect(quiz.onQuestionRendered).not.toHaveBeenCalledWith(question);

            // Simulate onEndAnimate callBack
            echoCallArgs[1]();

            expect(quiz.onQuestionRendered).toHaveBeenCalledWith(question);
        })
    })
});
