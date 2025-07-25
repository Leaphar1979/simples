let dailyValue = 0;
let startDate = null;
let expenses = [];

function saveSettings(e) {
  e.preventDefault();
  dailyValue = parseFloat(document.getElementById('daily-value').value);
  startDate = document.getElementById('start-date').value;
  localStorage.setItem('dailyValue', dailyValue);
  localStorage.setItem('startDate', startDate);
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

function getMondayOfWeek(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function getSundayOfWeek(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = 7 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function getLastDayOfMonth(dateStr) {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getDaysInclusive(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = end - start;
  return diffTime >= 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
}

function getTotalExpenses(start, end) {
  return expenses
    .filter(exp => exp.date >= start && exp.date <= end)
    .reduce((sum, exp) => sum + exp.amount, 0);
}

function renderSummary() {
  if (!dailyValue || !startDate) return;

  const today = new Date().toISOString().split('T')[0];
  const mondayOfWeek = getMondayOfWeek(today);
  const sundayOfWeek = getSundayOfWeek(today);
  const lastDayOfMonth = getLastDayOfMonth(today).toISOString().split('T')[0];

  let startForWeek;
  if (startDate > sundayOfWeek) {
    startForWeek = null;
  } else if (startDate < mondayOfWeek) {
    startForWeek = today;
  } else if (startDate > today) {
    startForWeek = startDate;
  } else {
    startForWeek = today;
  }

  let daysRemainingWeek = startForWeek ? getDaysInclusive(startForWeek, sundayOfWeek) : 0;
  const startForMonth = startDate > today ? startDate : today;
  const daysRemainingMonth = getDaysInclusive(startForMonth, lastDayOfMonth);

  const todayExpenses = getTotalExpenses(today, today);
  const weekExpenses = startForWeek ? getTotalExpenses(startForWeek, sundayOfWeek) : 0;
  const monthExpenses = getTotalExpenses(startForMonth, lastDayOfMonth);

  document.getElementById('daily-balance').textContent =
    `Saldo do dia: R$ ${(dailyValue - todayExpenses).toFixed(2)}`;
  document.getElementById('weekly-balance').textContent =
    `Saldo da semana: R$ ${(dailyValue * daysRemainingWeek - weekExpenses).toFixed(2)}`;
  document.getElementById('monthly-balance').textContent =
    `Saldo do mês: R$ ${(dailyValue * daysRemainingMonth - monthExpenses).toFixed(2)}`;
}

window.onload = () => {
  const storedValue = localStorage.getItem('dailyValue');
  const storedDate = localStorage.getItem('startDate');
  const storedExpenses = localStorage.getItem('expenses');

  if (storedValue && storedDate) {
    dailyValue = parseFloat(storedValue);
    startDate = storedDate;
    document.getElementById('daily-value').value = dailyValue;
    document.getElementById('start-date').value = startDate;
  }

  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
  }

  document.getElementById('config-form').addEventListener('submit', saveSettings);
  document.getElementById('expense-form').addEventListener('submit', addExpense);
  document.getElementById('reset-button').addEventListener('click', resetAll);

  renderExpenses();
  renderSummary();
};
