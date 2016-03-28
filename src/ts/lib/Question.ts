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

            if (!this.title || !this.title()) {

                throw new Error(`The question named '${this.name}' does not define a title!`);
            }

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
        }

        private processor: QuestionProcessor<any>;

        private description: (() => HTMLElement);

        private title: (() => HTMLElement);

        private whenAnsweredCallback: (answer: any) => void;

        private required: () => boolean;

        private ifCallback: () => boolean;

        /*
                public _getParsedFullText(): string {

                    var text = Quiz.wrapText(this._getParsedText(), "question-text");

                    var description = Quiz.wrapText(this._getParsedDescription(), "question-description");

                    return Quiz.wrapText(text + description, "question", this.constructor.toString().match(/\w+/g)[1], this.name);
                }
        */

        private createContainer(name: String, content: any): () => HTMLElement {

            return () => {

                var container = $(`<div class="${name}">`);

                if (typeof (content) === "string") {

                    container.append(<string>content);

                } else {

                    container.append((<() => any>content)());
                }

                return container.get(0);
            }
        }

        withTitle(title: string): this
        withTitle(title: () => string): this
        withTitle(title: () => HTMLElement): this
        withTitle(title: string | (() => string) | (() => HTMLElement)): this {

            this.title = this.createContainer("title", title);

            return this;
        }

        withDescription(description: string): this
        withDescription(description: () => string): this
        withDescription(description: () => HTMLElement): this
        withDescription(description: string | (() => string) | (() => HTMLElement)): this {

            this.description = this.createContainer("description", description);

            return this;
        }

        getDescription(): () => HTMLElement {

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

        getTitle(): () => HTMLElement {

            return this.title;
        }

        getWhenAnsweredCallback(): (answer: any) => void {

            return this.whenAnsweredCallback;
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

        /**
        Sets the question processor.
        */
        withProcessor(processor: QuestionProcessor<any>): this {

            this.processor = processor;

            return this;
        }
    }
}
