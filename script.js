const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");

const historyBtn = document.getElementById("historyBtn");
const closeHistory = document.getElementById("closeHistory");
const overlay = document.getElementById("overlay");

const clearHistoryBtn = document.getElementById("clearHistory");

const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");

const toast = document.getElementById("toast");

let currentInput = "";
let previousInput = "";
let operator = null;
let shouldResetScreen = false;


/* ================================= */
/* NUMBER FORMAT */
/* ================================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 10
    }).format(number);
}


/* ================================= */
/* UPDATE DISPLAY */
/* ================================= */

function updateDisplay() {

    expressionDisplay.textContent =
        previousInput && operator
            ? `${formatNumber(Number(previousInput))} ${getOperatorSymbol(operator)}`
            : currentInput || "0";

    resultDisplay.textContent =
        currentInput
            ? formatNumber(Number(currentInput))
            : "0";
}


/* ================================= */
/* OPERATOR SYMBOL */
/* ================================= */

function getOperatorSymbol(op) {

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[op] || op;
}


/* ================================= */
/* INPUT NUMBER */
/* ================================= */

function inputNumber(number) {

    if (shouldResetScreen) {
        currentInput = "";
        shouldResetScreen = false;
    }

    if (number === "." && currentInput.includes(".")) {
        return;
    }

    if (currentInput === "0" && number !== ".") {
        currentInput = "";
    }

    if (currentInput.length >= 15) {
        return;
    }

    currentInput += number;

    updateDisplay();
}


/* ================================= */
/* CHOOSE OPERATOR */
/* ================================= */

function chooseOperator(nextOperator) {

    if (currentInput === "" && previousInput === "") {
        return;
    }

    if (previousInput !== "" && currentInput !== "") {
        calculate(false);
    }

    previousInput = currentInput;
    operator = nextOperator;

    currentInput = "";

    updateDisplay();
}


/* ================================= */
/* CALCULATE */
/* ================================= */

function calculate(saveHistory = true) {

    if (!operator || previousInput === "" || currentInput === "") {
        return;
    }

    const first = Number(previousInput);
    const second = Number(currentInput);

    let result;

    switch (operator) {

        case "+":
            result = first + second;
            break;

        case "-":
            result = first - second;
            break;

        case "*":
            result = first * second;
            break;

        case "/":

            if (second === 0) {
                showToast("Cannot divide by zero");
                return;
            }

            result = first / second;
            break;

        default:
            return;
    }

    const expression =
        `${formatNumber(first)} ${getOperatorSymbol(operator)} ${formatNumber(second)}`;

    currentInput = String(result);

    previousInput = "";
    operator = null;

    shouldResetScreen = true;

    expressionDisplay.textContent = expression;

    resultDisplay.textContent = formatNumber(result);

    if (saveHistory) {
        addHistory(expression, result);
    }

    animateResult();
}


/* ================================= */
/* RESULT ANIMATION */
/* ================================= */

function animateResult() {

    resultDisplay.animate(
        [
            {
                transform: "scale(0.92)",
                opacity: 0.4
            },
            {
                transform: "scale(1.05)",
                opacity: 1
            },
            {
                transform: "scale(1)",
                opacity: 1
            }
        ],
        {
            duration: 300,
            easing: "cubic-bezier(.2,.8,.2,1)"
        }
    );
}


/* ================================= */
/* CLEAR */
/* ================================= */

function clearCalculator() {

    currentInput = "";
    previousInput = "";
    operator = null;

    shouldResetScreen = false;

    expressionDisplay.textContent = "0";
    resultDisplay.textContent = "0";
}


/* ================================= */
/* BACKSPACE */
/* ================================= */

function backspace() {

    if (shouldResetScreen) {
        return;
    }

    currentInput = currentInput.slice(0, -1);

    updateDisplay();
}


/* ================================= */
/* PERCENT */
/* ================================= */

function percentage() {

    if (currentInput === "") {
        return;
    }

    currentInput = String(Number(currentInput) / 100);

    updateDisplay();
}


/* ================================= */
/* SQUARE ROOT */
/* ================================= */

function squareRoot() {

    if (currentInput === "") {
        return;
    }

    const number = Number(currentInput);

    if (number < 0) {
        showToast("Invalid square root");
        return;
    }

    const expression = `√${formatNumber(number)}`;

    const result = Math.sqrt(number);

    currentInput = String(result);

    expressionDisplay.textContent = expression;
    resultDisplay.textContent = formatNumber(result);

    addHistory(expression, result);

    animateResult();

    shouldResetScreen = true;
}


/* ================================= */
/* SQUARE */
/* ================================= */

function square() {

    if (currentInput === "") {
        return;
    }

    const number = Number(currentInput);

    const expression = `${formatNumber(number)}²`;

    const result = number ** 2;

    currentInput = String(result);

    expressionDisplay.textContent = expression;
    resultDisplay.textContent = formatNumber(result);

    addHistory(expression, result);

    animateResult();

    shouldResetScreen = true;
}


/* ================================= */
/* INVERSE */
/* ================================= */

