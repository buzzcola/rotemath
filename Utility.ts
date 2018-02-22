namespace RoteMath {

    type Point2 = { [dimension: string]: number, x: number, y: number };

    export class Utility {
        static shuffleInPlace(array: any[]) {
            // do the Fisher-Yates shuffle!
            // https://stackoverflow.com/a/2450976/41457
            let currentIndex: number = array.length
            let temporaryValue: number;
            let randomIndex: number;

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

        static getRandomInt(min: number, max: number): number {
            // thanks MDN!
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }

        static coinToss<T>(option1:T, option2:T) : T {
            return Math.random() >= 0.5 ? option2 : option1;
        }
        
        static range(size: number) {
            return [...Array(size).keys()];
        }
                
        static range2(size1: number, size2: number = undefined): Point2[] {
            let result: Point2[] = [];
            for (let i of this.range(size1)) {
                for (let j of this.range(size2 || size1)) {
                    result.push({ x: i, y: j });
                }
            }
            return result;
        }
    }
}