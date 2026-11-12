const tg = window.Telegram.WebApp;
tg.expand();

// --- 1. СИНХРОНИЗАЦИЯ БАЛАНСА ---
// Бот передаст баланс при открытии
let currentBalance = parseInt(tg.initDataUnsafe?.user ? 1000 : 0); 
// Для теста ставим 1000, в реале бот будет присылать реальный
// (пока что мы просто показываем заглушку, но данные уйдут в бот)
document.getElementById('user-balance').innerText = "Синх..."; 
setTimeout(() => { document.getElementById('user-balance').innerText = "1000"; }, 500);

// --- 2. ЛОГИКА РУЛЕТКИ ---
const colorsData = {
    'yellow': { name: 'Жёлтый', mult: 2, angle: 0 }, // Углы для остановки
    'green':  { name: 'Зелёный', mult: 4, angle: 72 },
    'blue':   { name: 'Синий', mult: 6, angle: 144 },
    'purple': { name: 'Фиолетовый', mult: 11, angle: 216 },
    'orange': { name: 'Оранжевый', mult: 21, angle: 288 }
};

let selectedColor = null;
let selectedMult = 0;
let isSpinning = false;
let currentRotation = 0;

function selectColor(color, mult) {
    if (isSpinning) return;
    selectedColor = color;
    selectedMult = mult;
    document.getElementById('colors-panel').classList.add('hidden');
    document.getElementById('bet-area').classList.remove('hidden');
    document.getElementById('selected-color-name').innerText = colorsData[color].name;
    document.getElementById('selected-multiplier').innerText = mult;
    document.getElementById('result-text').innerText = "";
}

function cancelBet() {
    selectedColor = null;
    document.getElementById('colors-panel').classList.remove('hidden');
    document.getElementById('bet-area').classList.add('hidden');
}

function spin(betAmount) {
    executeSpin(betAmount);
}

function spinCustom() {
    const val = parseInt(document.getElementById('custom-bet').value);
    if (isNaN(val) || val < 10) {
        document.getElementById('result-text').innerText = "❌ Мин. ставка 10 🪙";
        return;
    }
    executeSpin(val);
}

function executeSpin(betAmount) {
    if (isSpinning) return;
    // Проверка баланса (условная, реальная проверка будет в боте)
    if (betAmount > 1000) { 
        document.getElementById('result-text').innerText = "❌ Недостаточно фишек!";
        return;
    }

    isSpinning = true;
    document.getElementById('result-text').innerText = "Крутим...";
    document.getElementById('bet-area').classList.add('hidden');

    // Генерируем результат по шансам
    const rand = Math.random() * 100;
    let winColorKey = 'yellow';
    if (rand < 48) winColorKey = 'yellow';
    else if (rand < 72) winColorKey = 'green'; // 48 + 24
    else if (rand < 88) winColorKey = 'blue';  // 72 + 16
    else if (rand < 96) winColorKey = 'purple';// 88 + 8
    else winColorKey = 'orange';               // 96 + 4

    const targetAngle = colorsData[winColorKey].angle;
    // Крутим минимум 5 полных оборотов (1800 градусов) + нужный угол
    const spins = 5; 
    const finalRotation = currentRotation + (spins * 360) + (targetAngle - (currentRotation % 360));
    
    currentRotation = finalRotation;
    const wheel = document.getElementById('wheel-img');
    
    // Запускаем CSS анимацию
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // Ждем окончания анимации (4 секунды в CSS)
    setTimeout(() => {
        finishSpin(winColorKey, betAmount);
    }, 4100);
}

function finishSpin(winColorKey, betAmount) {
    isSpinning = false;
    const won = winColorKey === selectedColor;
    
    let resultMsg = "";
    if (won) {
        const winAmount = betAmount * selectedMult;
        resultMsg = `🎉 ПОБЕДА! Выигрыш: +${winAmount} 🪙`;
    } else {
        resultMsg = `😔 Проигрыш. Выпало: ${colorsData[winColorKey].name}`;
    }
    
    document.getElementById('result-text').innerHTML = resultMsg;

    // ОТПРАВЛЯЕМ ДАННЫЕ В БОТА
    // Бот закроет окно и выдаст результат в чате
    tg.sendData(JSON.stringify({
        action: "spin",
        bet: betAmount,
        color: selectedColor,
        result_color: winColorKey
    }));
    
    // Возвращаем меню через 2 секунды (если бот не закроет сам)
    setTimeout(() => {
        document.getElementById('colors-panel').classList.remove('hidden');
        selectedColor = null;
    }, 2000);
}
