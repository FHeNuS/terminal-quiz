declare module TerminalQuiz {
    enum ChoiceQuestionMode {
        ID_LABEL = 0,
        ID = 1,
        LABEL = 2,
    }
    class ChoiceQuestion<T> extends Question {
        private opts;
        private nameGetter;
        private descGetter;
        private singleItemNameGetter;
        initialize(): void;
        withOptions(opts: Array<T>): ChoiceQuestion<T>;
        singleItemName(singleItemNameGetter: string | (() => string)): ChoiceQuestion<T>;
        private getSingleItemName();
        optionName(nameGetter: (opt: T) => string): ChoiceQuestion<T>;
        optionDescription(descGetter: (opt: T) => string): ChoiceQuestion<T>;
        withText(text: string | (() => string)): ChoiceQuestion<T>;
        onAnswer(callback: (selectedOption: T) => void): ChoiceQuestion<T>;
        _getCompletionCallback(): (string, callback) => void;
        _parseAnswer(answer: any): IQuestionParseResult;
    }
}
declare module TerminalQuiz {
    class CombinationQuestion extends Question {
        private questions;
        private showFormat;
        private showQuestions;
        onAnswer(callback: (answers: Array<any>) => void): CombinationQuestion;
        withText(text: string | (() => string)): CombinationQuestion;
        hideCombinationFormat(): CombinationQuestion;
        hideQuestionsDescription(): CombinationQuestion;
        withQuestions(questions: Array<Question>): CombinationQuestion;
        _parseAnswer(answer: string): IQuestionParseResult;
        _getCompletionCallback(): (string, callback) => void;
        initialize(): void;
    }
}
declare module TerminalQuiz {
    class ListQuestion<T extends Question> extends Question {
        private question;
        private answers;
        ofQuestion(question: T): ListQuestion<T>;
        initialize(): void;
        onAnswer(callback: (answers: Array<any>) => void): ListQuestion<T>;
        _getCompletionCallback(): (string, callback) => void;
        _parseAnswer(answer: string): IQuestionParseResult;
    }
}
declare module TerminalQuiz {
    interface IQuestionParseResult {
        isValid: boolean;
        keepAlive: boolean;
        parsedAnswer: any;
    }
    abstract class Question {
        name: string;
        protected quiz: Quiz;
        constructor(name: string, quiz: Quiz);
        initialize(): void;
        protected regex: RegExp;
        protected friendlyRegex: string;
        protected description: string | (() => string);
        protected text: string | (() => string);
        protected onAnswerCb: (answer: any) => void;
        protected required: () => boolean;
        protected ifCallback: () => boolean;
        _getParsedText(): string;
        _getCompletionCallback(): (string, callback) => void;
        _getParsedDescription(): string;
        _getParsedFullText(): string;
        _parseAnswer(answer: string): IQuestionParseResult;
        if(ifCallBack: () => boolean): Question;
        withText(text: string | (() => string)): Question;
        withPattern(regex: RegExp, friendlyRegex: string): TextQuestion;
        asRequired(required?: () => boolean): Question;
        onAnswer(callback: (answer: any) => void): Question;
        shouldBeAsked(): boolean;
        ask(callback: (answer: any) => void): void;
    }
}
declare module TerminalQuiz {
    class TextQuestion extends Question {
        onAnswer(callback: (answer: string) => void): TextQuestion;
        withText(text: string | (() => string)): TextQuestion;
        asRequired(required?: () => boolean): TextQuestion;
    }
}
declare module TerminalQuiz {
    interface IQuizOptions {
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
    class Quiz {
        private element;
        private opts;
        static CMD_SEPARATOR: string;
        static wrapText(text: string, ...classes: Array<string>): string;
        static wrap(text: string, tag: string, ...classes: Array<string>): string;
        static getStringFromStringGetter(getter: string | (() => string)): string;
        constructor(element: Element, opts: IQuizOptions);
        private createAudioElement(src);
        private term;
        private shouldPlayBackground;
        private backgroundAudio;
        private typingAudio;
        private rightAudio;
        private wrongAudio;
        private questions;
        private anim;
        private greetings;
        private separateTextFromElements(elem, bag);
        private typed(finish_typing);
        echo: (message: string, finish?: () => void) => void;
        setGreetings(msg: string | (() => string)): void;
        private addQuestion(text);
        echoFail(msg: string): void;
        echoSuccess(msg: string): void;
        addTextQuestion(name: string): TextQuestion;
        addListQuestion<T extends Question>(name: string, question: T): ListQuestion<T>;
        combinedQuestion(name: string, ...questions: Question[]): CombinationQuestion;
        addChoiceQuestion<T>(name: string): ChoiceQuestion<T>;
        playBackgroundMusic(): void;
        muteBackgroundMusic(): void;
        private end();
        start(): void;
        /**
        Returns the current supplied command string.
        */
        _getCommandString(): string;
        /**
        Returns the current supplied list of commands.
        */
        _getCommands(): Array<string>;
        _getNestedLevel(): number;
        _pushQuestion(answerCallback: (answer: string) => void, completionCallback: (answer, callback) => void, prompt: string | (() => string)): void;
        _popQuestion(): void;
        private audioLoopHash;
        private audioLoopCounter;
        private playAudio(audio, loop?);
        private stopAudio(audio);
    }
}
declare module TerminalQuiz {
    class TextBuilder {
        private text;
        append(str: string): TextBuilder;
        line(str?: string): TextBuilder;
        bold(str: string): TextBuilder;
        toString(): string;
    }
}
