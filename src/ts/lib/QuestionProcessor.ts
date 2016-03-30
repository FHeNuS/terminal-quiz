module TerminalQuiz {

    export class QuestionProcessor<T extends Question> {

        constructor(public question: T) {

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

        public validateAnswer(parsedAnswer: any, ctx: QuizContext) : void {

            var isRequired = false;

            var requiredCallback = this.question.getRequired();

            if (requiredCallback) {

                isRequired = requiredCallback();
            }

            if (isRequired && !parsedAnswer) {

                ctx.echoFail('Please provide an answer for this question!');
            }
        }

        public onKeyPress(typedCharacter: number, ctx: QuizContext) : boolean {

            console.log(typedCharacter);

            return true;
        }
    }
}
