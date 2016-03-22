module TerminalQuiz {
    export class CombinationQuestion extends Question {

        private questions = new Array<Question>();
        private showFormat: boolean = true;
        private showQuestions: boolean = true;

        onAnswer(callback: (answers: Array<any>) => void): CombinationQuestion {

            return <CombinationQuestion>super.onAnswer(callback);
        }

        withText(text: string | (() => string)): CombinationQuestion {

            return <CombinationQuestion>super.withText(text);
        }

        hideCombinationFormat(): CombinationQuestion{

            this.showFormat = false;

            return this;
        }

        hideQuestionsDescription(): CombinationQuestion {

            this.showQuestions = false;

            return this;
        }


        withQuestions(questions: Array<Question>): CombinationQuestion {

            this.questions = questions;

            return this;
        }

        public _parseAnswer(answer: string): IQuestionParseResult {

            var result = <IQuestionParseResult>{};

            var args = answer.split(Quiz.CMD_SEPARATOR);

            if (args.length != this.questions.length) {

                result.isValid = false;

                this.quiz.echoFail("Wrong answer format!");

            } else {

                result.isValid = true;

                var parsed = new Array<any>();

                args.forEach((arg, idx) => {

                    var innerResult = this.questions[idx]._parseAnswer(arg);

                    if (innerResult.isValid) {

                        parsed.push(innerResult.parsedAnswer);

                    } else {

                        result.isValid = false;
                    }
                });

                result.parsedAnswer = parsed;
            }

            return result;
        }

        public _getCompletionCallback(): (string, callback) => void {

            return (string, callback) => {

                var args = [];
                //var args = this.quiz._getCommands();

                // Because this question can be nested, we slice the full array to hold only the correct number of values
                //args = args.slice(this.quiz._getNestedLevel() - 1);

                if (args.length <= this.questions.length) {

                    // Retrieves the callback from the question at the imcomplete index
                    var lastIdx = args.length - 1;

                    this.questions[lastIdx]._getCompletionCallback()(string, callback);

                } else {

                    callback([]);
                }
            }
        }

        initialize(): void {

            super.initialize();

            this.questions.forEach((q) => {

                q.initialize();
            });

            if (!this.description) {

                this.description = () => {

                    var answerFormat = '';

                    if (this.showFormat) {

                        this.questions.forEach((q, idx) => {

                            answerFormat += Quiz.wrapText(q._getParsedText(), "combination-format-question");
                        });

                        answerFormat = Quiz.wrapText(answerFormat, "combination-format");
                    }

                    var questions = '';

                    if (this.showQuestions) {

                        this.questions.forEach((q, idx) => {

                            questions += Quiz.wrap(q._getParsedFullText(), "li", "conbination-question");
                        });

                        questions = Quiz.wrap(questions, "ul", "combination-questions");
                    }

                    return questions + answerFormat;
                }
            }
        }
    }
}
