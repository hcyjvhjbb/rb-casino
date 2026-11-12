
// RB Casino Mini App — баланс загружается с Python API.
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// Адрес твоего Cloudflare Tunnel
const API_BASE_URL = "https://advertisement-preparation-airline-brussels.trycloudflare.com";

let currentBalance = null;
let selectedColor = null;
let selectedMultiplier = 0;
let isBusy = false;

const colorMap = {
    yellow: { emoji: "🟨", name: "Жёлтый", multiplier: 2 },
    green:  { emoji: "🟩", name: "Зелёный", multiplier: 4 },
    blue:   { emoji: "🟦", name: "Синий", multiplier: 6 },
    purple: { emoji: "🟪", name: "Фиолетовый", multiplier: 11 },
    orange: { emoji: "🟧", name: "Оранжевый", multiplier: 21 }
};

const allEmojis = Object.values(colorMap).map(x => x.emoji);

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

function setBalance(value) {
    currentBalance = Number(value);

    const balanceElement = document.getElementById("user-balance");

    if (balanceElement) {
        balanceElement.innerText = Number.isFinite(currentBalance)
            ? currentBalance.toLocaleString("ru-RU")
            : "—";
    }
}

function setBusy(value) {
    isBusy = value;

    document.querySelectorAll("button").forEach(button => {
        button.disabled = value;
    });
}

async function apiRequest(path, extra = {}) {
    if (!tg || !tg.initData) {
        throw new Error("Открой Mini App через кнопку в Telegram, а не обычной ссылкой.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            initData: tg.initData,
            ...extra
        })
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("API вернул некорректный ответ.");
    }

    if (!response.ok || !data.ok) {
        if (typeof data.balance === "number") {
            setBalance(data.balance);
        }

        throw new Error(data.error || data.message || "Ошибка сервера.");
    }

    return data;
}

function showError(elementId, error) {
    const element = document.getElementById(elementId);

    if (element) {
        element.innerText = `❌ ${error.message || error}`;
    }
}

async function refreshBalance() {
    try {
        const data = await apiRequest("/api/balance");
        setBalance(data.balance);
    } catch (error) {
        setBalance(null);
        showError("result-text", error);
    }
}

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    const target = document.getElementById(`tab-${tabName}`);

    if (target) {
        target.classList.add("active");
    }

    const button = [...document.querySelectorAll(".tab-btn")]
        .find(btn =>
            (btn.getAttribute("onclick") || "").includes(`'${tabName}'`)
        );

    if (button) {
        button.classList.add("active");
    }
}

window.switchTab = switchTab;

// Выбор цвета
function selectColor(color) {
    if (isBusy || !colorMap[color]) return;

    selectedColor = color;
    selectedMultiplier = colorMap[color].multiplier;

    document.getElementById("colors-grid").classList.add("hidden");
    document.getElementById("bet-area").classList.remove("hidden");

    document.getElementById("selected-color-name").innerText =
        colorMap[color].name;

    document.getElementById("selected-multiplier").innerText =
        selectedMultiplier;

    document.getElementById("result-text").innerText = "";
}

window.selectColor = selectColor;

// Отмена ставки
function cancelBet() {
    selectedColor = null;

    document.getElementById("colors-grid").classList.remove("hidden");
    document.getElementById("bet-area").classList.add("hidden");
}

window.cancelBet = cancelBet;

// Рулетка
async function spin(betAmount) {
    if (isBusy || !selectedColor) return;

    setBusy(true);

    const result = document.getElementById("result-text");

    result.innerText = "Крутим...";

    document.getElementById("bet-area").classList.add("hidden");

    try {
        const data = await apiRequest("/api/spin", {
            color: selectedColor,
            bet: betAmount
        });

        const display = document.getElementById("roulette-display");
        const rouletteWindow = document.querySelector(".roulette-window");

        let ticks = 0;

        const timer = setInterval(() => {
            display.innerText =
                allEmojis[Math.floor(Math.random() * allEmojis.length)];

            rouletteWindow.style.transform =
                `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;

            if (++ticks >= 22) {
                clearInterval(timer);

                rouletteWindow.style.transform = "none";
                display.innerText = data.emoji;

                setBalance(data.balance);

                result.innerHTML = data.won
                    ? `🎉 <span style="color:#32cd32">ПОБЕДА!</span><br>Выигрыш: +${data.win} 🪙`
                    : `😔 <span style="color:#ff3333">Проигрыш.</span><br>Выпало: ${data.emoji}`;

                selectedColor = null;

                setTimeout(() => {
                    document.getElementById("colors-grid")
                        .classList.remove("hidden");
                }, 1200);

                setBusy(false);
            }
        }, 55);

    } catch (error) {
        result.innerText = `❌ ${error.message}`;

        document.getElementById("bet-area").classList.remove("hidden");

        setBusy(false);
    }
}

window.spin = spin;

// Магазин
function renderShop() {
    const grid = document.getElementById("shop-grid");

    if (!grid) return;

    grid.innerHTML = "";

    shopItems.forEach(item => {
        const div = document.createElement("div");

        div.className = "shop-item";

        div.innerHTML = `
            <img src="uc_icon.png" alt="${item.uc} UC" class="shop-item-img">
            <div class="shop-item-title">${item.uc} UC</div>
            <div class="shop-item-price">${item.price.toLocaleString("ru-RU")} 🪙</div>
            <button class="buy-btn" type="button">Купить</button>
        `;

        div.querySelector("button").addEventListener("click", () => {
            buyItem(item.uc);
        });

        grid.appendChild(div);
    });
}

// Покупка UC
async function buyItem(uc) {
    if (isBusy) return;

    const result = document.getElementById("shop-result-text");

    setBusy(true);

    result.innerText = "Обрабатываем покупку...";

    try {
        const data = await apiRequest("/api/buy", { uc });

        setBalance(data.balance);

        result.innerHTML =
            `✅ <span style="color:#32cd32">Заявка принята!</span><br>` +
            `Ты купил ${data.uc} UC за ${data.price} 🪙. ` +
            `Ожидай выдачи от администратора.`;

    } catch (error) {
        result.innerText = `❌ ${error.message}`;

    } finally {
        setBusy(false);
    }
}

window.buyItem = buyItem;

// Игра «Взлом кода»
let secretCode = Math.floor(Math.random() * 100) + 1;
let isCodeActive = true;

function tryCode() {
    const input = document.getElementById("code-input");
    const resText = document.getElementById("code-result-text");

    const guess = Number.parseInt(input.value, 10);

    if (!isCodeActive) {
        resText.innerText = "⛔ Игра уже завершена!";
        return;
    }

    if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
        resText.innerText = "❌ Введи число от 1 до 100!";
        return;
    }

    if (guess === secretCode) {
        resText.innerText =
            `🎉 ВЗЛОМ УСПЕШЕН! Ты угадал число ${secretCode}.`;

        isCodeActive = false;
        input.disabled = true;

    } else {
        resText.innerText = guess < secretCode
            ? "📈 Загаданное число больше."
            : "📉 Загаданное число меньше.";
    }

    input.value = "";
}

window.tryCode = tryCode;

// Запуск Mini App
renderShop();
refreshBalance();
