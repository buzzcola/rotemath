/// <reference path="Game.ts" />

namespace RoteMath {

    // shim for javascript to use materialize stuff.
    declare function $(selector: any): any;
    let $$: Function = document.querySelector.bind(document); // this is just less typing.

    let game: Game;
    let worstDigit: number;

    let settingsPanel: HTMLElement;
    let start: HTMLButtonElement;
    let problemType: HTMLSelectElement;
    let gameMode: HTMLSelectElement;
    let practicePanel: HTMLDivElement;
    let competitionPanel: HTMLDivElement;
    let practiceNumber: HTMLSelectElement;
    let gameMax: HTMLSelectElement;

    let gamePanel: HTMLElement;
    let answerButtons: HTMLAnchorElement[];
    let buttonContainer: Element;
    let scoreContainer: Element;
    let score: Element;
    let problem: Element;
    let progressBar: HTMLDivElement;
    let progressBackground: HTMLDivElement;
    let progressInterval: number;

    let gameOverPanel: HTMLDivElement;
    let gameOverMessage: HTMLParagraphElement;
    let gameOverGridContainer: HTMLDivElement;
    let practiceSuggestion: HTMLDivElement;
    let suggestionMessage: HTMLParagraphElement;
    let practiceSuggestionButton: HTMLAnchorElement;
    let startPractice: boolean;

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
        gameOverPanel = $$('#gameOver');
        gameOverMessage = $$('#gameOverMessage');
        gameOverGridContainer = $$('#gameOverGridContainer');
        practiceSuggestion = $$('#practiceSuggestion');
        suggestionMessage = $$('#suggestionMessage');
        practiceSuggestionButton = $$('#practiceSuggestionButton');

        // this will be a lot less tedious with some kind of SPA framework, I know.
        // have to use jQuery for select change instead of addEventListener because
        // of materialize.
        $(gameMode).change(function (event) {
            let mode: GameMode = +gameMode.value;
            if (mode === GameMode.Competitive) {
                practicePanel.classList.add('hide');
            } else {
                practicePanel.classList.remove('hide');
            }
        });

        start.addEventListener('click', startGame);
        practiceSuggestionButton.addEventListener('click', startPracticeSuggestion);

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
        let max = +gameMax.value;
        let practiceDigit = +practiceNumber.value;
        game = new Game({ gameMode: mode, problemType: type, max: max, practiceDigit: practiceDigit });

        if (progressInterval) {
            window.clearInterval(progressInterval);
        }
        progressInterval = window.setInterval(updateTimeLeft, 100);

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
        // report progress -5% to account for latency and whatever. Before this change
        // a player would get a missed point when there appeared to be time left on the timer.
        let width = '' + Math.max((Math.floor(game.percentageTimeLeft * 100) - 5), 0) + '%';
        progressBar.style.width = width;
    }

    function onGameOver() {
        let message = `Game Over. You scored ${game.score} out of ${game.maxScore}. `;

        if (game.score == game.maxScore) {
            message += 'That\'s perfect!';
        } else {
            message += 'Keep on practicing!';
        }

        gameOverGridContainer.innerHTML = '';
        gameOverGridContainer.appendChild(makeResultTable(game.answers));
        initializeTooltips();

        if (game.gameMode === GameMode.Competitive && !game.answers.every(a => a.success)) {
            worstDigit = getWorstDigit(game.answers);
            let message = `You could use some more practice for the number ${worstDigit}.`;
            suggestionMessage.innerText = message;
            practiceSuggestion.classList.remove('hide');
        } else {
            practiceSuggestion.classList.add('hide');
        }

        gameOverMessage.textContent = message;
        $('#gameOver').modal('open');
    }

    function startPracticeSuggestion() {
        startPractice = true;
        $('#gameOver').modal('close');
    }

    function makeResultTable(answers: Answer[]): HTMLTableElement {
        let minleft = answers.reduce((acc, x) => Math.min(x.problem.left, acc), Number.MAX_SAFE_INTEGER);
        let maxleft = answers.reduce((acc, x) => Math.max(x.problem.left, acc), Number.MIN_SAFE_INTEGER);
        let minright = answers.reduce((acc, x) => Math.min(x.problem.right, acc), Number.MAX_SAFE_INTEGER);
        let maxright = answers.reduce((acc, x) => Math.max(x.problem.right, acc), Number.MIN_SAFE_INTEGER);

        let table = document.createElement('table');
        table.classList.add('resultsGrid');

        let headerRow = table.appendChild(document.createElement('tr'));
        headerRow.appendChild(document.createElement('th')); // empty corner.
        for (let right = minright; right <= maxright; right++) {
            let cell = headerRow.appendChild(document.createElement('th'));
            cell.textContent = '' + right;
        }

        for (let left = minleft; left <= maxleft; left++) {
            let row = table.appendChild(document.createElement('tr'));
            let headerCell = row.appendChild(document.createElement('th'));
            headerCell.textContent = '' + left;

            for (let right = minright; right <= maxright; right++) {
                let cell = row.appendChild(document.createElement('td'));
                let answer = answers.filter(a => a.problem.left === left && a.problem.right === right)[0];

                cell.classList.add('tooltipped');
                cell.setAttribute('data-position', 'bottom');
                cell.setAttribute('data-delay', '50');
                cell.setAttribute('data-tooltip', answer.toString());

                if (answer.success) {
                    cell.classList.add('success');
                } else {
                    cell.classList.add('failure');
                }
            }
        }

        table.style.height = '' + ((maxleft - minleft + 2) * 2) + 'em';
        table.style.width = '' + ((maxright - minright + 2) * 2) + 'em';

        return table;
    }

    function getWorstDigit(answers: Answer[]): number {
        let correct = answers.filter(a => a.success);
        let ranks = correct.map(a => a.problem.left)
            .concat(correct.map(a => a.problem.right))
            .reduce((acc, d) => { acc.hasOwnProperty(d) ? acc[d]++ : acc[d] = 1; return acc }, {});

        return Object.keys(ranks)
            .reduce((acc, k) => ranks[k] < ranks[acc] ? +k : acc, 0);
    }

    function initializeTooltips() {
        $('.tooltipped').tooltip({ delay: 50 });
    }

    function gameOverCallback() {
        gamePanel.classList.add('hide');
        settingsPanel.classList.remove('hide');
        if (startPractice) {
            startPractice = false;
            gameMode.value = '' + GameMode.Practice;
            practiceNumber.value = '' + worstDigit;
            startGame();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
};

