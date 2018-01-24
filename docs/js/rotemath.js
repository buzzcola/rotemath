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
            // do the Fisher-Yates shuffle:
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
var RoteMath;
(function (RoteMath) {
    let ProblemType;
    (function (ProblemType) {
        ProblemType[ProblemType["Addition"] = 1] = "Addition";
        ProblemType[ProblemType["Multiplication"] = 2] = "Multiplication";
    })(ProblemType = RoteMath.ProblemType || (RoteMath.ProblemType = {}));
    class Problem {
        constructor(type, left, right) {
            this.type = type;
            this.left = left;
            this.right = right;
        }
        get operator() {
            if (this.type === ProblemType.Addition) {
                return '+';
            }
            else {
                return 'x';
            }
        }
        get question() {
            return `${this.left} ${this.operator} ${this.right}`;
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
                return RoteMath.Utility.range2(args.max + 1)
                    .map(p => new Problem(args.problemType, p.x, p.y));
            }
            else {
                return RoteMath.Utility.range(args.max + 1)
                    .map(x => new Problem(args.problemType, args.practiceDigit, x));
            }
        }
        toString() {
            return `${this.left} ${this.operator} ${this.right} = ${this.answer}`;
        }
    }
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
        constructor(args) {
            this.ANSWER_MAX_MS = 3000; // time the player can correctly answer and still get a point.
            this.ANSWER_DELAY_MS = 1000; // time between correct answer and next problem popping up (the "victory lap").
            this._state = GameState.NotStarted; // state of the game.        
            this.answers = []; // the user's answers.
            let problems = RoteMath.Problem.makeProblems(args);
            this.answers = [];
            this.gameMode = args.gameMode;
            this._maxScore = problems.length;
            this.allPossibleAnswers = problems
                .map(p => p.answer) // grab all answers
                .filter((value, index, self) => self.indexOf(value) === index) // get distinct
                .sort((a, b) => a - b); // sort
            RoteMath.Utility.shuffleInPlace(problems);
            this._problemStack = problems;
        }
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
        get currentProblem() {
            return this._currentProblem;
        }
        get state() {
            return this._state;
        }
        start() {
            if (this.inState(GameState.NotStarted)) {
                RoteMath.Event.fire(RoteMath.Events.GameStart);
                RoteMath.Event.fire(RoteMath.Events.ScoreChanged);
                this.loadNextProblem();
            }
        }
        tryAnswer(answer) {
            let elapsed = this.timeElapsed;
            if (this.inState(GameState.GameOver, GameState.NotStarted, GameState.VictoryLap))
                return;
            let expired = elapsed > this.ANSWER_MAX_MS;
            let result;
            if (answer === this.currentProblem.answer) {
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
        getSuggestedAnswers() {
            // get a range of possible answers to serve as a hint for the user.
            let answerIndex = this.allPossibleAnswers.indexOf(this._currentProblem.answer);
            let neighbourRange = 2;
            let upperNeighbour = answerIndex + neighbourRange;
            let lowerNeighbour = answerIndex - neighbourRange;
            // can't always put the correct answer in the middle of the range. Shift the
            // range so that the answer might be in any position.
            let shiftAmount = RoteMath.Utility.getRandomInt(-neighbourRange, neighbourRange + 1);
            upperNeighbour += shiftAmount;
            lowerNeighbour += shiftAmount;
            // that might have pushed us out of bounds. adjust to correct.
            while (lowerNeighbour < 0) {
                lowerNeighbour++;
                upperNeighbour++;
            }
            while (upperNeighbour >= this.allPossibleAnswers.length) {
                upperNeighbour--;
                lowerNeighbour--;
            }
            let result = [];
            for (let i = lowerNeighbour; i <= upperNeighbour; i++) {
                result.push(this.allPossibleAnswers[i]);
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
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />
/// <reference path="Utility.ts" />
/// <reference path="Game.ts" />
var RoteMath;
/// <reference path="./node_modules/@types/webspeechapi/index.d.ts" />
/// <reference path="Utility.ts" />
/// <reference path="Game.ts" />
(function (RoteMath) {
    //declare class webkitSpeechRecognition { grammars: webkitSpeechGrammarList };
    //declare class webkitSpeechGrammarList { addFromString(string: string, weight: number): void };
    let $$ = document.querySelector.bind(document); // this is just less typing.
    let game;
    let worstDigit;
    let settingsPanel;
    let start;
    let problemType;
    let gameMode;
    let practicePanel;
    let competitionPanel;
    let practiceNumber;
    let gameMax;
    let gamePanel;
    let answerButtons;
    let buttonContainer;
    let scoreContainer;
    let score;
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
    let recognition;
    const BTN_INACTIVE = 'grey';
    const BTN_ACTIVE = 'blue';
    const BTN_INCORRECT = 'red';
    function init() {
        settingsPanel = $$('#settings');
        gamePanel = $$('#game');
        start = $$('#start');
        problemType = $$('#problemType');
        gameMode = $$('#gameMode');
        practicePanel = $$('#practicePanel');
        competitionPanel = $$('#competitionPanel');
        practiceNumber = $$('#practiceNumber');
        gameMax = $$('#gameMax');
        problem = $$('#problem');
        progressBar = $$('#progressBar');
        progressBackground = $$('#progressBackground');
        scoreContainer = $$('#scoreContainer');
        score = $$('#score');
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
        let numberWords = RoteMath.Utility.range(145).map(n => '' + n).join(' | ');
        let grammar = `#JSGF V1.0; grammar numbers; public <number> = ${numberWords};`;
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        var speechRecognitionList = new webkitSpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
        recognition.onresult = function (event) {
            let answer = event.results[0][0].transcript;
            var answerNumber = +answer;
            console.log(`got audio input: ${answer}`);
            if (!isNaN(answerNumber)) {
                if (!game.tryAnswer(answerNumber)) {
                    console.log(`  > ${answerNumber} is incorrect!`);
                    window.setTimeout(() => recognition.start(), 100);
                }
            }
            else {
                console.log(`  > that's not a number!`);
                window.setTimeout(() => recognition.start(), 100);
            }
        };
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
        game.allPossibleAnswers
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
        game.start();
    }
    function onAnswerButtonClick() {
        let answer = +this.innerText;
        let result = game.tryAnswer(answer);
        if (!result) {
            this.classList.remove('blue');
            this.classList.add('red');
        }
    }
    function onCorrectAnswer() {
        problem.innerHTML += ' = ' + game.currentProblem.answer;
    }
    function onScoreChanged() {
        score.innerHTML = '' + game.score;
    }
    function onProblemLoaded() {
        problem.innerHTML = game.currentProblem.question;
        // highlight suggested answers.
        var suggestions = game.getSuggestedAnswers();
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
        // listen for the answer!
        recognition.start();
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