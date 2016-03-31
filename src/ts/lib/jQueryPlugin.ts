(function($:JQueryStatic) {

    $.fn.terminalQuiz = function(options: TerminalQuiz.IQuizOptions) {

        if (this.length > 1)
            throw new Error("Cannot apply the terminal quiz JQuery plugin for multiple elements at once!");

        return new TerminalQuiz.Quiz(this.get(0), options);
    };

})(jQuery);

declare interface JQuery {
    terminalQuiz(options: TerminalQuiz.IQuizOptions): TerminalQuiz.IQuiz;
}
