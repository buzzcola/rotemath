namespace RoteMath {

    export enum ProblemType {
        Addition = 1,
        Multiplication        
    }
    
    export class Problem {
        constructor(
            public readonly type:ProblemType,
            public readonly left:number,             
            public readonly right:number) { }

        get operator() {
            if(this.type === ProblemType.Addition) {
                return '+';
            } else {
                return 'x';
            }
        }

        get question() {
            return `${this.left} ${this.operator} ${this.right}`;
        }

        get answer() {
            if(this.type === ProblemType.Addition) {
                return this.left + this.right;
            } else {
                return this.left * this.right;
            }
        }

        static makeProblems(type:ProblemType, max: number): Problem[] {
            let result = [];
            for (let i = 1; i <= max; i++) {
                for (let j = 1; j <= max; j++) {
                    result.push(new Problem(type, i, j));
                }
            }

            return result;
        }
    }
}