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
        constructor(question, answer) {
            this.question = question;
            this.answer = answer;
        }
        static makeMultiplicationProblems(max) {
            let result = [];
            for (let i = 1; i <= max; i++) {
                for (let j = 1; j <= max; j++) {
                    let question = '' + i + ' x ' + j;
                    let answer = i * j;
                    result.push(new Problem(question, answer));
                }
            }
            return result;
        }
        static makeAdditionProblems(max) {
            let result = [];
            for (let i = 1; i <= max; i++) {
                for (let j = 1; j <= max; j++) {
                    let question = '' + i + ' + ' + j;
                    let answer = i + j;
                    result.push(new Problem(question, answer));
                }
            }
            return result;
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
    let GameState;
    (function (GameState) {
        GameState[GameState["NotStarted"] = 0] = "NotStarted";
        GameState[GameState["InPlay"] = 1] = "InPlay";
        GameState[GameState["GameOver"] = 2] = "GameOver";
    })(GameState = RoteMath.GameState || (RoteMath.GameState = {}));
    class Game {
        constructor(problemType, max) {
            this._state = GameState.NotStarted; // state of the game.
            this._score = 0; // current score.
            let problems;
            if (problemType === RoteMath.ProblemType.Multiplication) {
                problems = RoteMath.Problem.makeMultiplicationProblems(max);
            }
            else {
                problems = RoteMath.Problem.makeAdditionProblems(max);
            }
            this._maxScore = problems.length;
            this.allAnswers = problems
                .map(p => p.answer) // grab all answers
                .filter((value, index, self) => self.indexOf(value) === index) // get distinct
                .sort((a, b) => a - b); // sort
            RoteMath.Utility.shuffleInPlace(problems);
            this._problemStack = problems;
        }
        get score() {
            return this._score;
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
            if (this.state === GameState.NotStarted)
                this.loadNextProblem();
        }
        tryAnswer(answer) {
            switch (this._state) {
                case GameState.GameOver:
                    throw new Error('Attempt to answer in game over state.');
                case GameState.NotStarted:
                    throw new Error('Attempt to answer before game started.');
            }
            let result;
            if (answer === this.currentProblem.answer) {
                result = true;
                this._score++;
            }
            else {
                result = false;
            }
            if (this._problemStack.length > 0) {
                this.loadNextProblem();
            }
            else {
                this.gameOver();
            }
            return result;
        }
        getSuggestedAnswers() {
            // get a range of possible answers to serve as a hint for the user.
            let answerIndex = this.allAnswers.indexOf(this._currentProblem.answer);
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
            while (upperNeighbour >= this.allAnswers.length) {
                upperNeighbour--;
                lowerNeighbour--;
            }
            let result = [];
            for (let i = lowerNeighbour; i <= upperNeighbour; i++) {
                result.push(this.allAnswers[i]);
            }
            return result;
        }
        loadNextProblem() {
            switch (this._state) {
                case GameState.GameOver:
                    throw new Error('Attempt to load next problem in Game Over state.');
                case GameState.NotStarted:
                    this._state = GameState.InPlay;
            }
            this._currentProblem = this._problemStack.pop();
        }
        gameOver() {
            this._state = GameState.GameOver;
        }
    }
    RoteMath.Game = Game;
})(RoteMath || (RoteMath = {}));
/// <reference path="Game.ts" />
var RoteMath;
/// <reference path="Game.ts" />
(function (RoteMath) {
    let $ = document.querySelector.bind(document); // this is just less typing.
    let game;
    let settingsPanel;
    let gamePanel;
    let answerButtons;
    let start;
    let gameMode;
    let gameMax;
    let buttonContainer;
    let score;
    let problem;
    function init() {
        settingsPanel = $('#settings');
        gamePanel = $('#game');
        start = $('#start');
        gameMode = $('#gameMode');
        gameMax = $('#gameMax');
        problem = $('#problem');
        score = $('#score');
        buttonContainer = $('#button-container');
        start.addEventListener('click', startGame);
    }
    function startGame() {
        let problemType = +gameMode.value;
        let max = +gameMax.value;
        game = new RoteMath.Game(problemType, max);
        // clear out the button div, then make a button for every possible answer.
        answerButtons = [];
        while (buttonContainer.hasChildNodes()) {
            buttonContainer.removeChild(buttonContainer.lastChild);
        }
        game.allAnswers
            .forEach(i => {
            let button = document.createElement('button');
            button.innerText = '' + i;
            button.addEventListener('click', answerButtonClick);
            buttonContainer.appendChild(button);
            answerButtons.push(button);
        });
        settingsPanel.style.visibility = 'hidden';
        gamePanel.style.visibility = 'visible';
        game.start();
        updateProblem();
        updateScore();
    }
    function answerButtonClick() {
        game.tryAnswer(+this.innerText);
        updateScore();
        if (game.state === RoteMath.GameState.GameOver) {
            gameOver();
        }
        else {
            updateProblem();
        }
    }
    function updateScore() {
        score.innerHTML = '' + game.score;
    }
    function updateProblem() {
        problem.innerHTML = game.currentProblem.question;
        // highlight suggested answers.
        var suggestions = game.getSuggestedAnswers();
        answerButtons.forEach(b => b.disabled = suggestions.indexOf(+b.innerHTML) === -1);
    }
    function gameOver() {
        let message = 'Game Over! You scored ' + game.score + '. ';
        if (game.score == game.maxScore) {
            message += 'That\'s perfect! You did a great job.';
        }
        else {
            message += 'Keep on practicing!';
        }
        alert(message);
        gamePanel.style.visibility = 'hidden';
        settingsPanel.style.visibility = 'visible';
    }
    document.addEventListener('DOMContentLoaded', init);
})(RoteMath || (RoteMath = {}));
;
//# sourceMappingURL=rotemath.js.map