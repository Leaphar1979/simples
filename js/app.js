const configForm = document.getElementById('config-form');
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const resetButton = document.getElementById('reset-button');

const dailySummary = document.getElementById('daily-summary');
const weeklySummary = document.getElementById('weekly-summary');
const monthlySummary = document.getElementById('monthly-summary');

let config = JSON.parse(localStorage.getItem('config')) || null;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function saveConfig(dailyBudget, startDate) {
  config = { dailyBudget: parseFloat(dailyBudget), startDate };
  localStorage.setItem('config', JSON.stringify(config));
  renderSummary();
}

function saveExpense(date, amount, description) {
  expenses.push({ date, amount: parseFloat(amount), description });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
  renderSummary();
}

function renderExpenses() {
  expenseList.innerHTML = '';
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedExpenses.forEach((exp, index) => {
    const li = document.createElement('li');
    li.textContent = `${exp.date} - R$ ${exp.amount.toFixed(2)} (${exp.description || 'Sem descrição'})`;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Excluir';
    delBtn.onclick = () => {
      expenses.splice(index, 1);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      renderExpenses();
      renderSummary();
    };

    li.appendChild(delBtn);
    expenseList.appendChild(li);
  });
}

function calculateDailyBalances() {
  if (!config) return {};

  const dailyBudget = config.dailyBudget;
  const startDate = new Date(config.startDate);
  const balances = {};
  let previousBalance = 0;

  const today = new Date();
  const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  for (let i = 0; i <= daysElapsed; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const totalSpent = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    const available = dailyBudget + previousBalance;
    const endBalance = available - totalSpent;

    balances[dateStr] = {
      date: dateStr,
      dailyBudget,
      previousBalance,
      totalSpent,
      endBalance,
    };

    previousBalance = endBalance;
  }

  return balances;
}

function renderSummary() {
  const balances = calculateDailyBalances();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBalance = balances[todayStr];

  if (todayBalance) {
    const { dailyBudget, previousBalance, totalSpent, endBalance } = todayBalance;

    dailySummary.innerHTML = `
      <strong>Saldo do dia:</strong><br>
      R$ ${dailyBudget.toFixed(2)}<br>
      + R$ ${previousBalance.toFixed(2)} (saldo anterior)<br>
      — R$ ${totalSpent.toFixed(2)} (gastos do dia)<br>
      = <strong>R$ ${endBalance.toFixed(2)}</strong>
    `;
  } else {
    dailySummary.textContent = 'Nenhum dado para hoje.';
  }

  renderWeeklySummary(balances);
  renderMonthlySummary(balances);
}

function renderWeeklySummary(balances) {
  const dates = Object.keys(balances);
  const currentWeek = getWeekDates(new Date());
  let total = 0;

  dates.forEach(date => {
    if (currentWeek.includes(date)) {
      total += balances[date].endBalance;
    }
  });

  weeklySummary.textContent = `Saldo da semana: R$ ${total.toFixed(2)}`;
}

function renderMonthlySummary(balances) {
  const month = new Date().toISOString().slice(0, 7); // yyyy-mm
  const dates = Object.keys(balances);
  let total = 0;

  dates.forEach(date => {
    if (date.startsWith(month)) {
      total += balances[date].endBalance;
    }
  });

  monthlySummary.textContent = `Saldo do mês: R$ ${total.toFixed(2)}`;
}

function getWeekDates(date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay() + 1); // Segunda

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const dailyBudget = document.getElementById('daily-budget').value;
  const startDate = document.getElementById('start-date').value;
  saveConfig(dailyBudget, startDate);
});

expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const date = document.getElementById('expense-date').value;
  const amount = document.getElementById('expense-amount').value;
  const desc = document.getElementById('expense-desc').value;
  saveExpense(date, amount, desc);
  expenseForm.reset();
});

resetButton.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja apagar todos os dados?')) {
    localStorage.removeItem('config');
    localStorage.removeItem('expenses');
    config = null;
    expenses = [];
    renderExpenses();
    renderSummary();
  }
});

window.onload = () => {
  if (config) {
    renderExpenses();
    renderSummary();
  }
};
