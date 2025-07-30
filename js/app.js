const startButton = document.getElementById("startButton");
const addExpenseButton = document.getElementById("addExpense");
const resetButton = document.getElementById("resetButton");

const startDateInput = document.getElementById("startDate");
const dailyAmountInput = document.getElementById("dailyAmount");
const expenseInput = document.getElementById("expense");
const dailyBalanceDisplay = document.getElementById("dailyBalance");
const appSection = document.getElementById("appSection");

function getTodayKey() {
  const today = new Date();
  today.setHours(today.getHours() - 3); // Ajuste UTC-3
  return today.toISOString().split("T")[0];
}

function loadSettings() {
  return {
    startDate: localStorage.getItem("startDate"),
    dailyAmount: parseFloat(localStorage.getItem("dailyAmount")) || 0,
    lastDate: localStorage.getItem("lastDate"),
    currentBalance: parseFloat(localStorage.getItem("currentBalance")) || 0
  };
}

function saveSettings(settings) {
  localStorage.setItem("startDate", settings.startDate);
  localStorage.setItem("dailyAmount", settings.dailyAmount);
  localStorage.setItem("lastDate", settings.lastDate);
  localStorage.setItem("currentBalance", settings.currentBalance);
}

function addDailyAllowance(settings) {
  const todayKey = getTodayKey();
  if (settings.lastDate !== todayKey) {
    settings.currentBalance += settings.dailyAmount;
    settings.lastDate = todayKey;
    saveSettings(settings);
  }
  return settings;
}

function updateDisplay(balance) {
  dailyBalanceDisplay.textContent = `R$ ${balance.toFixed(2)}`;
}

function initApp() {
  const settings = loadSettings();
  if (!settings.startDate || !settings.dailyAmount) return;
  addDailyAllowance(settings);
  updateDisplay(settings.currentBalance);
  appSection.classList.remove("hidden");
}

startButton.addEventListener("click", () => {
  const startDate = startDateInput.value;
  const dailyAmount = parseFloat(dailyAmountInput.value);

  if (!startDate || isNaN(dailyAmount) || dailyAmount <= 0) {
    alert("Por favor, informe uma data e um valor diário válido.");
    return;
  }

  const settings = {
    startDate,
    dailyAmount,
    lastDate: "",
    currentBalance: 0
  };
  saveSettings(settings);
  initApp();
});

addExpenseButton.addEventListener("click", () => {
  const expense = parseFloat(expenseInput.value);
  if (isNaN(expense) || expense <= 0) return;

  const settings = loadSettings();
  settings.currentBalance -= expense;
  saveSettings(settings);
  updateDisplay(settings.currentBalance);
  expenseInput.value = "";
});

resetButton.addEventListener("click", () => {
  if (confirm("Deseja realmente apagar todos os dados?")) {
    localStorage.clear();
    location.reload();
  }
});

initApp();
