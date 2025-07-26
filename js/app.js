const configForm = document.getElementById("config-form");
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const resetButton = document.getElementById("reset-button");

const dailySummary = document.getElementById("daily-summary");
const weeklySummary = document.getElementById("weekly-summary");
const monthlySummary = document.getElementById("monthly-summary");

let dailyValue = parseFloat(localStorage.getItem("dailyValue")) || 0;
let startDate = localStorage.getItem("startDate") || null;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveConfig(e) {
  e.preventDefault();
  dailyValue = parseFloat(document.getElementById("daily-budget").value);
  startDate = document.getElementById("start-date").value;
  localStorage.setItem("dailyValue", dailyValue);
  localStorage.setItem("startDate", startDate);
  updateUI();
}

function addExpense(e) {
  e.preventDefault();
  const date = document.getElementById("expense-date").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const desc = document.getElementById("expense-desc").value;
  expenses.push({ date, amount, desc });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
  expenseForm.reset();
}

function resetData() {
  localStorage.clear();
  dailyValue = 0;
  startDate = null;
  expenses = [];
  updateUI();
}

function groupExpensesByDate() {
  const grouped = {};
  for (let exp of expenses) {
    if (!grouped[exp.date]) grouped[exp.date] = [];
    grouped[exp.date].push(exp);
  }
  return grouped;
}

function calculateDailyBalances() {
  if (!startDate || !dailyValue) return [];

  const grouped = groupExpensesByDate();
  const today = new Date().toISOString().split("T")[0];
  const balances = [];
  let currentDate = new Date(startDate);
  let accumulated = 0;

  while (currentDate.toISOString().split("T")[0] <= today) {
    const key = currentDate.toISOString().split("T")[0];
    const dayExpenses = grouped[key] || [];
    const daySpent = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

    accumulated += dailyValue;
    accumulated -= daySpent;

    balances.push({
      date: key,
      expenses: dayExpenses,
      saldo: parseFloat(accumulated.toFixed(2))
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return balances;
}

function updateUI() {
  expenseList.innerHTML = "";
  const balances = calculateDailyBalances();
  const grouped = groupExpensesByDate();

  balances.forEach(({ date, expenses, saldo }) => {
    const li = document.createElement("li");
    const dia = new Date(date).getDate();
    const month = new Date(date).toLocaleDateString("pt-BR", { month: "2-digit" });
    let html = `<strong>(${dia})</strong><br>R$ ${dailyValue.toFixed(2)}<br>`;

    const prev = balances.find(b => b.date === getPreviousDate(date));
    if (prev) html += `+${prev.saldo.toFixed(2)} (saldo do dia anterior)<br>`;

    if (expenses.length) {
      for (let e of expenses) {
        html += `- ${e.amount.toFixed(2)} (${e.desc || "sem descrição"})<br>`;
      }
    }

    html += `<strong>Saldo do dia: R$ ${saldo.toFixed(2)}</strong>`;
    li.innerHTML = html;
    expenseList.appendChild(li);
  });

  const last = balances[balances.length - 1];
  if (last) dailySummary.innerHTML = `Saldo do dia (${last.date}): R$ ${last.saldo.toFixed(2)}`;

  // semanal e mensal (simplificados)
  const weekTotal = balances.slice(-7).reduce((s, b) => s + b.saldo, 0);
  weeklySummary.innerHTML = `Saldo acumulado da semana: R$ ${weekTotal.toFixed(2)}`;

  const month = new Date().toISOString().slice(0, 7);
  const monthBalances = balances.filter(b => b.date.startsWith(month));
  const monthTotal = monthBalances.length ? monthBalances[monthBalances.length - 1].saldo : 0;
  monthlySummary.innerHTML = `Saldo acumulado do mês: R$ ${monthTotal.toFixed(2)}`;
}

function getPreviousDate(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// Event listeners
configForm.addEventListener("submit", saveConfig);
expenseForm.addEventListener("submit", addExpense);
resetButton.addEventListener("click", resetData);

// Inicialização
updateUI();
