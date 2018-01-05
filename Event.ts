namespace RoteMath {
    // broke-ass implementation of simple global events.
    // it was this or EventEmitter and 6,000 files worth of dependencies.

    export enum Events {
        GameStart,
        GameOver,
        ProblemLoaded,
        ProblemAnswered,
        ScoreChanged
    }

    export class Event {

        private static _eventQueues: { [event: string]: Function[] } = {};

        static fire(event: Events): void {
            let queue: Function[] = this._eventQueues[event];            

            if (!queue) {
                return;
            }

            queue.forEach(f => f());
        }

        static on(event: Events, handler: Function) {
            if (typeof this._eventQueues[event] === 'undefined') {
                this._eventQueues[event] = [];
            }

            this._eventQueues[event].push(handler);
        }
    }
}