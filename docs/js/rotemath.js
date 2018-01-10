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
    }
    RoteMath.Answer = Answer;
})(RoteMath || (RoteMath = {}));
var RoteMath;
(function (RoteMath) {
    // broke-ass implementation of simple global events.
    // it was this or EventEmitter and 6,000 files worth of dependencies.
    var Events;
    // broke-ass implementation of simple global events.
    // it was this or EventEmitter and 6,000 files worth of dependencies.
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
    var ProblemType;
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
                return RoteMath.Utility.range2(args.param + 1)
                    .map(p => new Problem(args.problemType, p.x, p.y));
            }
            else {
                return RoteMath.Utility.range(12)
                    .map(x => new Problem(args.problemType, args.param, x));
            }
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
    var GameMode;
    (function (GameMode) {
        GameMode[GameMode["Competitive"] = 1] = "Competitive";
        GameMode[GameMode["Practice"] = 2] = "Practice"; // practice on particular digits.
    })(GameMode = RoteMath.GameMode || (RoteMath.GameMode = {}));
    var GameState;
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
            this._answers = []; // the user's answers.
            let problems = RoteMath.Problem.makeProblems(args);
            this._answers = [];
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
            let elapsed = (new Date()).getTime() - this._currentProblemStartTime.getTime();
            return Math.max(0, this.ANSWER_MAX_MS - elapsed);
        }
        get percentageTimeLeft() {
            return this.timeLeft / this.ANSWER_MAX_MS;
        }
        get score() {
            return this._answers
                .filter(a => a.success && a.time <= this.ANSWER_MAX_MS)
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
            let expired = (elapsed - this._currentProblemStartTime.getTime()) > this.ANSWER_MAX_MS;
            let result;
            if (answer === this.currentProblem.answer) {
                result = true;
                let firstTry = this.inState(GameState.WaitingForFirstAnswer);
                this._answers.push(new RoteMath.Answer(this.currentProblem, elapsed, firstTry, expired));
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
/// <reference path="Game.ts" />
var RoteMath;
/// <reference path="Game.ts" />
(function (RoteMath) {
    let $$ = document.querySelector.bind(document); // this is just less typing.
    let game;
    let settingsPanel;
    let gamePanel;
    let answerButtons;
    let start;
    let problemType;
    let gameMode;
    let practicePanel;
    let competitionPanel;
    let practiceNumber;
    let gameMax;
    let buttonContainer;
    let scoreContainer;
    let score;
    let problem;
    let progressBar;
    let progressBackground;
    let progressInterval;
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
        // this will be a lot less tedious with some kind of SPA framework, I know.
        // have to use jQuery for select change instead of addEventListener because
        // of materialize.
        $('#gameMode').change(function (event) {
            let mode = +gameMode.value;
            if (mode === RoteMath.GameMode.Competitive) {
                competitionPanel.classList.remove('hide');
                practicePanel.classList.add('hide');
            }
            else {
                competitionPanel.classList.add('hide');
                practicePanel.classList.remove('hide');
            }
        });
        start.addEventListener('click', startGame);
        RoteMath.Event.on(RoteMath.Events.ProblemLoaded, onProblemLoaded);
        RoteMath.Event.on(RoteMath.Events.ScoreChanged, onScoreChanged);
        RoteMath.Event.on(RoteMath.Events.CorrectAnswer, onCorrectAnswer);
        RoteMath.Event.on(RoteMath.Events.GameOver, onGameOver);
        $('#gameOver').modal({
            complete: gameOverCallback
        });
    }
    function startGame() {
        let mode = +gameMode.value;
        let type = +problemType.value;
        let param = mode === RoteMath.GameMode.Competitive ? +gameMax.value : +practiceNumber.value;
        game = new RoteMath.Game({ gameMode: mode, problemType: type, param: param });
        if (progressInterval) {
            window.clearInterval(progressInterval);
        }
        progressInterval = window.setInterval(updateTimeLeft, 250);
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
    }
    function updateTimeLeft() {
        let width = '' + (game.percentageTimeLeft * 100) + '%';
        progressBar.style.width = width;
    }
    function onGameOver() {
        let message = 'Game Over! You scored ' + game.score + '. ';
        if (game.score == game.maxScore) {
            message += 'That\'s perfect! You did a great job.';
        }
        else {
            message += 'Keep on practicing!';
        }
        $('#gameOver').modal('open');
    }
    function gameOverCallback() {
        gamePanel.classList.add('hide');
        settingsPanel.classList.remove('hide');
    }
    document.addEventListener('DOMContentLoaded', init);
})(RoteMath || (RoteMath = {}));
;
//# sourceMappingURL=rotemath.js.map