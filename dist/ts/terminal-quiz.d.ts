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
        getAnswer(): string;
        setAnswer(answer: string): any;
        echoSuccess(msg: string): void;
        echoFail(msg: string): void;
        playSound(sound: QuizSounds): any;
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
        private started;
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
        */
        echo(message: string, callBack?: () => void): any;
        echo(message: HTMLElement, callBack?: () => void): any;
        /**
        Add the supplied question to this Quiz.
        @param question The question to add.
        @returns The added question, for chanining purposes.
        */
        ask<T extends Question>(question: T): T;
        /**
        Writes an error message and marks the current question (if there is) as not valid.
        @param msg Message to write.
        */
        echoFail(msg: string): void;
        /**
        Writes a success message.
        @param msg Message to write.
        */
        echoSuccess(msg: string): void;
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
        onUserCommand(cmd: any): void;
        onKeyPress(event: KeyboardEvent): boolean;
        /**
        Initializes the quiz without starting it.
        */
        initialize(): void;
        /**
        Starts the quiz.
        */
        start(): void;
        /**
        Indicates if the quiz already started or not.
        @returns false.
        */
        hasStarted(): boolean;
        /**
        Renders the supplied question at the terminal.
        @param question Question to render.
        */
        renderQuestion(question: Question): void;
        /**
        Asks the current question.
        */
        askCurrentQuestion(): void;
        /**
        Goes to the next question.
        */
        validateCurrentQuestion(): void;
        validateAnswer(question: any): boolean;
        moveToNextQuestion(): void;
        getCurrentQuestion(): Question;
        destroy(): void;
        onQuestionAnswered(question: Question): void;
        private onEnd();
        playAudio(sound: QuizSounds, loop?: boolean): void;
        stopAudio(sound: QuizSounds): void;
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
        private required;
        private ifCallback;
        private createContainer(name, content);
        withTitle(title: string): this;
        withTitle(title: () => string): this;
        withTitle(title: () => HTMLElement): this;
        withDescription(description: string): this;
        withDescription(description: () => string): this;
        withDescription(description: () => HTMLElement): this;
        getDescription(): () => HTMLElement;
        getIfCallback(): () => boolean;
        getName(): string;
        getProcessor(): QuestionProcessor<this>;
        getRequired(): () => boolean;
        getTitle(): () => HTMLElement;
        getWhenAnsweredCallback(): (answer: any) => void;
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
        /**
        Sets the question processor.
        */
        withProcessor(processor: QuestionProcessor<any>): this;
        /**
        Renders this question and returns the resulting HTMLElement.
        */
        render(): HTMLElement;
    }
}

declare module TerminalQuiz {
    class QuestionProcessor<T extends Question> {
        question: T;
        constructor(question: T);
        showPrompt(): boolean;
        render(): HTMLElement;
        getDetail(): HTMLElement;
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
        getDetail(): HTMLElement;
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
        getDetail(): HTMLElement;
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
