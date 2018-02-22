/// <reference path="./node_modules/@types/modernizr/index.d.ts" />
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />

namespace RoteMath {
    export class RoteSpeech {
        readonly speechRecognition: SpeechRecognition;

        constructor(public readonly synthesisEnabled: boolean, public readonly recognitionEnabled: boolean) {
            
            if (recognitionEnabled && !Modernizr.speechrecognition) {
                throw new Error("Can't construct a speech recognition object when it's not supported.");
            }

            if(synthesisEnabled && !Modernizr.speechsynthesis) {
                throw new Error("Can't enable speech synthesis when it's not supported.");
            }

            let Recognition: SpeechRecognitionStatic;
            let GrammarList: SpeechGrammarListStatic;

            if (typeof (SpeechRecognition) === 'undefined') {
                Recognition = webkitSpeechRecognition;
                GrammarList = webkitSpeechGrammarList;
            } else {
                Recognition = SpeechRecognition;
                GrammarList = SpeechGrammarList;
            }

            let numberWords = Utility.range(145).map(n => '' + n).join(' | ');
            let grammar = `#JSGF V1.0; grammar numbers; public <number> = ${numberWords};`
            this.speechRecognition = new Recognition();
            this.speechRecognition.continuous = false;
            var speechRecognitionList = new GrammarList();
            speechRecognitionList.addFromString(grammar, 1);
            this.speechRecognition.grammars = speechRecognitionList;
            this.speechRecognition.maxAlternatives = 5;
        }

        static getAnswerFromSpeechResults(resultList: SpeechRecognitionResultList) {
            // this is annoying. why are some things implemented as array-like instead of arrays?
            let results: string[] = [];
            for (let i = 0; i < resultList[0].length; i++) { results.push(resultList[0][i].transcript) }

            let numberResults = results.map(RoteSpeech.pluckNumberFromPhrase).filter(x => x !== undefined);

            let gotNumber = !!numberResults.length;
            let number = gotNumber ? numberResults[0] : undefined;
            let word = results[0];

            let result = {
                gotNumber: gotNumber,
                number: number,
                word: word,
                alternatives: results
            };

            console.log(result);
            return result;
        }

        speak(message: string, startRecognition:boolean = false) {
            // if recognition is enabled, we have to disable it so RoteMath doesn't talk to itself. 
            // It is not a good conversationalist.            
            if(this.recognitionEnabled) {
                this.speechRecognition.abort();
            }

            if (this.synthesisEnabled) {
                let synth = speechSynthesis;
                if(synth.speaking) {
                    synth.cancel(); // stop current utterance. otherwise they queue up.
                }

                let utterance = new SpeechSynthesisUtterance(message);
                if (startRecognition && this.recognitionEnabled) {
                    utterance.onend = () => this.speechRecognition.start();
                }
                synth.speak(utterance);
            } else if (startRecognition && this.recognitionEnabled) {
                this.speechRecognition.start();
            }
        }

        speakProblem(problem: Problem, startRecognition:boolean = false) {
            let operator: string;
            if (problem.type == ProblemType.Addition) {
                operator = 'plus';
            } else {
                operator = 'times';
            }
            let values: any[] = [problem.left, problem.right, problem.answer];
            values[problem.problemMode] = 'something';
            let message = `${values[0]} ${operator} ${values[1]} equals ${values[2]}?`;
            this.speak(message, startRecognition);
        }

        static pluckNumberFromPhrase(phrase: string) {
            let numbers = phrase.split(' ').filter(x => !isNaN(+x)).map(x => +x);
            return numbers.length ? numbers[0] : undefined;
        }

        static supportsSpeechRecognition() {
            return Modernizr.speechrecognition;
        }

        static supportsSpeechSynthesis() {
            return Modernizr.speechsynthesis;
        }
    }
}