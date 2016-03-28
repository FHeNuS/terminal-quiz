module TerminalQuiz {

    export interface IQuizOptions {

        typeMessageDelay?: number;

        autoStart?: boolean;

        onAnswer?: (question: Question) => void;

        debug?: boolean;

        onEnd?: () => void;

        greetings?: string;

        backgroundSoundUrl?: string;

        quizTypingSoundUrl?: string;

        userTypingSoundUrl?: string;

        rightAnswerSoundUrl?: string;

        wrongAnswerSoundUrl?: string;

        playBackground?: boolean;
    }
}
