const tg = window.Telegram.WebApp;
tg.expand();

let currentBalance = 10000; // Стартовый баланс для теста
document.getElementById('user-balance').innerText = currentBalance;

// --- НАВИГАЦИЯ ---
function switchTab(tabName) {
    // Убираем активный класс со всех кнопок и контента
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Добавляем активный класс нужным
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// --- РУЛЕТКА ---
const colorMap = {
    'yellow': { emoji: '🟨', name: 'Жёлтый' },
    'green':  { emoji: '🟩', name: 'Зелёный' },
    'blue':   { emoji: '🟦', name: 'Синий' },
    'purple': { emoji: '🟪', name: 'Фиолетовый' },
    'orange': { emoji: '🟧', name: 'Оранжевый' }
};
const allEmojis = ['🟨', '🟩', '🟦', '🟪', '🟧'];

let selectedColor = null;
let selectedMultiplier = 0;
let isSpinning = false;

function selectColor(color, multiplier) {
    if (isSpinning) return;
    selectedColor = color;
    selectedMultiplier = multiplier;
    
    document.getElementById('colors-grid').classList.add('hidden');
    document.getElementById('bet-area').classList.remove('hidden');
    document.getElementById('selected-color-name').innerText = colorMap[color].name;
    document.getElementById('selected-multiplier').innerText = multiplier;
    document.getElementById('result-text').innerText = "";
}

function cancelBet() {
    selectedColor = null;
    document.getElementById('colors-grid').classList.remove('hidden');
    document.getElementById('bet-area').classList.add('hidden');
}

function spin(betAmount) {
    if (isSpinning) return;
    if (betAmount > currentBalance) {
        document.getElementById('result-text').innerText = "❌ Недостаточно фишек!";
        return;
    }

    isSpinning = true;
    currentBalance -= betAmount;
    document.getElementById('user-balance').innerText = currentBalance;
    document.getElementById('result-text').innerText = "Крутим...";
    document.getElementById('bet-area').classList.add('hidden');

    const display = document.getElementById('roulette-display');
    const rouletteWindow = document.querySelector('.roulette-window');
    
    let spins = 0;
    const maxSpins = 30;
    const spinInterval = setInterval(() => {
        display.innerText = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        rouletteWindow.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
        spins++;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            rouletteWindow.style.transform = 'none';
            finishSpin(betAmount);
        }
    }, 50);
}

function finishSpin(betAmount) {
    const winColor = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    document.getElementById('roulette-display').innerText = winColor;
    isSpinning = false;

    const myEmoji = colorMap[selectedColor].emoji;

    if (winColor === myEmoji) {
        const winAmount = betAmount * selectedMultiplier;
        currentBalance += winAmount;
        document.getElementById('user-balance').innerText = currentBalance;
        document.getElementById('result-text').innerHTML = `🎉 <span style="color:#32cd32">ПОБЕДА!</span><br>Выигрыш: +${winAmount} 🪙`;
    } else {
        document.getElementById('result-text').innerHTML = `😔 <span style="color:#ff3333">Проигрыш.</span><br>Выпало: ${winColor}`;
    }

    setTimeout(() => {
        document.getElementById('colors-grid').classList.remove('hidden');
        selectedColor = null;
    }, 2000);
}

// --- МАГАЗИН ---
const shopItems = [
    { uc: 60, price: 100 },
    { uc: 325, price: 500 },
    { uc: 660, price: 1000 },
    { uc: 1800, price: 2500 },
    { uc: 3850, price: 5000 },
    { uc: 8100, price: 10000 },
    { uc: 16200, price: 20000 },
    { uc: 24300, price: 30000 },
    { uc: 32400, price: 40000 },
    { uc: 40500, price: 50000 }
];

function renderShop() {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    
    shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <img src="uc_icon.png" alt="${item.uc} UC" class="shop-item-img">
            <div class="shop-item-title">${item.uc} UC</div>
            <div class="shop-item-price">${item.price} 🪙</div>
            <button class="buy-btn" onclick="buyItem(${item.uc}, ${item.price})">Купить</button>
        `;
        grid.appendChild(div);
    });
}

function buyItem(uc, price) {
    const resText = document.getElementById('shop-result-text');
    if (currentBalance < price) {
        resText.innerHTML = `❌ <span style="color:#ff3333">Недостаточно фишек!</span> Нужно ${price} 🪙`;
        return;
    }
    
    currentBalance -= price;
    document.getElementById('user-balance').innerText = currentBalance;
    resText.innerHTML = `✅ <span style="color:#32cd32">Успешно!</span> Ты купил ${uc} UC.<br>Ожидай выдачи от админа.`;
    
    // В реальном приложении здесь будет запрос к боту
    // tg.sendData(JSON.stringify({ action: 'buy', uc: uc, price: price }));
}

// --- ВЗЛОМ КОДА ---
let secretCode = Math.floor(Math.random() * 100) + 1; // Секретное число
let isCodeActive = true;

function tryCode() {
    const input = document.getElementById('code-input');
    const resText = document.getElementById('code-result-text');
    const guess = parseInt(input.value);

    if (!isCodeActive) {
        resText.innerHTML = "⛔ Игра уже завершена!";
        return;
    }

    if (isNaN(guess) || guess < 1 || guess > 100) {
        resText.innerHTML = "❌ Введи число от 1 до 100!";
        return;
    }

    if (guess === secretCode) {
        resText.innerHTML = `🎉 <span style="color:#32cd32">ВЗЛОМ УСПЕШЕН!</span><br>Ты угадал число ${secretCode}!<br>Приз: 60 UC.`;
        isCodeActive = false;
        input.disabled = true;
    } else if (guess < secretCode) {
        resText.innerHTML = `📈 <span style="color:#ffcc00">Загаданное число больше.</span>`;
    } else {
        resText.innerHTML = `📉 <span style="color:#ffcc00">Загаданное число меньше.</span>`;
    }
    
    input.value = '';
}

// Инициализация магазина при загрузке
renderShop();
