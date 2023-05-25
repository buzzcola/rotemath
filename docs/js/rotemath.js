var RoteMath;
(function (RoteMath) {
    class Answer {
        constructor(problem, time, firstTry, expired) {
            this.problem = problem;
            this.time = time;
            this.firstTry = firstTry;
            this.expired = expired;
        }
        get success() {
            return this.firstTry && !this.expired;
        }
        toString() {
            let message;
            if (this.success)
                message = '(Correct!)';
            else if (!this.firstTry)
                message = '(First Answer was Incorrect)';
            else
                message = '(Time Out)';
            return `${this.problem.toString()} ${message}`;
        }
    }
    RoteMath.Answer = Answer;
})(RoteMath || (RoteMath = {}));
var RoteMath;
(function (RoteMath) {
    // broke-ass implementation of simple global events.
    // it was this or EventEmitter and 6,000 files worth of dependencies.
    let Events;
    (function (Events) {
        Events[Events["GameStart"] = 0] = "GameStart";
        Events[Events["GameOver"] = 1] = "GameOver";
        Events[Events["ProblemLoaded"] = 2] = "ProblemLoaded";
        Events[Events["CorrectAnswer"] = 3] = "CorrectAnswer";
        Events[Events["ScoreChanged"] = 4] = "ScoreChanged";
    })(Events = RoteMath.Events || (RoteMath.Events = {}));
    class Event {
        static fire(event) {
            let queue = this._eventQueues[event];
            if (!queue) {
                return;
            }
            queue.forEach(f => f());
        }
        static on(event, handler) {
            if (typeof this._eventQueues[event] === 'undefined') {
                this._eventQueues[event] = [];
            }
            this._eventQueues[event].push(handler);
        }
    }
    Event._eventQueues = {};
    RoteMath.Event = Event;
})(RoteMath || (RoteMath = {}));
var RoteMath;
(function (RoteMath) {
    class Utility {
        static shuffleInPlace(array) {
            // do the Fisher-Yates shuffle!
            // https://stackoverflow.com/a/2450976/41457
            let currentIndex = array.length;
            let temporaryValue;
            let randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }
        static getRandomInt(min, max) {
            // thanks MDN!
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }
        static coinToss(option1, option2) {
            return Math.random() >= 0.5 ? option2 : option1;
        }
        static range(size) {
            return [...Array(size).keys()];
        }
        static range2(size1, size2 = undefined) {
            let result = [];
            for (let i of this.range(size1)) {
                for (let j of this.range(size2 || size1)) {
                    result.push({ x: i, y: j });
                }
            }
            return result;
        }
    }
    RoteMath.Utility = Utility;
})(RoteMath || (RoteMath = {}));
//import { Utility } from './Utility';
var RoteMath;
//import { Utility } from './Utility';
(function (RoteMath) {
    let ProblemType;
    (function (ProblemType) {
        ProblemType[ProblemType["Addition"] = 1] = "Addition";
        ProblemType[ProblemType["Multiplication"] = 2] = "Multiplication";
    })(ProblemType = RoteMath.ProblemType || (RoteMath.ProblemType = {}));
    // Problems can be displayed three ways. This helps with learning.
    let ProblemMode;
    (function (ProblemMode) {
        ProblemMode[ProblemMode["HideLeft"] = 0] = "HideLeft";
        ProblemMode[ProblemMode["HideRight"] = 1] = "HideRight";
        ProblemMode[ProblemMode["HideAnswer"] = 2] = "HideAnswer"; // "6 x 5 = ?"
    })(ProblemMode = RoteMath.ProblemMode || (RoteMath.ProblemMode = {}));
    class Problem {
        constructor(type, left, right) {
            this.type = type;
            this.left = left;
            this.right = right;
            if (type === ProblemType.Multiplication && (left === 0 || right === 0)) {
                // in multiplication, if one factor is zero and you mask the other one then there
                // are multiple (infinite) correct solutions. Let's avoid that.
                if (left !== 0) {
                    this.problemMode = RoteMath.Utility.coinToss(ProblemMode.HideRight, ProblemMode.HideAnswer);
                }
                else if (right !== 0) {
                    this.problemMode = RoteMath.Utility.coinToss(ProblemMode.HideLeft, ProblemMode.HideAnswer);
                }
                else {
                    // zero times zero.
                    this.problemMode = ProblemMode.HideAnswer;
                }
            }
            else {
                this.problemMode = RoteMath.Utility.getRandomInt(0, 3);
            }
        }
        get operator() {
            if (this.type === ProblemType.Addition) {
                return '+';
            }
            else {
                return 'x';
            }
        }
        get questionMasked() {
            let values = [this.left, this.right, this.answer];
            values[this.problemMode] = Problem.maskCharacter;
            return `${values[0]} ${this.operator} ${values[1]} = ${values[2]}`;
        }
        get solution() {
            return [this.left, this.right, this.answer][this.problemMode];
        }
        get questionUnmasked() {
            return `${this.left} ${this.operator} ${this.right} = ${this.answer}`;
        }
        get answer() {
            if (this.type === ProblemType.Addition) {
                return this.left + this.right;
            }
            else {
                return this.left * this.right;
            }
        }
        static makeProblems(args) {
            let result = [];
            if (args.gameMode === RoteMath.GameMode.Competitive) {
                const all = RoteMath.Utility.range2(args.max + 1)
                    .map(p => new Problem(args.problemType, p.x, p.y));
                // let's trim out out some of the zero and one problems. a 13x13 competitive
                // set will have 25 "zero times something" and 25 "one times something", and
                // we really don't need too many of those.
                const maxZeroes = 3;
                const maxOnes = 3;
                let zeroes = 0;
                let ones = 0;
                RoteMath.Utility.shuffleInPlace(all);
                all.forEach(p => {
                    if (p.left == 0 || p.right == 0) {
                        if (zeroes < maxZeroes) {
                            zeroes++;
                            result.push(p);
                        }
                    }
                    else if (p.left == 1 || p.right == 1) {
                        if (ones < maxOnes) {
                            ones++;
                            result.push(p);
                        }
                    }
                    else {
                        result.push(p);
                    }
                });
            }
            else {
                result = RoteMath.Utility.range(args.max + 1)
                    .map(x => new Problem(args.problemType, args.practiceDigit, x));
            }
            return result;
        }
        toString() {
            return `${this.left} ${this.operator} ${this.right} = ${this.answer}`;
        }
    }
    Problem.maskCharacter = '?';
    RoteMath.Problem = Problem;
})(RoteMath || (RoteMath = {}));
/// <reference path="Utility.ts" />
/// <reference path="Problem.ts" />
var RoteMath;
/// <reference path="Utility.ts" />
/// <reference path="Problem.ts" />
(function (RoteMath) {
    let GameMode;
    (function (GameMode) {
        GameMode[GameMode["Competitive"] = 1] = "Competitive";
        GameMode[GameMode["Practice"] = 2] = "Practice"; // practice on particular digits.
    })(GameMode = RoteMath.GameMode || (RoteMath.GameMode = {}));
    let GameState;
    (function (GameState) {
        GameState[GameState["NotStarted"] = 0] = "NotStarted";
        GameState[GameState["WaitingForFirstAnswer"] = 1] = "WaitingForFirstAnswer";
        GameState[GameState["WaitingYouBlewIt"] = 2] = "WaitingYouBlewIt";
        GameState[GameState["VictoryLap"] = 3] = "VictoryLap";
        GameState[GameState["GameOver"] = 4] = "GameOver";
    })(GameState = RoteMath.GameState || (RoteMath.GameState = {}));
    class Game {
        get timeElapsed() {
            return (new Date()).getTime() - this._currentProblemStartTime.getTime();
        }
        get timeLeft() {
            if (!this.inState(GameState.WaitingForFirstAnswer)) {
                return 0;
            }
            return Math.max(0, this.ANSWER_MAX_MS - this.timeElapsed);
        }
        get percentageTimeLeft() {
            return this.timeLeft / this.ANSWER_MAX_MS;
        }
        get score() {
            return this.answers
                .filter(a => a.success)
                .length;
        }
        get maxScore() {
            return this._maxScore;
        }
        get problemCount() {
            return this._maxScore;
        }
        get currentPosition() {
            return this._maxScore - this._problemStack.length;
        }
        get currentProblem() {
            return this._currentProblem;
        }
        get state() {
            return this._state;
        }
        constructor(args) {
            this.ANSWER_MAX_MS = 5000; // time the player can correctly answer and still get a point.
            this.ANSWER_DELAY_MS = 1000; // time between correct answer and next problem popping up (the "victory lap").
            this._state = GameState.NotStarted; // state of the game.        
            this.answers = []; // the user's answers.
            let problems = RoteMath.Problem.makeProblems(args);
            this.answers = [];
            this.gameMode = args.gameMode;
            this._maxScore = problems.length;
            this.allPossibleSolutions = problems
                .map(p => p.solution) // grab all answers
                .filter((value, index, self) => self.indexOf(value) === index) // get distinct
                .sort((a, b) => a - b); // sort
            RoteMath.Utility.shuffleInPlace(problems);
            this._problemStack = problems;
        }
        start() {
            if (this.inState(GameState.NotStarted)) {
                RoteMath.Event.fire(RoteMath.Events.GameStart);
                RoteMath.Event.fire(RoteMath.Events.ScoreChanged);
                this.loadNextProblem();
            }
        }
        trySolution(solution) {
            let elapsed = this.timeElapsed;
            if (this.inState(GameState.GameOver, GameState.NotStarted, GameState.VictoryLap))
                return;
            let expired = elapsed > this.ANSWER_MAX_MS;
            let result;
            if (solution === this.currentProblem.solution) {
                result = true;
                let firstTry = this.inState(GameState.WaitingForFirstAnswer);
                this.answers.push(new RoteMath.Answer(this.currentProblem, elapsed, firstTry, expired));
                RoteMath.Event.fire(RoteMath.Events.ScoreChanged);
                this._state = GameState.VictoryLap;
                RoteMath.Event.fire(RoteMath.Events.CorrectAnswer);
                window.setTimeout(() => {
                    if (this._problemStack.length === 0) {
                        this.gameOver();
                    }
                    else {
                        this.loadNextProblem();
                    }
                }, this.ANSWER_DELAY_MS);
            }
            else {
                result = false;
                this._state = GameState.WaitingYouBlewIt;
            }
            return result;
        }
        getSuggestedSolutions() {
            // get a range of possible solutions to serve as a hint for the user.
            let solutionIndex = this.allPossibleSolutions.indexOf(this._currentProblem.solution);
            let neighbourRange = 2;
            let upperNeighbour = solutionIndex + neighbourRange;
            let lowerNeighbour = solutionIndex - neighbourRange;
            // can't always put the correct solution in the middle of the range. Shift the
            // range so that the answer might be in any position.
            let shiftAmount = RoteMath.Utility.getRandomInt(-neighbourRange, neighbourRange + 1);
            upperNeighbour += shiftAmount;
            lowerNeighbour += shiftAmount;
            // that might have pushed us out of bounds. adjust to correct.
            while (lowerNeighbour < 0) {
                lowerNeighbour++;
                upperNeighbour++;
            }
            while (upperNeighbour >= this.allPossibleSolutions.length) {
                upperNeighbour--;
                lowerNeighbour--;
            }
            let result = [];
            for (let i = lowerNeighbour; i <= upperNeighbour; i++) {
                result.push(this.allPossibleSolutions[i]);
            }
            return result;
        }
        loadNextProblem() {
            if (this.inState(GameState.GameOver))
                return;
            this._currentProblem = this._problemStack.pop();
            this._currentProblemStartTime = new Date();
            RoteMath.Event.fire(RoteMath.Events.ProblemLoaded);
            this._state = GameState.WaitingForFirstAnswer;
        }
        gameOver() {
            RoteMath.Event.fire(RoteMath.Events.GameOver);
            this._state = GameState.GameOver;
        }
        inState(...states) {
            return states.indexOf(this._state) > -1;
        }
    }
    RoteMath.Game = Game;
})(RoteMath || (RoteMath = {}));
/// <reference path="./node_modules/@types/modernizr/index.d.ts" />
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />
var RoteMath;
/// <reference path="./node_modules/@types/modernizr/index.d.ts" />
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />
(function (RoteMath) {
    class RoteSpeech {
        constructor(synthesisEnabled, recognitionEnabled) {
            this.synthesisEnabled = synthesisEnabled;
            this.recognitionEnabled = recognitionEnabled;
            if (recognitionEnabled && !Modernizr.speechrecognition) {
                throw new Error("Can't construct a speech recognition object when it's not supported.");
            }
            if (synthesisEnabled && !Modernizr.speechsynthesis) {
                throw new Error("Can't enable speech synthesis when it's not supported.");
            }
            let Recognition;
            let GrammarList;
            if (typeof (SpeechRecognition) === 'undefined') {
                Recognition = webkitSpeechRecognition;
                GrammarList = webkitSpeechGrammarList;
            }
            else {
                Recognition = SpeechRecognition;
                GrammarList = SpeechGrammarList;
            }
            let numberWords = RoteMath.Utility.range(145).map(n => '' + n).join(' | ');
            let grammar = `#JSGF V1.0; grammar numbers; public <number> = ${numberWords};`;
            this.speechRecognition = new Recognition();
            this.speechRecognition.continuous = false;
            var speechRecognitionList = new GrammarList();
            speechRecognitionList.addFromString(grammar, 1);
            this.speechRecognition.grammars = speechRecognitionList;
            this.speechRecognition.maxAlternatives = 5;
        }
        static getAnswerFromSpeechResults(resultList) {
            // this is annoying. why are some things implemented as array-like instead of arrays?
            let results = [];
            for (let i = 0; i < resultList[0].length; i++) {
                results.push(resultList[0][i].transcript);
            }
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
        speak(message, startRecognition = false) {
            // if recognition is enabled, we have to disable it so RoteMath doesn't talk to itself. 
            // It is not a good conversationalist.            
            if (this.recognitionEnabled) {
                this.speechRecognition.abort();
            }
            if (this.synthesisEnabled) {
                let synth = speechSynthesis;
                if (synth.speaking) {
                    synth.cancel(); // stop current utterance. otherwise they queue up.
                }
                let utterance = new SpeechSynthesisUtterance(message);
                if (startRecognition && this.recognitionEnabled) {
                    utterance.onend = () => this.speechRecognition.start();
                }
                synth.speak(utterance);
            }
            else if (startRecognition && this.recognitionEnabled) {
                this.speechRecognition.start();
            }
        }
        speakProblem(problem, startRecognition = false) {
            let operator;
            if (problem.type == RoteMath.ProblemType.Addition) {
                operator = 'plus';
            }
            else {
                operator = 'times';
            }
            let values = [problem.left, problem.right, problem.answer];
            values[problem.problemMode] = 'something';
            let message = `${values[0]} ${operator} ${values[1]} equals ${values[2]}?`;
            this.speak(message, startRecognition);
        }
        static pluckNumberFromPhrase(phrase) {
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
    RoteMath.RoteSpeech = RoteSpeech;
})(RoteMath || (RoteMath = {}));
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />
/// <reference path="SpeechRecognition.ts" />
/// <reference path="Utility.ts" />
/// <reference path="Game.ts" />
var RoteMath;
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />
/// <reference path="SpeechRecognition.ts" />
/// <reference path="Utility.ts" />
/// <reference path="Game.ts" />
(function (RoteMath) {
    let $$ = document.querySelector.bind(document); // this is just less typing.
    let game;
    let worstDigit;
    let settingsPanel;
    let start;
    let problemType;
    let gameMode;
    let speechEnabledContainer;
    let speechEnabledCheckbox;
    let micEnabledContainer;
    let micEnabledCheckbox;
    let practicePanel;
    let competitionPanel;
    let practiceNumber;
    let gameMax;
    let gamePanel;
    let answerButtons;
    let buttonContainer;
    let scoreContainer;
    let score;
    let progress;
    let problem;
    let progressBar;
    let progressBackground;
    let progressInterval;
    let gameOverPanel;
    let gameOverMessage;
    let gameOverGridContainer;
    let practiceSuggestion;
    let suggestionMessage;
    let practiceSuggestionButton;
    let startPractice;
    let speech;
    const BTN_INACTIVE = 'grey';
    const BTN_ACTIVE = 'blue';
    const BTN_INCORRECT = 'red';
    function init() {
        settingsPanel = $$('#settings');
        gamePanel = $$('#game');
        start = $$('#start');
        problemType = $$('#problemType');
        gameMode = $$('#gameMode');
        speechEnabledContainer = $$('#speechEnabledContainer');
        speechEnabledCheckbox = $$('#speechEnabledCheckbox');
        micEnabledContainer = $$('#micEnabledContainer');
        micEnabledCheckbox = $$('#micEnabledCheckbox');
        practicePanel = $$('#practicePanel');
        competitionPanel = $$('#competitionPanel');
        practiceNumber = $$('#practiceNumber');
        gameMax = $$('#gameMax');
        problem = $$('#problem');
        progressBar = $$('#progressBar');
        progressBackground = $$('#progressBackground');
        scoreContainer = $$('#scoreContainer');
        score = $$('#score');
        progress = $$('#progress');
        buttonContainer = $$('#button-container');
        gameOverPanel = $$('#gameOver');
        gameOverMessage = $$('#gameOverMessage');
        gameOverGridContainer = $$('#gameOverGridContainer');
        practiceSuggestion = $$('#practiceSuggestion');
        suggestionMessage = $$('#suggestionMessage');
        practiceSuggestionButton = $$('#practiceSuggestionButton');
        // this will be a lot less tedious with some kind of SPA framework, I know.
        // have to use jQuery for select change instead of vanilla because
        // of materialize.
        $(gameMode).change(function (event) {
            let mode = +gameMode.value;
            if (mode === RoteMath.GameMode.Competitive) {
                practicePanel.classList.add('hide');
            }
            else {
                practicePanel.classList.remove('hide');
            }
        });
        start.addEventListener('click', startGame);
        practiceSuggestionButton.addEventListener('click', startPracticeSuggestion);
        RoteMath.Event.on(RoteMath.Events.ProblemLoaded, onProblemLoaded);
        RoteMath.Event.on(RoteMath.Events.ScoreChanged, onScoreChanged);
        RoteMath.Event.on(RoteMath.Events.CorrectAnswer, onCorrectAnswer);
        RoteMath.Event.on(RoteMath.Events.GameOver, onGameOver);
        $('#gameOver').modal({
            complete: gameOverCallback
        });
        let apology = 'Sorry, this doesn\'t work with your web browser.';
        if (!RoteMath.RoteSpeech.supportsSpeechRecognition()) {
            micEnabledCheckbox.disabled = true;
            micEnabledContainer.addEventListener('click', () => showToast(apology));
        }
        if (!RoteMath.RoteSpeech.supportsSpeechSynthesis()) {
            speechEnabledCheckbox.disabled = true;
            speechEnabledCheckbox.addEventListener('click', () => showToast(apology));
        }
    }
    function startGame() {
        let mode = +gameMode.value;
        let type = +problemType.value;
        let max = +gameMax.value;
        let practiceDigit = +practiceNumber.value;
        game = new RoteMath.Game({ gameMode: mode, problemType: type, max: max, practiceDigit: practiceDigit });
        if (progressInterval) {
            window.clearInterval(progressInterval);
        }
        progressInterval = window.setInterval(updateTimeLeft, 100);
        // clear out the button div, then make a button for every possible answer.
        answerButtons = [];
        while (buttonContainer.hasChildNodes()) {
            buttonContainer.removeChild(buttonContainer.lastChild);
        }
        game.allPossibleSolutions
            .forEach(i => {
            let button = document.createElement('a');
            for (let c of ['btn', BTN_INACTIVE, 'answer-button']) {
                button.classList.add(c);
            }
            button.innerText = '' + i;
            button.addEventListener('click', onAnswerButtonClick);
            buttonContainer.appendChild(button);
            answerButtons.push(button);
        });
        settingsPanel.classList.add('hide');
        gamePanel.classList.remove('hide');
        speech = new RoteMath.RoteSpeech(speechEnabledCheckbox.checked, micEnabledCheckbox.checked);
        if (speech.synthesisEnabled) {
            speech.speechRecognition.onresult = onNumberSpeechRecognized;
        }
        updateProgress();
        game.start();
    }
    function onAnswerButtonClick() {
        let solution = +this.innerText;
        let result = game.trySolution(solution);
        if (!result) {
            this.classList.remove('blue');
            this.classList.add('red');
        }
    }
    function onNumberSpeechRecognized(event) {
        let result = RoteMath.RoteSpeech.getAnswerFromSpeechResults(event.results);
        if (result.gotNumber) {
            if (!game.trySolution(result.number)) {
                let message = `${result.number} is incorrect!`;
                showToast(message);
                speech.speak(message, true);
            }
        }
        else {
            let alternatives = result.alternatives.map(s => s + '?!').join('<br>');
            showToast(alternatives);
            speech.speak('I didn\'t get that.', true);
        }
    }
    function onCorrectAnswer() {
        problem.innerHTML = game.currentProblem.questionUnmasked;
        updateProgress();
        speech.speak('correct!');
    }
    function updateProgress() {
        progress.innerHTML = game.currentPosition + " / " + game.problemCount;
    }
    function onScoreChanged() {
        score.innerHTML = '' + game.score;
    }
    function onProblemLoaded() {
        let problemContent = game.currentProblem.questionMasked;
        problemContent = problemContent.replace(RoteMath.Problem.maskCharacter, `<span id="solutionMask">${RoteMath.Problem.maskCharacter}</span>`);
        problem.innerHTML = problemContent;
        // highlight suggested answers.
        var suggestions = game.getSuggestedSolutions();
        for (let b of answerButtons) {
            b.classList.remove(BTN_INCORRECT);
            if (suggestions.indexOf(+b.innerHTML) !== -1) {
                b.classList.add(BTN_ACTIVE);
                b.classList.remove(BTN_INACTIVE);
            }
            else {
                b.classList.add(BTN_INACTIVE);
                b.classList.remove(BTN_ACTIVE);
            }
        }
        speech.speakProblem(game.currentProblem, true);
    }
    function updateTimeLeft() {
        // report progress -5% to account for latency and whatever. Before this change
        // a player would get a missed point when there appeared to be time left on the timer.
        let width = '' + Math.max((Math.floor(game.percentageTimeLeft * 100) - 5), 0) + '%';
        progressBar.style.width = width;
    }
    function onGameOver() {
        let message = `Game Over. You scored ${game.score} out of ${game.maxScore}. `;
        if (game.score == game.maxScore) {
            message += 'That\'s perfect!';
        }
        else {
            message += 'Keep on practicing!';
        }
        gameOverGridContainer.innerHTML = '';
        gameOverGridContainer.appendChild(makeResultTable(game.answers));
        initializeTooltips();
        if (game.gameMode === RoteMath.GameMode.Competitive && !game.answers.every(a => a.success)) {
            worstDigit = getWorstDigit(game.answers);
            let message = `You could use some more practice for the number ${worstDigit}.`;
            suggestionMessage.innerText = message;
            practiceSuggestion.classList.remove('hide');
        }
        else {
            practiceSuggestion.classList.add('hide');
        }
        gameOverMessage.textContent = message;
        $('#gameOver').modal('open');
    }
    function startPracticeSuggestion() {
        startPractice = true;
        $('#gameOver').modal('close');
    }
    function makeResultTable(answers) {
        let minleft = answers.reduce((acc, x) => Math.min(x.problem.left, acc), Number.MAX_SAFE_INTEGER);
        let maxleft = answers.reduce((acc, x) => Math.max(x.problem.left, acc), Number.MIN_SAFE_INTEGER);
        let minright = answers.reduce((acc, x) => Math.min(x.problem.right, acc), Number.MAX_SAFE_INTEGER);
        let maxright = answers.reduce((acc, x) => Math.max(x.problem.right, acc), Number.MIN_SAFE_INTEGER);
        let table = document.createElement('table');
        table.classList.add('resultsGrid');
        let headerRow = table.appendChild(document.createElement('tr'));
        headerRow.appendChild(document.createElement('th')); // empty corner.
        for (let right = minright; right <= maxright; right++) {
            let cell = headerRow.appendChild(document.createElement('th'));
            cell.textContent = '' + right;
        }
        for (let left = minleft; left <= maxleft; left++) {
            let row = table.appendChild(document.createElement('tr'));
            let headerCell = row.appendChild(document.createElement('th'));
            headerCell.textContent = '' + left;
            for (let right = minright; right <= maxright; right++) {
                let cell = row.appendChild(document.createElement('td'));
                let answer = answers.filter(a => a.problem.left === left && a.problem.right === right)[0];
                cell.classList.add('tooltipped');
                cell.setAttribute('data-position', 'bottom');
                cell.setAttribute('data-delay', '50');
                cell.setAttribute('data-tooltip', answer.toString());
                if (answer.success) {
                    cell.classList.add('success');
                }
                else {
                    cell.classList.add('failure');
                }
            }
        }
        table.style.height = '' + ((maxleft - minleft + 2) * 2) + 'em';
        table.style.width = '' + ((maxright - minright + 2) * 2) + 'em';
        return table;
    }
    function getWorstDigit(answers) {
        let correct = answers.filter(a => a.success);
        let ranks = correct.map(a => a.problem.left)
            .concat(correct.map(a => a.problem.right))
            .reduce((acc, d) => { acc.hasOwnProperty(d) ? acc[d]++ : acc[d] = 1; return acc; }, {});
        return Object.keys(ranks)
            .reduce((acc, k) => ranks[k] < ranks[acc] ? +k : acc, 0);
    }
    function initializeTooltips() {
        $('.tooltipped').tooltip({ delay: 50 });
    }
    function showToast(message) {
        Materialize.toast(message, 2000, 'rounded');
    }
    function gameOverCallback() {
        gamePanel.classList.add('hide');
        settingsPanel.classList.remove('hide');
        if (startPractice) {
            startPractice = false;
            gameMode.value = '' + RoteMath.GameMode.Practice;
            practiceNumber.value = '' + worstDigit;
            startGame();
        }
    }
    document.addEventListener('DOMContentLoaded', init);
})(RoteMath || (RoteMath = {}));
;
//# sourceMappingURL=rotemath.js.map