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
            let message: string;
            if (this.success) message = '(Correct!)';
            else if (!this.firstTry) message = '(First Answer was Incorrect)';
            else message = '(Time Out)';

            return `${this.problem.toString()} ${message}`;
        }
    }
}