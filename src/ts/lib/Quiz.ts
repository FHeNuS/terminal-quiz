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

                                            // execute in next interval
                                            setTimeout(() => {

                                                this.stopAudio(QuizSounds.QuizTyping);

                                                // swap command with prompt
                                                this.anim = false;

                                                this.term.set_prompt(prompt);

                                                if (onFinish)
                                                    onFinish();

                                            }, delay);
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
        echo(message: string)
        echo(message: HTMLElement)
        echo(message: HTMLElement|string) {

            if (typeof(message) === "string") {

                message = $(`<div class="echo">${message}</div>`).get(0);
            }

            var currentCmd = this.term.get_command();
            this.term.set_command('');

            this.animatedType(<HTMLElement>message, () => {

                this.term.set_command(currentCmd);
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
            this.term.set_prompt("> ");
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

            this.playAudio(QuizSounds.UserTyping);

            var currentQuestion = this.getCurrentQuestion();

            if (currentQuestion)
                return currentQuestion.getProcessor().onKeyPress(event.keyCode, this.ctx);
        }

        validateCurrentAnswer(): boolean {

            var question = this.getCurrentQuestion();
            var answer = this.getAnswer(question);

            // By default is valid
            answer.isValid = true;

            question.getProcessor().validateAnswer(answer.parsedAnswer, this.ctx);

            return answer.isValid;
        }

        /**
        Initializes the quiz without starting it.
        */
        initialize(): void {

            // initialize terminal
            this.term = window["$"](this.element).terminal((cmd: string, term) => {

                this.onUserCommand(cmd);

                this.goToNextQuestion();

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
        Asks the current question.
        */
        askCurrentQuestion(): void {

            var question = this.getCurrentQuestion();

            if (question) {

                this.term.clear();

                question.initialize();

                var questionElem = $(`<div class="${question.constructor.toString().match(/\w+/g)[1]}"></div>`);

                var titleElem = question.getTitle()();

                var descriptionElem = question.getDescription()();

                var detailElem = question.getProcessor().getDetail();

                questionElem.append(titleElem);

                if (descriptionElem)
                    questionElem.append(descriptionElem);

                if (detailElem)
                    questionElem.append(detailElem);

                this.echo(questionElem.get(0));
            }
        }

        /**
        Goes to the next question.
        */
        goToNextQuestion(): void {

            if (!this.started)
                throw new Error("Cannot go to the next question because the quiz did not start yet! Did you call the start method?");

            if (this.validateCurrentAnswer()) {

                this.onAnswered(this.getCurrentQuestion());

                this.playAudio(QuizSounds.RightAnswer);

                var isLastQuestion = this.currentQuestionIdx == (this.questions.length - 1);

                if (isLastQuestion) {

                    this.end();

                } else {

                    // If it did not reach the last question, advances
                    this.currentQuestionIdx++;

                    this.askCurrentQuestion();
                }

            } else {

                this.playAudio(QuizSounds.WrongAnswer);
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

        private onAnswered(question: Question) {


        }

        private onEnd() {


        }

        private playAudio(sound: QuizSounds, loop = false) {

            var soundName = sound.toString();

            if (this.audioManager.hasAudio(soundName))
                this.audioManager.play(soundName, loop);
        }

        private stopAudio(sound: QuizSounds) {

            var soundName = sound.toString();

            if (this.audioManager.hasAudio(soundName))
                this.audioManager.stop(soundName);
        }
    }
}
