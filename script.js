window.onload = toggleDebugButtons;

// ---------------- spielersuche ------------------------

function showPlayerResults(playersResult, searchMode = false) {
    const resultsDiv = document.getElementById('playerresults');
    
    if (!playersResult || playersResult.length === 0) {
        resultsDiv.style.display = 'none'; // Verstecke das Ergebnis-Div, wenn keine Ergebnisse vorhanden sind
        return;
    }
    
    resultsDiv.style.display = 'block'; // Zeige das Ergebnis-Div an
    resultsDiv.innerHTML = ''; // Clear previous results

    // Anzeige der Anzahl der Spieler
    const sizeDiv = document.createElement('div');
    sizeDiv.textContent = `Anzahl: ${playersResult.length}`;
    resultsDiv.appendChild(sizeDiv);

    // Trennlinie
    const hr = document.createElement('hr');
    resultsDiv.appendChild(hr);

    // Liste der Spieler
    if (playersResult.length > 0) {
        const ul = document.createElement('ul');
        playersResult.forEach(player => {
            const li = document.createElement('li');
            // Formatierung abhängig vom Modus
            li.textContent = searchMode
                ? `${player.vorname} ${player.nachname}`
                : `${player.nachname}, ${player.vorname}`;
            ul.appendChild(li);
        });
        resultsDiv.appendChild(ul);
    } else {
        resultsDiv.textContent = 'Keine Spieler gefunden';
    }
}

function getAllPlayers() {
    const allPlayers = getPlayers();
    allPlayers.sort((a, b) => {
        const lastNameComparison = a.nachname.localeCompare(b.nachname);
        if (lastNameComparison !== 0) {
            return lastNameComparison;
        }
        return a.vorname.localeCompare(b.vorname);
    });
    showPlayerResults(allPlayers);
}

function searchPlayers() {
    const pos = document.getElementById('position').value;
    const team = document.getElementById('team').value;
    const results = find(pos, team);
    showPlayerResults(results, true); // Set searchMode to true for search results
}

function find(pos, team) {
    const allPlayers = getPlayers();

    const filteredPlayers = allPlayers.filter(player => {
        console.log('Checking player:', player);

        const hasPosition = pos === 'ALL' || player.positions.includes(pos);

        // Finde die zugehörigen Team-Aliase, falls vorhanden, ansonsten nutze das Team selbst
        const aliases = teamAliases[team] || [team];

        const hasValidTeam = player.teams.some(t => {
            if (!t || !t.n) {
                console.error('Invalid team entry:', t);
                return false;
            }
            return aliases.includes(t.n);
        });

        return hasPosition && hasValidTeam;
    });

    // Randomize the order of filteredPlayers before returning
    const randomizedPlayers = filteredPlayers.sort(() => Math.random() - 0.5);

    return randomizedPlayers;
}

// ---------------- Teamsuche ------------------------

function suggestPlayers() {
    const input = document.getElementById('playerName').value.toLowerCase();
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.style.display = 'block';
    suggestionsDiv.innerHTML = '';
    
    const resultsDiv = document.getElementById('teamresults');
    resultsDiv.style.display = 'block'; // Zeige das Ergebnis-Div an
    resultsDiv.innerHTML = ''; // Vorherige Ergebnisse löschen

    if (input.length < 1) {
        suggestionsDiv.style.display = 'none'; // Verberge das Dropdown, wenn weniger als 1 Buchstabe eingegeben wurde
        return;
    }

    const allPlayers = getPlayers();
    const suggestions = allPlayers
        .filter(player => 
            player.vorname.toLowerCase().includes(input) || 
            player.nachname.toLowerCase().includes(input)
        )
        .sort((a, b) => {
            // Sortiere nach Nachnamen und dann Vorname
            const nameA = `${a.nachname.toLowerCase()} ${a.vorname.toLowerCase()}`;
            const nameB = `${b.nachname.toLowerCase()} ${b.vorname.toLowerCase()}`;
            return nameA.localeCompare(nameB);
        })
        .slice(0, 10); // Maximal 10 Vorschläge anzeigen

    if (suggestions.length > 0) {
        suggestionsDiv.style.display = 'block'; // Zeige das Dropdown an, wenn es Vorschläge gibt
        suggestions.forEach(player => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            // Zeige den Namen im Format [Nachname], [Vorname] an
            div.textContent = `${player.nachname}, ${player.vorname}`;
            div.onclick = () => selectSuggestion(`${player.nachname}, ${player.vorname}`);
            suggestionsDiv.appendChild(div);
        });
    } else {
        suggestionsDiv.style.display = 'none'; // Verberge das Dropdown, wenn keine Vorschläge vorhanden sind
    }
}

