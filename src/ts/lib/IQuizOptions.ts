module TerminalQuiz {

    export interface IQuizOptions {

        typeMessageDelay?: number;

        autoStart?: boolean;

        onAnswer?: (question: Question) => void;

        debug?: boolean;

        onEnd?: () => void;

        greetings?: string;

        backgroundSoundUrl?: string;

        tipyingSoundUrl?: string;

        rightAnswerSoundUrl?: string;

        wrongAnswerSoundUrl?: string;

        playBackground?: boolean;
    }
}
