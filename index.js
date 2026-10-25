const display = document.getElementById('display');
const valHex = document.getElementById('val-hex');
const valDec = document.getElementById('val-dec');
const valOct = document.getElementById('val-oct');
const valBin = document.getElementById('val-bin');
const historyList = document.getElementById('history-list');
const bitGrid = document.getElementById('bit-grid');

function setTheme(themeName) {
    const calc = document.getElementById('calculator');
    calc.className='';
    calc.classList.add(`theme-${themeName}`);
    localStorage.setItem('calc_theme',themeName);
}
window.addEventListener(`DOMContentLoaded`, () => {
    const savedTheme = localStorage.getItem(`calc_theme`) || 'default';
    setTheme(savedTheme);
    initBitGrid();
    loadHistory();
});
function initBitGrid(){
    bitGrid.innerHTML = '';
    for(let i = 31 ; i >= 0 ; i--) {
        const bitBox = document.createElement('div');
        bitBox.className = 'bit-box';
        bitBox.dataset.bit = i;
        bitBox.textContent = '0';
        bitBox.onclick = () => {
            toggleBit(i);
        };
        bitGrid.appendChild(bitBox);
    }
}
function toggleBit(bitIndex) {
    try{
        let currentVal= display.value.trim();
        let num = currentVal ? Number(eval(currentVal)) : 0 ;
        if (isNaN(num) || !isFinite(num)) { num = 0; }
        let intVal = Math.trunc(num) >>> 0;
        intVal ^= (1<<bitIndex);
        display.value = intVal.toString();
        updateBasePanel();
    } catch(e){
        display.value = (1<<bitIndex).toString();
        updateBasePanel();
    }
}
function updateBitGrid(numericValue) {
    let unsignedVal = Math.trunc(numericValue) >>> 0;
    const boxes = bitGrid.querySelectorAll('.bit-box');
    boxes.forEach(box => {
        let bitIndex = parseInt(box.dataset.bit);
        let isSet = (unsignedVal &(1 <<bitIndex)) !== 0 ;
        if (isSet){
            box.classList.add('active');
            box.textContent= '1';
        } 
         else {
            box.classList.remove('active');
            box.textContent='0';
         }
    });
}


function appendToDisplay(input) {
    display.value += input;
    updateBasePanel();

}

function clearDisplay() {
    display.value = '';
    updateBasePanel();
}
 
function calculate() {
    try{
        let expression = display.value;
        let result = eval(expression);
        if (result !== undefined && !isNaN(result) && isFinite(result)) {
            saveToHistory(expression,result);
        }
        display.value = result;
        updateBasePanel();
    }
    catch(error){
        display.value = "Error";
    }
}
function saveToHistory(expr , res){
    let history= JSON.parse(localStorage.getItem('calc_history')) || [];
    history.unshift ({ expr: expr , res:res})
    if(history.length > 30)history.pop();
    localStorage.setItem('calc_history',JSON.stringify(history));
    renderHistory();
}
function loadHistory(){
    renderHistory();
}
function renderHistory(){
    let history = JSON.parse(localStorage.getItem('calc_history')) || [];
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<div style= "font-size:11px; color: #555; text-align: center; padding: 4px;">No calculations yet</div>';
        return;
    }
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${item.expr}</span> <strong>=${item.res}</strong>`;
        div.onclick = () => {
            display.value = item.res;
            updateBasePanel();
        };
        historyList.appendChild(div);
    });
}
function clearHistory(){
    localStorage.removeItem('calc_history');
    renderHistory();
}
function updateBasePanel() {
    try {
        let currentVal=display.value.trim();
        if(!currentVal) {
            resetReadouts();
            return;
        }
        let numericValue = Number(eval(currentVal));
        if(isNaN(numericValue) || !isFinite(numericValue)){
            resetReadouts();
            return;
        }
        let intVal = Math.trunc(numericValue)
        valHex.textContent=intVal.toString(16).toUpperCase();
        valDec.textContent=intVal.toString(10);
        valBin.textContent=intVal.toString(2);
        valOct.textContent=intVal.toString(8);
        updateBitGrid(intVal);
        updateByteInspector(intVal);
    } catch(e) {

    }
}
function resetReadouts() {
    valHex.textContent='0';
    valDec.textContent='0';
    valOct.textContent='0';
    valBin.textContent='0';
    updateBitGrid(0);
}
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/^[0-9a-fA-F]$/.test(key)) {
        appendToDisplay(key.toUpperCase());
    }
    else if (['+','-','*','/','&','|','^'].includes(key)) {
        appendToDisplay(key);
    }
    else if (key === '.'){
        appendToDisplay('.');
    }
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    else if (key === 'Backspace') {
        display.value = display.value.slice(0,-1);
        updateBasePanel();
    }
    else if (key === 'Escape') {
        clearDisplay();
    }
});
function updateByteInspector(decimalValue){
    let int32 = parseInt(decimalValue) || 0;
    let bytes = [
        (int32 >>> 24) & 0xFF,
        (int32 >>> 16) & 0xFF,
        (int32 >>> 8) & 0xFF,
        int32 & 0xFF
    ];
    for(let i = 0; i<4;i++){
        let b = bytes[3 - i]
        let hex = b.toString(16).toUpperCase().padStart(2,'0');
        let asciiChar = (b >= 32 && b <= 126) ? String.fromCharCode(b):'.';
        let span = document.getElementById(`byte-${3-i}`);
        if (span) {
            span.textContent= `0x${hex} (${b}) [${asciiChar}]`;
        }
    }
}