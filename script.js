//------------------------------------------------------------------
// start screen
const startScreen = document.getElementById('start-screen'); //div
const player1NameInput = document.getElementById('player1Name'); //input
const player2NameInput = document.getElementById('player2Name'); //input
const roundsSelect = document.getElementById('rounds-select'); //select

// game screen
const gameScreen = document.getElementById('game-screen'); //div
const player1Input = document.getElementById('player1Input'); //input
const player2Input = document.getElementById('player2Input'); //input
const questionText = document.getElementById('question-text'); //h1
const answerDiv = document.getElementById('answer-div'); //div
const answerText = document.getElementById('answer-text'); //h2
const player1Label = document.getElementById('player1Label'); //span
const player2Label = document.getElementById('player2Label'); //span

// scores screen
const scoresScreen = document.getElementById('scores-screen'); //div
const scoresElement = document.getElementById('scores'); //div
const winnerElement = document.getElementById('winner'); //h1

//------------------------------------------------------------------
// global variables
let player1Name = '';
let player2Name = '';
let player1Points = 0;
let player2Points = 0;
let currentRound = 1;
let totalRounds = null;
let question = null;

// -----------------------------------------------------------------
/*
- callback onClick()
- holt sich die Spielernamen
- prüft, ob Spielernamen nicht leer sind
    - startet playRound()
*/
function startGame() {
    console.log("startGame");
    player1Name = player1NameInput.value.trim();
    player2Name = player2NameInput.value.trim();
    totalRounds = parseInt(roundsSelect.value);

    if (player1Name !== '' && player2Name !== '') {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        playRound();
    }
}

//------------------------------------------------------------------
/* 
- holt neue frage, präsentiert inputs und spielernamen
*/
async function playRound() {
    console.log("playRound, currentRound: " + currentRound);
    // hide answer-div
    answerDiv.classList.add('hidden');
    
    // hole question
    question = await getRandomQuestion();
    answerText.textContent = question.answer;
    questionText.textContent = "Frage " + currentRound + ": " + question.question;
    
    // init input
    player1Input.value = '';
    player2Input.value = '';
    player1Input.disabled = false;
    player2Input.disabled = false;
    
    // show playernames and current score
    player1Label.textContent = `${player1Name} (${player1Points}) `;
    player2Label.textContent = `${player2Name} (${player2Points}) `;
}
//------------------------------------------------------------------
/*
- lockt die inputs ein, sofern werte drin stehen
- zeigt die antwort, wenn werte eingelockt sind
- addiert 1 punkt zum spieler der die runde gewonnen hat
- leitet final weiter zur nächsten runde oder zu scores */
function lockAnswer(player) {
    console.log("lockAnswer");
    const playerInput = player === 1 ? player1Input : player2Input;
    const playerPoints = player === 1 ? player1Points : player2Points;

    // player input (guess) darf nicht leer sein
    if (playerInput.value !== '') {
        if (player === 1) {
            player1Input.disabled = true;
        }
        if(player === 2){
            player2Input.disabled = true;
        }
        // zeige richtige antwort, vergebe punkt
        if (player1Input.disabled && player2Input.disabled) {
            answerDiv.classList.remove('hidden');
            const answer = question.answer;
            
            if(Math.abs(answer-player1Input) < Math.abs(answer-player2Input)){
                player1Points++;
                console.log(player1Name + " ist näher dran.");
            } else {
                player2Points++;
                console.log(player2Name + " ist näher dran.");
            }
        }
    }
}

//------------------------------------------------------------------
  // API-Anfrage für eine zufällige Frage (inkl. Antwort)
async function getRandomQuestion() {
    console.log("getRandomQuestion");
    try {
        const response = await fetch('https://question-generator.herokuapp.com/api/getRandomQuestion');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler beim Abrufen der Frage:', error);
    }
}
//------------------------------------------------------------------
// Funktion zum Wechseln zur nächsten Runde
function nextRoundOrScores() {
    console.log("nextRoundOrScores");
    
    if(currentRound === totalRounds){
        showScores();
    } else {
        currentRound++;
        playRound(); 
    }
}
//------------------------------------------------------------------
// Funktion zum Anzeigen der Scores
function showScores() {
    console.log("showScores");
    gameScreen.classList.add('hidden');
    scoresScreen.classList.remove('hidden');
    // show winning playername
    winnerElement.textContent = player1Points > player2Points ? player1Name + " hat gewonnen!" : player2Name + " hat gewonnen!";
    // show scores
    scoresElement.innerHTML = `
        <p>${player1Name} - ${player1Points}</p>
        <p>${player2Name} - ${player2Points}</p>
    `;
}
//------------------------------------------------------------------
// Funktion zum Starten eines neuen Spiels
function newGame() {
    console.log("newGame");
    startScreen.classList.remove('hidden');
    scoresScreen.classList.add('hidden');

    player1NameInput.value = '';
    player2NameInput.value = '';
    player1Points = 0;
    player2Points = 0;
    currentRound = 1;
}
//------------------------------------------------------------------
// Spiel starten
console.log("script-root");
