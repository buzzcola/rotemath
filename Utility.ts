namespace RoteMath {
    export class Utility {
        static shuffleInPlace(array: any[]) {
            // do the Fisher-Yates shuffle:
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
    }
}