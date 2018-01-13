namespace RoteMath {

    export class Answer {
        constructor(
            public problem: Problem,
            public time: number,
            public firstTry: boolean,
            public expired: boolean) { }

        get success(): boolean {
            return this.firstTry && !this.expired;
        }

        toString() {
            return `${this.problem.toString()} 
        }
    }
}