module TerminalQuiz {

    export interface QuizContext {

        getAnswer(): string;

        setAnswer(answer: string);
    }

    export class Quiz {

        static CMD_SEPARATOR = " ";

        constructor(private element: Element, private opts: IQuizOptions) {

        }

        private currentQuestionIdx: number;
        private started = false;
        private term: any;
        private i: QuizContext;
        private questions = new Array<Question>();
        private answers: {
            [name: string]: QuestionAnswer
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

                                this.playAudio(QuizSounds.Type, true);

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

                                                this.stopAudio(QuizSounds.Type);

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

        addQuestion<T extends Question>(question: T): T {

            if (!!this.answers[question.getName()])
                throw new Error(`Cannot add a question named '${question.getName()}' twice!`);

            this.questions.push(question);
            this.answers[question.getName()] = new QuestionAnswer();

            return question;
        }

        echoFail(msg: string): void {

            this.echo($(`<div class="echo-fail">${msg}</div>`).get(0));
            this.playAudio(QuizSounds.WrongAnswer);
        }

        echoSuccess(msg: string) {

            this.echo($(`<div class="echo-success">${msg}</div>`).get(0));
            this.playAudio(QuizSounds.RightAnswer);
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

        public clear(): void {

            this.term.clear();
            this.term.set_prompt("> ");
        }

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

        getAnswer(question: Question): QuestionAnswer {

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

            return this.getCurrentQuestion().getProcessor().onKeyPress(event.keyCode, this.ctx);
        }

        validateCurrentAnswer(): boolean {

            var isValid = false;
            var question = this.getCurrentQuestion();

            if (question) {

                var answer = this.getAnswer(question);

                // By default is valid
                answer.isValid = true;

                question.getProcessor().validateAnswer(answer.parsedAnswer, {

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

            this.ctx = {

                getAnswer: () => {

                    return this.term.get_command();
                },
                setAnswer: (answer: string) => {

                    this.term.set_command(answer);
                }
            }
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

        private onEnd() {


        }

        private playAudio(sound: QuizSounds, loop = false) {

        }

        private stopAudio(sound: QuizSounds) {

        }
    }
}
