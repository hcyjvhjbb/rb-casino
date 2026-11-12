// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран

// Переменные игры
let currentBalance = 0;
let selectedColor = null;
let selectedMultiplier = 0;
let isSpinning = false;

// Эмуляция баланса (в реальном приложении он будет приходить с сервера)
// Мы дадим стартовые 1000 фишек для теста
currentBalance = 1000; 
document.getElementById('user-balance').innerText = currentBalance;

const colorMap = {
    'yellow': { emoji: '🟨', name: 'Жёлтый' },
    'green':  { emoji: '🟩', name: 'Зелёный' },
    'blue':   { emoji: '🟦', name: 'Синий' },
    'purple': { emoji: '🟪', name: 'Фиолетовый' },
    'orange': { emoji: '🟧', name: 'Оранжевый' }
};

const allEmojis = ['🟨', '🟩', '🟦', '🟪', '🟧'];

// Выбор цвета
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

// Отмена ставки
function cancelBet() {
    selectedColor = null;
    document.getElementById('colors-grid').classList.remove('hidden');
    document.getElementById('bet-area').classList.add('hidden');
}

// Сама крутка
function spin(betAmount) {
    if (isSpinning) return;
    if (betAmount > currentBalance) {
        document.getElementById('result-text').innerText = "❌ Недостаточно фишек!";
        return;
    }

    isSpinning = true;
    
    // Списываем ставку
    currentBalance -= betAmount;
    document.getElementById('user-balance').innerText = currentBalance;
    document.getElementById('result-text').innerText = "Крутим...";
    document.getElementById('bet-area').classList.add('hidden');

    const display = document.getElementById('roulette-display');
    const rouletteWindow = document.querySelector('.roulette-window');
    
    // Анимация (быстрое переключение эмодзи)
    let spins = 0;
    const maxSpins = 30;
    const spinInterval = setInterval(() => {
        display.innerText = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        // Тряска окна
        rouletteWindow.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
        spins++;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            rouletteWindow.style.transform = 'none';
            finishSpin(betAmount);
        }
    }, 50);
}

// Завершение игры
function finishSpin(betAmount) {
    // Генерируем результат (в реальном приложении это придет с сервера)
    // Пока для теста: случайный цвет
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

    // Возвращаем кнопки выбора цвета через 2 секунды
    setTimeout(() => {
        document.getElementById('colors-grid').classList.remove('hidden');
        selectedColor = null;
    }, 2000);
    
    // Отправка данных боту (для будущей интеграции)
    // tg.sendData(JSON.stringify({ action: 'spin', bet: betAmount, result: winColor }));
}