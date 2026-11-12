const tg = window.Telegram.WebApp;
tg.expand();

// Получаем баланс из ссылки, которую сгенерировал бот
const urlParams = new URLSearchParams(window.location.search);
let currentBalance = parseInt(urlParams.get('balance')) || 0;

// Отображаем баланс
document.getElementById('user-balance').innerText = currentBalance;

// --- НАВИГАЦИЯ ---
function switchTab(event, tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
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
    
    // Отправляем данные в бот и ЗАКРЫВАЕМ Mini App
    // Бот пришлет результат в чат
    tg.sendData(JSON.stringify({
        action: "spin",
        bet: betAmount,
        color: selectedColor
    }));
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
    if (currentBalance < price) {
        document.getElementById('shop-result-text').innerHTML = `❌ Недостаточно фишек!`;
        return;
    }
    // Отправляем данные в бот для покупки
    tg.sendData(JSON.stringify({
        action: "buy",
        uc: uc,
        price: price
    }));
}

// --- ВЗЛОМ КОДА ---
function tryCode() {
    const guess = parseInt(document.getElementById('code-input').value);
    if (isNaN(guess) || guess < 1 || guess > 100) {
        document.getElementById('code-result-text').innerHTML = "❌ Введи число от 1 до 100!";
        return;
    }
    // Отправляем догадку в бот
    tg.sendData(JSON.stringify({
        action: "hack",
        guess: guess
    }));
}

renderShop();
