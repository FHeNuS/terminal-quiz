declare module TerminalQuiz {
    interface IQuizOptions {
        typeMessageDelay?: number;
        autoStart?: boolean;
        debug?: boolean;
        onStart?(): void;
        onEnd?(): void;
        onQuestionRendered?(question: Question): void;
        onQuestionAnswered?(question: Question, answer: Answer): void;
        onKeyPress?: (e: KeyboardEvent) => void;
        greetings?: string;
        backgroundSoundUrl?: string;
        quizTypingSoundUrl?: string;
        userTypingSoundUrl?: string;
        rightAnswerSoundUrl?: string;
        wrongAnswerSoundUrl?: string;
        playBackground?: boolean;
    }
}

declare module TerminalQuiz {
    enum QuizSounds {
        WrongAnswer,
        RightAnswer,
        Background,
        QuizTyping,
        UserTyping,
    }
}

declare module TerminalQuiz {
    class QuizAudioManager {
        private audioElements;
        private shouldPlayAudioHash;
        private audioLoopHash;
        private audioLoopCounter;
        constructor();
        private createAudioElement(name, src);
        isMuted(name: string): boolean;
        unmute(name: string): void;
        mute(name: string): void;
        addAudio(name: string, src: string): void;
        private getAudio(name, throwErrorIfNotFound?);
        hasAudio(name: string): boolean;
        play(name: string, loop?: boolean): void;
        stop(name: string): void;
    }
}


declare module TerminalQuiz {
    interface QuizContext {
        getAnswer(): Answer;
        getTypedCommand(): string;
        setTypedCommand(answer: string): any;
        echoSuccess(msg: string | HTMLElement): void;
        echoFail(msg: string | HTMLElement): void;
        playSound(sound: QuizSounds, loop?: boolean): any;
        stopSound(sound: QuizSounds): any;
    }
    interface IQuiz extends Quiz {
    }
    class Quiz {
        private element;
        private opts;
        static CMD_SEPARATOR: string;
        constructor(element: Element, opts: IQuizOptions);
        private audioManager;
        private currentQuestionIdx;
        private term;
        private questions;
        private answers;
        private anim;
        private greetings;
        private ctx;
        private separateTextFromElements(elem, bag);
        private animatedType(message, onFinish);
        /**
        Writes a message to the terminal.
        @param message String message to write.
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echo(message: string, callBack?: () => void): void;
        /**
        Writes a message to the terminal.
        @param message HTMLElement to write.
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echo(message: HTMLElement, callBack?: () => void): void;
        /**
        Add the supplied question to this Quiz.
        @param question The question to add.
        @returns The added question, for chanining purposes.
        */
        ask<T extends Question>(question: T): T;
        /**
        Writes an error message and marks the current question (if there is) as not valid.
        @param msg Message to write.
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echoFail(msg: HTMLElement | string, callBack?: () => void): void;
        /**
        Writes a success message.
        @param msg Message to write.
        @param callBack Callback that will be called when the message finishes
        being written.
        */
        echoSuccess(msg: HTMLElement | string, callBack?: () => void): void;
        /**
        Clear the current output.
        */
        clear(): void;
        /**
        Ends the quiz.
        */
        end(): void;
        /**
        Retrieves the answer for the supplied question.
        @param question The question to retrieve the answer.
        @returns The supplied question answer.
        */
        getAnswer(question: Question): Answer;
        /**
        Returns the list of questions this quiz has.
        @returnValue List of questions.
        */
        getQuestions(): Question[];
        onKeyPress(event: KeyboardEvent): boolean;
        /**
        Initializes the quiz without starting it.
        */
        initialize(): void;
        /**
        Starts the quiz.
        */
        start(): void;
        onQuestionRendered(question: Question): void;
        /**
        Hides the prompt if the question processor indicates.
        @prompt Question processor to check.
        */
        hidePromptIfNeeded(processor: QuestionProcessor<any>): void;
        /**
        Renders the supplied question at the terminal.
        @param question Question to render.
        */
        renderQuestion(question: Question): void;
        /**
        Indicates if the supplied question should be asked.
        @param question The question to check.
        @returnValue True or false.
        */
        shouldAskQuestion(question: Question): boolean;
        /**
        Asks the current question.
        */
        askCurrentQuestion(): void;
        /**
        Parses and validates current question.
        */
        parseCurrentQuestion(): Answer;
        validateCurrentQuestion(): boolean;
        s: any;
        validateAnswer(question: Question, answer: Answer): boolean;
        /**
        Because some answer may not be questioned, this method will find the
        previous suitable question index.
        @returns The previous question index if found or -1 if not.
        */
        getPreviousQuestionIndex(): number;
        /**
        Because some answer may not be questioned, this method will find the
        next suitable question index.
        @returns The next question index if found or -1 if not.
        */
        getNextQuestionIndex(): number;
        /**
        Moves to the desired question.
        @param idx Question index.
        */
        moveToQuestion(idx: number): void;
        moveToNextQuestion(): void;
        getCurrentQuestion(): Question;
        destroy(): void;
        onQuestionAnswered(question: Question): void;
        private onEnd();
        playSound(sound: QuizSounds, loop?: boolean): void;
        stopSound(sound: QuizSounds): void;
    }
}

