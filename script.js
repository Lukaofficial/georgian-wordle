'use strict';

import { georgianWords } from "./words.js";

/* =========================================================================
   DOM REFERENCES
   ========================================================================= */

// Keys on the on-screen keyboard whose glyph changes when Shift is held
const kw = document.getElementById('kw');
const kr = document.getElementById('kr');
const kt = document.getElementById('kt');
const ks = document.getElementById('ks');
const kj = document.getElementById('kj');
const kz = document.getElementById('kz');
const kc = document.getElementById('kc');

// Tracks which physical keys are currently held down (event.code -> true)
const keysPressed = {};

// The 6x5 grid of guess cells, built as a flat array (row-major order).
// Using a single lookup here instead of 30 separate `const dXY = ...`
// declarations keeps the file shorter and makes the grid easier to reason
// about (see `slots` below, which is what the rest of the code uses).
const slots = [];
for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= 5; col++) {
        slots.push(document.getElementById(`d${row}${col}`));
    }
}

// Elements used to draw the "wins per attempt" bar graph
const l1 = document.getElementById('firstLine');
const l2 = document.getElementById('secondLine');
const l3 = document.getElementById('thirdLine');
const l4 = document.getElementById('fourthLine');
const l5 = document.getElementById('fifthLine');
const l6 = document.getElementById('sixthLine');

const t1 = document.getElementById('firstText');
const t2 = document.getElementById('secondText');
const t3 = document.getElementById('thirdText');
const t4 = document.getElementById('fourthText');
const t5 = document.getElementById('fifthText');
const t6 = document.getElementById('sixthText');

// Buttons / misc controls
const hintCont = document.getElementById("hint");
const resetScoreBtn = document.getElementById("resetScore");
const newGameBtn = document.getElementById("newGame");

// Modal window shown at the end of a game
const modalCloseBtn = document.getElementsByClassName("close")[0];
const modal = document.getElementById('myModal');

// Shown briefly when the user types a non-Georgian character
const notInGeoEl = document.getElementById('notInGeo');

/* =========================================================================
   GAME STATE
   ========================================================================= */

// Set of valid Georgian letters the keyboard/typing logic accepts.
const GEORGIAN_LETTERS = new Set([
    "ქ", "წ", "ჭ", "ე", "რ", "ღ", "ტ", "თ", "ყ", "უ", "ი", "ო", "პ", "ა",
    "ს", "შ", "დ", "ფ", "გ", "ჰ", "ჯ", "ჟ", "კ", "ლ", "ზ", "ძ", "ხ", "ც",
    "ჩ", "ვ", "ბ", "ნ", "მ"
]);

// Which row (1-6) the player is currently filling in
let currentRow = 1;

// The word the player needs to guess this round
let chosenWord = pickRandomWord();

function pickRandomWord() {
    const index = Math.floor(Math.random() * georgianWords.length);
    return georgianWords[index];
}

/* =========================================================================
   LOCAL STORAGE / SCORE TRACKING
   ========================================================================= */

// Keys used to store how many wins happened on each attempt (1-6)
const WIN_KEYS = ["winsIn1", "winsIn2", "winsIn3", "winsIn4", "winsIn5", "winsIn6"];

// Make sure every counter exists in localStorage before the game starts
WIN_KEYS.forEach((key) => {
    if (localStorage.getItem(key) === undefined) {
        localStorage.setItem(key, 0);
    }
});

// Resets all win counters back to zero and redraws the graph
function resetScore() {
    WIN_KEYS.forEach((key) => localStorage.setItem(key, 0));
    generateXYGraph();
}

// Increments the win counter stored under `key` by 1
function updateLocalStorage(key) {
    const currentScore = Number(localStorage.getItem(key));
    localStorage.setItem(key, currentScore + 1);
}

/* =========================================================================
   GRAPH RENDERING
   ========================================================================= */

// Draws a single bar (line) + label based on the win count for one attempt
function lineAndTextGenerator(winKey, line, text) {
    const wins = localStorage.getItem(winKey);
    line.style.height = wins * 5 + "px";
    line.style.top = `calc(464px - ${wins * 5}px)`;
    text.style.top = "470px";
}

