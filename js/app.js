document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "saboyaAppData";

  // ===== Helpers de número/format =====
  const fmtBRL = (n) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

  /**
   * Parser robusto para valores monetários.
   * - Aceita: "23,5", "23.5", "1.234,56", "1,234.56", "R$ 1.234,56" etc.
   * - Usa o ÚLTIMO separador como decimal e remove os demais (milhar).
   * - Retorna NaN quando não há número válido.
   */
  function parseNumberSmart(input) {
    if (typeof input === "number") return input;
    if (input === null || input === undefined) return NaN;
    let s = String(input).trim();
    if (!s) return NaN;

    s = s.replace(/\u202F/g, "").replace(/\s|R\$\s?/gi, "");
    const hasComma = s.includes(",");
    const hasDot   = s.includes(".");

    if (hasComma && hasDot) {
      const lastComma = s.lastIndexOf(",");
      const lastDot   = s.lastIndexOf(".");
      const decimalIsComma = lastComma > lastDot;
      if (decimalIsComma) {
        s = s.replace(/\./g, "");
        s = s.replace(/,([^,]*)$/, ".$1");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (hasComma) {
      const parts = s.split(",");
      if (parts.length > 2) {
        const dec = parts.pop();
        s = parts.join("") + "." + dec;
      } else {
        s = s.replace(",", ".");
      }
    } else if (hasDot) {
      const parts = s.split(".");
      if (parts.length > 2) {
        const dec = parts.pop();
        s = parts.join("") + "." + dec;
      }
    }

    s = s.replace(/[^0-9\.\-]/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  // Sanitizador leve (não muda a UI)
  function attachNumericSanitizer(el) {
    if (!el) return;
    el.addEventListener("input", () => {
      const clean = el.value.replace(/[^\d,\.]/g, "");
      if (clean !== el.value) el.value = clean;
    }, { passive: true });
  }

  // ===== Elementos =====
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

  // aplica sanitizador nos inputs numéricos
  attachNumericSanitizer(dailyAmountInput);
  attachNumericSanitizer(expenseInput);

  // ===== Datas =====
  function getTodayDate() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 3); // Ajusta para UTC-3
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // ===== Storage robusto =====
  function isValidState(obj) {
    if (!obj || typeof obj !== "object") return false;
    const okExp = Array.isArray(obj.expenses);
    const okDaily = typeof obj.dailyAmount === "number";
    const okBalance = typeof obj.lastBalance === "number";
    const okDate = typeof obj.currentDate === "string" && obj.currentDate.length === 10;
    return okExp && okDaily && okBalance && okDate;
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return isValidState(data) ? data : null;
    } catch {
      // JSON inválido → limpa chave para não travar a UI
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      return null;
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Falha ao salvar dados:", e);
    }
  }

  // ===== Cálculos =====
  function calculateBalance(data) {
    const expensesToday = (data.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return round2((data.lastBalance || 0) + (data.dailyAmount || 0) - expensesToday);
  }

  function checkNewDay(data) {
    const today = getTodayDate();
    if (data.currentDate !== today) {
      const yesterdayBalance = calculateBalance(data);
      data.lastBalance = round2(yesterdayBalance);
      data.currentDate = today;
      data.expenses = [];
      saveData(data);
    }
  }

  // ===== UI =====
  function updateExpenseList(data) {
    expenseList.innerHTML = "";
    (data.expenses || []).forEach((expense, index) => {
      const li = document.createElement("li");

      const amountSpan = document.createElement("span");
      amountSpan.className = "amount";
      amountSpan.textContent = `- ${fmtBRL(expense.amount)}`;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Editar";
      editBtn.className = "edit-btn";
      editBtn.addEventListener("click", () => {
        const newValue = prompt("Novo valor:", String(expense.amount).replace(".", ","));
        const parsed = parseNumberSmart(newValue);
        if (!isNaN(parsed) && parsed > 0) {
          data.expenses[index].amount = round2(parsed);
          saveData(data);
          updateDisplay(data);
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Apagar";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", () => {
        data.expenses.splice(index, 1);
        saveData(data);
        updateDisplay(data);
      });

      li.appendChild(amountSpan);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      expenseList.appendChild(li);
    });
  }

  function updateDisplay(data) {
    if (!data) return;
    checkNewDay(data);

    const balance = calculateBalance(data);
    balanceDisplay.textContent = fmtBRL(balance);

    balanceDisplay.classList.toggle("balance-negative", balance < 0);
    balanceDisplay.classList.toggle("balance-positive", balance >= 0);

    updateExpenseList(data);
  }

  function initApp(data) {
    setupSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    updateDisplay(data);
  }

  // ===== Boot =====
  const existingData = loadData();
  if (existingData) {
    initApp(existingData);
  } else {
    // garante UI limpa em caso de storage inválido
    setupSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }

  // ===== Listeners =====
  startButton.addEventListener("click", () => {
    const dailyAmount = parseNumberSmart(dailyAmountInput.value);
    const startDate = startDateInput.value;
    const today = getTodayDate();

    if (!startDate || isNaN(dailyAmount) || dailyAmount <= 0) {
      alert("Preencha os campos corretamente.");
      return;
    }

    const data = {
      startDate,
      dailyAmount: round2(dailyAmount),
      expenses: [],
      currentDate: today,
      lastBalance: 0
    };

    saveData(data);
    initApp(data);
  });

  addExpenseButton.addEventListener("click", () => {
    const value = parseNumberSmart(expenseInput.value);
    if (isNaN(value) || value <= 0) {
      alert("Valor inválido.");
      return;
    }

    const data = loadData();
    if (!data) {
      alert("Configuração não encontrada. Inicie o app informando data e valor diário.");
      return;
    }

    data.expenses.push({ amount: round2(value) });
    saveData(data);
    expenseInput.value = "";
    updateDisplay(data);
  });

  resetButton.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
});
