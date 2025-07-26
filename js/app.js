let dailyValue = 0;
let startDate = null;
let expenses = [];
let lastCalculatedDate = null;

// Salva as configurações iniciais (valor diário e data de início)
function saveSettings(e) {
  e.preventDefault();
  dailyValue = parseFloat(document.getElementById('daily-value').value);
  startDate = document.getElementById('start-date').value;

  localStorage.setItem('dailyValue', dailyValue);
  localStorage.setItem('startDate', startDate);
  lastCalculatedDate = startDate;
  localStorage.setItem('lastCalculatedDate', lastCalculatedDate);

  // Saldo inicial do primeiro dia
  localStorage.setItem('saldo_' + startDate, dailyValue);

  renderSummary();
}

// Adiciona gasto
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

// Remove gasto
function removeExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  renderExpenses();
  renderSummary();
}

// Reseta tudo
function resetAll() {
  if (confirm("Tem certeza que deseja apagar todos os dados?")) {
    localStorage.clear();
    location.reload();
  }
}

// Lista de gastos
function renderExpenses() {
  const list = document.getElementById('expenses-list');
  list.innerHTML = '';
  expenses.forEach((exp, index) => {
    const item = document.createElement('li');
    item.innerHTML = `${exp.date} - ${exp.description}: R$ ${exp.amount.toFixed(2)} <button onclick="removeExpense(${index})">X</button>`;
    list.appendChild(item);
  });
}

// Utilitários
function getPreviousSunday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0=domingo
  date.setDate(date.getDate() - day);
  return date.toISOString().split('T')[0];
}

function getSaturday(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0=domingo, 6=sábado
  date.setDate(date.getDate() + (6 - day));
  return date.toISOString().split('T')[0];
}

function getLastDayOfMonth(dateStr) {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

function getDaysArray(startStr, endStr) {
  const dates = [];
  let current = new Date(startStr);
  const end = new Date(endStr);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getTotalExpenses(date) {
  return expenses
    .filter(exp => exp.date === date)
    .reduce((sum, exp) => sum + exp.amount, 0);
}

// Atualiza os saldos diários herdando sobra/falta
function updateDailyBalances() {
  if (!dailyValue || !startDate) return;

  const today = new Date().toISOString().split('T')[0];
  const lastSavedDate = localStorage.getItem('lastCalculatedDate') || startDate;

  let currentDate = new Date(lastSavedDate);
  const todayDate = new Date(today);

  while (currentDate <= todayDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    let saldoHoje = dailyValue;

    if (dateStr !== startDate) {
      const saldoOntem = parseFloat(localStorage.getItem('saldo_' + prevDateStr)) || dailyValue;
      const gastosOntem = getTotalExpenses(prevDateStr);
      const sobraOuFalta = saldoOntem - gastosOntem;
      saldoHoje = dailyValue + sobraOuFalta;
    }

    localStorage.setItem('saldo_' + dateStr, saldoHoje);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  localStorage.setItem('lastCalculatedDate', today);
}

// Renderiza os saldos: do dia, da semana, do mês
function renderSummary() {
  updateDailyBalances();

  const today = new Date().toISOString().split('T')[0];
  const saturday = getSaturday(today);
  const lastDayOfMonth = getLastDayOfMonth(today);

  // Saldo do dia
  const saldoHoje = parseFloat(localStorage.getItem('saldo_' + today)) || dailyValue;
  const gastosHoje = getTotalExpenses(today);
  const saldoDia = saldoHoje - gastosHoje;

  // Saldo da semana: de hoje até sábado (inclusive)
  const diasSemana = getDaysArray(today, saturday);
  let saldoSemana = 0;
  diasSemana.forEach(dateStr => {
    const saldoDiaX = parseFloat(localStorage.getItem('saldo_' + dateStr)) || dailyValue;
    const gastos = getTotalExpenses(dateStr);
    saldoSemana += saldoDiaX - gastos;
  });

  // Saldo do mês: de hoje até último dia do mês
  const diasMes = getDaysArray(today, lastDayOfMonth);
  let saldoMes = 0;
  diasMes.forEach(dateStr => {
    const saldoDiaX = parseFloat(localStorage.getItem('saldo_' + dateStr)) || dailyValue;
    const gastos = getTotalExpenses(dateStr);
    saldoMes += saldoDiaX - gastos;
  });

  document.getElementById('daily-balance').textContent =
    `Saldo do dia: R$ ${saldoDia.toFixed(2)}`;
  document.getElementById('weekly-balance').textContent =
    `Saldo da semana: R$ ${saldoSemana.toFixed(2)}`;
  document.getElementById('monthly-balance').textContent =
    `Saldo do mês: R$ ${saldoMes.toFixed(2)}`;
}

// Inicializa app ao carregar
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

  renderExpenses();
  renderSummary();

  document.getElementById('config-form').addEventListener('submit', saveSettings);
  document.getElementById('expense-form').addEventListener('submit', addExpense);
  document.getElementById('reset-button').addEventListener('click', resetAll);
};