declare module TerminalQuiz {
    interface IQuestionParseResult {
        isValid: boolean;
        keepAlive: boolean;
        parsedAnswer: any;
    }
    abstract class Question {
        protected name: string;
        constructor(name: string);
        initialize(): void;
        private processor;
        private description;
        private title;
        private whenAnsweredCallback;
        private whenRenderedCallback;
        private required;
        private ifCallback;
        private requiredMessage;
        withRequiredMessage(requiredMessage: string): this;
        withRequiredMessage(requiredMessage: () => string): this;
        withRequiredMessage(requiredMessage: () => HTMLElement): this;
        withTitle(title: string): this;
        withTitle(title: () => string): this;
        withTitle(title: () => HTMLElement): this;
        withDescription(description: string): this;
        withDescription(description: () => string): this;
        withDescription(description: () => HTMLElement): this;
        getDescription(): string | (() => string) | (() => HTMLElement);
        getIfCallback(): () => boolean;
        getName(): string;
        getProcessor(): QuestionProcessor<this>;
        getRequired(): () => boolean;
        getRequiredMessage(): string | (() => string) | (() => HTMLElement);
        getTitle(): string | (() => string) | (() => HTMLElement);
        getWhenAnsweredCallback(): (answer: any) => void;
        getWhenRenderedCallback(): () => void;
        /**
        Sets the question as required.
        */
        asRequired(): this;
        /**
        Sets the question as required or not.
        @param required Value indicating if the question is required or not.
        */
        asRequired(required: boolean): this;
        /**
        Sets the question as required or not.
        @param required Callback that will indicate if the question is required or not.
        */
        asRequired(required: () => boolean): this;
        onlyAskIf(callback: () => boolean): this;
        whenAnswered(callback: (answer: any) => void): this;
        whenRendered(callback: () => void): this;
        /**
        Sets the question processor.
        */
        withProcessor(processor: QuestionProcessor<any>): this;
    }
}

declare module TerminalQuiz {
    class QuestionProcessor<T extends Question> {
        question: T;
        constructor(question: T);
        showPrompt(): boolean;
        private createContainer(name, content);
        /**
        Renders the question and returns the resulting HTMLElement.
        */
        render(ctx: QuizContext): HTMLElement;
        getDetail(ctx: QuizContext): HTMLElement;
        onRendered(ctx: QuizContext): void;
        /**
        Parses the user answer.
        @returns The parsed answer.
        */
        parseUserAnswer(userAnswer: string): any;
        validateAnswer(parsedAnswer: any, ctx: QuizContext): void;
        onKeyPress(typedCharacter: number, ctx: QuizContext): boolean;
    }
}

declare module TerminalQuiz {
    class Answer {
        parsedAnswer: any;
        userAnswer: string;
        isValid: boolean;
    }
}

declare module TerminalQuiz {
    class TextQuestion extends Question {
        protected regex: RegExp;
        protected friendlyRegex: string;
        withPattern(regex: RegExp, friendlyRegex: string): this;
        getPattern(): RegExp;
        getFriendlyPattern(): string;
        initialize(): void;
    }
    class TextQuestionProcessor extends QuestionProcessor<TextQuestion> {
        getDetail(ctx: QuizContext): HTMLElement;
        validateAnswer(parsedAnswer: any, ctx: QuizContext): void;
    }
    interface IQuiz {
        askText(name: string): TextQuestion;
    }
}

declare module TerminalQuiz {
    class ChoiceQuestionProcessor extends QuestionProcessor<ChoiceQuestion<any>> {
        private container;
        private selectedIdx;
        private createOption(opt, idx, ul, ctx);
        getDetail(ctx: QuizContext): HTMLElement;
        onRendered(ctx: QuizContext): void;
        private getUserAnswerIdx(userAnswer);
        parseUserAnswer(userAnswer: string): any;
        validateAnswer(parsedAnswer: any, ctx: QuizContext): void;
        private clearSelectedChoice();
        private displaySelectedChoice();
        onKeyPress(typedKey: number, ctx: QuizContext): boolean;
        showPrompt(): boolean;
    }
    class ChoiceQuestion<T> extends Question {
        private opts;
        private nameGetter;
        initialize(): void;
        getOpts(): Array<T>;
        getOptsName(): (opt: T) => string;
        withOpts(opts: Array<T>): ChoiceQuestion<T>;
        withOptsName(nameGetter: (opt: T) => string): ChoiceQuestion<T>;
    }
    interface IQuiz {
        askChoice<T>(name: string): ChoiceQuestion<T>;
        askChoice<T>(name: string, options: Array<T>): ChoiceQuestion<T>;
    }
}

interface JQuery {
    terminalQuiz(options: TerminalQuiz.IQuizOptions): TerminalQuiz.IQuiz;
}
