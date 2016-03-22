module TerminalQuiz {

    export class Quiz {

        static CMD_SEPARATOR = " ";

        static wrapText(text: string, ...classes: Array<string>): string {

            return Quiz.wrap(text, "div", ...classes);
        }

        static wrap(text: string, tag: string, ...classes: Array<string>): string {

            var txt = '<' + tag;

            if (classes) {
                txt += ' class="';
                txt += classes.join(" ");
                txt += '">';
            }

            txt += text + '</' + tag + '>'

            return txt;
        }

        static getStringFromStringGetter(getter: string | (() => string)) {

            var text = "";

            if (getter) {

                if (typeof getter === "string") {

                    text = <string>getter;

                } else {

                    text = (<(() => string)>getter)();
                }
            }

            return text;
        }

        constructor(private element: Element, private opts: IQuizOptions) {

        }

        private currentQuestion: Question = null;
        private term: any;

        private questions = new Array<Question>();
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

        private typed(finish_typing: (message, prompt) => void) {
            return (message: string, finish?: () => void) => {

                var prompt = this.term.get_prompt();

                if (message.length > 0) {

                    this.anim = true;
                    var processed = false;
                    var c = 0;

                    this.term.set_prompt('');

                    var msgElem = $("<div>").html(message);
                    var bags = [];

                    this.separateTextFromElements(msgElem.get(0), bags);

                    this.term.echo("<i/>", {

                        raw: true,

                        finalize: (container) => {

                            try {

                                if (!processed) {

                                    processed = true;

                                    this.playAudio(this.typingAudio, true);

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

                                                    this.stopAudio(this.typingAudio);

                                                    // swap command with prompt
                                                    finish_typing(message, prompt);

                                                    this.anim = false;

                                                    if (finish)
                                                        finish();

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
            };
        }

        echo = this.typed((message, prompt) => {
            this.term.set_command('');
            //this.term.echo(message, { raw: true })
            this.term.set_prompt(prompt);
        });

        setGreetings(msg: string | (() => string)): void {

            this.greetings = msg;
        }

        addQuestion(question: Question): Question {

            this.questions.push(question);

            return question;
        }

        echoFail(msg: string): void {

            this.echo(Quiz.wrapText(msg, "echo-fail"));
            this.playAudio(this.wrongAudio);
        }

        echoSuccess(msg: string) {

            this.echo(Quiz.wrapText(msg, "echo-success"));
        }

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



        private end() {

            this.stopAudio(this.backgroundAudio);

            this.term.clear();
            this.term.set_prompt("> ");

            this.opts.onEnd();
        }

        onUserCommand(cmd): void {

            if (cmd.toLowerCase() == "start") {

                if (this.shouldPlayBackground)
                    this.playAudio(this.backgroundAudio, true);

                this.term.clear();

                var currentQuestionIdx = 0;
                var questionCount = this.questions.length;
                var currentQuestion = this.questions[currentQuestionIdx];
                var onQuestionAnsweredCallBack = () => {

                    if (currentQuestion.shouldBeAsked() && this.opts.onAnswer) {

                        this.opts.onAnswer(currentQuestion);
                    }

                    currentQuestionIdx++;

                    if (currentQuestionIdx < questionCount) {

                        currentQuestion = this.questions[currentQuestionIdx]

                        if (currentQuestion.shouldBeAsked()) {

                            currentQuestion.ask(onQuestionAnsweredCallBack);

                        } else {

                            onQuestionAnsweredCallBack();
                        }

                    } else {

                        this.end();
                    }
                };

                currentQuestion.ask(onQuestionAnsweredCallBack);

            } else {

                this.echoFail("Unknown command!");
            }
        }

        initialize(): void {

            this.term = window["$"](this.element).terminal((cmd: string, term) => {

                this.onUserCommand(cmd);

            }, {
                    name: 'xxx',
                    //width: 800,
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

        start(): void {

            if (!this.questions || this.questions.length == 0) {
                throw new Error("The quiz cannot start because it has no questions!")
            }

            this.currentQuestion = this.questions[0];
        }

        getCurrentQuestion(): Question {

            return this.currentQuestion;
        }

        destroy(): void {

            if (this.term) {

                this.term.purge();
                this.term.destroy();
            }
        }

        /**
        Returns the current supplied command string.
        */
        _getCommandString(): string {

            return this.term.get_command();
        }

        /**
        Returns the current supplied list of commands.
        */
        _getCommands(): Array<string> {

            return this.term.get_command().split(Quiz.CMD_SEPARATOR);
        }
    }
}
