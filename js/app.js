document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "saboyaAppData";

  const startButton = document.getElementById("startButton");
  const resetButton = document.getElementById("resetButton");
  const addExpenseButton = document.getElementById("addExpense");

  const startDateInput = document.getElementById("startDate");
  const dailyAmountInput = document.getElementById("dailyAmount");
  const expenseInput = document.getElementById("expense");

  const balanceDisplay = document.getElementById("balanceDisplay");
  const expenseList = document.getElementById("expenseList");

  const setupSection = document.getElementById("setup");
  const appSection = document.getElementById("appSection");

  function loadData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getTodayDate() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 3); // Ajuste UTC-3
    return now.toISOString().split("T")[0];
  }

  function calculateBalance(data) {
    const today = getTodayDate();
    const daysPassed = Math.floor(
      (new Date(today) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)
    );

    let total = data.dailyAmount * (daysPassed + 1);

    const spentToday = data.expenses
      .filter((e) => e.date === today)
      .reduce((acc, e) => acc + e.amount, 0);

    const allSpent = data.expenses.reduce((acc, e) => acc + e.amount, 0);

    const balance = total - allSpent;

    return {
      balance,
      spentToday,
      expensesToday: data.expenses
        .map((e, index) => ({ ...e, index }))
        .filter((e) => e.date === today),
    };
  }

  function updateDisplay(data) {
    const { balance, expensesToday } = calculateBalance(data);
    balanceDisplay.textContent = balance.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    expenseList.innerHTML = "";
    expensesToday.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = `- ${e.amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })} `;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Excluir";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.style.backgroundColor = "#dc3545";
      deleteBtn.style.color = "#fff";
      deleteBtn.style.border = "none";
      deleteBtn.style.padding = "4px 8px";
      deleteBtn.style.borderRadius = "4px";
      deleteBtn.style.cursor = "pointer";

      deleteBtn.addEventListener("click", () => {
        data.expenses.splice(e.index, 1);
        saveData(data);
        updateDisplay(data);
      });

      li.appendChild(deleteBtn);
      expenseList.appendChild(li);
    });
  }

  function initApp(data) {
    setupSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    updateDisplay(data);
  }

  startButton.addEventListener("click", () => {
    const startDate = startDateInput.value;
    const dailyAmount = parseFloat(dailyAmountInput.value);

    if (!startDate || isNaN(dailyAmount) || dailyAmount <= 0) {
      alert("Preencha corretamente os campos.");
      return;
    }

    const data = {
      startDate,
      dailyAmount,
      expenses: [],
    };

    saveData(data);
    initApp(data);
  });

  addExpenseButton.addEventListener("click", () => {
    const data = loadData();
    const amount = parseFloat(expenseInput.value);
    if (!data || isNaN(amount) || amount <= 0) return;

    const today = getTodayDate();
    data.expenses.push({ date: today, amount });
    saveData(data);
    expenseInput.value = "";
    updateDisplay(data);
  });

  resetButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  const existingData = loadData();
  if (existingData) {
    initApp(existingData);
  }
});
