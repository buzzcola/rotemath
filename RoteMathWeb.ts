/// <reference path="Game.ts" />

namespace RoteMath {

    let $: Function = document.querySelector.bind(document); // this is just less typing.

    let game: Game;
    let settingsPanel: HTMLElement;
    let gamePanel: HTMLElement;
    let answerButtons: HTMLButtonElement[];
    let start: HTMLButtonElement;
    let gameMode: HTMLSelectElement;
    let gameMax: HTMLSelectElement;
    let buttonContainer: Element;
    let score: Element;
    let problem: Element;

    function init() {

        settingsPanel = $('#settings');
        gamePanel = $('#game');
        start = $('#start');
        gameMode = $('#gameMode');
        gameMax = $('#gameMax');
        problem = $('#problem');
        score = $('#score');
        buttonContainer = $('#button-container');

        start.addEventListener('click', startGame);
    }

    function startGame() {
        let problemType: ProblemType = +gameMode.value;
        let max: number = +gameMax.value;
        game = new Game(problemType, max);

        // clear out the button div, then make a button for every possible answer.
        answerButtons = [];
        while(buttonContainer.hasChildNodes()){
            buttonContainer.removeChild(buttonContainer.lastChild);
        }
        
        game.allAnswers
            .forEach(i => {
                let button = document.createElement('button');
                button.innerText = '' + i;
                button.addEventListener('click', answerButtonClick);
                buttonContainer.appendChild(button);
                answerButtons.push(button);
            });

        settingsPanel.style.visibility = 'hidden';
        gamePanel.style.visibility = 'visible';

        game.start();
        updateProblem();
        updateScore();
    }

    function answerButtonClick() {
        game.tryAnswer(+this.innerText);
        updateScore();

        if (game.state === GameState.GameOver) {
            gameOver();
        } else {
            updateProblem();
        }
    }

    function updateScore() {
        score.innerHTML = '' + game.score;
    }

    function updateProblem() {
        problem.innerHTML = game.currentProblem.question;

        // highlight suggested answers.
        var suggestions = game.getSuggestedAnswers();
        answerButtons.forEach(b =>
            b.disabled = suggestions.indexOf(+b.innerHTML) === -1
        );
    }

    function gameOver() {
        let message = 'Game Over! You scored ' + game.score + '. ';
        if(game.score == game.maxScore){
            message += 'That\'s perfect! You did a great job.';
        } else {
            message += 'Keep on practicing!';
        }

        alert(message);
        gamePanel.style.visibility = 'hidden';
        settingsPanel.style.visibility = 'visible';
    }

    document.addEventListener('DOMContentLoaded', init);
};

