document.addEventListener("DOMContentLoaded", () => {
  const setupSection = document.getElementById("setup-section");
  const entrySection = document.getElementById("entry-section");
  const summarySection = document.getElementById("summary-section");
  const todaySpan = document.getElementById("today");
  const setupForm = document.getElementById("setup-form");
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const dailySummary = document.getElementById("daily-summary");
  const weeklySummary = document.getElementById("weekly-summary");
  const monthlySummary = document.getElementById("monthly-summary");
  const resetButton = document.getElementById("reset-button");

  const getToday = () => new Date().toISOString().split("T")[0];

  const loadConfig = () => {
    const dailyBudget = localStorage.getItem("dailyBudget");
    const startDate = localStorage.getItem("startDate");
    return dailyBudget && startDate ? { dailyBudget: parseFloat(dailyBudget), startDate } : null;
  };

  const saveConfig = (dailyBudget, startDate) => {
    localStorage.setItem("dailyBudget", dailyBudget);
    localStorage.setItem("startDate", startDate);
  };

  const saveExpenses = (date, expenses) => {
    localStorage.setItem(`expenses-${date}`, JSON.stringify(expenses));
  };

  const loadExpenses = (date) => {
    return JSON.parse(localStorage.getItem(`expenses-${date}`)) || [];
  };

  const renderExpenses = (date) => {
    const expenses = loadExpenses(date);
    expenseList.innerHTML = "";
    expenses.forEach((e, i) => {
      const li = document.createElement("li");
      li.textContent = `${e.description}: R$ ${e.amount.toFixed(2)}`;
      const del = document.createElement("button");
      del.textContent = "❌";
      del.onclick = () => {
        expenses.splice(i, 1);
        saveExpenses(date, expenses);
        renderExpenses(date);
        updateSummaries();
      };
      li.appendChild(del);
      expenseList.appendChild(li);
    });
  };

  const updateSummaries = () => {
    const config = loadConfig();
    const today = getToday();
    const expensesToday = loadExpenses(today);
    const spentToday = expensesToday.reduce((sum, e) => sum + e.amount, 0);
    dailySummary.textContent = `Saldo do dia: R$ ${(config.dailyBudget - spentToday).toFixed(2)}`;

    // Weekly
    const todayDate = new Date(today);
    const start = new Date(todayDate);
    const diffToMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
    let weekSpent = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split("T")[0];
      const dayExpenses = loadExpenses(dStr);
      weekSpent += dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    }
    const weeklyTotal = config.dailyBudget * 7;
    weeklySummary.textContent = `Saldo da semana: R$ ${(weeklyTotal - weekSpent).toFixed(2)}`;

    // Monthly
    const [year, month] = today.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();
    let monthSpent = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${month.padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayExpenses = loadExpenses(dStr);
      monthSpent += dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    }
    const monthlyTotal = config.dailyBudget * daysInMonth;
    monthlySummary.textContent = `Saldo do mês: R$ ${(monthlyTotal - monthSpent).toFixed(2)}`;
  };

  const startApp = () => {
    const config = loadConfig();
    if (!config) return;
    setupSection.style.display = "none";
    entrySection.style.display = "block";
    summarySection.style.display = "block";
    todaySpan.textContent = getToday();
    renderExpenses(getToday());
    updateSummaries();
  };

  const config = loadConfig();
  if (config) {
    startApp();
  } else {
    setupSection.style.display = "block";
  }

  setupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const dailyBudget = parseFloat(document.getElementById("daily-budget").value);
    const startDate = document.getElementById("start-date").value;
    if (dailyBudget > 0 && startDate) {
      saveConfig(dailyBudget, startDate);
      startApp();
    }
  });

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    if (description && amount > 0) {
      const today = getToday();
      const expenses = loadExpenses(today);
      expenses.push({ description, amount });
      saveExpenses(today, expenses);
      renderExpenses(today);
      updateSummaries();
      expenseForm.reset();
    }
  });

  resetButton.addEventListener("click", () => {
    if (confirm("Deseja realmente resetar o app?")) {
      localStorage.clear();
      location.reload();
    }
  });
});
