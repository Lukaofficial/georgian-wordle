# 🇬🇪 ქართული ვორდლი (Georgian Wordle)

A Georgian version of the popular **Wordle** game built entirely with **HTML, CSS, and Vanilla JavaScript**.

Guess the hidden **5-letter Georgian word** in **6 attempts**. Every guess gives color-coded feedback to help you find the correct answer.

---

## ✨ Features

- 🇬🇪 Fully supports the Georgian alphabet
- 🎮 Classic Wordle gameplay
- ⌨️ Interactive on-screen Georgian keyboard
- 🟩🟨⬜ Wordle color feedback
  - 🟩 Correct letter in the correct position
  - 🟨 Correct letter in the wrong position
  - ⬜ Letter is not in the word
- 📚 Validates guesses using a Georgian word list
- 💡 Hint system after several failed attempts
- 📊 Statistics saved using Local Storage
- 📈 Win distribution graph
- 🔄 Play unlimited random words
- 🚫 Detects when the user is typing in a non-Georgian keyboard layout

---

## 🖼️ Preview

![Screenshot](screenshot-1.png)
![Screenshot](screenshot-2.png)

---

## 🎯 How to Play

1. Guess the hidden **5-letter Georgian word**.
2. You have **6 attempts**.
3. Press **Enter** to submit your guess.
4. Use **Backspace** to delete letters.
5. Colors indicate how close your guess is:

| Color | Meaning |
|--------|---------|
| 🟩 Green | Correct letter, correct position |
| 🟨 Yellow | Correct letter, wrong position |
| ⬜ Gray | Letter is not in the word |

If you still haven't guessed the word after several attempts, a hint becomes available revealing the first two letters.

---

## 📊 Statistics

The game stores your progress locally in your browser.

It tracks:

- Wins in 1 attempt
- Wins in 2 attempts
- Wins in 3 attempts
- Wins in 4 attempts
- Wins in 5 attempts
- Wins in 6 attempts

A simple graph displays your win distribution after every game.

---

## 🛠️ Built With

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- Local Storage API

---

## 📁 Project Structure

```
.
├── index.html
├── style.css
├── script.js
├── words.js
├── favicon.png
└── README.md
```

---

## 🚀 Running the Project

Simply clone the repository and open it using a local web server.

Example:

```bash
git clone https://github.com/yourusername/georgian-wordle.git
```

Then open `index.html` using a local server such as:

- VS Code Live Server
- Python HTTP Server
- XAMPP
- Any static web server

---

## 💻 Keyboard Support

The game is designed for the **Georgian keyboard layout**.

If another keyboard layout is detected, the game displays a warning asking the player to switch to Georgian.

The on-screen keyboard also changes certain letters while **Shift** is held, matching the Georgian keyboard layout.

---

## 💡 Future Improvements

- Daily challenge mode
- Dark mode
- Mobile optimizations
- Animations
- Difficulty settings
- Share results
- Online leaderboard
- Better handling of repeated letters (matching official Wordle behavior)

---

## 📜 License

This project is open source and available under the **MIT License**.

---

Made with ❤️ for Georgian language learners and Wordle fans.
