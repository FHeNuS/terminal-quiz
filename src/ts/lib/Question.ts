module TerminalQuiz {

    export interface IQuestionParseResult {

        isValid: boolean;

        keepAlive: boolean;

        parsedAnswer: any;
    }

    export abstract class Question {

        constructor(protected name: string) {
        }

        public initialize(): void {

            if (!this.required) {

                // If the required callback is not defined, set as not required
                this.required = () => false;
            }

            if (!this.ifCallback) {

                // If the if callback is not defined, set as it should execute
                this.ifCallback = () => true;
            }

            if (!this.description) {

                this.description = () => null;
            }

            if (!this.getProcessor()) {

                this.withProcessor(new QuestionProcessor(this));
            }

            if (!this.getRequiredMessage()) {

                this.withRequiredMessage('Please provide an answer for this question!');
            }
        }

        private processor: QuestionProcessor<any>;

        private description: string | (() => string) | (() => HTMLElement);

        private title: string | (() => string) | (() => HTMLElement);

        private whenAnsweredCallback: (answer: any) => void;

        private whenRenderedCallback: () => void;

        private required: () => boolean;

        private ifCallback: () => boolean;

        private requiredMessage: string | (() => string) | (() => HTMLElement);
        /*
                public _getParsedFullText(): string {

                    var text = Quiz.wrapText(this._getParsedText(), "question-text");

                    var description = Quiz.wrapText(this._getParsedDescription(), "question-description");

                    return Quiz.wrapText(text + description, "question", this.constructor.toString().match(/\w+/g)[1], this.name);
                }
        */

        withRequiredMessage(requiredMessage: string): this
        withRequiredMessage(requiredMessage: () => string): this
        withRequiredMessage(requiredMessage: () => HTMLElement): this
        withRequiredMessage(requiredMessage: string | (() => string) | (() => HTMLElement)): this {

            this.requiredMessage = requiredMessage;

            return this;
        }

        withTitle(title: string): this
        withTitle(title: () => string): this
        withTitle(title: () => HTMLElement): this
        withTitle(title: string | (() => string) | (() => HTMLElement)): this {

            this.title = title;

            return this;
        }

        withDescription(description: string): this
        withDescription(description: () => string): this
        withDescription(description: () => HTMLElement): this
        withDescription(description: string | (() => string) | (() => HTMLElement)): this {

            this.description = description;

            return this;
        }

        getDescription(): string | (() => string) | (() => HTMLElement) {

            return this.description;
        }

        getIfCallback(): () => boolean {

            return this.ifCallback;
        }

        getName(): string {

            return this.name;
        }

        getProcessor(): QuestionProcessor<this> {

            return this.processor;
        }

        getRequired(): () => boolean {

            return this.required;
        }

        getRequiredMessage(): string | (() => string) | (() => HTMLElement) {

            return this.requiredMessage;
        }

        getTitle(): string | (() => string) | (() => HTMLElement) {

            return this.title;
        }

        getWhenAnsweredCallback(): (answer: any) => void {

            return this.whenAnsweredCallback;
        }

        getWhenRenderedCallback(): () => void {

            return this.whenRenderedCallback;
        }

        /**
        Sets the question as required.
        */
        asRequired(): this
        /**
        Sets the question as required or not.
        @param required Value indicating if the question is required or not.
        */
        asRequired(required: boolean): this
        /**
        Sets the question as required or not.
        @param required Callback that will indicate if the question is required or not.
        */
        asRequired(required: () => boolean): this
        /**
        Sets the question as required or not.
        @param required A boolean value or a callback that will indicate if the question is required or not.
        */
        asRequired(required?: boolean | (() => boolean)): this {

            if (required === undefined) {

                // If no arguments are supplied, it should be required
                this.required = () => true;

            } else {

                if (typeof required === "boolean") {

                    this.required = () => <boolean>required;

                } else {

                    this.required = (<() => boolean>required);
                }
            }

            return this;
        }

        onlyAskIf(callback: () => boolean): this {

            this.ifCallback = callback;

            return this;
        }

        whenAnswered(callback: (answer: any) => void): this {

            this.whenAnsweredCallback = callback;

            return this;
        }

        whenRendered(callback: () => void): this {

            this.whenRenderedCallback = callback;

            return this;
        }

        /**
        Sets the question processor.
        */
        withProcessor(processor: QuestionProcessor<any>): this {

            this.processor = processor;

            return this;
        }
    }
}
