module TerminalQuiz {

    export enum ChoiceQuestionMode {

        ID_LABEL,

        ID,

        LABEL,
    }

    export class ChoiceQuestion<T> extends Question {

        private opts: Array<T>;
        private nameGetter: (item: T) => string;
        private descGetter: (item: T) => string;
        private singleItemNameGetter: string | (() => string);

        initialize(): void {

            super.initialize();

            if (!this.singleItemNameGetter) {

                this.singleItemNameGetter = this.name;
            }

            /*
                        if (!this.description) {


                            this.detail = () => {

                                var txt = "";

                                this.opts.forEach((opt) => {

                                    var optTxt = Quiz.wrap(this.nameGetter(opt), "div", "choice-name");

                                    if (this.descGetter)
                                        optTxt += Quiz.wrap(this.descGetter(opt), "div", "choice-desc");

                                    txt += Quiz.wrap(optTxt, "li", "choice");
                                });

                                return Quiz.wrap(txt, "ul", "choices");
                            }

                        }
                        */
        }

        withOptions(opts: Array<T>): ChoiceQuestion<T> {

            this.opts = opts;

            return this;
        }

        singleItemName(singleItemNameGetter: string | (() => string)): ChoiceQuestion<T> {

            this.singleItemNameGetter = singleItemNameGetter;

            return this;
        }

        optionName(nameGetter: (opt: T) => string): ChoiceQuestion<T> {

            this.nameGetter = nameGetter;

            return this;
        }

        optionDescription(descGetter: (opt: T) => string): ChoiceQuestion<T> {

            this.descGetter = descGetter;

            return this;
        }

        /*
        onAnswer(callback: (selectedOption: T) => void): ChoiceQuestion<T> {

            return <ChoiceQuestion<T>>super.onUserCommand(callback);
        }
        */

        _getCompletionCallback(): TerminalQuiz.Autocomplete {

            return (answer, callback) => {

                callback(this.opts.map((item) => {

                    return this.nameGetter(item);

                }));
            }
        }

        parseUserAnswer(answer: any): IQuestionParseResult {

            /*
            var result = super.parseUserAnswer(answer);

            if (result.isValid) {

                var answers = this.opts.filter(item => {

                    return this.nameGetter(item) == answer;
                });

                if (answers.length == 1) {

                    result.isValid = true;
                    result.parsedAnswer = answers[0];

                } else {

                    result.isValid = false;
                    this.quiz.echoFail("Invalid choice of " + this.getSingleItemName() + "!");
                }
            }

            return result;
            */

            return null;
        }
    }
}
