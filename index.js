const display = document.getElementById('display');
const valHex = document.getElementById('val-hex');
const valDec = document.getElementById('val-dec');
const valOct = document.getElementById('val-oct');
const valBin = document.getElementById('val-bin');
const historyList = document.getElementById('history-list');
const bitGrid = document.getElementById('bit-grid');
function evaluateExpression(rawExpr) {
    let cleanExpr = rawExpr.trim();
    if (!cleanExpr) return null;
    let parsedExpr = cleanExpr.replace(/\b(?!0x)[0-9A-F]*[A-F][0-9A-F]*\b/gi, '0x$&');
    return eval(parsedExpr);
}
function setTheme(themeName) {
    const calc = document.getElementById('calculator');
    calc.className = '';
    calc.classList.add(`theme-${themeName}`);
    localStorage.setItem('calc_theme', themeName);
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        const isCurrent = btn.getAttribute('onclick')?.includes(`'${themeName}'`);
        btn.classList.toggle('active-theme', Boolean(isCurrent));
    });
}
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('calc_theme') || 'default';
    setTheme(savedTheme);
    initBitGrid();
    loadHistory();
});
function initBitGrid() {
    bitGrid.innerHTML = '';
    for (let i = 31; i >= 0; i--) {
        const bitBox = document.createElement('div');
        bitBox.className = 'bit-box';
        bitBox.dataset.bit = i;
        bitBox.title = `Bit ${i}`;
        bitBox.textContent = '0';
        bitBox.onclick = () => {
            toggleBit(i);
        };
        bitGrid.appendChild(bitBox);
    }
}
function toggleBit(bitIndex) {
    try {
        let currentVal = display.value.trim();
        let num = currentVal ? Number(evaluateExpression(currentVal)) : 0;
        if (isNaN(num) || !isFinite(num)) { num = 0; }
        let intVal = ((Math.trunc(num) >>> 0) ^ (1 << bitIndex)) >>> 0;
        display.value = intVal.toString();
        updateBasePanel();
    } catch (e) {
        display.value = ((1 << bitIndex) >>> 0).toString();
        updateBasePanel();
    }
}
function updateBitGrid(numericValue) {
    let unsignedVal = Math.trunc(numericValue) >>> 0;
    const boxes = bitGrid.querySelectorAll('.bit-box');
    boxes.forEach(box => {
        let bitIndex = parseInt(box.dataset.bit);
        let isSet = (unsignedVal & (1 << bitIndex)) !== 0;
        if (isSet) {
            box.classList.add('active');
            box.textContent = '1';
        } else {
            box.classList.remove('active');
            box.textContent = '0';
        }
    });
}
function appendToDisplay(input) {
    if (display.value === 'Error') {
        display.value = '';
    }
    display.value += input;
    updateBasePanel();
}
function clearDisplay() {
    display.value = '';
    updateBasePanel();
}
function calculate() {
    try {
        let expression = display.value.trim();
        if (!expression) return;
        let result = evaluateExpression(expression);
        if (result !== undefined && !isNaN(result) && isFinite(result)) {
            let formattedResult = Number.isInteger(result) ? result : Number(result.toFixed(6));
            saveToHistory(expression, formattedResult);
            display.value = formattedResult;
            updateBasePanel();
        } else {
            display.value = 'Error';
        }
    } catch (error) {
        display.value = 'Error';
    }
}
function saveToHistory(expr, res) {
    let history = JSON.parse(localStorage.getItem('calc_history')) || [];
    history.unshift({ expr: expr, res: res });
    if (history.length > 30) history.pop();
    localStorage.setItem('calc_history', JSON.stringify(history));
    renderHistory();
}
function loadHistory() {
    renderHistory();
}
function renderHistory() {
    let history = JSON.parse(localStorage.getItem('calc_history')) || [];
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">NO DATA IN MEMORY</div>';
        return;
    }
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${item.expr}</span> <strong>= ${item.res}</strong>`;
        div.onclick = () => {
            display.value = item.res;
            updateBasePanel();
        };
        historyList.appendChild(div);
    });
}
function clearHistory() {
    localStorage.removeItem('calc_history');
    renderHistory();
}
function updateBasePanel() {
    try {
        let currentVal = display.value.trim();
        if (!currentVal || currentVal === 'Error') {
            resetReadouts();
            return;
        }
        let numericValue = Number(evaluateExpression(currentVal));
        if (isNaN(numericValue) || !isFinite(numericValue)) {
            resetReadouts();
            return;
        }
        let intVal = Math.trunc(numericValue);
        let unsignedVal = intVal >>> 0;
        valHex.textContent = unsignedVal.toString(16).toUpperCase();
        valDec.textContent = intVal.toString(10);
        valOct.textContent = unsignedVal.toString(8);
        valBin.textContent = unsignedVal.toString(2);
        updateBitGrid(unsignedVal);
        updateByteInspector(unsignedVal);
    } catch (e) {
    }
}
function resetReadouts() {
    valHex.textContent = '0';
    valDec.textContent = '0';
    valOct.textContent = '0';
    valBin.textContent = '0';
    updateBitGrid(0);
    updateByteInspector(0);
}