let dailyValue = 0;
let startDate = null;
let expenses = [];
let lastCalculatedDate = null;

function saveSettings(e) {
  e.preventDefault();
  dailyValue = parseFloat(document.getElementById('daily-value').value);
  startDate = document.getElementById('start-date').value;
  localStorage.setItem('dailyValue', dailyValue);
  localStorage.setItem('startDate', startDate);
  localStorage.setItem('lastCalculatedDate', startDate);
  renderSummary();
}

function addExpense(e) {
  e.preventDefault();
  const date = document.getElementById('expense-date').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const description = document.getElementById('expense-description').value;
  if (!date || isNaN(amount) || !description) return;
  expenses.push({ date, amount, description });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  renderSummary();
  e.target.reset();
}

function removeExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  renderSummary();
}

function resetAll() {
  if (confirm("Tem certeza que deseja apagar todos os dados?")) {
    localStorage.clear();
    location.reload();
  }
}

function renderExpenses() {
  const list = document.getElementById('expenses-list');
  list.innerHTML = '';
  expenses.forEach((exp, index) => {
    const item = document.createElement('li');
    item.innerHTML = `${exp.date} - ${exp.description}: R$ ${exp.amount.toFixed(2)} <button onclick="removeExpense(${index})">X</button>`;
    list.appendChild(item);
  });
}

function getSunday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = 7 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function getLastDayOfMonth(dateStr) {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

function getDaysInclusive(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

function getTotalExpenses(start, end) {
  return expenses
    .filter(exp => exp.date >= start && exp.date <= end)
    .reduce((sum, exp) => sum + exp.amount, 0);
}

function renderSummary() {
  if (!dailyValue || !startDate) return;

  const today = new Date().toISOString().split('T')[0];
  const sunday = getSunday(today);
  const lastDayOfMonth = getLastDayOfMonth(today);

  // Dias restantes até domingo e até final do mês
  const daysRemainingWeek = getDaysInclusive(today, sunday);
  const daysRemainingMonth = getDaysInclusive(today, lastDayOfMonth);

  // Gastos
  const todayExpenses = getTotalExpenses(today, today);
  const weekExpenses = getTotalExpenses(today, sunday);
  const monthExpenses = getTotalExpenses(today, lastDayOfMonth);

  document.getElementById('daily-balance').textContent =
    `Saldo do dia: R$ ${(dailyValue - todayExpenses).toFixed(2)}`;
  document.getElementById('weekly-balance').textContent =
    `Saldo da semana: R$ ${(dailyValue * daysRemainingWeek - weekExpenses).toFixed(2)}`;
  document.getElementById('monthly-balance').textContent =
    `Saldo do mês: R$ ${(dailyValue * daysRemainingMonth - monthExpenses).toFixed(2)}`;
}

function checkNewDay() {
  const today = new Date().toISOString().split('T')[0];
  if (lastCalculatedDate && lastCalculatedDate !== today) {
    // calcular sobra/falta de ontem
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    const yesterdayExpenses = getTotalExpenses(yesterday, yesterday);
    const diff = dailyValue - yesterdayExpenses;

    // Ajustar dailyValue para hoje somando sobra/falta
    dailyValue += diff;
    localStorage.setItem('dailyValue', dailyValue);
  }
  lastCalculatedDate = today;
  localStorage.setItem('lastCalculatedDate', lastCalculatedDate);
}

window.onload = () => {
  const storedValue = localStorage.getItem('dailyValue');
  const storedDate = localStorage.getItem('startDate');
  const storedExpenses = localStorage.getItem('expenses');
  lastCalculatedDate = localStorage.getItem('lastCalculatedDate');

  if (storedValue && storedDate) {
    dailyValue = parseFloat(storedValue);
    startDate = storedDate;
    document.getElementById('daily-value').value = dailyValue;
    document.getElementById('start-date').value = startDate;
  }

  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
  }

  checkNewDay();
  renderExpenses();
  renderSummary();

  document.getElementById('config-form').addEventListener('submit', saveSettings);
  document.getElementById('expense-form').addEventListener('submit', addExpense);
  document.getElementById('reset-button').addEventListener('click', resetAll);
};
