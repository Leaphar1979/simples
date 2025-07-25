document.addEventListener("DOMContentLoaded", () => {
  const configForm = document.getElementById("setup-form");
  const entrySection = document.getElementById("entry-section");
  const summarySection = document.getElementById("summary-section");
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const todaySpan = document.getElementById("today");
  const dailySummary = document.getElementById("daily-summary");
  const weeklySummary = document.getElementById("weekly-summary");
  const monthlySummary = document.getElementById("monthly-summary");

  let config = {
    dailyBudget: 0,
    startDate: null,
  };

  let expenses = {}; // { '2025-07-25': [ { description, amount }, ... ] }

  // Helper para obter data no formato yyyy-mm-dd
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  // Mostrar data atual no formulário de entrada
  function updateTodaySpan() {
    const today = new Date();
    todaySpan.textContent = formatDate(today);
  }

  // Salvar dados no localStorage
  function saveData() {
    localStorage.setItem("saboya-config", JSON.stringify(config));
    localStorage.setItem("saboya-expenses", JSON.stringify(expenses));
  }

  // Carregar dados do localStorage
  function loadData() {
    const savedConfig = localStorage.getItem("saboya-config");
    const savedExpenses = localStorage.getItem("saboya-expenses");
    if (savedConfig) config = JSON.parse(savedConfig);
    if (savedExpenses) expenses = JSON.parse(savedExpenses);
  }

  // Calcular saldos diário, semanal e mensal e mostrar no resumo
  function updateSummary() {
    if (!config.dailyBudget || !config.startDate) return;

    const today = new Date();
    const startDate = new Date(config.startDate);

    const dayMs = 24 * 60 * 60 * 1000;

    // Número total de dias no mês
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Dias passados desde início do controle
    const daysPassed = Math.floor((today - startDate) / dayMs);

    // Saldo diário = valor fixo diário - soma gastos do dia
    const todayKey = formatDate(today);
    const todayExpenses = expenses[todayKey] || [];
    const sumToday = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
    const dailyBalance = config.dailyBudget - sumToday;

    // Saldo semanal (segunda a domingo)
    const dayOfWeek = today.getDay(); // 0=domingo, 1=segunda
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Ajusta para segunda-feira

    let sumWeekExpenses = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = formatDate(d);
      const dayExpenses = expenses[key] || [];
      sumWeekExpenses += dayExpenses.reduce((acc, e) => acc + e.amount, 0);
    }
    const weeklyBudget = config.dailyBudget * 7;
    const weeklyBalance = weeklyBudget - sumWeekExpenses;

    // Saldo mensal (considerando o mês atual inteiro)
    let sumMonthExpenses = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayExpenses = expenses[dateKey] || [];
      sumMonthExpenses += dayExpenses.reduce((acc, e) => acc + e.amount, 0);
    }
    const monthlyBudget = config.dailyBudget * daysInMonth;
    const monthlyBalance = monthlyBudget - sumMonthExpenses;

    dailySummary.textContent = `Saldo Diário: R$ ${dailyBalance.toFixed(2)}`;
    weeklySummary.textContent = `Saldo Semanal: R$ ${weeklyBalance.toFixed(2)}`;
    monthlySummary.textContent = `Saldo Mensal: R$ ${monthlyBalance.toFixed(2)}`;
  }

  // Renderizar a lista de gastos do dia atual
  function renderExpenses() {
    expenseList.innerHTML = "";
    const todayKey = formatDate(new Date());
    const todaysExpenses = expenses[todayKey] || [];
    todaysExpenses.forEach((expense, index) => {
      const li = document.createElement("li");
      li.textContent = `${expense.description} - R$ ${expense.amount.toFixed(2)}`;

      const btnDel = document.createElement("button");
      btnDel.textContent = "X";
      btnDel.style.marginLeft = "10px";
      btnDel.onclick = () => {
        expenses[todayKey].splice(index, 1);
        saveData();
        renderExpenses();
        updateSummary();
      };

      li.appendChild(btnDel);
      expenseList.appendChild(li);
    });
  }

  // Inicializar o app, mostrar seção correta
  function initApp() {
    loadData();
    if (config.dailyBudget && config.startDate) {
      document.getElementById("setup-section").style.display = "none";
      entrySection.style.display = "block";
      summarySection.style.display = "block";
      updateTodaySpan();
      renderExpenses();
      updateSummary();
    } else {
      document.getElementById("setup-section").style.display = "block";
      entrySection.style.display = "none";
      summarySection.style.display = "none";
    }
  }

  // Eventos

  // Quando configurações são salvas
  configForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const dailyBudgetInput = document.getElementById("daily-budget");
    const startDateInput = document.getElementById("start-date");
    const dailyBudgetVal = parseFloat(dailyBudgetInput.value);
    const startDateVal = startDateInput.value;

    if (dailyBudgetVal > 0 && startDateVal) {
      config.dailyBudget = dailyBudgetVal;
      config.startDate = startDateVal;
      saveData();
      initApp();
    }
  });

  // Quando um gasto é lançado
  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const descInput = document.getElementById("description");
    const amountInput = document.getElementById("amount");
    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (description && amount > 0) {
      const todayKey = formatDate(new Date());
      if (!expenses[todayKey]) expenses[todayKey] = [];
      expenses[todayKey].push({ description, amount });
      saveData();
      renderExpenses();
      updateSummary();

      descInput.value = "";
      amountInput.value = "";
    }
  });

  // Inicializa app ao carregar página
  initApp();
});