function inverse() {

    if (currentInput === "") {
        return;
    }

    const number = Number(currentInput);

    if (number === 0) {
        showToast("Cannot divide by zero");
        return;
    }

    const expression = `1 / ${formatNumber(number)}`;

    const result = 1 / number;

    currentInput = String(result);

    expressionDisplay.textContent = expression;
    resultDisplay.textContent = formatNumber(result);

    addHistory(expression, result);

    animateResult();

    shouldResetScreen = true;
}


/* ================================= */
/* POSITIVE / NEGATIVE */
/* ================================= */

function changeSign() {

    if (currentInput === "" || currentInput === "0") {
        return;
    }

    currentInput = String(Number(currentInput) * -1);

    updateDisplay();
}


/* ================================= */
/* BUTTON CLICK */
/* ================================= */

document.querySelectorAll(".btn, .small-btn").forEach(button => {

    button.addEventListener("click", function(event) {

        createRipple(this, event);

        const value = this.dataset.value;
        const action = this.dataset.action;

        if (value !== undefined) {

            if ("0123456789.".includes(value)) {
                inputNumber(value);
            }

            else if ("+-*/".includes(value)) {
                chooseOperator(value);
            }

            return;
        }


        switch (action) {

            case "clear":
                clearCalculator();
                break;

            case "backspace":
                backspace();
                break;

            case "percent":
                percentage();
                break;

            case "calculate":
                calculate();
                break;

            case "sqrt":
                squareRoot();
                break;

            case "square":
                square();
                break;

            case "inverse":
                inverse();
                break;

            case "sign":
                changeSign();
                break;
        }

    });

});


/* ================================= */
/* RIPPLE EFFECT */
/* ================================= */

function createRipple(button, event) {

    const ripple = document.createElement("span");

    ripple.classList.add("ripple");

    const rect = button.getBoundingClientRect();

    ripple.style.left =
        `${event.clientX - rect.left}px`;

    ripple.style.top =
        `${event.clientY - rect.top}px`;

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}


/* ================================= */
/* KEYBOARD SUPPORT */
/* ================================= */

document.addEventListener("keydown", event => {

    const key = event.key;

    if (
        !isNaN(key) ||
        key === "."
    ) {
        inputNumber(key);
        return;
    }

    if (
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/"
    ) {
        chooseOperator(key);
        return;
    }

    switch (key) {

        case "Enter":
        case "=":
            event.preventDefault();
            calculate();
            break;

        case "Backspace":
            backspace();
            break;

        case "Escape":
            clearCalculator();
            break;

        case "%":
            percentage();
            break;
    }

});


/* ================================= */
/* HISTORY */
/* ================================= */

let history =
    JSON.parse(localStorage.getItem("novaCalcHistory")) || [];


function addHistory(expression, result) {

    history.unshift({
        expression,
        result
    });

    history = history.slice(0, 30);

    localStorage.setItem(
        "novaCalcHistory",
        JSON.stringify(history)
    );

    renderHistory();
}


function renderHistory() {

    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div>🧮</div>
                <p>No calculations yet</p>
            </div>
        `;

        return;
    }

    historyList.innerHTML = "";

    history.forEach((item, index) => {

        const div = document.createElement("div");

        div.className = "history-item";

        div.innerHTML = `
            <div class="history-expression">
                ${escapeHTML(item.expression)}
            </div>

            <div class="history-result">
                = ${formatNumber(Number(item.result))}
            </div>
        `;

        div.addEventListener("click", () => {

            currentInput = String(item.result);

            previousInput = "";
            operator = null;

            shouldResetScreen = false;

            expressionDisplay.textContent =
                item.expression;

            resultDisplay.textContent =
                formatNumber(Number(item.result));

            closeHistoryPanel();

        });

        historyList.appendChild(div);

    });
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


clearHistoryBtn.addEventListener("click", () => {

    history = [];

    localStorage.removeItem("novaCalcHistory");

    renderHistory();

    showToast("History cleared");
});


/* ================================= */
/* HISTORY PANEL */
/* ================================= */

historyBtn.addEventListener(
    "click",
    openHistoryPanel
);

closeHistory.addEventListener(
    "click",
    closeHistoryPanel
);

overlay.addEventListener(
    "click",
    closeHistoryPanel
);


function openHistoryPanel() {

    historyPanel.classList.add("active");
    overlay.classList.add("active");

}


function closeHistoryPanel() {

    historyPanel.classList.remove("active");
    overlay.classList.remove("active");

}


/* ================================= */
/* THEME */
/* ================================= */

const savedTheme =
    localStorage.getItem("novaCalcTheme");


if (savedTheme === "light") {

    document.body.classList.add("light");

    themeIcon.textContent = "☾";
}


themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");

    const isLight =
        document.body.classList.contains("light");

    localStorage.setItem(
        "novaCalcTheme",
        isLight ? "light" : "dark"
    );

    themeIcon.textContent =
        isLight ? "☾" : "☀";

});


/* ================================= */
/* TOAST */
/* ================================= */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);
}


/* ================================= */
/* INITIALIZE */
/* ================================= */

renderHistory();
updateDisplay();