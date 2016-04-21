module TerminalQuiz {

    export interface IQuizOptions {

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
