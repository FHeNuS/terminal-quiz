///ts:ref=TextQuestion.ts
/// <reference path="./TextQuestion.ts"/> ///ts:ref:generated
///ts:ref=ChoiceQuestion.ts
/// <reference path="./ChoiceQuestion.ts"/> ///ts:ref:generated
///ts:ref=CombinationQuestion.ts
/// <reference path="./CombinationQuestion.ts"/> ///ts:ref:generated
///ts:ref=ListQuestion.ts
/// <reference path="./ListQuestion.ts"/> ///ts:ref:generated
module TerminalQuiz {

    export interface IQuizOptions {

        backgroundSoundUrl?: string;

        tipyingSoundUrl?: string;

        rightAnswerSoundUrl?: string;

        wrongAnswerSoundUrl?: string;

        typeMessageDelay: number;

        autoStart?: boolean;

        onAnswer?: (question: Question) => void;

        debug?: boolean;

        playBackground?: boolean;

        onEnd?: () => void;

        greetings?: string;
    }

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

            this.backgroundAudio = this.createAudioElement(opts.backgroundSoundUrl);
            this.typingAudio = this.createAudioElement(opts.tipyingSoundUrl);
            this.rightAudio = this.createAudioElement(opts.rightAnswerSoundUrl);
            this.wrongAudio = this.createAudioElement(opts.wrongAnswerSoundUrl);
            this.shouldPlayBackground = opts.playBackground === undefined || opts.playBackground;
        }

        private createAudioElement(src): HTMLAudioElement {

            var audio = document.createElement("audio");
            audio.src = src;
            document.body.appendChild(audio);

            return audio;
        }

        private term: any;
        private shouldPlayBackground: boolean;
        private backgroundAudio: HTMLAudioElement;
        private typingAudio: HTMLAudioElement;
        private rightAudio: HTMLAudioElement;
        private wrongAudio: HTMLAudioElement;
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

                if (this.opts.typeMessageDelay > 0) {

                    this.anim = true;
                    var processed = false;
                    var c = 0;

                    if (message.length > 0) {

                        this.term.set_prompt('');

                        var msgElem = $("<div>").html(message);
                        var bags = [];

                        this.separateTextFromElements(msgElem.get(0), bags);

                        this.term.echo("<i/>", {

                            raw: true,

                            finalize: (container) => {

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

                                                }, this.opts.typeMessageDelay);
                                            }
                                        }
                                    }, this.opts.typeMessageDelay);

                                } else {

                                    container.append(msgElem);
                                }
                            }
                        });
                    }

                } else {

                    finish_typing(message, prompt);
                    finish();
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

        private addQuestion(text: Question) {

            this.questions.push(text);

            return text;
        }

        echoFail(msg: string) {

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

        playBackgroundMusic(): void {

            if (!this.shouldPlayBackground) {

                this.playAudio(this.backgroundAudio, true);

                this.shouldPlayBackground = true;
            }
        }

        muteBackgroundMusic(): void {

            if (this.shouldPlayBackground) {

                this.stopAudio(this.backgroundAudio);

                this.shouldPlayBackground = false;
            }
        }

        private end() {

            this.stopAudio(this.backgroundAudio);

            this.term.clear();
            this.term.set_prompt("> ");

            this.opts.onEnd();
        }

        start(): void {

            this.term = window["$"](this.element).terminal((cmd, term) => {

                if (cmd == 'start') {

                    if (this.shouldPlayBackground)
                        this.playAudio(this.backgroundAudio, true);

                    term.clear();

                    if (this.questions && this.questions.length > 0) {

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

                        this.end();
                    }

                } else {

                    this.echoFail('unknown command');
                }

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

            this.echo(this.opts.greetings);
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

        _getNestedLevel(): number {

            return this.term.level();
        }

        _pushQuestion(answerCallback: (answer: string) => void, completionCallback: (answer, callback) => void, prompt: string | (() => string)): void {

            var opts = <any>{

                prompt: "> "
            };

            if (completionCallback) {

                opts.completion = (terminal, string, callback) => {

                    completionCallback(string, callback);
                }
            }

            this.term.push(answerCallback, opts);
        }

        _popQuestion(): void {

            this.playAudio(this.rightAudio);

            this.term.clear();

            this.term.pop();
        }

        private audioLoopHash = [];
        private audioLoopCounter = [];

        private playAudio(audio: HTMLAudioElement, loop: boolean = false): void {

            if (loop) {

                if (!this.audioLoopHash[audio.src]) {

                    var handler = function () {
                        this.currentTime = 0;
                        this.play();
                    };

                    this.audioLoopHash[audio.src] = handler;

                    // Because the same sound can be triggered more than once, we create a counter to know when it should be terminated;
                    this.audioLoopCounter[audio.src] = 1;

                    audio.addEventListener('ended', handler, false);

                    audio.play();

                } else {

                    this.audioLoopCounter[audio.src]++;
                }

            } else {

                audio.play();
            }
        }

        private stopAudio(audio: HTMLAudioElement) {

            if (this.audioLoopCounter[audio.src] == 1) {

                audio.pause();
                audio.currentTime = 0;

                // Only closes the loop if is the last trigger
                audio.removeEventListener('ended', this.audioLoopHash[audio.src], false);
                this.audioLoopHash[audio.src] = null;

            } else {

                this.audioLoopCounter[audio.src]--;
            }
        }
    }
}