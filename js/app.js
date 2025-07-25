let dailyValue = 0;
let startDate = null;
let expenses = [];

function saveSettings(event) {
  event.preventDefault();
  dailyValue = parseFloat(document.getElementById('daily-value').value);
  startDate = document.getElementById('start-date').value;
  localStorage.setItem('dailyValue', dailyValue);
  localStorage.setItem('startDate', startDate);
  renderSummary();
}

function addExpense(event) {
  event.preventDefault();
  const date = document.getElementById('expense-date').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const description = document.getElementById('expense-description').value;
  expenses.push({ date, amount, description });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  renderSummary();
  event.target.reset();
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
    item.innerHTML = `${exp.date} - ${exp.description}: R$ ${exp.amount.toFixed(2)} 
      <button onclick="removeExpense(${index})">X</button>`;
    list.appendChild(item);
  });
}

function renderSummary() {
  if (!dailyValue || !startDate) return;

  const today = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart(today);
  const monthStart = today.slice(0, 8) + '01';

  const todayExpenses = getTotalExpenses(today, today);
  const weekExpenses = getTotalExpenses(weekStart, today);
  const monthExpenses = getTotalExpenses(monthStart, today);

  const totalWeekDays = getDaysBetween(weekStart, today) + 1;
  const totalMonthDays = getDaysBetween(monthStart, today) + 1;

  const dailyBalance = dailyValue - todayExpenses;
  const weekBalance = dailyValue * totalWeekDays - weekExpenses;
  const monthBalance = dailyValue * totalMonthDays - monthExpenses;

  document.getElementById('daily-balance').textContent = `Saldo do dia: R$ ${dailyBalance.toFixed(2)}`;
  document.getElementById('weekly-balance').textContent = `Saldo da semana: R$ ${weekBalance.toFixed(2)}`;
  document.getElementById('monthly-balance').textContent = `Saldo do mês: R$ ${monthBalance.toFixed(2)}`;
}

function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // segunda
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getDaysBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate - startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getTotalExpenses(start, end) {
  return expenses
    .filter(exp => exp.date >= start && exp.date <= end)
    .reduce((sum, exp) => sum + exp.amount, 0);
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

  renderExpenses();
  renderSummary();
};
