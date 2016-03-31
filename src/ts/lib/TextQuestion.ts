module TerminalQuiz {

    export class TextQuestion extends Question {

        protected regex: RegExp;

        protected friendlyRegex: string;

        withPattern(regex: RegExp, friendlyRegex: string): this {

            this.regex = regex;
            this.friendlyRegex = friendlyRegex;

            return this;
        }

        getPattern(): RegExp {

            return this.regex;
        }

        getFriendlyPattern(): string {

            return this.friendlyRegex;
        }

        initialize(): void {

            if (!this.getProcessor()) {

                this.withProcessor(new TextQuestionProcessor(this));
            }

            super.initialize();
        }
    }

    export class TextQuestionProcessor extends QuestionProcessor<TextQuestion> {

        getDetail(): HTMLElement {

            // Text questions by default do not have detail
            return null;
        }

        public validateAnswer(parsedAnswer: any, ctx: QuizContext): void {

            super.validateAnswer(parsedAnswer, ctx);

            var regex = this.question.getPattern();

            if (parsedAnswer && regex) {

                // If an answer was supplied and a regex also, test the answer
                // to see it matches the pattern
                if (!this.question.getPattern().test(parsedAnswer)) {

                    // If it does not match, raise an error
                    ctx.echoFail(`The answer '${parsedAnswer}' does not respect the pattern '${this.question.getFriendlyPattern()}'!`)
                }
            }
        }
    }

    export interface IQuiz {

        askText(name: string): TextQuestion;
    }

    Quiz.prototype["askText"] = function(name: string) {

        return this.ask(new TextQuestion(name));
    }
}
