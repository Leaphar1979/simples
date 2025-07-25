document.addEventListener("DOMContentLoaded", () => {
  const setupForm = document.getElementById("setup-form");
  const entrySection = document.getElementById("entry-section");
  const summarySection = document.getElementById("summary-section");
  const todaySpan = document.getElementById("today");
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const dailySummary = document.getElementById("daily-summary");
  const weeklySummary = document.getElementById("weekly-summary");
  const monthlySummary = document.getElementById("monthly-summary");

  const resetButton = document.getElementById("reset-button");

  // Reset app
  resetButton.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja resetar o aplicativo? Todos os dados serão apagados.")) {
      localStorage.clear();
      location.reload();
    }
  });

  function saveConfig(daily, startDate) {
    localStorage.setItem("dailyBudget", daily);
    localStorage.setItem("startDate", startDate);
  }

  function getTodayDateStr() {
    return new Date().toISOString().split("T")[0];
  }

  function loadConfig() {
    const daily = localStorage.getItem("dailyBudget");
    const startDate = localStorage.getItem("startDate");
    return daily && startDate ? { daily: parseFloat(daily), startDate } : null;
  }

  function saveExpenses(expenses) {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function loadExpenses() {
    const data = localStorage.getItem("expenses");
    return data ? JSON.parse(data) : [];
  }

  function renderExpenses(expenses) {
    expenseList.innerHTML = "";
    const today = getTodayDateStr();
    const todayExpenses = expenses.filter(e => e.date === today);
    todayExpenses.forEach(e => {
      const li = document.createElement("li");
      li.textContent = `${e.description}: R$ ${e.amount.toFixed(2)}`;
      expenseList.appendChild(li);
    });
  }

  function renderSummaries(expenses, dailyBudget, startDate) {
    const today = new Date(getTodayDateStr());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // segunda-feira
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const sum = (list) => list.reduce((acc, e) => acc + e.amount, 0);

    const todayExpenses = expenses.filter(e => e.date === getTodayDateStr());
    const weekExpenses = expenses.filter(e => new Date(e.date) >= weekStart);
    const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart);

    const daysSinceStart = Math.ceil((today - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const weekDays = today.getDay() === 0 ? 7 : today.getDay(); // domingo = 7
    const monthDays = today.getDate();

    dailySummary.textContent = `Hoje: R$ ${dailyBudget.toFixed(2)} - Gasto: R$ ${sum(todayExpenses).toFixed(2)} - Saldo: R$ ${(dailyBudget - sum(todayExpenses)).toFixed(2)}`;
    weeklySummary.textContent = `Semana: R$ ${(dailyBudget * weekDays).toFixed(2)} - Gasto: R$ ${sum(weekExpenses).toFixed(2)} - Saldo: R$ ${(dailyBudget * weekDays - sum(weekExpenses)).toFixed(2)}`;
    monthlySummary.textContent = `Mês: R$ ${(dailyBudget * monthDays).toFixed(2)} - Gasto: R$ ${sum(monthExpenses).toFixed(2)} - Saldo: R$ ${(dailyBudget * monthDays - sum(monthExpenses)).toFixed(2)}`;
  }

  setupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const daily = parseFloat(document.getElementById("daily-budget").value);
    const startDate = document.getElementById("start-date").value;
    saveConfig(daily, startDate);
    location.reload();
  });

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const expenses = loadExpenses();
    expenses.push({ date: getTodayDateStr(), description, amount });
    saveExpenses(expenses);
    renderExpenses(expenses);
    const { daily, startDate } = loadConfig();
    renderSummaries(expenses, daily, startDate);
    expenseForm.reset();
  });

  // Inicialização
  const config = loadConfig();
  if (config) {
    document.getElementById("setup-section").style.display = "none";
    entrySection.style.display = "block";
    summarySection.style.display = "block";
    todaySpan.textContent = getTodayDateStr();
    const expenses = loadExpenses();
    renderExpenses(expenses);
    renderSummaries(expenses, config.daily, config.startDate);
  }
});
