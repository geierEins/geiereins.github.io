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
const togglePlayer1Input = document.getElementById('togglePlayer1input'); //span
const togglePlayer2Input = document.getElementById('togglePlayer2input'); //span
const player1button = document.getElementById('player1button'); //button
const player2button = document.getElementById('player2button'); //button
const frageNrText = document.getElementById('frage-n-text'); //h1
const questionText = document.getElementById('question-text'); //h1
const answerDiv = document.getElementById('answer-div'); //div
const answerText = document.getElementById('answer-text'); //h2
const player1Label = document.getElementById('player1Label'); //h1
const player1PointsLabel = document.getElementById('player1PointsLabel'); //h1
const player2Label = document.getElementById('player2Label'); //h1
const player2PointsLabel = document.getElementById('player2PointsLabel'); //h1
const roundWinnerText = document.getElementById('round-winner-text'); //h2

// scores screen
const scoresScreen = document.getElementById('scores-screen'); //div
const scoresText1 = document.getElementById('scoresText1'); //h2
const scoresText2 = document.getElementById('scoresText2'); //h2
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
    
    if(player1Name==='' || player2Name===''){
        Toastify({
            text: "Spielername fehlt!",
            backgroundColor: '#8B4500',
            duration: 4000
        }).showToast();
    }

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
    answerText.textContent = "Antwort: " + question.answer;
    frageNrText.textContent = "Frage " + currentRound + ": ";
    questionText.textContent = question.question;
    
    // init input
    player1Input.value = '';
    player2Input.value = '';
    player1Input.disabled = false;
    player2Input.disabled = false;
    
    // show playernames and current score
    player1Label.textContent = player1Name;
    player1PointsLabel.textContent = '('+player1Points+')';    
    player2Label.textContent = player2Name;
    player2PointsLabel.textContent = '('+player2Points+')';
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
    playerInput.value = playerInput.value.replace(/,/g, '.');
    
    if(playerInput.value===''){
        console.log("LEER");
        Toastify({
            text: "Eingabe darf nicht leer sein!",
            backgroundColor: '#8B4500',
            duration: 4000
        }).showToast();
    }

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
            player1button.disabled = true;
            player2button.disabled = true;
            const answer = question.answer;
            const p1diff = Math.abs(answer-player1Input.value);
            const p2diff = Math.abs(answer-player2Input.value);
            
            // zeige die guesses beider player
            player1Input.type = 'number';
            player2Input.type = 'number';
            togglePlayer1Input.innerHTML = '<i class="fa fa-eye"></i>';
            togglePlayer2Input.innerHTML = '<i class="fa fa-eye"></i>';
            
            if(p1diff < p2diff){
                player1Points++;
                roundWinnerText.textContent = player1Name + " ist näher dran.";
            } else if(p1diff > p2diff){
                player2Points++;
                roundWinnerText.textContent = player2Name + " ist näher dran.";
            } else if (p1diff === p2diff){
                player1Points++;
                player2Points++;
                roundWinnerText.textContent = "unentschieden.";
            }
        }
    }
}

//------------------------------------------------------------------
  // API-Anfrage für eine zufällige Frage (inkl. Antwort)
async function getRandomQuestion() {
    console.log("getRandomQuestion");
    try {
        const response = await fetch('http://localhost:8080/api/getRandomQuestion');
        //const response = await fetch('https://question-generator.herokuapp.com/api/getRandomQuestion');
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
    
    // setze types der input fields zurück
    player1Input.type = "password";
    player2Input.type = "password";
    togglePlayer1Input.innerHTML = '<i class="fa fa-eye-slash"></i>';
    togglePlayer2Input.innerHTML = '<i class="fa fa-eye-slash"></i>';
    
    // mache buttons wieder clickbar
    player1button.disabled = false;
    player2button.disabled = false;
    
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
    scoresText1.textContent = player1Name + " - " + player1Points;
    scoresText2.textContent = player2Name + " - " + player2Points;
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
function togglePasswordVisibility(player) {
    const playerInput = player === 1 ? player1Input : player2Input;
    const togglePlayerInput = player === 1 ? togglePlayer1input : togglePlayer2input;
  
    if (playerInput.type === "password") {
        playerInput.value = playerInput.value.replace(/,/g, '.');
        playerInput.type = "number";
        togglePlayerInput.innerHTML = '<i class="fa fa-eye"></i>';
    } else {
        playerInput.type = "password";
        togglePlayerInput.innerHTML = '<i class="fa fa-eye-slash"></i>';
    }
}
//------------------------------------------------------------------
console.log("script-root");
