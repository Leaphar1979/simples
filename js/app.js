document.addEventListener("DOMContentLoaded", () => {
  const setupSection = document.getElementById("setup-section");
  const entrySection = document.getElementById("entry-section");
  const summarySection = document.getElementById("summary-section");
  const setupForm = document.getElementById("setup-form");
  const expenseForm = document.getElementById("expense-form");
  const todaySpan = document.getElementById("today");
  const expenseList = document.getElementById("expense-list");
  const resetBtn = document.getElementById("reset-app");

  function saveConfig(daily, startDate) {
    localStorage.setItem("dailyBudget", daily);
    localStorage.setItem("startDate", startDate);
  }

  function loadConfig() {
    return {
      dailyBudget: parseFloat(localStorage.getItem("dailyBudget")),
      startDate: localStorage.getItem("startDate")
    };
  }

  function addExpense(date, description, amount) {
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.push({ date, description, amount });
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function removeExpense(index) {
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    renderSummaries();
  }

  function renderExpenses() {
    const today = new Date().toISOString().split("T")[0];
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]").filter(e => e.date === today);
    expenseList.innerHTML = "";
    expenses.forEach((e, i) => {
      const li = document.createElement("li");
      li.textContent = `${e.description}: R$ ${e.amount.toFixed(2)} `;
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.onclick = () => removeExpense(i);
      li.appendChild(delBtn);
      expenseList.appendChild(li);
    });
  }

  function renderSummaries() {
    const daily = document.getElementById("daily-summary");
    const weekly = document.getElementById("weekly-summary");
    const monthly = document.getElementById("monthly-summary");
    const { dailyBudget, startDate } = loadConfig();
    const today = new Date().toISOString().split("T")[0];
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");

    const dailyTotal = expenses
      .filter(e => e.date === today)
      .reduce((acc, e) => acc + parseFloat(e.amount), 0);
    const todayBalance = dailyBudget - dailyTotal;

    const start = new Date(startDate);
    const now = new Date(today);
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

    const weeklyStart = new Date(now);
    weeklyStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weeklyStart);
      d.setDate(weeklyStart.getDate() + i);
      return d.toISOString().split("T")[0];
    });

    const weeklyTotal = expenses
      .filter(e => weekDates.includes(e.date))
      .reduce((acc, e) => acc + parseFloat(e.amount), 0);

    const month = today.slice(0, 7);
    const monthlyTotal = expenses
      .filter(e => e.date.startsWith(month))
      .reduce((acc, e) => acc + parseFloat(e.amount), 0);

    daily.innerHTML = `<strong>Saldo do dia:</strong> R$ ${todayBalance.toFixed(2)}`;
    weekly.innerHTML = `<strong>Acumulado da semana:</strong> R$ ${(dailyBudget * 7 - weeklyTotal).toFixed(2)}`;
    monthly.innerHTML = `<strong>Restante do mês:</strong> R$ ${(dailyBudget * diffDays - monthlyTotal).toFixed(2)}`;
  }

  function updateUI() {
    const { dailyBudget, startDate } = loadConfig();
    if (dailyBudget && startDate) {
      setupSection.style.display = "none";
      entrySection.style.display = "block";
      summarySection.style.display = "block";
      todaySpan.textContent = new Date().toLocaleDateString();
      renderExpenses();
      renderSummaries();
    } else {
      setupSection.style.display = "block";
      entrySection.style.display = "none";
      summarySection.style.display = "none";
    }
  }

  setupForm.addEventListener("submit", e => {
    e.preventDefault();
    const daily = parseFloat(document.getElementById("daily-budget").value);
    const startDate = document.getElementById("start-date").value;
    saveConfig(daily, startDate);
    updateUI();
  });

  expenseForm.addEventListener("submit", e => {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = new Date().toISOString().split("T")[0];
    addExpense(date, description, amount);
    expenseForm.reset();
    renderExpenses();
    renderSummaries();
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Deseja realmente resetar todos os dados do app?")) {
      localStorage.clear();
      location.reload();
    }
  });

  updateUI();
});
