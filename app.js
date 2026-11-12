const tg = window.Telegram.WebApp;
tg.expand();

// Получаем баланс из URL
const urlParams = new URLSearchParams(window.location.search);
let currentBalance = parseInt(urlParams.get('balance')) || 1000;
let hackActive = urlParams.get('hack') === '1';

document.getElementById('user-balance').innerText = currentBalance;
if (hackActive) {
    document.getElementById('tab-btn-code').style.display = 'block';
}

// --- НАВИГАЦИЯ ---
function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// --- РУЛЕТКА ---
const colorMap = { 'yellow': 'Жёлтый', 'green': 'Зелёный', 'blue': 'Синий', 'purple': 'Фиолетовый', 'orange': 'Оранжевый' };
let selectedColor = null;

function selectColor(color, mult) {
    selectedColor = color;
    document.getElementById('colors-grid').style.display = 'none';
    document.getElementById('bet-area').classList.remove('hidden');
    document.getElementById('selected-color-name').innerText = colorMap[color];
}

function cancelBet() {
    selectedColor = null;
    document.getElementById('colors-grid').style.display = 'grid';
    document.getElementById('bet-area').classList.add('hidden');
}

function spin(betAmount) {
    if (betAmount > currentBalance) {
        document.getElementById('result-text').innerText = "❌ Недостаточно фишек!";
        return;
    }
    sendAction({ action: "spin", bet: betAmount, color: selectedColor });
}

function customSpin() {
    let val = prompt("Введите сумму ставки:", "100");
    if (val === null || val.trim() === "") return;
    let betAmount = parseInt(val);
    
    if (isNaN(betAmount) || betAmount <= 0) { alert("❌ Введите корректное число!"); return; }
    if (betAmount > currentBalance) {
        document.getElementById('result-text').innerText = "❌ Недостаточно фишек!";
        return;
    }
    sendAction({ action: "spin", bet: betAmount, color: selectedColor });
}

// --- МАГАЗИН ---
const shopItems = [
    { uc: 60, price: 100 }, { uc: 325, price: 500 }, { uc: 660, price: 1000 },
    { uc: 1800, price: 2500 }, { uc: 3850, price: 5000 }, { uc: 8100, price: 10000 },
    { uc: 16200, price: 20000 }, { uc: 24300, price: 30000 }, { uc: 32400, price: 40000 }, { uc: 40500, price: 50000 }
];

function renderShop() {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    shopItems.forEach(item => {
        grid.innerHTML += `
            <div class="shop-item">
                <img src="uc_icon.png" class="shop-item-img" onerror="this.src='https://via.placeholder.com/60?text=UC'">
                <div class="shop-item-title">${item.uc} UC</div>
                <div class="shop-item-price">${item.price} 🪙</div>
                <button class="buy-btn" onclick="buyItem(${item.uc}, ${item.price})">Купить</button>
            </div>
        `;
    });
}

function buyItem(uc, price) {
    if (currentBalance < price) {
        document.getElementById('shop-result-text').innerHTML = `❌ Недостаточно фишек!`;
        return;
    }
    sendAction({ action: "buy", uc: uc, price: price });
}

// --- ВЗЛОМ ---
function tryCode() {
    const input = document.getElementById('code-input');
    const guess = parseInt(input.value);
    if (isNaN(guess) || guess < 1 || guess > 10) {
        document.getElementById('code-result-text').innerHTML = "❌ Введи число от 1 до 10!";
        return;
    }
    sendAction({ action: "hack", guess: guess });
}

// --- АДМИНКА (Через prompt) ---
const ADMIN_PASS = "iD3NIbP!+^*4s)?4]0k4Z~x~~3.n9%[<OublN;NkGqo&$.TbcI";

function openAdmin() {
    let pass = prompt("Введите пароль администратора:");
    if (pass === ADMIN_PASS) {
        let action = prompt("Выберите действие:\n1. Честный режим\n2. Казино в плюсе\n3. Казино в минусе\n4. Изменить цену (Пример: 60:100)");
        
        if (action === "1") sendAction({ action: "admin_mode", mode: "fair" });
        else if (action === "2") sendAction({ action: "admin_mode", mode: "negative" });
        else if (action === "3") sendAction({ action: "admin_mode", mode: "positive" });
        else if (action === "4") {
            let priceVal = prompt("Введите формат UC:Цена (например, 60:100):");
            if (priceVal && priceVal.includes(':')) sendAction({ action: "admin_price", value: priceVal });
        }
    } else if (pass !== null) {
        alert("❌ Неверный пароль!");
    }
}

// --- ОТПРАВКА В БОТ ---
function sendAction(data) {
    if (tg && tg.initData) {
        tg.sendData(JSON.stringify(data));
    } else {
        // Тест на ПК (если не в Telegram)
        alert("Действие: " + JSON.stringify(data) + "\n(На телефоне в Telegram это закроет окно и выполнит действие)");
    }
}

renderShop();
