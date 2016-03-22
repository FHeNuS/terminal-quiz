module TerminalQuiz {

    export interface QuizAudioManagerOptions {

        
    }

    export class QuizAudioManager {

        private audioElements: {
            [audioUrl: string]: HTMLAudioElement;
        };

        private shouldPlayAudioHash: {
            [audioUrl: string]: boolean;
        };

        private audioLoopHash: {
            [audioUrl: string]: () => void;
        };

        private audioLoopCounter: {
            [audioUrl: string]: number;
        };

        constructor() {

        }

        private createAudioElement(name, src): HTMLAudioElement {

            var audio = document.createElement("audio");
            audio.src = src;
            document.body.appendChild(audio);

            return audio;
        }

        isMuted(name: string) {

            return !this.shouldPlayAudioHash[name];
        }

        unmute(name: string): void {

            if (!this.shouldPlayAudioHash[name]) {

                this.playAudio(name, true);

                this.shouldPlayAudioHash[name] = true;
            }
        }

        mute(name: string): void {

            if (this.shouldPlayAudioHash[name]) {

                this.stopAudio(name);

                this.shouldPlayAudioHash[name] = false;
            }
        }

        addAudio(name: string, src: string) {

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

            return audio;
        }

        public hasAudio(name: string): boolean {

            return !!this.getAudio(name, false);
        }

        private playAudio(name: string, loop: boolean = false): void {

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

        private stopAudio(name: string) {

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
