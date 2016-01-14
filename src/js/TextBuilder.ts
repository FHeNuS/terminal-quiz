module TerminalQuiz {

    export class TextBuilder {

        private text = "";

        append(str: string): TextBuilder {

            this.text += str;

            return this;
        }

        line(str?: string): TextBuilder {

            if (str)
                this.text += str + "\r\n";
            else
                this.text += "\r\n";

            return this;
        }

        bold(str: string): TextBuilder {

            this.text += "[[b;;]"

            this.text += str;

            this.text += "]";

            return this;
        }

        public toString(): string {

            return this.text;
        }
    }
}