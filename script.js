const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const clearBtn = document.getElementById('clearBtn');
const alertBtn = document.getElementById('alertBtn');
const themeToggle = document.getElementById('themeToggle');
const editModeBtn = document.getElementById('editModeBtn');
const quickPhrasesGrid = document.getElementById('quickPhrasesGrid');

let isEditMode = false;

// Default phrases
const defaultPhrases = [
    { text: "Tengo sed, quiero agua", emoji: "💧", label: "Agua", count: 0 },
    { text: "Tengo dolor, necesito medicina", emoji: "💊", label: "Dolor", count: 0 },
    { text: "Quiero ir al baño", emoji: "🚽", label: "Baño", count: 0 },
    { text: "¿Dónde está el bebé?", emoji: "👶", label: "Bebé", count: 0 },
    { text: "Tengo hambre", emoji: "🍎", label: "Comida", count: 0 },
    { text: "Tengo frío", emoji: "🥶", label: "Frío", count: 0 },
    { text: "Tengo calor", emoji: "🥵", label: "Calor", count: 0 },
    { text: "Te amo mucho", emoji: "❤️", label: "Te amo", count: 0 },
    { text: "Gracias", emoji: "🙏", label: "Gracias", count: 0 },
    { text: "Por favor", emoji: "✨", label: "Por favor", count: 0 }
];

// Load from localStorage or use defaults
let phrases = JSON.parse(localStorage.getItem('bubu_phrases')) || defaultPhrases;

const historyList = document.getElementById('historyList');
// Load history from localStorage
let history = JSON.parse(localStorage.getItem('bubu_history')) || [];

function saveData() {
    localStorage.setItem('bubu_phrases', JSON.stringify(phrases));
    localStorage.setItem('bubu_history', JSON.stringify(history));
}

// Initialize Speech Synthesis
const synth = window.speechSynthesis;
let voices = [];

function loadVoices() {
    voices = synth.getVoices();
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (text !== '') {
        const utterThis = new SpeechSynthesisUtterance(text);

        // Try to find a Spanish voice
        const spanishVoice = voices.find(voice => voice.lang.includes('es'));
        if (spanishVoice) {
            utterThis.voice = spanishVoice;
        }

        const speechIndicator = document.getElementById('speechIndicator');

        utterThis.onstart = () => {
            speechIndicator.classList.remove('hidden');
        };

        utterThis.onend = () => {
            speechIndicator.classList.add('hidden');
        };

        utterThis.pitch = 1;
        utterThis.rate = 1;
        synth.speak(utterThis);

        // Visual feedback on button
        if (text === textInput.value) {
            speakBtn.classList.add('speaking');
            setTimeout(() => speakBtn.classList.remove('speaking'), 1000);
        }

        // Update phrase count if it matches a default phrase
        const phraseIndex = phrases.findIndex(p => p.text.toLowerCase() === text.toLowerCase());
        if (phraseIndex !== -1) {
            phrases[phraseIndex].count++;
        } else {
            // Add new custom phrase
            phrases.push({
                text: text,
                emoji: "💬",
                label: text.length > 20 ? text.substring(0, 20) + '...' : text,
                count: 1
            });
        }

        saveData(); // Save changes
        renderPhrases(); // Re-render to show updated count and order

        // Add to history
        addToHistory(text);
    }
}

function addToHistory(text) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Prevent duplicate consecutive entries
    if (history.length > 0 && history[0].text === text) return;

    history.unshift({ text, time: timeString });
    saveData(); // Save history
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">Aquí aparecerá lo que digas...</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="speak('${item.text}')">
            <span>${item.text}</span>
            <span class="time">${item.time}</span>
        </div>
    `).join('');
}

// Render Quick Phrases
function renderPhrases() {
    // Sort phrases by count (descending)
    const sortedPhrases = [...phrases].sort((a, b) => b.count - a.count);

    quickPhrasesGrid.innerHTML = sortedPhrases.map((phrase, index) => `
        <button class="phrase-btn" onclick="${isEditMode ? '' : `speak('${phrase.text}')`}">
            <div class="phrase-content">
                <span class="emoji">${phrase.emoji}</span>
                ${phrase.label}
            </div>
            ${phrase.count > 0 ? `<span class="count-badge">${phrase.count}</span>` : ''}
            ${isEditMode ? `<div class="delete-btn" onclick="deletePhrase('${phrase.text}')">✕</div>` : ''}
        </button>
    `).join('');
}

function deletePhrase(text) {
    phrases = phrases.filter(p => p.text !== text);
    saveData(); // Save deletion
    renderPhrases();
}

function playAlert() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // Slide up

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Event Listeners
const suggestionsContainer = document.getElementById('suggestions');

textInput.addEventListener('input', () => {
    const text = textInput.value.toLowerCase().trim();
    if (text.length < 2) {
        suggestionsContainer.classList.add('hidden');
        return;
    }

    // Filter phrases that contain the text
    const matches = phrases.filter(p => p.text.toLowerCase().includes(text));

    if (matches.length > 0) {
        suggestionsContainer.innerHTML = matches.map(p => `
            <button class="suggestion-chip" onclick="applySuggestion('${p.text}')">
                ${p.emoji} ${p.label}
            </button>
        `).join('');
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
});

function applySuggestion(text) {
    textInput.value = text;
    suggestionsContainer.classList.add('hidden');
    speak(text);
}

speakBtn.addEventListener('click', () => {
    speak(textInput.value);
});

clearBtn.addEventListener('click', () => {
    textInput.value = '';
    textInput.focus();
    suggestionsContainer.classList.add('hidden');
});

alertBtn.addEventListener('click', playAlert);

const whatsappBtn = document.getElementById('whatsappBtn');
const sleepModeBtn = document.getElementById('sleepModeBtn');
const sleepOverlay = document.getElementById('sleepOverlay');

whatsappBtn.addEventListener('click', () => {
    const phoneNumber = "51995566892";
    const message = encodeURIComponent("Amor, ven por favor");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
});

sleepModeBtn.addEventListener('click', () => {
    sleepOverlay.classList.remove('hidden');
});

sleepOverlay.addEventListener('click', () => {
    sleepOverlay.classList.add('hidden');
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

editModeBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    editModeBtn.textContent = isEditMode ? 'Listo' : 'Editar';
    editModeBtn.style.color = isEditMode ? 'var(--primary-hover)' : 'var(--primary-color)';
    renderPhrases();
});

// Initial render
renderPhrases();
renderHistory();
loadVoices();
