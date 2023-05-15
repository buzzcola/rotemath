//import { Utility } from './Utility';

namespace RoteMath {

    export enum ProblemType {
        Addition = 1,
        Multiplication
    }

    // Problems can be displayed three ways. This helps with learning.
    export enum ProblemMode {
        HideLeft = 0, // "? x 5 = 30"
        HideRight = 1, // "6 x ? = 30"
        HideAnswer = 2 // "6 x 5 = ?"
    }

    export class Problem {
        static readonly maskCharacter = '?';

        problemMode: ProblemMode;

        constructor(
            public readonly type: ProblemType,
            public readonly left: number,
            public readonly right: number) {
            if (type === ProblemType.Multiplication && (left === 0 || right === 0)) {
                // in multiplication, if one factor is zero and you mask the other one then there
                // are multiple (infinite) correct solutions. Let's avoid that.
                if (left !== 0) {
                    this.problemMode = Utility.coinToss(ProblemMode.HideRight, ProblemMode.HideAnswer);
                } else if (right !== 0) {
                    this.problemMode = Utility.coinToss(ProblemMode.HideLeft, ProblemMode.HideAnswer);
                } else {
                    // zero times zero.
                    this.problemMode = ProblemMode.HideAnswer;
                }

            } else {
                this.problemMode = Utility.getRandomInt(0, 3);
            }
        }

        get operator() {
            if (this.type === ProblemType.Addition) {
                return '+';
            } else {
                return 'x';
            }
        }

        get questionMasked() {
            let values: any[] = [this.left, this.right, this.answer];
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
            } else {
                return this.left * this.right;
            }
        }

        static makeProblems(args: { problemType: ProblemType, gameMode: GameMode, max: number, practiceDigit?: number }): Problem[] {
            let result = [];
            if (args.gameMode === GameMode.Competitive) {
                const all = Utility.range2(args.max + 1)
                    .map(p => new Problem(args.problemType, p.x, p.y));

                // let's trim out out some of the zero and one problems. a 13x13 competitive
                // set will have 25 "zero times something" and 25 "one times something", and
                // we really don't need too many of those.
                const maxZeroes = 3;
                const maxOnes = 3;
                let zeroes = 0;
                let ones = 0;

                Utility.shuffleInPlace(all);
                all.forEach(p => {
                    if(p.left == 0 || p.right == 0) {
                        if(zeroes < maxZeroes) {
                            zeroes++;
                            result.push(p);
                        }
                    }
                    else if(p.left == 1 || p.right == 1) {
                        if(ones < maxOnes) {
                            ones++;
                            result.push(p);
                        }
                    }
                    else {
                        result.push(p);
                    }
                });


            } else {
                result = Utility.range(args.max + 1)
                    .map(x => new Problem(args.problemType, args.practiceDigit, x));
            }

            return result;
        }

        toString() {
            return `${this.left} ${this.operator} ${this.right} = ${this.answer}`;
        }
    }
}