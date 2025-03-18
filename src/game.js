import { Wordle, GREEN, YELLOW, BLACK } from './classes/Wordle.js';
import { fiveLetterWords } from './fiveLetterWords.js';

class Game {
    constructor() {
        this.wordle = new Wordle(this.getRandomWord());
        this.currentGuess = '';
        this.guesses = [];
        this.maxGuesses = 6;
        this.gameOver = false;
        this.message = '';
        this.keyboardState = new Map();
        
        this.init();
    }

    init() {
        this.createGameBoard();
        this.createKeyboard();
        this.setupEventListeners();
    }

    getRandomWord() {
        const randomIndex = Math.floor(Math.random() * fiveLetterWords.length);
        return fiveLetterWords[randomIndex].toUpperCase();
    }

    createGameBoard() {
        const gameBoard = document.getElementById('game-board');
        for (let i = 0; i < this.maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                row.appendChild(tile);
            }
            gameBoard.appendChild(row);
        }
    }

    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        rows.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            row.forEach(key => {
                const button = document.createElement('button');
                button.className = 'key';
                button.textContent = key;
                keyboardRow.appendChild(button);
            });
            keyboard.appendChild(keyboardRow);
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.deleteLetter();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                this.addLetter(e.key.toUpperCase());
            }
        });

        document.getElementById('keyboard').addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            if (e.target.classList.contains('key')) {
                const key = e.target.textContent;
                if (key === 'ENTER') {
                    this.submitGuess();
                } else if (key === '⌫') {
                    this.deleteLetter();
                } else {
                    this.addLetter(key);
                }
            }
        });
    }

    addLetter(letter) {
        if (this.currentGuess.length < 5) {
            this.currentGuess += letter;
            this.updateDisplay();
        }
    }

    deleteLetter() {
        if (this.currentGuess.length > 0) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateDisplay();
        }
    }

    submitGuess() {
        if (this.currentGuess.length !== 5) return;
        
        if (!fiveLetterWords.includes(this.currentGuess.toLowerCase())) {
            this.showMessage('Not in word list');
            return;
        }

        const result = this.wordle.checkWord(this.currentGuess);
        const submittedWord = this.currentGuess;
        this.currentGuess = '';
        this.guesses.push({ word: submittedWord, result });
        
        // Update keyboard state
        this.updateKeyboardState(submittedWord, result);
        
        this.updateDisplay();
        this.updateKeyboardDisplay();

        if (submittedWord === this.wordle.word) {
            this.gameOver = true;
            this.showMessage('Congratulations! You won!');
            return;
        }

        if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this.showMessage(`Game Over! The word was ${this.wordle.word}`);
            return;
        }
    }

    updateKeyboardState(word, result) {
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            const currentState = this.keyboardState.get(letter);
            const newState = result[i];

            // Update state only if new result is better than current state
            if (!currentState || this.isBetterResult(newState, currentState)) {
                this.keyboardState.set(letter, newState);
            }
        }
    }

    isBetterResult(newState, currentState) {
        // GREEN is best, then YELLOW, then BLACK
        const statePriority = {
            [GREEN]: 3,
            [YELLOW]: 2,
            [BLACK]: 1
        };
        return statePriority[newState] > statePriority[currentState];
    }

    updateKeyboardDisplay() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            const letter = key.textContent;
            if (letter === 'ENTER' || letter === '⌫') return;

            const state = this.keyboardState.get(letter);
            key.className = 'key';
            if (state === GREEN) {
                key.classList.add('correct');
            } else if (state === YELLOW) {
                key.classList.add('present');
            } else if (state === BLACK) {
                key.classList.add('absent');
            }
        });
    }

    updateDisplay() {
        const rows = document.querySelectorAll('.row');
        rows.forEach((row, rowIndex) => {
            const tiles = row.querySelectorAll('.tile');
            if (rowIndex < this.guesses.length) {
                const guess = this.guesses[rowIndex];
                tiles.forEach((tile, tileIndex) => {
                    tile.textContent = guess.word[tileIndex];
                    tile.className = 'tile';
                    if (guess.result[tileIndex] === GREEN) {
                        tile.classList.add('correct');
                    } else if (guess.result[tileIndex] === YELLOW) {
                        tile.classList.add('present');
                    } else {
                        tile.classList.add('absent');
                    }
                });
            } else if (rowIndex === this.guesses.length) {
                tiles.forEach((tile, tileIndex) => {
                    tile.textContent = this.currentGuess[tileIndex] || '';
                    tile.className = 'tile';
                });
            } else {
                tiles.forEach(tile => {
                    tile.textContent = '';
                    tile.className = 'tile';
                });
            }
        });
    }

    showMessage(message) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        setTimeout(() => {
            messageElement.textContent = '';
        }, 3000);
    }
}

window.addEventListener('load', () => {
    new Game();
}); 