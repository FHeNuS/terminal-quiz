module TerminalQuiz {

    export class QuestionProcessor {

        constructor(public question: Question) {

        }

        /**
        Returns the callback (if any) responsible for this questions autocomplete.
        @return Autocomplete callback.
        */
        public _getCompletionCallback(): TerminalQuiz.Autocomplete {

            return null;
        }

        public getDetail(): HTMLElement {

            return null;
        }

        /**
        Parses the user answer.
        @returns The parsed answer.
        */
        public parseUserAnswer(userAnswer: string): any {

            return userAnswer;
        }

        public validateAnswer(parsedAnswer: any, messenger: IMessenger) : void {

            var isRequired = false;

            var requiredCallback = this.question.getRequired();

            if (requiredCallback) {

                isRequired = requiredCallback();
            }

            if (isRequired && !parsedAnswer) {

                messenger.echoFail('Please provide an answer for this question!');
            }
        }
    }
}
