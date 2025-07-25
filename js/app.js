document.addEventListener('DOMContentLoaded', () => {
  const dailyBudgetInput = document.getElementById('daily-budget');
  const startDateInput = document.getElementById('start-date');
  const dateInput = document.getElementById('date');
  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const expensesList = document.getElementById('expenses-list');
  const dailySummary = document.getElementById('daily-summary');
  const weeklySummary = document.getElementById('weekly-summary');
  const monthlySummary = document.getElementById('monthly-summary');
  const configForm = document.getElementById('config-form');
  const expenseForm = document.getElementById('expense-form');
  const resetButton = document.getElementById('reset-button');

  function getConfig() {
    return JSON.parse(localStorage.getItem('config')) || {};
  }

  function saveConfig(config) {
    localStorage.setItem('config', JSON.stringify(config));
  }

  function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
  }

  function saveExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function updateSummary() {
    const config = getConfig();
    const expenses = getExpenses();
    if (!config.dailyBudget || !config.startDate) return;

    const today = new Date().toISOString().split('T')[0];
    const start = new Date(config.startDate);
    const now = new Date();
    const dayCount = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

    const todayExpenses = expenses
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // segunda-feira
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weeklyExpenses = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= weekStart && d <= weekEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    const daysInMonth = Math.floor((nextMonth - monthStart) / (1000 * 60 * 60 * 24));
    const monthBudget = config.dailyBudget * daysInMonth;

    const monthlyExpenses = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const dailyBalance = config.dailyBudget - todayExpenses;
    const weeklyBalance = (config.dailyBudget * 7) - weeklyExpenses;
    const monthlyBalance = monthBudget - monthlyExpenses;

    dailySummary.textContent = `Saldo do dia: ${formatCurrency(dailyBalance)}`;
    weeklySummary.textContent = `Saldo da semana: ${formatCurrency(weeklyBalance)}`;
    monthlySummary.textContent = `Saldo do mês: ${formatCurrency(monthlyBalance)}`;
  }

  function renderExpenses() {
    const expenses = getExpenses();
    expensesList.innerHTML = '';
    expenses.forEach((expense, index) => {
      const li = document.createElement('li');
      li.textContent = `${expense.date} - ${expense.description}: ${formatCurrency(expense.amount)}`;
      const btn = document.createElement('button');
      btn.textContent = 'Excluir';
      btn.addEventListener('click', () => {
        expenses.splice(index, 1);
        saveExpenses(expenses);
        renderExpenses();
        updateSummary();
      });
      li.appendChild(btn);
      expensesList.appendChild(li);
    });
  }

  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const config = {
      dailyBudget: parseFloat(dailyBudgetInput.value),
      startDate: startDateInput.value
    };
    saveConfig(config);
    updateSummary();
  });

  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const expense = {
      date: dateInput.value,
      description: descriptionInput.value,
      amount: parseFloat(amountInput.value)
    };
    const expenses = getExpenses();
    expenses.push(expense);
    saveExpenses(expenses);
    renderExpenses();
    updateSummary();
    expenseForm.reset();
  });

  resetButton.addEventListener('click', () => {
    if (confirm("Deseja mesmo limpar todos os dados?")) {
      localStorage.clear();
      location.reload();
    }
  });

  const config = getConfig();
  if (config.dailyBudget) dailyBudgetInput.value = config.dailyBudget;
  if (config.startDate) startDateInput.value = config.startDate;
  renderExpenses();
  updateSummary();
});
