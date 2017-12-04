namespace RoteMath {
    // broke-ass implementation of simple global events.
    // inspired by https://gist.github.com/wildlyinaccurate/3209556
    // it was this or EventEmitter and 6,000 files worth of dependencies.
    /*
        Basic usage

        Event.on('counted.to::1000', function() {
            doSomething();
        });

        for (i = 0; i <= 1000; i++) {
            // Count to 1000...
        }

        Event.fire('counted.to::1000'); // doSomething() is called
    */

    export enum Events {
        GameStart,
        GameOver,
        ProblemLoaded,
        CorrectAnswer,
        WrongAnswer
    }

    export class Event {

        private static _eventQueues = {};

        static  fire(event: Events): void {
            let queue: Function[] = this._eventQueues[event];

            if (!queue) {
                return;
            }

            queue.forEach(f => f());
        }

        static on(event:Events, handler:Function) {
            if (typeof this._eventQueues[event] === 'undefined') {
                this._eventQueues[event] = [];
            }

            this._eventQueues[event].push(handler);
        }
    }
}