module TerminalQuiz {

    export interface IMessenger {

        echoSuccess(msg: string): void;

        echoFail(msg: string): void;
    }
}
