/// <reference path="Utility.ts" />
/// <reference path="Problem.ts" />

namespace RoteMath {

    export enum GameMode {
        Competitive = 1, // answer questions up to a certain number to earn the belt! 
        Practice // practice on particular digits.
    }

    export enum GameState {
        NotStarted,
        WaitingForFirstAnswer, // waiting for the first answer and not out of time yet.
        WaitingYouBlewIt, // time's up for this question or a wrong guess already happened.
        VictoryLap, // correct answer was given, we're showing the answer before the next question gets loaded.
        GameOver
    }

    export class Game {

        private readonly ANSWER_MAX_MS = 5000; // time the player can correctly answer and still get a point.
        private readonly ANSWER_DELAY_MS = 1000; // time between correct answer and next problem popping up (the "victory lap").

        private _state: GameState = GameState.NotStarted; // state of the game.        
        private readonly _problemStack: Problem[]; // the problems we'll be doling out.        
        private _maxScore: number; // maximum possible score.
        private _currentProblem: Problem; // the current problem, if the game is in play.        
        private _currentProblemStartTime: Date;
        public readonly allPossibleSolutions: ReadonlyArray<number>;
        public readonly answers: Answer[] = []; // the user's answers.
        public readonly gameMode: GameMode;

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

        constructor(args: { problemType: ProblemType, gameMode: GameMode, max: number, practiceDigit?: number }) {
            let problems = Problem.makeProblems(args);
            this.answers = [];
            this.gameMode = args.gameMode;
            this._maxScore = problems.length;
            this.allPossibleSolutions = problems
                .map(p => p.solution) // grab all answers
                .filter((value, index, self) => self.indexOf(value) === index) // get distinct
                .sort((a, b) => a - b); // sort

            Utility.shuffleInPlace(problems);
            this._problemStack = problems;
        }

        start() {
            if (this.inState(GameState.NotStarted)) {
                Event.fire(Events.GameStart);
                Event.fire(Events.ScoreChanged);
                this.loadNextProblem();
            }
        }

        trySolution(solution: number): boolean {
            let elapsed = this.timeElapsed;

            if (this.inState(GameState.GameOver, GameState.NotStarted, GameState.VictoryLap)) return;

            let expired = elapsed > this.ANSWER_MAX_MS;

            let result: boolean;
            if (solution === this.currentProblem.solution) {
                result = true;
                let firstTry = this.inState(GameState.WaitingForFirstAnswer);
                this.answers.push(new Answer(this.currentProblem, elapsed, firstTry, expired));
                Event.fire(Events.ScoreChanged);

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

        getSuggestedSolutions() {
            // get a range of possible solutions to serve as a hint for the user.

            let solutionIndex = this.allPossibleSolutions.indexOf(this._currentProblem.solution);
            let neighbourRange = 2;
            let upperNeighbour = solutionIndex + neighbourRange;
            let lowerNeighbour = solutionIndex - neighbourRange;

            // can't always put the correct solution in the middle of the range. Shift the
            // range so that the answer might be in any position.
            let shiftAmount = Utility.getRandomInt(-neighbourRange, neighbourRange + 1);
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

            let result: number[] = [];
            for (let i = lowerNeighbour; i <= upperNeighbour; i++) {
                result.push(this.allPossibleSolutions[i]);
            }

            return result;
        }

        private loadNextProblem() {
            if (this.inState(GameState.GameOver)) return;

            this._currentProblem = this._problemStack.pop();
            this._currentProblemStartTime = new Date();
            Event.fire(Events.ProblemLoaded)
            this._state = GameState.WaitingForFirstAnswer;
        }

        private gameOver() {
            Event.fire(Events.GameOver);
            this._state = GameState.GameOver;
        }

        private inState(...states: GameState[]) {
            return states.indexOf(this._state) > -1;
        }
    }
}