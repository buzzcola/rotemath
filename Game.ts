/// <reference path="Utility.ts" />
/// <reference path="Problem.ts" />

namespace RoteMath {

    export enum GameState {
        NotStarted,
        WaitingForFirstAnswer, // waiting for the first answer and not out of time yet.
        WaitingYouBlewIt, // time's up for this question or a wrong guess already happened.
        VictoryLap, // correct answer was given, we're showing the answer before the next question gets loaded.
        GameOver
    }

    export class Game {

        private readonly ANSWER_MAX_MS = 3000; // time the player can correctly answer and still get a point.
        private readonly ANSWER_DELAY_MS = 1000; // time between correct answer and next problem popping up (the "victory lap").
        

        private _state: GameState = GameState.NotStarted; // state of the game.        
        private readonly _problemStack: Problem[]; // the problems we'll be doling out.
        private _score: number;
        private _maxScore: number; // maximum possible score.
        private _currentProblem: Problem; // the current problem, if the game is in play.        
        private _currentProblemStartTime: Date;
        public readonly allPossibleAnswers: ReadonlyArray<number>;

        get timeLeft() {
            if(this._state !== GameState.WaitingForFirstAnswer) {
                return 0;
            }

            let elapsed = (new Date()).getTime() - this._currentProblemStartTime.getTime();
            return Math.max(0, this.ANSWER_MAX_MS - elapsed);
        }

        get percentageTimeLeft() {
            return this.timeLeft / this.ANSWER_MAX_MS;
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

        constructor(problemType: ProblemType, max: number) {
            let problems = Problem.makeProblems(problemType, max);
            this._maxScore = problems.length;
            this.allPossibleAnswers = problems
                .map(p => p.answer) // grab all answers
                .filter((value, index, self) => self.indexOf(value) === index) // get distinct
                .sort((a, b) => a - b); // sort

            Utility.shuffleInPlace(problems);
            this._problemStack = problems;
        }

        start() {
            if (this.state === GameState.NotStarted) {
                Event.fire(Events.GameStart);
                this.setScore(0);
                this.loadNextProblem();
            }
        }

        tryAnswer(answer: number): boolean {
            let notExpired = !!this.timeLeft;
            switch (this._state) {
                case GameState.GameOver:
                    throw new Error('Attempt to answer in game over state.');
                case GameState.NotStarted:
                    throw new Error('Attempt to answer before game started.');
            }

            let result: boolean;
            if (answer === this.currentProblem.answer) {
                result = true;
                if (this._state === GameState.WaitingForFirstAnswer && notExpired) {
                    this.setScore(this.score + 1);
                }
                this._state = GameState.VictoryLap;
                Event.fire(Events.CorrectAnswer);
                window.setTimeout(() => {
                    if (this._problemStack.length === 0) {
                        this.gameOver();
                    } else {
                        this.loadNextProblem();
                    }
                }, this.ANSWER_DELAY_MS);
            } else {
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
            let shiftAmount = Utility.getRandomInt(-neighbourRange, neighbourRange + 1);
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

            let result: number[] = [];
            for (let i = lowerNeighbour; i <= upperNeighbour; i++) {
                result.push(this.allPossibleAnswers[i]);
            }

            return result;
        }

        private loadNextProblem() {
            switch (this._state) {
                case GameState.GameOver:
                    throw new Error('Attempt to load next problem in Game Over state.');
                case GameState.NotStarted:
                    this._state = GameState.WaitingForFirstAnswer;
            }

            this._currentProblem = this._problemStack.pop();
            this._currentProblemStartTime = new Date();
            Event.fire(Events.ProblemLoaded)
            this._state = GameState.WaitingForFirstAnswer;
        }

        private setScore(newScore: number) {
            this._score = newScore;
            Event.fire(Events.ScoreChanged);
        }

        private gameOver() {
            Event.fire(Events.GameOver);
            this._state = GameState.GameOver;
        }
    }
}