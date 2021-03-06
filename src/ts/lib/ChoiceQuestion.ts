module TerminalQuiz {

    export class ChoiceQuestionProcessor extends QuestionProcessor<ChoiceQuestion<any>> {

        private container: JQuery;
        private selectedIdx: number = 0;

        private createOption(opt: any, idx: number, ul: JQuery, ctx: QuizContext) {

            var li = $(`<li class="choice"><span class="cursor"></span><span class="position"></span><span class="name">${this.question.getOptsName()(opt)}</span></li>`)
                .appendTo(ul)
                .click(() => {

                    this.selectedIdx = idx;

                    this.displaySelectedChoice();

                    ctx.playSound(QuizSounds.UserTyping);
                });
        }

        getDetail(ctx: QuizContext): HTMLElement {

            var answer = ctx.getAnswer().parsedAnswer;

            if (answer) {

                // Updates the selected choice if there is already one
                this.selectedIdx = this.question.getOpts().indexOf(answer);
            }

            this.container = $('<div class="choices">')

            var ul = $('<ul></ul>').appendTo(this.container);

            this.question.getOpts().forEach((opt, idx) => {

                this.createOption(opt, idx, ul, ctx);
            });

            return this.container.get(0);
        }

        onRendered(ctx: QuizContext) {

            this.displaySelectedChoice();

            super.onRendered(ctx);
        }

        private getUserAnswerIdx(userAnswer: number): number {

            var answerIdx = -1;

            if (userAnswer > 0 && userAnswer <= this.question.getOpts().length) {

                // Decrements one from the answer because array indexes are zero-based and the answers are one-based
                answerIdx = userAnswer - 1;
            }

            return answerIdx;
        }

        public parseUserAnswer(userAnswer: string): any {

            return (this.selectedIdx >= 0) ? this.question.getOpts()[this.selectedIdx] : null;
        }

        public validateAnswer(parsedAnswer: any, ctx: QuizContext): void {

            if (!parsedAnswer) {

                ctx.echoFail("Please select a valid choice number!");
            }
        }

        private clearSelectedChoice(): void {

            // Removes the selected class from all the choices before processing
            this.container.find("li").each((idx, choice) => {

                $(choice).removeClass("selected");
            });
        }

        private displaySelectedChoice(): void {

            this.clearSelectedChoice();

            // Highlight the typed answer
            this.container.find("li").eq(this.selectedIdx).addClass("selected");
        }

        public onKeyPress(typedKey: number, ctx: QuizContext): boolean {

            var validKey = false;

            if (typedKey == 38) {

                // UP ARROW
                if (this.selectedIdx > 0) {

                    this.selectedIdx--;

                    this.displaySelectedChoice();
                }

            } else if (typedKey == 40) {

                // DOWN ARROR
                if (this.selectedIdx < (this.question.getOpts().length - 1)) {

                    this.selectedIdx++;

                    this.displaySelectedChoice();
                }

            } else if ((typedKey >= 48 && typedKey <= 57) || (typedKey >= 96 && typedKey <= 105)) {

                var isNumPad = (typedKey >= 96 && typedKey <= 105);

                // 0 to 9 Keys and NumPad Keys
                var typedChar = (isNumPad) ? "" + (typedKey - 96) : String.fromCharCode(typedKey);

                if (/^\d$/.test(typedChar)) {

                    var answerIdx = this.getUserAnswerIdx(parseInt(typedChar));

                    if (answerIdx >= 0) {

                        this.selectedIdx = answerIdx;

                        this.displaySelectedChoice();

                        // If its a digit between the valid choices, returns as valid
                        validKey = false;

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

        showPrompt(): boolean {

            return false;
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

    export interface IQuiz {

        askChoice<T>(name: string): ChoiceQuestion<T>;
        askChoice<T>(name: string, options: Array<T>): ChoiceQuestion<T>;
    }

    Quiz.prototype["askChoice"] = function(name: string, options: Array<any>) {

        var question = this.ask(new ChoiceQuestion(name));

        if (options)
            question.withOpts(options);

        return question;
    }
}
