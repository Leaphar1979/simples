document.addEventListener('DOMContentLoaded', () => {
  const setupSection = document.getElementById('setup-section');
  const entrySection = document.getElementById('entry-section');
  const summarySection = document.getElementById('summary-section');
  const setupForm = document.getElementById('setup-form');
  const expenseForm = document.getElementById('expense-form');
  const todaySpan = document.getElementById('today');
  const expenseList = document.getElementById('expense-list');
  const dailySummary = document.getElementById('daily-summary');
  const weeklySummary = document.getElementById('weekly-summary');
  const monthlySummary = document.getElementById('monthly-summary');
  const resetButton = document.getElementById('reset-button');

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function loadConfig() {
    const budget = localStorage.getItem('dailyBudget');
    const startDate = localStorage.getItem('startDate');
    if (budget && startDate) {
      document.getElementById('daily-budget').value = budget;
      document.getElementById('start-date').value = startDate;
      return { budget: parseFloat(budget), startDate };
    }
    return null;
  }

  function saveConfig(budget, startDate) {
    localStorage.setItem('dailyBudget', budget);
    localStorage.setItem('startDate', startDate);
  }

  function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  }

  function saveExpense(description, amount) {
    const expenses = getExpenses();
    expenses.push({
      date: formatDate(new Date()),
      description,
      amount: parseFloat(amount)
    });
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  function resetApp() {
    localStorage.clear();
    location.reload();
  }

  function showApp() {
    setupSection.style.display = 'none';
    entrySection.style.display = 'block';
    summarySection.style.display = 'block';
    todaySpan.textContent = formatDate(new Date());
    renderExpenses();
    renderSummaries();
  }

  function renderExpenses() {
    const expenses = getExpenses().filter(e => e.date === formatDate(new Date()));
    expenseList.innerHTML = '';
    expenses.forEach(exp => {
      const li = document.createElement('li');
      li.textContent = `${exp.description} - R$ ${exp.amount.toFixed(2)}`;
      expenseList.appendChild(li);
    });
  }

  function renderSummaries() {
    const budget = parseFloat(localStorage.getItem('dailyBudget'));
    const startDate = new Date(localStorage.getItem('startDate'));
    const today = new Date();
    const expenses = getExpenses();

    let dailyTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (exp.date === formatDate(today)) {
        dailyTotal += exp.amount;
      }

      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      if (expDate >= firstDayOfWeek && expDate <= today) {
        weeklyTotal += exp.amount;
      }

      if (
        expDate.getFullYear() === today.getFullYear() &&
        expDate.getMonth() === today.getMonth()
      ) {
        monthlyTotal += exp.amount;
      }
    });

    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const weekDays = today.getDay() + 1;
    const monthDays = today.getDate();

    dailySummary.textContent = `Hoje: R$ ${budget.toFixed(2)} - R$ ${dailyTotal.toFixed(2)} = R$ ${(budget - dailyTotal).toFixed(2)}`;
    weeklySummary.textContent = `Semana: R$ ${(budget * weekDays).toFixed(2)} - R$ ${weeklyTotal.toFixed(2)} = R$ ${(budget * weekDays - weeklyTotal).toFixed(2)}`;
    monthlySummary.textContent = `Mês: R$ ${(budget * monthDays).toFixed(2)} - R$ ${monthlyTotal.toFixed(2)} = R$ ${(budget * monthDays - monthlyTotal).toFixed(2)}`;
  }

  const config = loadConfig();
  if (config) {
    showApp();
  }

  setupForm.addEventListener('submit', e => {
    e.preventDefault();
    const budget = document.getElementById('daily-budget').value;
    const startDate = document.getElementById('start-date').value;
    saveConfig(budget, startDate);
    showApp();
  });

  resetButton.addEventListener('click', () => {
    if (confirm("Tem certeza que deseja resetar todos os dados?")) {
      resetApp();
    }
  });

  expenseForm.addEventListener('submit', e => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    saveExpense(description, amount);
    expenseForm.reset();
    renderExpenses();
    renderSummaries();
  });
});
