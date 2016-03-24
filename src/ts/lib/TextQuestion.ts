 module TerminalQuiz {

    export class TextQuestion extends Question {

        protected regex: RegExp;

        protected friendlyRegex: string;

        withPattern(regex: RegExp, friendlyRegex: string): this {

            this.regex = regex;
            this.friendlyRegex = friendlyRegex;

            return this;
        }

        initialize() : void {

            if (!this.getProcessor()) {

                this.withProcessor(new TextQuestionProcessor(this));
            }

            super.initialize();
        }
    }

    export class TextQuestionProcessor extends QuestionProcessor {

        getDetail(): HTMLElement {

            // Text questions by default do not have detail
            return null;
        }
    }
}
