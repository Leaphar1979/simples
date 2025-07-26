const configForm = document.getElementById("config-form");
const expenseForm = document.getElementById("expense-form");
const resetButton = document.getElementById("reset-button");
const summaryOutput = document.getElementById("summary-output");
const expenseList = document.getElementById("expense-list");

let config = JSON.parse(localStorage.getItem("config")) || null;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveData() {
  localStorage.setItem("config", JSON.stringify(config));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateSummary();
  renderExpenses();
}

function resetData() {
  if (confirm("Tem certeza que deseja resetar todos os dados?")) {
    localStorage.clear();
    config = null;
    expenses = [];
    summaryOutput.textContent = "Saldo diário será exibido aqui.";
    expenseList.innerHTML = "";
  }
}

function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.forEach((exp) => {
    const li = document.createElement("li");
    li.textContent = `${exp.date} - R$ ${exp.amount.toFixed(2)} (${exp.desc})`;
    expenseList.appendChild(li);
  });
}

function updateSummary() {
  if (!config) return;

  const { dailyBudget, startDate } = config;
  const budget = Number(dailyBudget);
  const start = new Date(startDate);
  const today = new Date();

  const days = [];
  let saldoAnterior = 0;

  for (
    let d = new Date(start);
    d <= today;
    d.setDate(d.getDate() + 1)
  ) {
    const dataStr = d.toISOString().split("T")[0];
    const gastosDoDia = expenses
      .filter((e) => e.date === dataStr)
      .map((e) => e.amount);
    const totalGastos = gastosDoDia.reduce((a, b) => a + b, 0);
    const saldoDia = budget + saldoAnterior - totalGastos;
    days.push({
      data: new Date(d),
      gastos: expenses.filter((e) => e.date === dataStr),
      saldoAnterior,
      saldoDia,
      totalGastos,
    });
    saldoAnterior = saldoDia;
  }

  let resumo = "";
  days.forEach((dia) => {
    const dd = String(dia.data.getDate()).padStart(2, "0");
    const mm = String(dia.data.getMonth() + 1).padStart(2, "0");
    resumo += `(${dd}/${mm})\nR$ ${config.dailyBudget}\n`;
    if (dia.saldoAnterior > 0)
      resumo += `+R$ ${dia.saldoAnterior.toFixed(2)} (saldo do dia anterior)\n`;
    if (dia.gastos.length > 0) {
      dia.gastos.forEach((g) => {
        resumo += `-R$ ${g.amount.toFixed(2)} (${g.desc})\n`;
      });
    }
    resumo += `———————\nR$ ${dia.saldoDia.toFixed(2)} (saldo do dia)\n\n`;
  });

  summaryOutput.textContent = resumo.trim();
}

configForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const dailyBudget = document.getElementById("daily-budget").value;
  const startDate = document.getElementById("start-date").value;
  config = { dailyBudget, startDate };
  saveData();
});

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("expense-date").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const desc = document.getElementById("expense-desc").value || "Sem descrição";

  expenses.push({ date, amount, desc });
  saveData();

  expenseForm.reset();
});

resetButton.addEventListener("click", resetData);

// Inicializa app
if (config) {
  updateSummary();
  renderExpenses();
}
