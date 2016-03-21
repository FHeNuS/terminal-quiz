module TerminalQuiz.Tests {

    export class DummyQuestion extends TerminalQuiz.Question {

    }

    export class Utils {

        static triggerKeys(element: JQuery, keyCode: number): void {

            var e = $.Event("keydown");
            e.which = e.keyCode = keyCode;
            element.trigger(e);

            var e = $.Event("keyup");
            e.which = e.keyCode = keyCode;
            element.trigger(e);

            var e = $.Event("keypress");
            e.which = e.keyCode = keyCode;
            element.trigger(e);
        }

        static type(element: JQuery, text?: string, pressReturnAtTheEnd = true): void {

            if (text) {

                for (let i = 0; i < text.length; i++) {

                    Utils.triggerKeys(element, text.charCodeAt(i));
                }
            }

            if (pressReturnAtTheEnd) {

                Utils.triggerKeys(element, 13);
            }
        }
    }
}
