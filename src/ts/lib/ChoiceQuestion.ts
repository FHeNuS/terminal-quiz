module TerminalQuiz {

    export class ChoiceQuestionProcessor extends QuestionProcessor<ChoiceQuestion<any>> {

        private container: JQuery;
        private selectedIdx: number;

        getDetail(): HTMLElement {

            this.container = $('<ol class="choices"></ul>"');

            this.question.getOpts().forEach((opt) => {

                this.container.append(`<li class="choice"><span class="cursor"></span><span class="name">${this.question.getOptsName()(opt)}</span></li>`)
            });

            return this.container.get(0);
        }

        private getUserAnswerIdx(userAnswer: string): number {

            var answerIdx = -1;

            // The user answer should be a index with the selected choice
            var parsedValue = parseInt(userAnswer);

            if (parsedValue > 0 && parsedValue <= this.question.getOpts().length) {

                // Decrements one from the answer because array indexes are zero-based and the answers are one-based
                answerIdx = parsedValue - 1;
            }

            return answerIdx;
        }

        public parseUserAnswer(userAnswer: string): any {

            var answerIdx = this.getUserAnswerIdx(userAnswer);

            return (answerIdx != -1) ? this.question.getOpts()[answerIdx] : null;
        }

        public validateAnswer(parsedAnswer: any, ctx: QuizContext): void {

            if (!parsedAnswer) {

                ctx.echoFail("Please select a valid choice number!");
            }
        }

        private clearSelectedChoice(): void {

            // Removes the selected class from all the choices before processing
            this.container.children().each((idx, choice) => {

                $(choice).removeClass("selected");
            });
        }

        private displaySelectedChoice(): void {

            this.clearSelectedChoice();

            // Highlight the typed answer
            this.container.children().eq(this.selectedIdx).addClass("selected");
        }

        public onKeyPress(typedKey: number,  ctx: QuizContext): boolean {

            console.log(typedKey);

            var validKey = false;

            if (typedKey == 8) {

                // BACKSPACE
                validKey = true;

                if (ctx.getAnswer().length == 1) {

                    // If is erasing the last character, should clear the selected choice
                    this.clearSelectedChoice();
                }

            } else if (typedKey == 38) {

                // UP ARROW
                if (this.selectedIdx > 0) {

                    this.selectedIdx--;

                } else {

                    this.selectedIdx = this.question.getOpts().length - 1;
                }

                ctx.setAnswer("" + (this.selectedIdx + 1));

                this.displaySelectedChoice();

            } else if (typedKey == 40) {

                // DOWN ARROR
                if (this.selectedIdx < (this.question.getOpts().length - 1)) {

                    this.selectedIdx++;

                } else {

                    this.selectedIdx = 0;
                }

                ctx.setAnswer("" + (this.selectedIdx + 1));
                
                this.displaySelectedChoice();

            } else if ((typedKey >= 48 && typedKey <= 57) || (typedKey >= 96 && typedKey <= 105)) {

                var isNumPad = (typedKey >= 96 && typedKey <= 105);

                // 0 to 9 Keys and NumPad Keys
                var typedChar = (isNumPad) ? "" + (typedKey - 96) : String.fromCharCode(typedKey);

                if (/^\d$/.test(typedChar)) {

                    var answerIdx = this.getUserAnswerIdx(ctx.getAnswer() + typedChar);

                    if (answerIdx > -1) {

                        this.selectedIdx = answerIdx;

                        this.displaySelectedChoice();

                        // If its a digit between the valid choices, returns as valid
                        validKey = true;

                    } else {

                        ctx.echoFail("Please type a valid choice number or use the UP and DOWN arrows!");
                    }
                }

            } else if (typedKey >= 65 && typedKey <= 90) {

                // A TO Z
                ctx.echoFail("Please type a valid choice number or use the UP and DOWN arrows!");

            } else {

                // It could be special keys, so they are valid because they may trigger another functionality
                validKey = true;
            }

            return validKey;
        }
    }

    export class ChoiceQuestion<T> extends Question {

        private opts: Array<T>;
        private nameGetter: (item: T) => string;

        initialize(): void {

            if (!this.getProcessor()) {

                this.withProcessor(new ChoiceQuestionProcessor(this));
            }

            super.initialize();

            if (!this.nameGetter) {

                // If the name getter is not defined, creates one that returns the option itself
                this.nameGetter = (opt) => opt.toString();
            }
        }

        getOpts(): Array<T> {

            return this.opts;
        }

        getOptsName(): (opt: T) => string {

            return this.nameGetter;
        }

        withOpts(opts: Array<T>): ChoiceQuestion<T> {

            this.opts = opts;

            return this;
        }

        withOptsName(nameGetter: (opt: T) => string): ChoiceQuestion<T> {

            this.nameGetter = nameGetter;

            return this;
        }
    }
}