function selectSuggestion(name) {
    document.getElementById('playerName').value = name;
    document.getElementById('suggestions').innerHTML = '';
}

function searchTeamsByPlayer() {
    const input = document.getElementById('playerName').value.toLowerCase();
    const allPlayers = getPlayers();
    const resultsDiv = document.getElementById('teamresults');
    resultsDiv.innerHTML = ''; // Vorherige Ergebnisse löschen

    const player = allPlayers.find(player => 
        `${player.nachname.toLowerCase()}, ${player.vorname.toLowerCase()}` === input
    );

    if (player) {
        const teamDetails = player.teams
            .map(team => {
                // Finde den ausgeschriebenen Namen des Teams
                const teamName = TeamNames[team.n] || team.n;
                // Finde das Kürzel des Teams
                const teamCode = team.n;
                
                // Finde das zugehörige Franchise
                const franchiseKey = Object.keys(teamAliases).find(franchiseKey => 
                    teamAliases[franchiseKey].includes(teamCode)
                );

                const franchiseName = franchiseKey ? TeamNames[franchiseKey] : null;
                const franchiseCode = franchiseKey || teamCode;
                
                // Formatieren der Teamdetails
                let detail = `${teamName} (${teamCode})`;
                if (franchiseKey && franchiseKey !== teamCode) {
                    detail += ` --> ${franchiseName} (${franchiseCode})`;
                }

                return `• ${detail}`;
            })
            .join('<br>'); // Trennung durch Zeilenumbrüche

        resultsDiv.innerHTML = `Teams von ${player.vorname} ${player.nachname}:<br><br>${teamDetails}`;
    } else {
        resultsDiv.textContent = 'Spieler nicht gefunden';
    }
    document.getElementById('suggestions').style.display = 'none';
}

// ---------------- statkarten ------------------------

function showStatResults(statsResult) {
    const resultsDiv = document.getElementById('statsresults');
    resultsDiv.style.display = 'block'; // Zeige das Ergebnis-Div an
    resultsDiv.innerHTML = ''; // Clear previous results

    // Trennlinie
    const hr = document.createElement('hr');
    resultsDiv.appendChild(hr);

    // Stats
    const ul = document.createElement('ul');
    statsResult.forEach((stat, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${stat.text}`; // Always include index
        li.className = 'colored-stat'; // Apply class for styling
        ul.appendChild(li);
    });
    resultsDiv.appendChild(ul);
}

function getSelectedStats() {
    const selectedStats = [];
    const checkboxes = document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const statIndex = parseInt(checkbox.value, 10);
        selectedStats.push(getStats().find(stat => stat.i === statIndex));
    });
    console.log(selectedStats);
    return selectedStats;
}

function getRandomStats(count) {
    const stats = getSelectedStats();
    if (stats.length === 0) {
        alert('Bitte wähle mindestens eine Stat aus.');
        return;
    }
    showStatResults(getRandomStatsArray(count, stats));
}

function getRandomStatsArray(count, stats) {
    const pickedNums = new Set();

    while (pickedNums.size < count && pickedNums.size < stats.length) {
        const randomIndex = Math.floor(Math.random() * stats.length);
        pickedNums.add(stats[randomIndex]);
    }
    return Array.from(pickedNums);
}

// --------------- dropdown -------------------
document.addEventListener('DOMContentLoaded', (event) => {
    populateStatCheckboxes();
});

function populateStatCheckboxes() {
    const stats = getStats();
    const dropdownContent = document.querySelector('.dropdown-content');
    stats.forEach(stat => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" checked value="${stat.i}"> ${stat.short}`;
        dropdownContent.appendChild(label);
    });
}

