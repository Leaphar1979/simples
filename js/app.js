document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("startButton");
  const addExpense = document.getElementById("addExpense");
  const resetButton = document.getElementById("resetButton");
  const expenseList = document.getElementById("expenseList");
  const balanceDisplay = document.getElementById("balanceDisplay");

  let dailyAmount = 0;
  let expenses = [];

  function updateBalance() {
    const total = expenses.reduce((acc, val) => acc + val.value, 0);
    const balance = dailyAmount - total;
    balanceDisplay.textContent = `R$ ${balance.toFixed(2)}`;
  }

  function renderExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `R$ ${item.value.toFixed(2)}`;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Editar";
      editBtn.className = "edit-btn";
      editBtn.onclick = () => {
        const newValue = prompt("Novo valor:", item.value);
        if (newValue !== null) {
          const parsed = parseFloat(newValue);
          if (!isNaN(parsed)) {
            expenses[index].value = parsed;
            renderExpenses();
            updateBalance();
          }
        }
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Excluir";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = () => {
        expenses.splice(index, 1);
        renderExpenses();
        updateBalance();
      };

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      expenseList.appendChild(li);
    });
  }

  startButton.addEventListener("click", () => {
    const amountInput = document.getElementById("dailyAmount").value;
    dailyAmount = parseFloat(amountInput);
    if (isNaN(dailyAmount)) return;

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("appSection").classList.remove("hidden");
    updateBalance();
  });

  addExpense.addEventListener("click", () => {
    const value = parseFloat(document.getElementById("expense").value);
    if (!isNaN(value)) {
      expenses.push({ value });
      renderExpenses();
      updateBalance();
      document.getElementById("expense").value = "";
    }
  });

  resetButton.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja resetar tudo?")) {
      dailyAmount = 0;
      expenses = [];
      document.getElementById("setup").classList.remove("hidden");
      document.getElementById("appSection").classList.add("hidden");
    }
  });
});
