module TerminalQuiz {

    export class QuizAudioManager {

        private audioElements: {
            [audioUrl: string]: HTMLAudioElement;
        } = {};

        private shouldPlayAudioHash: {
            [audioUrl: string]: boolean;
        } = {};

        private audioLoopHash: {
            [audioUrl: string]: () => void;
        } = {};

        private audioLoopCounter: {
            [audioUrl: string]: number;
        } = {};


        private soundArray = new Array<String>();


        constructor() {
        }

        private createAudioElement(name, src): HTMLAudioElement {
          var audio = document.createElement("audio");
            if(typeof src === "string"){
              audio.src = src;
              document.body.appendChild(audio);
              this.audioElements[name] = audio;
              return audio;
            } else {
              this.soundArray = src;
              audio.src = "1.wav";
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

        addAudio(name: string, src: string | Array<String>) {
            if (this.getAudio(name, false)) {

                throw new Error(`The audio named '${name}' was already added!`);

            } else {

                this.createAudioElement(name, src);
                this.shouldPlayAudioHash[name] = true;
            }
        }

        private getAudio(name, throwErrorIfNotFound = true): HTMLAudioElement {
            var audio = this.audioElements[name];

            if (!audio && throwErrorIfNotFound) {
                throw new Error(`The audio "${name}" could not be found! Are you sure you called the 'addAudio' method?`);
            }
            if(this.soundArray.length!=0 && name == "UserTypingAudio"){
                audio.src = this.soundArray[Math.floor(Math.random()*(this.soundArray.length+1))].toString();
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
