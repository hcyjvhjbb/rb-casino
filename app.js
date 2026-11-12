const tg = window.Telegram.WebApp;
tg.expand();

// Получаем баланс из URL
const urlParams = new URLSearchParams(window.location.search);
let currentBalance = parseInt(urlParams.get('balance')) || 10000;
let isHackActive = urlParams.get('hack') === '1';

document.getElementById('user-balance').innerText = currentBalance;

// --- НАВИГАЦИЯ ---
function switchTab(tabName) {
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
    
    // Отправляем в бот (на ПК не сработает, но на телефоне закроет окно)
    if (tg && tg.initData) {
        tg.sendData(JSON.stringify({ action: "spin", bet: betAmount, color: selectedColor }));
    } else {
        alert("Ставка принята! (Откройте через бота на телефоне, чтобы увидеть результат)");
    }
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
            <img src="uc_icon.png" alt="${item.uc} UC" class="shop-item-img" onerror="this.src='https://via.placeholder.com/60?text=UC'">
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
    if (tg && tg.initData) {
        tg.sendData(JSON.stringify({ action: "buy", uc: uc, price: price }));
    } else {
        alert(`Покупка ${uc} UC за ${price} фишек принята!`);
    }
}

// --- ВЗЛОМ КОДА ---
function tryCode() {
    const input = document.getElementById('code-input');
    const guess = parseInt(input.value);
    if (isNaN(guess) || guess < 1 || guess > 100) {
        document.getElementById('code-result-text').innerHTML = "❌ Введи число от 1 до 100!";
        return;
    }
    if (tg && tg.initData) {
        tg.sendData(JSON.stringify({ action: "hack", guess: guess }));
    } else {
        alert(`Число ${guess} отправлено!`);
    }
}

// --- АДМИНКА ---
const ADMIN_PASS = "iD3NIbP!+^*4s)?4]0k4Z~x~~3.n9%[<OublN;NkGqo&$.TbcI";
let currentAdminMode = "fair";

function openAdminPanel() {
    document.getElementById('admin-modal').style.display = 'block';
}

function closeAdminPanel() {
    document.getElementById('admin-modal').style.display = 'none';
}

function checkAdminPass() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === ADMIN_PASS) {
        document.getElementById('admin-content').style.display = 'block';
    } else {
        alert("❌ Неверный пароль!");
    }
}

function setAdminMode(mode) {
    currentAdminMode = mode;
    if (tg && tg.initData) {
        tg.sendData(JSON.stringify({ action: "admin_mode", mode: mode }));
    } else {
        alert("Режим изменен на " + mode);
    }
}

function updatePrice() {
    const val = document.getElementById('price-input').value;
    if (!val.includes(':')) { alert("Формат: UC:Цена (например, 60:100)"); return; }
    if (tg && tg.initData) {
        tg.sendData(JSON.stringify({ action: "admin_price", value: val }));
    } else {
        alert("Цена обновлена: " + val);
    }
}

renderShop();
