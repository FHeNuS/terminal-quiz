module TerminalQuiz {

    export class QuestionProcessor<T extends Question> {

        constructor(public question: T) {

        }

        showPrompt(): boolean {

            return true;
        }

        render(): HTMLElement {

            var questionElem = $(`<div class="${this.question.constructor.toString().match(/\w+/g)[1]}"></div>`);

            if (this.question.getTitle()) {

                var titleElem = this.question.getTitle()();

                questionElem.append(titleElem);
            }

            var descriptionElem = this.question.getDescription()();

            if (descriptionElem)
                questionElem.append(descriptionElem);

            var detailElem = this.getDetail();

            if (detailElem)
                questionElem.append(detailElem);

                return questionElem.get(0);
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
