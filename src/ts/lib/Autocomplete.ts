module TerminalQuiz {

    export interface Autocomplete {

        /**
        Contract for the callback called when the user requests the autocomplete feature.
        @param answer: The current answer.
        @param possibleAnswers: The callback that should be called with the list of possible answers.
        */
        (answer: string, possibleAnswers: (answers: Array<string>) => void): void;
    }
}
