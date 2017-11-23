namespace RoteMath {

    export enum ProblemType {
        Addition = 1,
        Multiplication        
    }
    
    export class Problem {
        constructor(public readonly question: string, public readonly answer: number) { }

        static makeMultiplicationProblems(max: number): Problem[] {
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

        static makeAdditionProblems(max: number): Problem[] {
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
}