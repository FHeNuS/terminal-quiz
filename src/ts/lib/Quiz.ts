module TerminalQuiz {

    export class Quiz {

        public static WRONG_AUDIO_NAME = "WrongAudio";
        public static RIGHT_AUDIO_NAME = "RightAudio";
        public static BACKGROUND_AUDIO_NAME = "BackgroundAudio";
        public static TYPING_AUDIO_NAME = "TypingAudio";

        static CMD_SEPARATOR = " ";

        constructor(private element: Element, private opts: IQuizOptions) {

        }

        private currentQuestionIdx: number;
        private started = false;
        private term: any;

        private questions = new Array<Question>();
        private answers: {
            [name: string]: QuestionAnswer
        } = {};
        private anim: boolean = false;
        private greetings: String | (() => string);

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

                                this.playAudio(Quiz.TYPING_AUDIO_NAME, true);

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

                                                this.stopAudio(Quiz.TYPING_AUDIO_NAME);

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

        private echo(message: HTMLElement) {

            this.animatedType(message, () => {

                this.term.set_command('');
            });
        }

        setGreetings(msg: string | (() => string)): void {

            this.greetings = msg;
        }

        addQuestion(question: Question): Question {

            this.questions.push(question);

            return question;
        }

        echoFail(msg: string): void {

            this.echo($(`<div class="echo-fail">${msg}</div>`).get(0));
            this.playAudio(Quiz.WRONG_AUDIO_NAME);
        }

        echoSuccess(msg: string) {

            this.echo($(`<div class="echo-success">${msg}</div>`).get(0));
            this.playAudio(Quiz.RIGHT_AUDIO_NAME);
        }

        /*
        addTextQuestion(name: string): TextQuestion {

            return <TextQuestion>this.addQuestion(new TextQuestion(name, this));
        }

        addListQuestion<T extends Question>(name: string, question: T): ListQuestion<T> {

            var list = <ListQuestion<T>>this.addQuestion(new ListQuestion<T>(name, this).ofQuestion(question));

            this.questions.splice(this.questions.indexOf(question), 1);

            return list;
        }

        combinedQuestion(name: string, ...questions: Question[]): CombinationQuestion {

            questions.forEach(q => {

                this.questions.splice(this.questions.indexOf(q), 1);
            });

            return <CombinationQuestion>this.addQuestion(new CombinationQuestion(name, this).withQuestions(questions));
        }

        addChoiceQuestion<T>(name: string): ChoiceQuestion<T> {

            return <ChoiceQuestion<T>>this.addQuestion(new ChoiceQuestion<T>(name, this));
        }
        */
        public end() {

            this.stopAudio(Quiz.BACKGROUND_AUDIO_NAME);

            this.term.clear();
            this.term.set_prompt("> ");

            this.opts.onEnd();
        }

        getAnswer(question: Question): QuestionAnswer {

            var answer = this.answers[question.getName()];

            if (!answer) {

                answer = this.answers[question.getName()] = new QuestionAnswer();
            }

            return answer;
        }

        onUserCommand(cmd): void {

            var question = this.getCurrentQuestion();

            if (question) {

                var answer = this.getAnswer(question);

                answer.userAnswer = cmd;
                answer.parsedAnswer = this.getCurrentQuestion().getProcessor().parseUserAnswer(answer.userAnswer);
            }
        }

        validateCurrentAnswer(): boolean {

            var isValid = false;
            var question = this.getCurrentQuestion();

            if (question) {

                var answer = this.getAnswer(question);

                // By default is valid
                answer.isValid = true;

                question.getProcessor().validateAnswer(answer.userAnswer, {

                    echoFail: (msg) => {

                        // If any fail message is raised, it is marked as invalid
                        answer.isValid = false;

                        this.echoFail(msg);
                    },

                    echoSuccess: (msg) => {

                        this.echoSuccess(msg);
                    }
                });

                isValid = answer.isValid;
            }

            return isValid;
        }

        /**
        Initializes the quiz without starting it.
        */
        initialize(): void {

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
                        }
                    },
                    greetings: (cb) => {

                        cb('');
                    },
                    completion: true,
                    checkArity: false
                });
        }

        /**
        Starts the quiz.
        */
        start(): void {

            if (!this.questions || this.questions.length == 0) {
                throw new Error("The quiz cannot start because it has no questions!")
            }

            this.currentQuestionIdx = 0;

            this.playAudio(Quiz.BACKGROUND_AUDIO_NAME, true);

            this.started = true;

            this.askCurrentQuestion();
        }

        /**
        Indicates if the quiz already started or not.
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

                var isLastQuestion = this.currentQuestionIdx == (this.questions.length - 1);

                if (isLastQuestion) {

                    this.end();

                } else {

                    // If it did not reach the last question, advances
                    this.currentQuestionIdx++;

                    this.askCurrentQuestion();
                }
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

        private playAudio(name: string, loop = false) {

        }

        private stopAudio(name: string) {

        }
    }
}
