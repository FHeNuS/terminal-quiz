module TerminalQuiz {

    export interface QuizAudioManagerOptions {

        backgroundSoundUrl?: string;

        tipyingSoundUrl?: string;

        rightAnswerSoundUrl?: string;

        wrongAnswerSoundUrl?: string;

        playBackground?: boolean;
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

        private createAudioElement(src): HTMLAudioElement {

            var audio = document.createElement("audio");
            audio.src = src;
            document.body.appendChild(audio);

            return audio;
        }

        unmute(audioName: string): void {

            if (!this.shouldPlayAudioHash[audioName]) {

                this.playAudio(audioName, true);

                this.shouldPlayAudioHash[audioName] = true;
            }
        }

        mute(audioName: string): void {

            if (this.shouldPlayAudioHash[audioName] === undefined || this.shouldPlayAudioHash[audioName]) {

                this.stopAudio(audioName);

                this.shouldPlayAudioHash[audioName] = false;
            }
        }

        private getAudio(audioName): HTMLAudioElement {

            var audio = this.audioElements[audioName];

            if (!audio) {

                throw new Error(`The audio "${audioName}" could not be found! Are you sure you called the method addAudio?`);
            }

            return audio;
        }

        private playAudio(audioName: string, loop: boolean = false): void {

            if (audioName) {

                var audio = this.getAudio(audioName);

                if (loop) {

                    if (!this.audioLoopHash[audioName]) {

                        var handler = function() {
                            this.currentTime = 0;
                            this.play();
                        };

                        this.audioLoopHash[audioName] = handler;

                        // Because the same sound can be triggered more than once, we create a counter to know when it should be terminated;
                        this.audioLoopCounter[audioName] = 1;

                        audio.addEventListener('ended', handler, false);

                        audio.play();

                    } else {

                        this.audioLoopCounter[audioName]++;
                    }

                } else {

                    audio.play();
                }
            }
        }

        private stopAudio(audioName: string) {

            if (audioName) {

                var audio = this.getAudio(audioName);

                if (audio) {

                    if (this.audioLoopCounter[audioName] == 1) {

                        audio.pause();
                        audio.currentTime = 0;

                        // Only closes the loop if is the last trigger
                        audio.removeEventListener('ended', this.audioLoopHash[audioName], false);
                        this.audioLoopHash[audioName] = null;

                    } else {

                        this.audioLoopCounter[audioName]--;
                    }
                }
            }
        }
    }
}
