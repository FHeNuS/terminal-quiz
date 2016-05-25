module TerminalQuiz {

    export class QuizAudioManager {

        private audioSrcs: {
            [name: string]: string | Array<string>;
        } = {};

        private audioElements: {
            [name: string]: HTMLAudioElement;
        } = {};

        private shouldPlayAudioHash: {
            [name: string]: boolean;
        } = {};

        private audioLoopHash: {
            [name: string]: () => void;
        } = {};

        private audioLoopCounter: {
            [name: string]: number;
        } = {};

        constructor() {
        }

        private createAudioElement(name: string, src: string | Array<string>): HTMLAudioElement {

          var audio = document.createElement("audio");
            if(typeof src === "string"){
              audio.src = src;
              document.body.appendChild(audio);
              this.audioElements[name] = audio;
              return audio;
            } else {
              audio.src = src[0];
              document.body.appendChild(audio);
              this.audioElements[name] = audio;
              return audio;
            }
        }

        isMuted(name: string) {

            return !this.shouldPlayAudioHash[name];
        }

        unmute(name: string): void {

            if (!this.shouldPlayAudioHash[name]) {

                this.play(name, true);

                this.shouldPlayAudioHash[name] = true;
            }
        }

        mute(name: string): void {

            if (this.shouldPlayAudioHash[name]) {

                this.stop(name);

                this.shouldPlayAudioHash[name] = false;
            }
        }

        addAudio(name: string, src: string | Array<string>) {

            if (this.getAudio(name, false)) {

                throw new Error(`The audio named '${name}' was already added!`);

            } else {

                this.audioSrcs[name] = src;
                this.createAudioElement(name, src);
                this.shouldPlayAudioHash[name] = true;
            }
        }

        private getAudio(name, throwErrorIfNotFound = true): HTMLAudioElement {

            var audio = this.audioElements[name];

            if (!audio && throwErrorIfNotFound) {
                throw new Error(`The audio "${name}" could not be found! Are you sure you called the 'addAudio' method?`);
            }

            var src = this.audioSrcs[name];

            if(src && typeof src !== "string") {

                if(src.length != 0){
                    audio.src = src[Math.floor(Math.random()*(src.length+1))].toString();
                }
            }

            return audio;
        }

        public hasAudio(name: string): boolean {

            return !!this.getAudio(name, false);
        }

        public play(name: string, loop: boolean = false): void {

            if (name) {

                var audio = this.getAudio(name);

                if (loop) {

                    if (!this.audioLoopHash[name]) {

                        var handler = function() {
                            this.currentTime = 0;
                            this.play();
                        };

                        this.audioLoopHash[name] = handler;

                        // Because the same sound can be triggered more than once, we create a counter to know when it should be terminated;
                        this.audioLoopCounter[name] = 1;

                        audio.addEventListener('ended', handler, false);

                        audio.play();

                    } else {

                        this.audioLoopCounter[name]++;
                    }

                } else {

                    audio.play();
                }
            }
        }

        public stop(name: string) {

            if (name) {

                var audio = this.getAudio(name);

                if (audio) {

                    if (this.audioLoopCounter[name] == 1) {

                        audio.pause();
                        audio.currentTime = 0;

                        // Only closes the loop if is the last trigger
                        audio.removeEventListener('ended', this.audioLoopHash[name], false);
                        this.audioLoopHash[name] = null;

                    } else {

                        this.audioLoopCounter[name]--;
                    }
                }
            }
        }
    }
}
