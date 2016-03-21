 module TerminalQuiz {

    export class TextQuestion extends Question {



        onAnswer(callback: (answer: string) => void): TextQuestion {

            return <TextQuestion>super.onAnswer(callback);
        }

        withText(text: string | (() => string)): TextQuestion {

            return <TextQuestion>super.withText(text);
        }

        asRequired(required?: () => boolean): TextQuestion {

            return <TextQuestion>super.asRequired(required);
        }
    }
}
