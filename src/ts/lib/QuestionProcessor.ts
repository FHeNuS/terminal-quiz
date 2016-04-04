module TerminalQuiz {

    export class QuestionProcessor<T extends Question> {

        constructor(public question: T) {

        }

        getDetail(): HTMLElement {

            return null;
        }

        onRendered(ctx: QuizContext) {

        }

        /**
        Parses the user answer.
        @returns The parsed answer.
        */
        parseUserAnswer(userAnswer: string): any {

            return userAnswer;
        }

        validateAnswer(parsedAnswer: any, ctx: QuizContext) : void {

            var isRequired = false;

            var requiredCallback = this.question.getRequired();

            if (requiredCallback) {

                isRequired = requiredCallback();
            }

            if (isRequired && !parsedAnswer) {

                ctx.echoFail('Please provide an answer for this question!');
            }
        }

        onKeyPress(typedCharacter: number, ctx: QuizContext) : boolean {

            return true;
        }
    }
}
