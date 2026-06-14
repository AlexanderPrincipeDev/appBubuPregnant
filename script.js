const textInput = document.getElementById('textInput');
const speakBtn = document.getElementById('speakBtn');
const repeatBtn = document.getElementById('repeatBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const helpBtn = document.getElementById('helpBtn');
const nurseBtn = document.getElementById('nurseBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const themeToggle = document.getElementById('themeToggle');
const priorityGrid = document.getElementById('priorityGrid');
const commonGrid = document.getElementById('commonGrid');
const chatLog = document.getElementById('chatLog');
const speechIndicator = document.getElementById('speechIndicator');
const spokenToast = document.getElementById('spokenToast');

const synth = window.speechSynthesis;
let voices = [];
let lastMessage = localStorage.getItem('bubu_last_message') || '';

const priorityPhrases = [
    { emoji: '👶', label: 'Dame a la bebé', text: 'Dame a la bebé', type: 'baby' },
    { emoji: '😣', label: 'Me duele mucho', text: 'Me duele mucho', type: 'urgent' },
    { emoji: '💧', label: 'Tengo sed', text: 'Tengo sed', type: 'comfort' },
    { emoji: '👩‍⚕️', label: 'Enfermera', text: 'Llama a la enfermera por favor', type: 'urgent' }
];

const commonPhrases = [
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
];

function loadVoices() {
    voices = synth.getVoices();
}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

function addMessage(text) {
    const emptyMessage = chatLog.querySelector('.empty-message');
    if (emptyMessage) emptyMessage.remove();

    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    chatLog.prepend(message);
}

function showToast(text) {
    spokenToast.innerHTML = `<span>Diciendo</span><strong>${text}</strong>`;
    spokenToast.classList.remove('hidden');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        spokenToast.classList.add('hidden');
    }, 2200);
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
    showToast(cleanText);
    addMessage(cleanText);
}

function stopVoice() {
    if (synth.speaking) synth.cancel();
    speechIndicator.classList.add('hidden');
    spokenToast.classList.add('hidden');
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

function renderPhraseGrid(grid, phrases, className) {
    grid.innerHTML = '';

    phrases.forEach(phrase => {
        const button = document.createElement('button');
        button.className = `${className} ${phrase.type ? `is-${phrase.type}` : ''}`;
        button.innerHTML = `<span>${phrase.emoji}</span>${phrase.label}`;
        button.addEventListener('click', () => speak(phrase.text));
        grid.appendChild(button);
    });
}

function renderPhrases() {
    renderPhraseGrid(priorityGrid, priorityPhrases, 'priority-btn');
    renderPhraseGrid(commonGrid, commonPhrases, 'phrase-btn');
}

speakBtn.addEventListener('click', () => speak(textInput.value));
repeatBtn.addEventListener('click', () => {
    if (lastMessage) speak(lastMessage);
});
stopBtn.addEventListener('click', stopVoice);
clearBtn.addEventListener('click', () => {
    textInput.value = '';
    textInput.focus();
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

renderPhrases();
loadVoices();
