/// <reference path="Game.ts" />

namespace RoteMath {

    let $: Function = document.querySelector.bind(document); // this is just less typing.

    let game: Game;
    let settingsPanel: HTMLElement;
    let gamePanel: HTMLElement;
    let answerButtons: HTMLAnchorElement[];
    let start: HTMLButtonElement;
    let gameMode: HTMLSelectElement;
    let gameMax: HTMLSelectElement;
    let buttonContainer: Element;
    let scoreContainer: Element;
    let score: Element;
    let problem: Element;

    function init() {

        settingsPanel = $('#settings');
        gamePanel = $('#game');
        start = $('#start');
        gameMode = $('#gameMode');
        gameMax = $('#gameMax');
        problem = $('#problem');
        scoreContainer = $('#scoreContainer');
        score = $('#score');
        buttonContainer = $('#button-container');

        start.addEventListener('click', startGame);

        Event.on(Events.ProblemLoaded, onProblemLoaded);

        Event.on(Events.CorrectAnswer, onCorrectAnswer);
        /*
        Event.on(Events.WrongAnswer, onProblemAnswered);
        */
        Event.on(Events.ScoreChanged, onScoreChanged);
        Event.on(Events.GameOver, onGameOver);
    }

    function startGame() {
        let problemType: ProblemType = +gameMode.value;
        let max: number = +gameMax.value;
        game = new Game(problemType, max);

        // clear out the button div, then make a button for every possible answer.
        answerButtons = [];
        while (buttonContainer.hasChildNodes()) {
            buttonContainer.removeChild(buttonContainer.lastChild);
        }

        game.allAnswers
            .forEach(i => {
                let button = document.createElement('a');
                for (let c of ['btn', 'waves-effect', 'waves-light', 'grey', 'answer-button']) {
                    button.classList.add(c);
                }
                button.innerText = '' + i;
                button.addEventListener('click', onAnswerButtonClick);
                buttonContainer.appendChild(button);
                answerButtons.push(button);
            });

        settingsPanel.classList.add('hide');
        gamePanel.classList.remove('hide');

        game.start();
    }

    function onAnswerButtonClick() {
        //animateElement(this, 'rubberBand');
        game.tryAnswer(+this.innerText);
    }

    function onCorrectAnswer() {
        animateElement(scoreContainer, 'bounce');
    }

    function onScoreChanged() {
        score.innerHTML = '' + game.score;
    }

    function onProblemLoaded() {
        problem.innerHTML = game.currentProblem.question;

        // highlight suggested answers.
        var suggestions = game.getSuggestedAnswers();
        for(let b of answerButtons) {
            if(suggestions.indexOf(+b.innerHTML) !== -1){
                b.classList.add('blue');
                b.classList.remove('grey');
            } else {
                b.classList.add('grey');
                b.classList.remove('blue');
            }
        }
    }

    function onGameOver() {
        let message = 'Game Over! You scored ' + game.score + '. ';
        if (game.score == game.maxScore) {
            message += 'That\'s perfect! You did a great job.';
        } else {
            message += 'Keep on practicing!';
        }

        alert(message);
        gamePanel.classList.remove('hide');
        settingsPanel.classList.add('hide');
    }

    function animateElement(el: Element, animationName: string) {
        // apply an animate.css animation to an element.
        let classNames = ['animated', animationName];
        classNames.forEach(className => {
            if (el.classList.contains(className)) {
                el.classList.remove(className);
            }
        });
        window.setTimeout(() => {
            classNames.forEach(className => {
                el.classList.add(className);
            });
        }, 0);
    }

    document.addEventListener('DOMContentLoaded', init);
};

