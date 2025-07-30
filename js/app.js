document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "saboyaAppData";

  const startButton = document.getElementById("startButton");
  const resetButton = document.getElementById("resetButton");
  const addExpenseButton = document.getElementById("addExpense");

  const startDateInput = document.getElementById("startDate");
  const dailyAmountInput = document.getElementById("dailyAmount");
  const expenseInput = document.getElementById("expense");
  const dailyBalanceDisplay = document.getElementById("dailyBalance");

  const setupSection = document.getElementById("setup");
  const appSection = document.getElementById("appSection");

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    });
  }

  function getTodayDate() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 3); // Ajuste UTC-3
    return now.toISOString().split("T")[0];
  }

  function loadAppData() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return data || null;
  }

  function saveAppData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function resetApp() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  function calculateTodayBalance(appData) {
    const today = getTodayDate();
    const startDate = new Date(appData.startDate);
    const currentDate = new Date(today);
    const daysElapsed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    const totalCredit = appData.dailyAmount * (daysElapsed + 1);

    const totalSpent = appData.expenses.reduce((sum, e) => sum + e.amount, 0);
    return totalCredit - totalSpent;
  }

  function updateBalanceDisplay(appData) {
    const balance = calculateTodayBalance(appData);
    dailyBalanceDisplay.textContent = formatCurrency(balance);
  }

  function initApp(appData) {
    setupSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    updateBalanceDisplay(appData);
  }

  startButton.addEventListener("click", () => {
    const startDate = startDateInput.value;
    const dailyAmount = parseFloat(dailyAmountInput.value);

    if (!startDate || isNaN(dailyAmount) || dailyAmount <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const appData = {
      startDate,
      dailyAmount,
      expenses: []
    };

    saveAppData(appData);
    initApp(appData);
  });

  addExpenseButton.addEventListener("click", () => {
    const appData = loadAppData();
    const amount = parseFloat(expenseInput.value);
    if (isNaN(amount) || amount <= 0) return;

    const today = getTodayDate();
    appData.expenses.push({ date: today, amount });
    saveAppData(appData);
    expenseInput.value = "";
    updateBalanceDisplay(appData);
  });

  resetButton.addEventListener("click", resetApp);

  const existingData = loadAppData();
  if (existingData) {
    initApp(existingData);
  }
});
