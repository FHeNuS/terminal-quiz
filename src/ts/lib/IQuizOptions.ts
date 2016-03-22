module TerminalQuiz {

    export interface IQuizOptions {

        typeMessageDelay?: number;

        autoStart?: boolean;

        onAnswer?: (question: Question) => void;

        debug?: boolean;

        onEnd?: () => void;

        greetings?: string;

        audioManager: QuizAudioManager;
    }
}
