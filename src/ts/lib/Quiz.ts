module TerminalQuiz {

    export interface QuizContext {

        getAnswer(): string;

        setAnswer(answer: string);

        echoSuccess(msg: string): void;

        echoFail(msg: string): void;

        playSound(sound: QuizSounds);
    }

    export interface IQuiz extends Quiz {

    }

    export class Quiz {

        static CMD_SEPARATOR = " ";

        constructor(private element: Element, private opts: IQuizOptions) {

        }

        private audioManager: QuizAudioManager;
        private currentQuestionIdx: number;
        private started = false;
        private term: any;
        private questions = new Array<Question>();
        private answers: {
            [name: string]: Answer
        } = {};
        private anim: boolean = false;
        private greetings: String | (() => string);
        private ctx: QuizContext;

        private separateTextFromElements(elem: Node, bag: any) {

            if (elem.hasChildNodes) {

                for (var i = 0; i < elem.childNodes.length; i++) {

                    var childNode = elem.childNodes[i];

                    if (childNode.nodeType == 3 && childNode.textContent.trim().length > 0) {

                        bag.push({ elem: childNode, text: childNode.textContent });
                        childNode.textContent = "";
                    }

                    this.separateTextFromElements(childNode, bag);
                }
            }
        }

        private animatedType(message: HTMLElement, onFinish: () => void): void {

            if (message.outerHTML.length > 0) {

                var prompt = this.term.get_prompt();

                this.anim = true;
                var processed = false;
                var c = 0;

                this.term.set_prompt('');

                var msgElem = $(message);
                var bags = [];

                this.separateTextFromElements(msgElem.get(0), bags);

                this.term.echo("<i/>", {

                    raw: true,

                    finalize: (container) => {

                        try {

                            if (!processed) {

                                processed = true;

                                this.playAudio(QuizSounds.QuizTyping, true);

                                // Clears dummy element created
                                container.empty();

                                // Appends elements stripped from text
                                container.append(msgElem);

                                var charIdx = 0;
                                var bagIdx = 0;
                                var bag = null;
                                var elem: HTMLElement = null;
                                var text = null;
                                var delay = (this.opts) ? this.opts.typeMessageDelay : 0;

                                var interval = setInterval(() => {

                                    bag = bags[bagIdx];
                                    elem = bag.elem;
                                    text = bag.text;

                                    elem.textContent += bag.text[charIdx++];

                                    if (charIdx == text.length) {

                                        // This means it reached the end of one element. Move to the next and restart char counter.
                                        bagIdx++;
                                        charIdx = 0;

                                        if (bagIdx == bags.length) {

                                            // This means that it processed all elements, remove interval and invoke callback
                                            clearInterval(interval);

                                            this.stopAudio(QuizSounds.QuizTyping);

                                            // swap command with prompt
                                            this.anim = false;

                                            this.term.set_prompt(prompt);

                                            if (onFinish)
                                                onFinish();
                                        }
                                    }
                                }, delay);

                            } else {

                                container.append(msgElem);
                            }
                        }
                        catch (e) {

                            console.error("Error on echo", e);
                        }
                    }
                });
            }
        }

        /**
        Writes a message to the terminal.
        */
        echo(message: string, callBack?: () => void)
        echo(message: HTMLElement, callBack?: () => void)
        echo(message: HTMLElement|string, callBack?: () => void) {

            if (typeof(message) === "string") {

                message = $(`<div class="echo">${message}</div>`).get(0);
            }

            var currentCmd = this.term.get_command();
            this.term.set_command('');

            this.animatedType(<HTMLElement>message, () => {

                this.term.set_command(currentCmd);

                if (callBack)
                    callBack();
            });
        }

        /**
        Add the supplied question to this Quiz.
        @param question The question to add.
        @returns The added question, for chanining purposes.
        */
        ask<T extends Question>(question: T): T {

            if (!!this.answers[question.getName()])
                throw new Error(`Cannot add a question named '${question.getName()}' twice!`);

            this.questions.push(question);
            this.answers[question.getName()] = new Answer();

            return question;
        }

        /**
        Writes an error message and marks the current question (if there is) as not valid.
        @param msg Message to write.
        */
        echoFail(msg: string): void {

            this.echo($(`<div class="echo-fail">${msg}</div>`).get(0));
            this.playAudio(QuizSounds.WrongAnswer);

            var question = this.getCurrentQuestion();

            if (question) {

                // If there is a current question, sets a not valid
                var answer = this.getAnswer(question);

                // By default is valid
                answer.isValid = false;
            }
        }

        /**
        Writes a success message.
        @param msg Message to write.
        */
        echoSuccess(msg: string) {

            this.echo($(`<div class="echo-success">${msg}</div>`).get(0));
            this.playAudio(QuizSounds.RightAnswer);
        }

        /**
        Clear the current output.
        */
        public clear(): void {

            this.term.clear();
        }

        /**
        Ends the quiz.
        */
        public end() {

            if (!this.term)
                throw new Error("Cannot end the quiz because it did not initialize!");

            if (!this.started)
                throw new Error("Cannot end the quiz because it did not start!");

            this.stopAudio(QuizSounds.Background);

            this.clear();

            this.started = false;

            this.onEnd();
        }

        /**
        Retrieves the answer for the supplied question.
        @param question The question to retrieve the answer.
        @returns The supplied question answer.
        */
        getAnswer(question: Question): Answer {

            return this.answers[question.getName()];
        }

        onUserCommand(cmd): void {

            var question = this.getCurrentQuestion();

            if (question) {

                var answer = this.getAnswer(question);

                answer.userAnswer = cmd;
                answer.parsedAnswer = this.getCurrentQuestion().getProcessor().parseUserAnswer(answer.userAnswer);
            }
        }

        onKeyPress(event: KeyboardEvent): boolean {

            if (this.hasStarted()) {

                var currentQuestion = this.getCurrentQuestion();

                this.playAudio(QuizSounds.UserTyping);

                return currentQuestion.getProcessor().onKeyPress(event.keyCode, this.ctx);

            } else {

                if (this.opts.onKeyPress) {

                    this.opts.onKeyPress(event);
                }

                return false;
            }
        }

        /**
        Initializes the quiz without starting it.
        */
        initialize(): void {

            // initialize terminal
            this.term = window["$"](this.element).terminal((cmd: string, term) => {

                this.onUserCommand(cmd);

                this.validateCurrentQuestion();
            }, {
                    name: 'xxx',
                    //width: 800,a
                    //height: 300,
                    keydown: (e) => {

                        //disable keyboard when animating
                        if (this.anim) {
                            return false;
                        } else {
                            if (!this.onKeyPress(e))
                                return false;
                        }
                    },

                    greetings: (cb) => {

                        cb('');
                    },
                    completion: true,
                    checkArity: false
                });

            // Creates ctx
            this.ctx = {

                getAnswer: () => {

                    return this.term.get_command();
                },
                setAnswer: (answer: string) => {

                    this.term.set_command(answer);
                },
                echoFail: (msg) => {

                    this.echoFail(msg);
                },

                echoSuccess: (msg) => {

                    this.echoSuccess(msg);
                },

                playSound: (sound) => {

                    this.playAudio(sound, false);
                }
            }

            // adds sounds
            this.audioManager = new QuizAudioManager();

            if (this.opts.backgroundSoundUrl)
                this.audioManager.addAudio(QuizSounds.Background.toString(), this.opts.backgroundSoundUrl);

            if (this.opts.rightAnswerSoundUrl)
                this.audioManager.addAudio(QuizSounds.RightAnswer.toString(), this.opts.rightAnswerSoundUrl);

            if (this.opts.wrongAnswerSoundUrl)
                this.audioManager.addAudio(QuizSounds.WrongAnswer.toString(), this.opts.wrongAnswerSoundUrl);

            if (this.opts.userTypingSoundUrl)
                this.audioManager.addAudio(QuizSounds.UserTyping.toString(), this.opts.userTypingSoundUrl);

            if (this.opts.quizTypingSoundUrl)
                this.audioManager.addAudio(QuizSounds.QuizTyping.toString(), this.opts.quizTypingSoundUrl);
        }

        /**
        Starts the quiz.
        */
        start(): void {

            if (!this.questions || this.questions.length == 0) {
                throw new Error("The quiz cannot start because it has no questions!")
            }

            this.currentQuestionIdx = 0;

            this.playAudio(QuizSounds.Background, true);

            this.started = true;

            if (this.opts.onStart) {

                this.opts.onStart();
            }

            this.askCurrentQuestion();
        }

        /**
        Indicates if the quiz already started or not.
        @returns false.
        */
        hasStarted(): boolean {

            return this.started;
        }

        /**
        Renders the supplied question at the terminal.
        @param question Question to render.
        */
        renderQuestion(question: Question) {

            this.clear();

            var questionElem = question.render();

            var showPrompt = question.getProcessor().showPrompt();

            // Hides prompt before rendering to avoid showing the promp
            // before the question
            if (!showPrompt) {

                $(this.element).find(".cmd").hide();
            }

            this.echo(questionElem, () => {

                // Show the prompt after the question rendered
                // to avoid showing it before
                if (showPrompt) {

                    $(this.element).find(".cmd").show();
                }

                question.getProcessor().onRendered(this.ctx);
            });

            if (this.opts.onQuestionRendered) {

                this.opts.onQuestionRendered(question);
            }
        }

        /**
        Asks the current question.
        */
        askCurrentQuestion(): void {

            var question = this.getCurrentQuestion();

            if (question) {

                var ifCallBack = question.getIfCallback();

                // Check if an If callback was supplied and if it returns true
                if (!ifCallBack || ifCallBack()) {

                    this.renderQuestion(question);

                } else {

                    this.moveToNextQuestion();
                }
            }
        }

        /**
        Goes to the next question.
        */
        validateCurrentQuestion(): void {

            var question = this.getCurrentQuestion();

            if (this.validateAnswer(question)) {

                this.onQuestionAnswered(question);

                this.playAudio(QuizSounds.RightAnswer);

                this.moveToNextQuestion();

            } else {

                this.playAudio(QuizSounds.WrongAnswer);
            }
        }

        validateAnswer(question): boolean {

            var answer = this.getAnswer(question);

            // By default is valid
            answer.isValid = true;

            question.getProcessor().validateAnswer(answer.parsedAnswer, this.ctx);

            return answer.isValid;
        }

        moveToNextQuestion() {

            var isLastQuestion = this.currentQuestionIdx == (this.questions.length - 1);

            if (isLastQuestion) {

                this.end();

            } else {

                // If it did not reach the last question, advances
                this.currentQuestionIdx++;

                this.askCurrentQuestion();
            }
        }

        getCurrentQuestion(): Question {

            return this.questions[this.currentQuestionIdx];
        }

        destroy(): void {

            if (this.term) {

                this.term.purge();
                this.term.destroy();
            }
        }

        onQuestionAnswered(question: Question) {

            var answer = this.getAnswer(question);

            var whenAnswered = question.getWhenAnsweredCallback();

            if (whenAnswered) {

                // Call the callback defined with the answer
                whenAnswered(answer.parsedAnswer)
            }

            if (this.opts.onQuestionAnswered) {

                this.opts.onQuestionAnswered(question, answer.parsedAnswer);
            }
        }

        private onEnd() {

            var onEnd = this.opts.onEnd;

            if (onEnd) {

                onEnd();
            }
        }

        playAudio(sound: QuizSounds, loop = false) {

            var soundName = sound.toString();

            if (this.audioManager.hasAudio(soundName))
                this.audioManager.play(soundName, loop);
        }

        stopAudio(sound: QuizSounds) {

            var soundName = sound.toString();

            if (this.audioManager.hasAudio(soundName))
                this.audioManager.stop(soundName);
        }
    }
}
