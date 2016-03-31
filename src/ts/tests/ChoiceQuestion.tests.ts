describe("ChoiceQuestion", () => {

    var question: TerminalQuiz.ChoiceQuestion<any> = null;
    var processor: TerminalQuiz.ChoiceQuestionProcessor = null;
    var ctx: TerminalQuiz.QuizContext = null;

    beforeEach(() => {

        question = new TerminalQuiz.ChoiceQuestion("Dummy");
        processor = new TerminalQuiz.ChoiceQuestionProcessor(question);
        ctx = jasmine.createSpyObj("ctx", ["echoFail"]);
    })

    describe("quiz.askChoice", () => {

        var question = null;
        var quiz: TerminalQuiz.IQuiz = null;
        var opts = null;
        beforeEach(() => {

            quiz = <TerminalQuiz.IQuiz>new TerminalQuiz.Quiz($('<div/>').get(0), {

            });

            opts = ["FirstOption", "SecondOption"];

            question = quiz.askChoice("anotherName").withOpts(opts);
        })

        it("should return a valid ChoiceQuestion instance and add it to the quiz", () => {

            expect(question).not.toBeNull();

            expect(quiz.getAnswer(question)).not.toBeNull();
        });

        it("should set the name", () => {

            expect(question.getName()).toBe("anotherName");
        })

        it("should set the options", () => {

            expect(question.getOpts()).toBe(opts);
        })
    })
})
