/// <reference path="Game.ts" />

namespace RoteMath {

    // shim for javascript to use materialize stuff.
    declare function $(selector: string): any;
    let $$: Function = document.querySelector.bind(document); // this is just less typing.

    let game: Game;
    let settingsPanel: HTMLElement;
    let gamePanel: HTMLElement;
    let answerButtons: HTMLAnchorElement[];
    let start: HTMLButtonElement;
    let problemType: HTMLSelectElement;
    let gameMode: HTMLSelectElement;
    let practicePanel: HTMLDivElement;
    let competitionPanel: HTMLDivElement;
    let practiceNumber: HTMLSelectElement;
    let gameMax: HTMLSelectElement;
    let buttonContainer: Element;
    let scoreContainer: Element;
    let score: Element;
    let problem: Element;
    let progressBar: HTMLDivElement;
    let progressBackground: HTMLDivElement;
    let progressInterval: number;

    const BTN_INACTIVE = 'grey';
    const BTN_ACTIVE = 'blue';
    const BTN_INCORRECT = 'red';

    function init() {

        settingsPanel = $$('#settings');
        gamePanel = $$('#game');
        start = $$('#start');
        problemType = $$('#problemType');
        gameMode = $$('#gameMode');
        practicePanel = $$('#practicePanel');
        competitionPanel = $$('#competitionPanel');
        practiceNumber = $$('#practiceNumber');
        gameMax = $$('#gameMax');
        problem = $$('#problem');
        progressBar = $$('#progressBar');
        progressBackground = $$('#progressBackground');
        scoreContainer = $$('#scoreContainer');
        score = $$('#score');
        buttonContainer = $$('#button-container');

        // this will be a lot less tedious with some kind of SPA framework, I know.
        // have to use jQuery for select change instead of addEventListener because
        // of materialize.
        $('#gameMode').change(function(event) {
            let mode: GameMode = +gameMode.value;
            if(mode === GameMode.Competitive) {
                competitionPanel.classList.remove('hide');
                practicePanel.classList.add('hide');                
            } else {
                competitionPanel.classList.add('hide');
                practicePanel.classList.remove('hide');                
            }
        });

        start.addEventListener('click', startGame);


        Event.on(Events.ProblemLoaded, onProblemLoaded);
        Event.on(Events.ScoreChanged, onScoreChanged);
        Event.on(Events.CorrectAnswer, onCorrectAnswer);
        Event.on(Events.GameOver, onGameOver);

        $('#gameOver').modal({
            complete: gameOverCallback
        });
    }

    function startGame() {
        let mode: GameMode = +gameMode.value
        let type: ProblemType = +problemType.value;
        let param = mode === GameMode.Competitive ? +gameMax.value : +practiceNumber.value;
        game = new Game({ gameMode: mode, problemType: type, param: param });

        if (progressInterval) {
            window.clearInterval(progressInterval);
        }
        progressInterval = window.setInterval(updateTimeLeft, 250);

        // clear out the button div, then make a button for every possible answer.
        answerButtons = [];
        while (buttonContainer.hasChildNodes()) {
            buttonContainer.removeChild(buttonContainer.lastChild);
        }

        game.allPossibleAnswers
            .forEach(i => {
                let button = document.createElement('a');
                for (let c of ['btn', BTN_INACTIVE, 'answer-button']) {
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
        let answer = +this.innerText;
        let result = game.tryAnswer(answer);
        if (!result) {
            this.classList.remove('blue');
            this.classList.add('red');
        }
    }

    function onCorrectAnswer() {
        problem.innerHTML += ' = ' + game.currentProblem.answer;
    }

    function onScoreChanged() {
        score.innerHTML = '' + game.score;
    }

    function onProblemLoaded() {
        problem.innerHTML = game.currentProblem.question;

        // highlight suggested answers.
        var suggestions = game.getSuggestedAnswers();
        for (let b of answerButtons) {
            b.classList.remove(BTN_INCORRECT);
            if (suggestions.indexOf(+b.innerHTML) !== -1) {
                b.classList.add(BTN_ACTIVE);
                b.classList.remove(BTN_INACTIVE);
            } else {
                b.classList.add(BTN_INACTIVE);
                b.classList.remove(BTN_ACTIVE);
            }
        }
    }

    function updateTimeLeft() {
        let width = '' + (game.percentageTimeLeft * 100) + '%';
        progressBar.style.width = width;
    }

    function onGameOver() {
        let message = 'Game Over! You scored ' + game.score + '. ';

        if (game.score == game.maxScore) {
            message += 'That\'s perfect! You did a great job.';
        } else {
            message += 'Keep on practicing!';
        }

        $('#gameOver').modal('open');
    }

    function gameOverCallback() {
        gamePanel.classList.add('hide');
        settingsPanel.classList.remove('hide');
    }

    document.addEventListener('DOMContentLoaded', init);
};

