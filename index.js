const display = document.getElementById('display');
const valHex = document.getElementById('val-hex');
const valDec = document.getElementById('val-dec');
const valOct = document.getElementById('val-oct');
const valBin = document.getElementById('val-bin');

function setTheme(themeName) {
    const calc = document.getElementById('calculator');
    calc.className='';
    calc.classList.add(`theme-${themeName}`);
    localStorage.setItem('calc_theme',themeName);
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
    try {
        let result= eval(display.value);
        display.value = result;
        updateBasePanel();
    }
    catch(error)   {
        display.value = 'Error';
    }
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
    } catch(e) {

    }
}
function resetReadouts() {
    valHex.textContent='0';
    valDec.textContent='0';
    valOct.textContent='0';
    valBin.textContent='0';
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