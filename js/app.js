let dailyValue = parseFloat(localStorage.getItem('dailyValue')) || 0;
let startDate = localStorage.getItem('startDate') || null;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

document.getElementById('daily-budget').value = dailyValue || '';
document.getElementById('start-date').value = startDate || '';

document.getElementById('config-form').addEventListener('submit', function (e) {
  e.preventDefault();
  dailyValue = parseFloat(document.getElementById('daily-budget').value);
  startDate = document.getElementById('start-date').value;
  localStorage.setItem('dailyValue', dailyValue);
  localStorage.setItem('startDate', startDate);
  renderSummary();
});

document.getElementById('expense-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const date = document.getElementById('expense-date').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const desc = document.getElementById('expense-desc').value.trim();
  if (!date || isNaN(amount)) return;

  expenses.push({ date, amount, desc });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  renderSummary();
  this.reset();
});

document.getElementById('reset-button').addEventListener('click', function () {
  if (confirm('Deseja realmente apagar todos os dados?')) {
    localStorage.clear();
    dailyValue = 0;
    startDate = null;
    expenses = [];
    document.getElementById('daily-budget').value = '';
    document.getElementById('start-date').value = '';
    renderExpenses();
    renderSummary();
  }
});

function renderExpenses() {
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  expenses.forEach(({ date, amount, desc }, index) => {
    const item = document.createElement('li');
    item.textContent = `${date} - R$${amount.toFixed(2)}${desc ? ' - ' + desc : ''}`;
    list.appendChild(item);
  });
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
    startForWeek = mondayOfWeek;
  } else {
    startForWeek = startDate > today ? today : startDate;
  }

  let daysRemainingWeek = startForWeek ? getDaysInclusive(today, sundayOfWeek) : 0;
  const startForMonth = startDate > today ? today : startDate;
  const daysRemainingMonth = getDaysInclusive(today, lastDayOfMonth);

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

function getTotalExpenses(start, end) {
  return expenses
    .filter(e => e.date >= start && e.date <= end)
    .reduce((sum, e) => sum + e.amount, 0);
}

function getMondayOfWeek(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function getSundayOfWeek(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() + (day === 0 ? 0 : 7 - day);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function getLastDayOfMonth(dateStr) {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getDaysInclusive(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

// Inicialização
renderExpenses();
renderSummary();
