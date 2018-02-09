/// <reference path="./node_modules/@types/modernizr/index.d.ts" />
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />

namespace RoteMath {
    export function makeSpeechRecognition(): SpeechRecognition {
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
        let recognition = new Recognition();
        recognition.continuous = false;
        var speechRecognitionList = new GrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.maxAlternatives = 5;
        return recognition;
    }

    export function getAnswerFromSpeechResults(resultList: SpeechRecognitionResultList) {

        // this is annoying. why are some things implemented as array-like instead of arrays?
        let results: string[] = [];
        for (let i = 0; i < resultList[0].length; i++) { results.push(resultList[0][i].transcript) }

        let numberResults = results.map(pluckNumberFromPhrase).filter(x => x !== undefined);

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

    function pluckNumberFromPhrase(phrase: string) {
        let numbers = phrase.split(' ').filter(x => !isNaN(+x)).map(x => +x);
        return numbers.length ? numbers[0] : undefined;
    }

    export function speak(enabled: Boolean, message: string, callback?: () => any) {
        if(!enabled) return;

        let synth = speechSynthesis;
        let utterance = new SpeechSynthesisUtterance(message);
        synth.speak(utterance);
        if (typeof (callback) === 'function') {
            utterance.onend = () => callback();
        }
    }

    export function speakProblem(enabled: Boolean, problem: Problem, callback?: () => any) {
        let operator: string;
        if (problem.type == ProblemType.Addition) {
            operator = 'plus';
        } else {
            operator = 'times';
        }
        let message = `${problem.left} ${operator} ${problem.right}`;
        speak(enabled, message, callback);
    }

    export function supportsSpeechRecognition() {
        return Modernizr.speechrecognition;
    }

    export function supportsSpeechSynthesis() {
        return Modernizr.speechsynthesis;
    }
}