function displayStats(stats) {
    const resultsDiv = document.getElementById('statsresults');
    resultsDiv.innerHTML = '';
    stats.forEach(stat => {
        const p = document.createElement('p');
        p.textContent = stat.text;
        resultsDiv.appendChild(p);
    });
}

// ---------------- debugging ----------------------

function debug(){
    logDuplicates();
    logInvalidPositions();
    logInvalidTeams();
}

function logDuplicates(){
    const results = findDuplicates();
        if (results.length > 0) {
        console.log('Es wurden doppelte Spielereinträge gefunden:');
        results.forEach(entry => {
            console.log(`Spieler: ${entry.vorname} ${entry.nachname}, Ungültige Position: ${entry.invalidPosition}`);
        });
    } else {
        console.log('Alle Spielereinträge sind unique.');
    }
}
function findDuplicates() {
    const allPlayers = getPlayers();
    const duplicates = [];
    const playerMap = new Map();

    allPlayers.forEach(player => {
        const key = `${player.vorname} ${player.nachname}`;
        if (playerMap.has(key)) {
            // Füge den Spieler der doppelten Liste hinzu, falls er schon in der Map existiert
            duplicates.push(player);
        } else {
            // Füge den Spieler der Map hinzu, wenn er noch nicht existiert
            playerMap.set(key, player);
        }
    });

    return duplicates;
}

function logInvalidPositions() {
	const allPlayers = getPlayers();
    const invalidEntries = findInvalidPositions(allPlayers);

    if (invalidEntries.length > 0) {
        console.log('Es wurden ungültige Positionseinträge gefunden:');
        invalidEntries.forEach(entry => {
            console.log(`Spieler: ${entry.vorname} ${entry.nachname}, Ungültige Position: ${entry.invalidPosition}`);
        });
    } else {
        console.log('Alle Positionseinträge sind gültig.');
    }
}
function findInvalidPositions(players) {
	let acceptedPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
    let invalidEntries = [];
	
    players.forEach(player => {
        player.positions.forEach(position => {
            if (!acceptedPositions.includes(position)) {
                invalidEntries.push({
                    vorname: player.vorname,
                    nachname: player.nachname,
                    invalidPosition: position
                });
            }
        });
    });

    return invalidEntries;
}

function logInvalidTeams() {
    const allPlayers = getPlayers();
    const invalidEntries = findInvalidTeams(allPlayers, Team);

    if (invalidEntries.length > 0) {
        console.log('Es wurden ungültige Teameinträge gefunden:');
        invalidEntries.forEach(entry => {
            console.log(`Spieler: ${entry.vorname} ${entry.nachname}, Ungültiges Team: ${entry.invalidTeam}`);
        });
    } else {
        console.log('Alle Teameinträge sind gültig.');
    }
}
function findInvalidTeams(players, validTeams) {
    let invalidEntries = [];

    players.forEach(player => {
        player.teams.forEach(team => {
            if (!isValidTeam(team, validTeams)) {
                invalidEntries.push({
                    vorname: player.vorname,
                    nachname: player.nachname,
                    invalidTeam: team ? team.n : 'undefined'
                });
            }
        });
    });

    return invalidEntries;
}

function isValidTeam(team, validTeams) {
    return team && team.n && Object.values(validTeams).some(validTeam => validTeam.n === team.n);
}

function isLocalhost() {
    return window.location.hostname === "";
}

function toggleDebugButtons() {
    const debugButtons = document.querySelectorAll('.debug-btn');
    debugButtons.forEach(button => {
            button.style.display = isLocalhost() ? 'inline-block' : 'none';
    });
}