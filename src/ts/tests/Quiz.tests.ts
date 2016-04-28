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

            it("should start the background audio", function() {

                spyOn(quiz, 'playSound');

                quiz.start();

                expect(quiz.playSound).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.Background, true);
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

    describe("validateAnswer", () => {

        var question = null;
        var answer = null;
        var processor: TerminalQuiz.QuestionProcessor<any> = null;

        beforeEach(() => {

            question = new DummyQuestion("someQuestion");

            answer = new TerminalQuiz.Answer();

            processor = new TerminalQuiz.QuestionProcessor(question);

            spyOn(question, 'getProcessor').and.returnValue(processor);

            spyOn(quiz, 'playSound');

            spyOn(quiz, 'onQuestionAnswered');

        });

        describe("current question is valid", () => {

            beforeEach(() => {

                spyOn(processor, 'validateAnswer').and.callFake((answer, messenger) => {

                });
            })

            it("should raise onQuestionAnswered event", function() {

                quiz.validateAnswer(question, answer);

                expect(quiz.onQuestionAnswered).toHaveBeenCalledWith(question);
            });

            it("should return true", function() {

                expect(quiz.validateAnswer(question, answer)).toBe(true);
            });

            it("should play the RightAnswer sound", function() {

                quiz.validateAnswer(question, answer);

                expect(quiz.playSound).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.RightAnswer);
            });
        })

        describe("current question is not invalid", () => {

            beforeEach(() => {

                spyOn(quiz, 'echoFail');

                spyOn(processor, 'validateAnswer').and.callFake(() => {

                    answer.isValid = false;
                });
            })

            it("should not ask the next question", () => {

                quiz.validateAnswer(question, answer);

                expect(quiz.onQuestionAnswered).not.toHaveBeenCalled();
            });

            it("should return false", () => {

                expect(quiz.validateAnswer(question, answer)).toBe(false);
            });

            it("should play the WrongAnswer sound", () => {

                quiz.validateAnswer(question, answer);

                expect(quiz.playSound).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.WrongAnswer);
            });
        });
    });

    describe("end", () => {

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

            spyOn(quiz, 'stopSound');

            quiz.end();

            expect(quiz.stopSound).toHaveBeenCalledWith(TerminalQuiz.QuizSounds.Background);
        });

        it("should notify end event listeners", function() {

            spyOn(quiz, 'onEnd');

            quiz.end();

            expect(quiz["onEnd"]).toHaveBeenCalled();
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

        var processor = null;

        beforeEach(() => {

            spyOn(quiz, 'clear');

            spyOn(quiz, 'echo');

            spyOn(quiz, 'onQuestionRendered');

            spyOn(quiz, 'hidePromptIfNeeded');

            element = {};

            question = jasmine.createSpyObj("Question", ["getProcessor", "initialize"]);

            processor = jasmine.createSpyObj("QuestionProcessor", ["render"]);

            (<jasmine.Spy>question.getProcessor).and.returnValue(processor);
        });

        it("should echo the question render result", () => {

            (<jasmine.Spy>question.initialize).and.callFake(() => {

                // Should clear before rendering
                expect(quiz.clear).toHaveBeenCalled();
            });

            (<jasmine.Spy>processor.render).and.callFake(() => {

                // Should initialize before rendering
                expect(question.initialize).toHaveBeenCalled();

                return element;
            });

            (<jasmine.Spy>quiz.echo).and.callFake(() => {

                // Should hide the prompt before rendering
                expect(quiz.hidePromptIfNeeded).toHaveBeenCalledWith(processor);
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