// Redraws the full "wins per attempt" bar graph from localStorage
function generateXYGraph() {
    lineAndTextGenerator("winsIn1", l1, t1);
    lineAndTextGenerator("winsIn2", l2, t2);
    lineAndTextGenerator("winsIn3", l3, t3);
    lineAndTextGenerator("winsIn4", l4, t4);
    lineAndTextGenerator("winsIn5", l5, t5);
    lineAndTextGenerator("winsIn6", l6, t6);
}

/* =========================================================================
   GAME FLOW
   ========================================================================= */

// Resets the board and picks a new word to start a fresh round
function newGame() {
    document.querySelectorAll('td').forEach((td) => {
        changeCell(td, "white", "2px solid grey", "black");
        td.textContent = "";
    });
    currentRow = 1;

    chosenWord = pickRandomWord();
    document.getElementById("ansv").innerHTML = chosenWord;
    document.getElementById("ansv").style.visibility = "hidden";
    document.getElementById("hint").style.visibility = "hidden";
    modal.style.display = "none";
}

// Shows the "you won / you lost" modal
function openPopup() {
    modal.style.display = "block";
}

// Reveals the first two letters of the answer as a hint
function showHint() {
    const letters = [...chosenWord];
    document.getElementById("hint").innerHTML = letters[0] + letters[1] + "***";
}

// Checks whether the row the player is currently on has all 5 cells filled
function isCurrentRowFull() {
    if (currentRow < 1 || currentRow > 6) return true;
    const lastCellIndex = (currentRow - 1) * 5 + 4;
    return slots[lastCellIndex].textContent !== "";
}

// Applies background/border/text colors to a single grid cell
function changeCell(cell, backgroundColor, border, color) {
    cell.style.backgroundColor = backgroundColor;
    cell.style.border = border;
    cell.style.color = color;
}

// Swaps the labels on keys that have a secondary (Shift) character
function changeKeyOnShift(a, b, c, d, e, f, g) {
    kw.textContent = a;
    kr.textContent = b;
    kt.textContent = c;
    ks.textContent = d;
    kj.textContent = e;
    kz.textContent = f;
    kc.textContent = g;
}

/* =========================================================================
   MODAL EVENT HANDLERS
   ========================================================================= */

// Clicking the "X" closes the modal and starts a new game
modalCloseBtn.onclick = function () {
    modal.style.display = "none";
    newGame();
};

// Clicking outside the modal also closes it and starts a new game
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
        newGame();
    }
};

/* =========================================================================
   KEYBOARD INPUT
   ========================================================================= */

// Handles letter input (fired for printable characters, including Georgian)
document.addEventListener('keypress', (event) => {
    const key = event.key;
    keysPressed[event.code] = true;

    // Highlight the matching on-screen keyboard key while it's pressed
    const keyElement = document.querySelector(`[data-key="${event.code}"]`);
    if (keyElement) {
        keyElement.classList.add('pressed');
    }

    const isTypeable = GEORGIAN_LETTERS.has(key);

    for (const slot of slots) {
        if (slot.textContent === "" && !isCurrentRowFull()) {
            if (isTypeable) {
                slot.textContent = key;
            } else if (key !== "Enter") {
                // Non-Georgian character: flash a warning and stop
                notInGeoEl.style.visibility = "visible";
                setTimeout(() => {
                    notInGeoEl.style.visibility = "hidden";
                }, 2000);
            }
            break;
        }
    }
});

// Handles Enter (submit guess), Backspace (delete letter), and Shift (toggle keys)
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter" && isCurrentRowFull()) {
        handleGuessSubmit();
    } else if (event.key === "Backspace") {
        handleBackspace();
    }

    // Show the Shift-layer characters while Shift is held
    if (event.key === "Shift") {
        changeKeyOnShift("ჭ", "ღ", "თ", "შ", "ჟ", "ძ", "ჩ");
    }
});

