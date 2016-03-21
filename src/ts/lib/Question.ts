module TerminalQuiz {

    export interface IQuestionParseResult {

        isValid: boolean;

        keepAlive: boolean;

        parsedAnswer: any;
    }

    export abstract class Question {

        constructor(public name: string, protected quiz: Quiz) {
        }

        public initialize(): void {
        }

        protected regex: RegExp;

        protected friendlyRegex: string;

        protected description: string | (() => string);

        protected text: string | (() => string);

        protected onAnswerCb: (answer: any) => void;

        protected required: () => boolean;

        protected ifCallback: () => boolean;

        public _getParsedText(): string {

            return Quiz.getStringFromStringGetter(this.text);
        }

        /**
        Returns the callback (if any) responsible for this questions autocomplete.
        @return Autocomplete callback.
        */
        public _getCompletionCallback(): TerminalQuiz.Autocomplete {

            return null;
        }

        public _getParsedDescription(): string {

            return Quiz.getStringFromStringGetter(this.description);
        }

        public _getParsedFullText(): string {

            var text = Quiz.wrapText(this._getParsedText(), "question-text");

            var description = Quiz.wrapText(this._getParsedDescription(), "question-description");

            return Quiz.wrapText(text + description, "question", this.constructor.toString().match(/\w+/g)[1], this.name);
        }

        public _parseAnswer(answer: string): IQuestionParseResult {

            var result = <IQuestionParseResult>{};
            result.isValid = false;

            var hasAnswer = (answer && answer.length > 0);

            if (!hasAnswer && this.required && this.required()) {

                this.quiz.echoFail("Please supply a value!");

            } else {

                if (hasAnswer && this.regex && !this.regex.test(answer)) {

                    this.quiz.echoFail("Supplied value does not respect pattern: " + this.friendlyRegex);

                } else {

                    result.isValid = true;
                    result.parsedAnswer = answer;
                }
            }

            return result;
        }

        if(ifCallBack: () => boolean): Question {

            this.ifCallback = ifCallBack;

            return this;
        }

        withText(text: string | (() => string)): Question {

            this.text = text;

            return this;
        }

        withPattern(regex: RegExp, friendlyRegex: string): TextQuestion {

            this.regex = regex;
            this.friendlyRegex = friendlyRegex;

            return this;
        }

        asRequired(required?: () => boolean): Question {

            if (required === undefined) {

                // If no arguments are supplied, it should be required
                required = () => true;
            }

            this.required = required;

            return this;
        }

        onAnswer(callback: (answer: any) => void): Question {

            this.onAnswerCb = callback;

            return this;
        }

        shouldBeAsked(): boolean {

            return (this.ifCallback) ? this.ifCallback() : true;
        }

        public ask(callback: (answer: any) => void): void {

            this.initialize();

            var fullText = this._getParsedFullText();

            this.quiz.echo(this._getParsedFullText(), () => {

                this.quiz._pushQuestion((answer: string) => {

                    var parseResult = this._parseAnswer(answer);

                    if (parseResult.isValid) {

                        if (!parseResult.keepAlive) {

                            this.onAnswerCb(parseResult.parsedAnswer);

                            this.quiz._popQuestion();

                            callback(parseResult.parsedAnswer);
                        }
                    }

                }, this._getCompletionCallback());
            });
        }
    }
}
