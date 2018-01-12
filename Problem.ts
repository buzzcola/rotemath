namespace RoteMath {

    export enum ProblemType {
        Addition = 1,
        Multiplication
    }

    export class Problem {
        constructor(
            public readonly type: ProblemType,
            public readonly left: number,
            public readonly right: number) { }

        get operator() {
            if (this.type === ProblemType.Addition) {
                return '+';
            } else {
                return 'x';
            }
        }

        get question() {
            return `${this.left} ${this.operator} ${this.right}`;
        }

        get answer() {
            if (this.type === ProblemType.Addition) {
                return this.left + this.right;
            } else {
                return this.left * this.right;
            }
        }

        static makeProblems(args: { problemType: ProblemType, gameMode: GameMode, param: number }): Problem[] {
            let result = [];
            if (args.gameMode === GameMode.Competitive) {
                return Utility.range2(args.param + 1)
                    .map(p => new Problem(args.problemType, p.x, p.y));
            } else {
                return Utility.range(13)
                    .map(x => new Problem(args.problemType, args.param, x));
            }
        }
    }
}