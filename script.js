const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const repeatBtn = document.getElementById('repeatBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const resetRankingBtn = document.getElementById('resetRankingBtn');
const resetModal = document.getElementById('resetModal');
const cancelResetBtn = document.getElementById('cancelResetBtn');
const confirmResetBtn = document.getElementById('confirmResetBtn');
const helpBtn = document.getElementById('helpBtn');
const nurseBtn = document.getElementById('nurseBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const themeToggle = document.getElementById('themeToggle');
const buttonViewToggle = document.getElementById('buttonViewToggle');
const priorityGrid = document.getElementById('priorityGrid');
const commonGrid = document.getElementById('commonGrid');
const buttonOnlyView = document.getElementById('buttonOnlyView');
const categoryBoard = document.getElementById('categoryBoard');
const currentMessage = document.getElementById('currentMessage');
const speechIndicator = document.getElementById('speechIndicator');

const synth = window.speechSynthesis;
let voices = [];
let lastMessage = localStorage.getItem('bubu_last_message') || '';
let isButtonOnlyView = localStorage.getItem('bubu_button_view') === '1';

const defaultPhrases = [
    { emoji: '👶', label: 'Dame a la bebé', text: 'Dame a la bebé', type: 'baby', count: 0 },
    { emoji: '😣', label: 'Me duele mucho', text: 'Me duele mucho', type: 'urgent', count: 0 },
    { emoji: '💧', label: 'Tengo sed', text: 'Tengo sed', type: 'comfort', count: 0 },
    { emoji: '👩‍⚕️', label: 'Enfermera', text: 'Llama a la enfermera por favor', type: 'urgent', count: 0 },
    { emoji: '✅', label: 'Sí', text: 'Sí', type: 'answer' },
    { emoji: '❌', label: 'No', text: 'No', type: 'answer' },
    { emoji: '🐢', label: 'Despacio', text: 'Despacio por favor', type: 'care' },
    { emoji: '✋', label: 'Espera', text: 'Espera por favor', type: 'care' },
    { emoji: '🚫', label: 'No puedo', text: 'No puedo', type: 'answer' },
    { emoji: '🙂', label: 'Estoy bien', text: 'Estoy bien', type: 'answer' },
    { emoji: '💊', label: 'Medicina', text: 'Necesito medicina para el dolor', type: 'urgent' },
    { emoji: '🩹', label: 'La herida', text: 'Cuidado con la herida', type: 'urgent' },
    { emoji: '🚽', label: 'Baño', text: 'Necesito ir al baño', type: 'comfort' },
    { emoji: '🛏️', label: 'Acomódame', text: 'Ayúdame a acomodarme', type: 'care' },
    { emoji: '⬆️', label: 'Sube la cama', text: 'Sube la cama por favor', type: 'care' },
    { emoji: '⬇️', label: 'Baja la cama', text: 'Baja la cama por favor', type: 'care' },
    { emoji: '☁️', label: 'Almohada', text: 'Acomódame la almohada', type: 'care' },
    { emoji: '🤝', label: 'Quédate', text: 'Quédate conmigo', type: 'answer' },
    { emoji: '🍼', label: 'Lactar', text: 'Ayúdame a darle de lactar a la bebé', type: 'baby' },
    { emoji: '🤲', label: 'Toma a la bebé', text: 'Toma a la bebé por favor', type: 'baby' },
    { emoji: '🤱', label: 'Quiero cargarla', text: 'Quiero cargar a la bebé', type: 'baby' },
    { emoji: '🤢', label: 'Náuseas', text: 'Tengo náuseas', type: 'urgent' },
    { emoji: '😵‍💫', label: 'Mareo', text: 'Me mareé', type: 'urgent' },
    { emoji: '🥶', label: 'Frío', text: 'Tengo frío', type: 'comfort' },
    { emoji: '🥵', label: 'Calor', text: 'Tengo calor', type: 'comfort' },
    { emoji: '💤', label: 'Quiero dormir', text: 'Quiero dormir', type: 'comfort' },
    { emoji: '🚪', label: 'No visitas', text: 'No quiero visitas ahora', type: 'comfort' },
    { emoji: '🙏', label: 'Gracias', text: 'Gracias amor', type: 'answer' }
].map((phrase, index) => ({ ...phrase, count: phrase.count || 0, order: index }));

const buttonCategories = [
    { title: 'Más probable', types: ['baby', 'urgent', 'comfort'], labels: ['Dame a la bebé', 'Me duele mucho', 'Tengo sed', 'Enfermera'] },
    { title: 'Respuestas rápidas', types: ['answer'] },
    { title: 'Moverme y cuidarme', types: ['care'] },
    { title: 'Bebé y lactancia', types: ['baby'] },
    { title: 'Dolor y clínica', types: ['urgent'] },
    { title: 'Comodidad', types: ['comfort'] }
];

let phrases = loadPhrases();

function loadPhrases() {
    try {
        const savedPhrases = JSON.parse(localStorage.getItem('bubu_phrases_usage')) || [];
        return defaultPhrases.map(defaultPhrase => {
            const savedPhrase = savedPhrases.find(phrase => phrase.text === defaultPhrase.text);
            return savedPhrase ? { ...defaultPhrase, count: savedPhrase.count || 0 } : defaultPhrase;
        });
    } catch (error) {
        return defaultPhrases;
    }
}

function savePhrases() {
    localStorage.setItem('bubu_phrases_usage', JSON.stringify(phrases.map(phrase => ({
        text: phrase.text,
        count: phrase.count || 0
    }))));
}

function resetRanking() {
    phrases = phrases.map(phrase => ({ ...phrase, count: 0 }));
    savePhrases();
    renderPhrases();
}

function openResetModal() {
    resetModal.classList.remove('hidden');
    cancelResetBtn.focus();
}

function closeResetModal() {
    resetModal.classList.add('hidden');
}

function sortedPhrases() {
    return [...phrases].sort((a, b) => {
        if ((b.count || 0) !== (a.count || 0)) return (b.count || 0) - (a.count || 0);
        return a.order - b.order;
    });
}

function loadVoices() {
    voices = synth.getVoices();
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

function updateCurrentMessage(text) {
    currentMessage.textContent = text || 'Escribe o toca una frase';
}

function speak(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const spanishVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => speechIndicator.classList.remove('hidden');
    utterance.onend = () => speechIndicator.classList.add('hidden');
    utterance.onerror = () => speechIndicator.classList.add('hidden');

    synth.speak(utterance);
    lastMessage = cleanText;
    localStorage.setItem('bubu_last_message', lastMessage);
    updateCurrentMessage(cleanText);
}

function stopVoice() {
    if (synth.speaking) synth.cancel();
    speechIndicator.classList.add('hidden');
}

function playSoftAlert() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(620, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(780, audioContext.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

function usePhrase(text) {
    const phrase = phrases.find(item => item.text === text);
    if (phrase) {
        phrase.count = (phrase.count || 0) + 1;
        savePhrases();
    }

    speak(text);
    renderPhrases();
}

function phrasesForCategory(category) {
    let categoryPhrases = phrases.filter(phrase => {
        if (category.labels) return category.labels.includes(phrase.label);
        return category.types.includes(phrase.type);
    });

    return categoryPhrases.sort((a, b) => {
        if ((b.count || 0) !== (a.count || 0)) return (b.count || 0) - (a.count || 0);
        return a.order - b.order;
    });
}

function renderPhraseGrid(grid, phrases, className) {
    grid.innerHTML = '';

    phrases.forEach(phrase => {
        const button = document.createElement('button');
        button.className = `${className} ${phrase.type ? `is-${phrase.type}` : ''}`;
        button.innerHTML = `
            <span class="button-emoji">${phrase.emoji}</span>
            <span class="button-label">${phrase.label}</span>
            ${phrase.count > 0 ? `<span class="count-badge">${phrase.count}</span>` : ''}
        `;
        button.addEventListener('click', () => usePhrase(phrase.text));
        grid.appendChild(button);
    });
}

function renderPhrases() {
    const orderedPhrases = sortedPhrases();
    renderPhraseGrid(priorityGrid, orderedPhrases.slice(0, 4), 'priority-btn');
    renderPhraseGrid(commonGrid, orderedPhrases.slice(4), 'phrase-btn');
    renderCategoryBoard();
}

function renderCategoryBoard() {
    categoryBoard.innerHTML = '';

    buttonCategories.forEach(category => {
        const section = document.createElement('section');
        section.className = 'button-category';

        const title = document.createElement('h3');
        title.textContent = category.title;

        const grid = document.createElement('div');
        grid.className = 'category-grid';

        renderPhraseGrid(grid, phrasesForCategory(category), 'category-btn');

        section.appendChild(title);
        section.appendChild(grid);
        categoryBoard.appendChild(section);
    });
}

function applyButtonOnlyView() {
    document.body.classList.toggle('button-only-mode', isButtonOnlyView);
    buttonOnlyView.classList.toggle('hidden', !isButtonOnlyView);
    priorityGrid.closest('.priority-section').classList.toggle('hidden', isButtonOnlyView);
    commonGrid.closest('.quick-section').classList.toggle('hidden', isButtonOnlyView);
    buttonViewToggle.textContent = isButtonOnlyView ? 'Vista normal' : 'Solo botones';
    localStorage.setItem('bubu_button_view', isButtonOnlyView ? '1' : '0');
}

speakBtn.addEventListener('click', () => speak(textInput.value));
repeatBtn.addEventListener('click', () => {
    if (lastMessage) speak(lastMessage);
});
stopBtn.addEventListener('click', stopVoice);
clearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateCurrentMessage('Escribe o toca una frase');
    textInput.focus();
});

resetRankingBtn.addEventListener('click', openResetModal);
cancelResetBtn.addEventListener('click', closeResetModal);
confirmResetBtn.addEventListener('click', () => {
    resetRanking();
    closeResetModal();
});
resetModal.addEventListener('click', event => {
    if (event.target === resetModal) closeResetModal();
});

buttonViewToggle.addEventListener('click', () => {
    isButtonOnlyView = !isButtonOnlyView;
    applyButtonOnlyView();
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !resetModal.classList.contains('hidden')) {
        closeResetModal();
    }
});

textInput.addEventListener('input', () => {
    updateCurrentMessage(textInput.value.trim());
});

helpBtn.addEventListener('click', () => {
    playSoftAlert();
    speak('Amor, ayúdame por favor');
});

nurseBtn.addEventListener('click', () => speak('Llama a la enfermera por favor'));

whatsappBtn.addEventListener('click', () => {
    const phoneNumber = localStorage.getItem('bubu_whatsapp_phone') || '51995566892';
    const message = encodeURIComponent(lastMessage || 'Amor, ayúdame por favor');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('bubu_dark_mode', isDark ? '1' : '0');
});

if (localStorage.getItem('bubu_dark_mode') === '1') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

if (lastMessage) updateCurrentMessage(lastMessage);
renderPhrases();
applyButtonOnlyView();
loadVoices();
