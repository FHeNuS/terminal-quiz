module TerminalQuiz {

    export class ListQuestion<T extends Question> extends Question {

        private question: T;
        private answers: Array<any>;
        ofQuestion(question: T): ListQuestion<T> {

            this.question = question;
            return this;
        }

        initialize(): void {

            super.initialize();

            this.answers = new Array<any>();
            this.question.initialize();

            if (!this.description) {

                this.description = () => {

                    var questionDescription = Quiz.wrapText(this.question._getParsedFullText(), "list-inner-question");

                    var cmds = "";

                    cmds += Quiz.wrap(Quiz.wrapText("add " + this.question.name, "list-cmd-name") + Quiz.wrapText("Adds the supplied value.", "list-cmd-desc"), "li");
                    cmds += Quiz.wrap(Quiz.wrapText("rem " + this.question.name, "list-cmd-name") + Quiz.wrapText("Removes the suplied value.", "list-cmd-desc"), "li");
                    cmds += Quiz.wrap(Quiz.wrapText("list", "list-cmd-name") + Quiz.wrapText("List the current values.", "list-cmd-desc"), "li");
                    cmds += Quiz.wrap(Quiz.wrapText("done", "list-cmd-name") + Quiz.wrapText("Finishes list edition.", "list-cmd-desc"), "li");

                    return questionDescription + Quiz.wrap(cmds, "ul", "list-cmds");
                }
            }
        }

        onAnswer(callback: (answers: Array<any>) => void): ListQuestion<T> {

            return <ListQuestion<T>>super.onAnswer(callback);
        }

        _getCompletionCallback(): (string, callback) => void {

            return (string, callback) => {

                var args = this.quiz._getCommands();

                if (args.length == 1) {

                    // Returns the list commands
                    callback(["add", "rem", "list", "done"]);

                } else {

                    this.question._getCompletionCallback()(string, callback);
                }

            }
        }

        _parseAnswer(answer: string): IQuestionParseResult {

            var result = <IQuestionParseResult>{};
            result.keepAlive = true;
            result.isValid = true;

            var args = answer.split(Quiz.CMD_SEPARATOR);

            switch (args[0]) {

                case "add":

                    var innerArgs = args.slice(1).join(Quiz.CMD_SEPARATOR);
                    var innerResult = this.question._parseAnswer(innerArgs);

                    result.isValid = innerResult.isValid;

                    if (innerResult.isValid) {

                        this.answers.push(innerResult.parsedAnswer);
                        this.quiz.echoSuccess(innerArgs + " added!");
                    }

                    break;

                case "rem":
                    break;

                case "list":
                    break;

                case "done":
                    result.parsedAnswer = this.answers;
                    result.keepAlive = false;
                    // TODO: Check min numbers
                    break;
            }

            return result;
        }
    }
}
