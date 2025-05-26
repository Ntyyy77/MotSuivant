const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let frenchWords = [];
let englishWords = [];
let spanishWords = [];

function loadWords() {
  frenchWords = fs.readFileSync(path.join(__dirname, 'dico/francais.txt'), 'utf-8')
    .split('\n')
    .map(w => w.trim())
    .filter(Boolean);

  englishWords = fs.readFileSync(path.join(__dirname, 'dico/anglais.txt'), 'utf-8')
    .split('\n')
    .map(w => w.trim())
    .filter(Boolean);

  spanishWords = fs.readFileSync(path.join(__dirname, 'dico/espagnol.txt'), 'utf-8')
    .split('\n')
    .map(w => w.trim())
    .filter(Boolean);
}

let currentLanguage = 'fr';
let currentWord = '';

function getRandomWord(lang) {
  let words;
  switch (lang) {
    case 'fr': words = frenchWords; break;
    case 'en': words = englishWords; break;
    case 'es': words = spanishWords; break;
    default: words = englishWords;
  }
  return words[Math.floor(Math.random() * words.length)];
}

function createWindow() {
  loadWords(); // Charger les mots une seule fois au démarrage
  currentWord = getRandomWord(currentLanguage);

  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');

  win.webContents.once('did-finish-load', () => {
    win.webContents.send('language-updated', currentLanguage);
    win.webContents.send('new-word', currentWord);
  });

  ipcMain.on('set-language', (event, lang) => {
    currentLanguage = lang;
    currentWord = getRandomWord(currentLanguage);
    console.log('Langue changée en :', currentLanguage);
    event.sender.send('language-updated', currentLanguage);
    event.sender.send('new-word', currentWord);
  });

  ipcMain.on('update-word', (event, newWord) => {
    currentWord = newWord;
    event.sender.send('new-word', currentWord);
  });
}

app.whenReady().then(createWindow);
