describe("jQueryPlugin", () => {

    it("plugin should initialize", () => {

        var container = $("<div/>");
        var quiz = container.terminalQuiz({

        });

        expect(quiz.hasStarted()).toBe(false);
    });
});
