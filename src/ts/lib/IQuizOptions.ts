module TerminalQuiz {

    export interface IQuizOptions {

        backgroundSoundUrl?: string;

        tipyingSoundUrl?: string;

        rightAnswerSoundUrl?: string;

        wrongAnswerSoundUrl?: string;

        typeMessageDelay?: number;

        autoStart?: boolean;

        onAnswer?: (question: Question) => void;

        debug?: boolean;

        playBackground?: boolean;

        onEnd?: () => void;

        greetings?: string;
    }
}
