describe("TextQuestionProcessor", () => {

    var question: TerminalQuiz.TextQuestion = null;
    var processor: TerminalQuiz.TextQuestionProcessor = null;
    var ctx: TerminalQuiz.QuizContext = null;

    beforeEach(() => {

        question = new TerminalQuiz.TextQuestion("Dummy");
        processor = new TerminalQuiz.TextQuestionProcessor(question);
        ctx = jasmine.createSpyObj("ctx", ["echoFail"]);
    })

    describe("validateAnswer", () => {

        describe("has pattern", () => {

            beforeEach(() => {

                question.withPattern(/\d/, "#");
            });

            describe("parsed answer does not match pattern", () => {

                it("should raise error message with the friendly pattern", () => {

                    processor.validateAnswer("a", ctx);

                    expect(ctx.echoFail).toHaveBeenCalledWith(`The answer 'a' does not respect the pattern '#'!`);
                })
            })

            describe("parsed answer matches pattern", () => {

                it("should not raise any error", () => {

                    processor.validateAnswer("1", ctx);

                    expect(ctx.echoFail).not.toHaveBeenCalled();
                })
            })
        })
    })
})
