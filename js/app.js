document.addEventListener("DOMContentLoaded", () => {
  const setupSection = document.getElementById("setup-section");
  const entrySection = document.getElementById("entry-section");
  const summarySection = document.getElementById("summary-section");
  const setupForm = document.getElementById("setup-form");
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const resetButton = document.getElementById("reset-button");
  const todaySpan = document.getElementById("today");
  const dailySummary = document.getElementById("daily-summary");
  const weeklySummary = document.getElementById("weekly-summary");
  const monthlySummary = document.getElementById("monthly-summary");

  // Função para salvar no localStorage
  const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const getData = (key, fallback) => JSON.parse(localStorage.getItem(key)) || fallback;

  const formatDate = (date) => date.toISOString().split("T")[0];
  const todayStr = formatDate(new Date());

  function loadSetup() {
    const config = getData("config", null);
    if (!config) {
      setupSection.style.display = "block";
      entrySection.style.display = "none";
      summarySection.style.display = "none";
      resetButton.style.display = "none";
      return;
    }

    setupSection.style.display = "none";
    entrySection.style.display = "block";
    summarySection.style.display = "block";
    resetButton.style.display = "block";
    todaySpan.textContent = todayStr;

    loadExpenses();
    updateSummaries();
  }

  setupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const dailyBudget = parseFloat(document.getElementById("daily-budget").value);
    const startDate = document.getElementById("start-date").value;

    if (isNaN(dailyBudget) || !startDate) return;

    saveData("config", { dailyBudget, startDate });
    saveData("expenses", {});
    loadSetup();
  });

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    if (!description || isNaN(amount)) return;

    const expenses = getData("expenses", {});
    if (!expenses[todayStr]) expenses[todayStr] = [];

    expenses[todayStr].push({ description, amount });
    saveData("expenses", expenses);

    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    loadExpenses();
    updateSummaries();
  });

  resetButton.addEventListener("click", () => {
    if (confirm("Deseja resetar o app e apagar todos os dados?")) {
      localStorage.clear();
      location.reload();
    }
  });

  function loadExpenses() {
    const expenses = getData("expenses", {});
    expenseList.innerHTML = "";

    (expenses[todayStr] || []).forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `${item.description} - R$ ${item.amount.toFixed(2)}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.style.marginLeft = "1rem";
      delBtn.addEventListener("click", () => {
        expenses[todayStr].splice(index, 1);
        saveData("expenses", expenses);
        loadExpenses();
        updateSummaries();
      });

      li.appendChild(delBtn);
      expenseList.appendChild(li);
    });
  }

  function updateSummaries() {
    const config = getData("config", {});
    const expenses = getData("expenses", {});
    const dailyBudget = config.dailyBudget || 0;
    const startDate = new Date(config.startDate);
    const today = new Date(todayStr);

    // Saldos
    const diasDesdeInicio = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalDisponivel = diasDesdeInicio * dailyBudget;

    // Cálculo dos gastos totais até hoje
    let totalGasto = 0;
    let gastoHoje = 0;
    let gastoSemana = 0;
    const dayOfWeek = today.getDay(); // 0 = Domingo

    Object.entries(expenses).forEach(([dateStr, items]) => {
      const date = new Date(dateStr);
      const totalDia = items.reduce((sum, i) => sum + i.amount, 0);
      totalGasto += totalDia;

      if (dateStr === todayStr) gastoHoje += totalDia;

      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      if (diffDays <= dayOfWeek) {
        gastoSemana += totalDia;
      }
    });

    dailySummary.textContent = `Saldo do dia: R$ ${(dailyBudget - gastoHoje).toFixed(2)}`;
    weeklySummary.textContent = `Saldo da semana: R$ ${(dailyBudget * (dayOfWeek + 1) - gastoSemana).toFixed(2)}`;
    monthlySummary.textContent = `Saldo acumulado até hoje: R$ ${(totalDisponivel - totalGasto).toFixed(2)}`;
  }

  loadSetup();
});
