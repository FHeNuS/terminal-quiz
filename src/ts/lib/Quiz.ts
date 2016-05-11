module TerminalQuiz {

    export interface QuizContext {

        getAnswer(): Answer;

        getTypedCommand(): string;

        setTypedCommand(answer: string);

        echoSuccess(msg: string|HTMLElement): void;

        echoFail(msg: string|HTMLElement): void;

        playSound(sound: QuizSounds, loop?: boolean);

        stopSound(sound: QuizSounds);
    }

    export interface IQuiz extends Quiz {

    }

    export class Quiz {

        static CMD_SEPARATOR = " ";

        constructor(private element: Element, private opts: IQuizOptions) {

        }

        private audioManager: QuizAudioManager;
        private currentQuestionIdx: number;
        private term: any;
        private questions = new Array<Question>();
        private answers: {
            [name: string]: Answer
        } = {};
        private anim: boolean = false;
        private greetings: String | (() => string);
        private ctx: QuizContext;

        private separateTextFromElements(elem: Node, bag: any) {

            var entry = {

                elem: elem,
                text: undefined
            };

            bag.push(entry);

            if (elem["style"]) {

                // Hides elements
                elem["style"].display = 'none';
            }

            if (elem.nodeType == 3 && elem.textContent.trim().length > 0) {

                // Strip the text from text elements
                entry.text = elem.textContent;
                elem.textContent = "";
            }

            if (elem.hasChildNodes) {

                for (var i = 0; i < elem.childNodes.length; i++) {

                    this.separateTextFromElements(elem.childNodes[i], bag);
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

                                this.playSound(QuizSounds.QuizTyping, true);

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

                                    if (elem["style"]) {

                                        // Shows element
                                        elem["style"].display = null;
                                    }

                                    if (bag.text) {

                                        // If there is text, appends th text
                                        text = bag.text;

                                        elem.textContent += bag.text[charIdx++];

                                        if (charIdx == text.length) {

                                            // This means it reached the end of one element. Move to the next and restart char counter.
                                            bagIdx++;
                                            charIdx = 0;
                                        }

                                    } else {

                                        // Otherwise just shows element and goes to the next
                                        bagIdx++;
                                    }

                                    if (bagIdx == bags.length) {

                                        // This means that it processed all elements, remove interval and invoke callback
                                        clearInterval(interval);

                                        this.stopSound(QuizSounds.QuizTyping);

                                        // swap command with prompt
                                        this.anim = false;

                                        this.term.set_prompt(prompt);

                                        if (onFinish)
                                            onFinish();
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
        @param message String message to write.
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echo(message: string, callBack?: () => void): void
        /**
        Writes a message to the terminal.
        @param message HTMLElement to write.
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echo(message: HTMLElement, callBack?: () => void): void
        echo(message: HTMLElement|string, callBack?: () => void): void {

            if (typeof(message) === "string") {

                message = $(`<div class="echo">${message}</div>`).get(0);
            }

            var currentCmd = this.term.get_command();
            this.term.set_command('');

            this.animatedType(<HTMLElement>message, () => {

                this.term.set_command(currentCmd);

                // Simulates a mouse click so it focus on the terminal
                $(this.element).click();

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
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echoFail(msg: HTMLElement|string, callBack?: () => void): void {

            this.echo($(`<div class="echo-fail"></div>`).append(msg).get(0), callBack);
            this.playSound(QuizSounds.WrongAnswer);

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
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echoSuccess(msg: HTMLElement|string, callBack?: () => void) {

            this.echo($(`<div class="echo-success"></div>`).append(msg).get(0), callBack);
            this.playSound(QuizSounds.RightAnswer);
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

            this.stopSound(QuizSounds.Background);

            this.clear();

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

        /**
        Returns the list of questions this quiz has.
        @returnValue List of questions.
        */
        getQuestions(): Question[] {

            return this.questions;
        }

        onKeyPress(event: KeyboardEvent): boolean {

            var currentQuestion = this.getCurrentQuestion();

            if (currentQuestion) {

                this.playSound(QuizSounds.UserTyping);

                return currentQuestion.getProcessor().onKeyPress(event.keyCode, this.ctx);
            }
        }

        /**
        Initializes the quiz without starting it.
        */
        initialize(): void {

            // initialize terminal
            this.term = window["$"](this.element).terminal((cmd: string, term) => {

            }, {
                    name: 'xxx',
                    //width: 800,a
                    //height: 300,
                    keydown: (e: KeyboardEvent) => {

                        var propagate = undefined;

                        //disable keyboard when animating
                        if (this.anim) {

                            propagate = false;

                        } else {

                            if (!this.onKeyPress(e)) {

                                propagate = false;

                            } else if (e.keyCode === 13) {

                                // If is enter key, parses the cmd
                                this.moveToNextQuestion();
                            }
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

                    return this.getAnswer(this.getCurrentQuestion());
                },
                getTypedCommand: () => {

                    return this.term.get_command();
                },
                setTypedCommand: (answer: string) => {

                    this.term.set_command(answer);
                },
                echoFail: (msg) => {

                    this.echoFail(msg);
                },

                echoSuccess: (msg) => {

                    this.echoSuccess(msg);
                },

                playSound: (sound, loop) => {

                    this.playSound(sound, loop);
                },

                stopSound: (sound) => {

                    this.stopSound(sound);
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

            if (this.opts.playBackground === undefined || this.opts.playBackground)
                this.playSound(QuizSounds.Background, true);

            if (this.opts.onStart) {

                this.opts.onStart();
            }

            this.askCurrentQuestion();
        }

        onQuestionRendered(question: Question) {

            question.getProcessor().onRendered(this.ctx);

            if (this.opts.onQuestionRendered) {

                this.opts.onQuestionRendered(question);
            }

            if (question.getProcessor().showPrompt()) {

                // Shows the prompt after the question rendered so it appears
                // natural
                $(this.element).find(".cmd").show();
            }
        }

        /**
        Hides the prompt if the question processor indicates.
        @prompt Question processor to check.
        */
        hidePromptIfNeeded(processor: QuestionProcessor<any>): void {

            var showPrompt = processor.showPrompt();

            // Hides the prompt before rendering so it does not flick for the
            // user
            if (!showPrompt) {

                $(this.element).find(".cmd").hide();
            }
        }

        /**
        Renders the supplied question at the terminal.
        @param question Question to render.
        */
        renderQuestion(question: Question) {

            this.clear();

            question.initialize();

            var processor = question.getProcessor();

            var questionElem = processor.render(this.ctx);

            this.hidePromptIfNeeded(processor);

            this.echo(questionElem, () => {

                this.onQuestionRendered(question);
            });
        }

        /**
        Indicates if the supplied question should be asked.
        @param question The question to check.
        @returnValue True or false.
        */
        shouldAskQuestion(question: Question) : boolean {

            var ifCallBack = question.getIfCallback();

            // Check if an If callback was supplied and if it returns true
            return (!ifCallBack || ifCallBack());
        }

        /**
        Asks the current question.
        */
        askCurrentQuestion(): void {

            var question = this.getCurrentQuestion();

            if (question) {

                if (this.shouldAskQuestion(question)) {

                    this.renderQuestion(question);

                } else {

                    this.moveToNextQuestion();
                }
            }
        }

        /**
        Parses and validates current question.
        */
        parseCurrentQuestion(): Answer {

            var question = this.getCurrentQuestion();

            var answer = this.getAnswer(question);

            answer.userAnswer = this.ctx.getTypedCommand();

            answer.parsedAnswer = this.getCurrentQuestion().getProcessor().parseUserAnswer(answer.userAnswer);

            return answer;
        }

        validateCurrentQuestion(): boolean {

            var question = this.getCurrentQuestion();
            var answer = this.getAnswer(question);

            return this.validateAnswer(question, answer);
        }s

        validateAnswer(question: Question, answer: Answer): boolean {

            answer.isValid = true;

            question.getProcessor().validateAnswer(answer.parsedAnswer, this.ctx);

            if (answer.isValid) {

                this.onQuestionAnswered(question);

                this.playSound(QuizSounds.RightAnswer);

            } else {

                this.playSound(QuizSounds.WrongAnswer);
            }

            return answer.isValid;
        }

        /**
        Because some answer may not be questioned, this method will find the
        previous suitable question index.
        @returns The previous question index if found or -1 if not.
        */
        getPreviousQuestionIndex(): number {

            var previousIdx = -1;

            if (this.currentQuestionIdx > 0) {

                var idx = this.currentQuestionIdx;
                var question = null;

                while (idx > 0 && previousIdx == -1) {

                    idx--;

                    question = this.questions[idx];

                    // Check if should ask question
                    if (this.shouldAskQuestion(question)) {

                        previousIdx = idx;
                    }
                }
            }

            return idx;
        }

        /**
        Because some answer may not be questioned, this method will find the
        next suitable question index.
        @returns The next question index if found or -1 if not.
        */
        getNextQuestionIndex(): number {

            var nextIdx = -1;

            // Checks if it reached the end of the quiz, if it did returns -1 because
            // there are no more questions
            if (this.currentQuestionIdx < (this.questions.length - 1)) {

                var idx = this.currentQuestionIdx;
                var question = null;

                while (idx < this.questions.length && nextIdx == -1) {

                    idx++;

                    question = this.questions[idx];

                    // Check if should ask question
                    if (this.shouldAskQuestion(question)) {

                        nextIdx = idx;
                    }
                }
            }

            return nextIdx;
        }

        /**
        Moves to the desired question.
        @param idx Question index.
        */
        moveToQuestion(idx: number): void {

            // Parses the question so that the current answer is saved
            this.parseCurrentQuestion();

            // Change current question idx
            this.currentQuestionIdx = idx;

            this.askCurrentQuestion();
        }

        /**
        Moves to the next question, only if the current question is valid.
        @returns A boolean value indicating that it could move to the next question because the current question is valid.
        */
        moveToNextQuestion(): boolean {

            var question = this.getCurrentQuestion();

            var answer = this.parseCurrentQuestion();

            var isValid = this.validateAnswer(question, answer);

            if (isValid) {

                var nextQuestionIdx = this.getNextQuestionIndex();

                if (nextQuestionIdx == -1) {

                    // No more questions, ends the quiz
                    this.end();

                } else {

                    this.currentQuestionIdx = nextQuestionIdx;

                    this.askCurrentQuestion();
                }
            }

            return isValid;
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

        playSound(sound: QuizSounds, loop = false) {

            var soundName = sound.toString();

            if (this.audioManager.hasAudio(soundName))
                this.audioManager.play(soundName, loop);
        }

        stopSound(sound: QuizSounds) {

            var soundName = sound.toString();

            if (this.audioManager.hasAudio(soundName))
                this.audioManager.stop(soundName);
        }
    }
}
