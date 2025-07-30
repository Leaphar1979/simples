try {
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

    if (!window.localStorage) {
      alert("localStorage não é suportado.");
      return;
    }

    function showError(msg) {
      const error = document.createElement("div");
      error.style.color = "red";
      error.textContent = "Erro: " + msg;
      document.body.appendChild(error);
    }

    function loadData() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
      } catch (err) {
        showError("Erro ao carregar dados do localStorage.");
        return null;
      }
    }

    function saveData(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        showError("Erro ao salvar dados no localStorage.");
      }
    }

    function getTodayDate() {
      const now = new Date();
      now.setUTCHours(now.getUTCHours() - 3);
      return now.toISOString().split("T")[0];
    }

    function calculateBalance(data) {
      const today = getTodayDate();
      const daysPassed = Math.floor(
        (new Date(today) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)
      );

      let total = data.dailyAmount * (daysPassed + 1);
      const allSpent = data.expenses.reduce((acc, e) => acc + e.amount, 0);
      const expensesToday = data.expenses.filter((e) => e.date === today);

      return {
        balance: total - allSpent,
        expensesToday,
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
        })}`;
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
      if (confirm("Deseja apagar todos os dados?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });

    const existingData = loadData();
    if (existingData) {
      initApp(existingData);
    }
  });
} catch (err) {
  const e = document.createElement("div");
  e.style.color = "red";
  e.textContent = "Erro crítico: " + err.message;
  document.body.appendChild(e);
}