// Removes the "pressed" highlight and restores default key labels on key release
document.addEventListener('keyup', (event) => {
    delete keysPressed[event.code];

    const keyElement = document.querySelector(`[data-key="${event.code}"]`);
    if (keyElement) {
        keyElement.classList.remove('pressed');
    }

    if (event.code === 'ShiftLeft') {
        changeKeyOnShift("წ", "რ", "ტ", "ს", "ჯ", "ზ", "ც");
    }
});

// Deletes the last filled letter in the current row
function handleBackspace() {
    const backspaceKey = document.querySelector('[data-key="Backspace"]');
    if (backspaceKey) {
        backspaceKey.classList.add('pressed');
    }

    const rowStart = (currentRow - 1) * 5;
    for (let i = slots.length - 1; i >= rowStart; i--) {
        if (slots[i].textContent !== "") {
            slots[i].textContent = "";
            break;
        }
    }
}

// Evaluates the current row's guess against the chosen word
function handleGuessSubmit() {
    const rowStart = (currentRow - 1) * 5;
    let submitText = "";
    for (let i = rowStart; i <= rowStart + 4; i++) {
        submitText += slots[i].textContent;
    }

    if (submitText === chosenWord) {
        handleWin();
        return;
    }

    // Guess must be a real word from the word list
    if (georgianWords.indexOf(submitText) === -1) {
        const notInList = document.getElementById('notInWordsList');
        if (notInList) {
            notInList.style.visibility = "visible";
            setTimeout(() => {
                notInList.style.visibility = "hidden";
            }, 2000);
        }
        return; // don't advance the row on an invalid word
    }

    const userLetters = slots.slice(rowStart, rowStart + 5).map((s) => s.textContent);
    const answerLetters = [...chosenWord];

    colorizeRow(currentRow, userLetters, answerLetters);

    if (currentRow < 6) {
        currentRow++;
    } else {
        // Out of attempts: reveal the answer and show the "lost" modal
        document.getElementById("ansv").innerHTML = chosenWord;
        document.getElementById("ansv").style.visibility = "visible";
        openPopup();
        generateXYGraph();
        document.getElementById("scoreRow").innerHTML = "წააგე!";
        return;
    }

    if (currentRow > 3) {
        document.getElementById("hint").style.visibility = "visible";
    }
}

// Colors a submitted row's cells: green (correct spot), yellow (wrong spot),
// grey (not in word)
function colorizeRow(row, userLetters, answerLetters) {
    const rowEl = document.querySelector(`table tr:nth-child(${row})`);
    for (let i = 0; i < 5; i++) {
        const cell = rowEl.querySelector(`td:nth-child(${i + 1})`);
        if (userLetters[i] === answerLetters[i]) {
            changeCell(cell, "rgb(63, 117, 58)", "2px solid rgb(63, 117, 58)", "white");
        } else if (answerLetters.includes(userLetters[i])) {
            changeCell(cell, "rgb(201, 180, 88)", "2px solid rgb(201, 180, 88)", "white");
        } else {
            changeCell(cell, "#787c7e", "2px solid #787c7e", "white");
        }
    }
}

// Handles a correct guess: reveals the answer, shows the modal, updates score
function handleWin() {
    document.getElementById("ansv").innerHTML = chosenWord;
    document.getElementById("ansv").style.visibility = "visible";
    openPopup();

    document.querySelectorAll(`table tr:nth-child(${currentRow}) td`).forEach((td) => {
        changeCell(td, "rgb(63, 117, 58)", "2px solid rgb(63, 117, 58)", "white");
    });

    document.getElementById("scoreRow").innerHTML = `შენ მოიგე ${currentRow} ცდაში.`;
    updateLocalStorage(WIN_KEYS[currentRow - 1]);
    generateXYGraph();
}

/* =========================================================================
   BUTTON LISTENERS
   ========================================================================= */

hintCont.addEventListener('click', showHint);
resetScoreBtn.addEventListener('click', resetScore);
newGameBtn.addEventListener('click', newGame);