/// <reference path="Utility.ts" />
/// <reference path="Problem.ts" />

namespace RoteMath {

    export enum GameState {
        NotStarted,
        InPlay,
        GameOver
    }

    export class Game {

        private _state: GameState = GameState.NotStarted; // state of the game.
        private readonly _problemStack: Problem[]; // the problems we'll be doling out.
        private _score: number = 0; // current score.
        private _maxScore: number; // maximum possible score.
        private _currentProblem: Problem; // the current problem, if the game is in play.        
        public readonly allAnswers: ReadonlyArray<number>;

        get score(): number {
            return this._score;
        }

        get maxScore(): number{
            return this._maxScore;
        }
        
        get currentProblem(): Problem {
            return this._currentProblem;
        }

        get state(): GameState {
            return this._state;
        }

        constructor(problemType:ProblemType, max:number) {
            let problems: Problem[];
            if(problemType === ProblemType.Multiplication) {
                problems = Problem.makeMultiplicationProblems(max);
            } else {
                problems = Problem.makeAdditionProblems(max);
            }

            this._maxScore = problems.length;            
            this.allAnswers = problems
                .map(p => p.answer) // grab all answers
                .filter((value, index, self) => self.indexOf(value) === index) // get distinct
                .sort((a, b) => a - b); // sort

            Utility.shuffleInPlace(problems);
            this._problemStack = problems;
        }

        start(): void {
            if (this.state === GameState.NotStarted){
                Event.fire(Events.GameStart);
                this.loadNextProblem();
            }
        }

        tryAnswer(answer: number): boolean {
            switch (this._state) {
                case GameState.GameOver:
                    throw new Error('Attempt to answer in game over state.');
                case GameState.NotStarted:
                    throw new Error('Attempt to answer before game started.');
            }

            let result: boolean;
            if (answer === this.currentProblem.answer) {
                result = true;
                this._score++;
                Event.fire(Events.CorrectAnswer);
            } else {
                result = false;
                Event.fire(Events.WrongAnswer);
            }

            if (this._problemStack.length > 0) {
                this.loadNextProblem();
            } else {                
                this.gameOver();
            }

            return result;
        }

        getSuggestedAnswers(): number[] {
            // get a range of possible answers to serve as a hint for the user.

            let answerIndex = this.allAnswers.indexOf(this._currentProblem.answer);
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

            while (upperNeighbour >= this.allAnswers.length) {
                upperNeighbour--;
                lowerNeighbour--;
            }

            let result: number[] = [];
            for (let i = lowerNeighbour; i <= upperNeighbour; i++) {
                result.push(this.allAnswers[i]);
            }

            return result;
        }

        private loadNextProblem(): void {
            switch (this._state) {
                case GameState.GameOver:
                    throw new Error('Attempt to load next problem in Game Over state.');
                case GameState.NotStarted:
                    this._state = GameState.InPlay;
            }

            Event.fire(Events.ProblemLoaded)
            this._currentProblem = this._problemStack.pop();
        }

        private gameOver() {
            Event.fire(Events.GameOver);
            this._state = GameState.GameOver;
        }
    }
}