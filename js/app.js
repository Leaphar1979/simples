const saldoDiaEl = document.getElementById('saldo-dia');
const saldoAcumuladoEl = document.getElementById('saldo-acumulado');
const listaGastosEl = document.getElementById('lista-gastos');
const formGasto = document.getElementById('form-gasto');

const valorDiario = 50;
const hoje = new Date().toISOString().slice(0, 10);

const dados = JSON.parse(localStorage.getItem('saboya-financeiro')) || {
  ultimaData: hoje,
  saldoAcumulado: valorDiario,
  gastos: []
};

if (dados.ultimaData !== hoje) {
  const diffDias = (new Date(hoje) - new Date(dados.ultimaData)) / (1000 * 60 * 60 * 24);
  dados.saldoAcumulado += valorDiario * diffDias;
  dados.ultimaData = hoje;
  dados.gastos = [];
}

atualizarTela();

formGasto.addEventListener('submit', (e) => {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  if (!descricao || isNaN(valor)) return;
  dados.gastos.push({ descricao, valor });
  dados.saldoAcumulado -= valor;
  salvar();
  atualizarTela();
  formGasto.reset();
});

function salvar() {
  localStorage.setItem('saboya-financeiro', JSON.stringify(dados));
}

function atualizarTela() {
  saldoDiaEl.textContent = `R$ ${valorDiario.toFixed(2)}`;
  saldoAcumuladoEl.textContent = `R$ ${dados.saldoAcumulado.toFixed(2)}`;
  listaGastosEl.innerHTML = '';
  dados.gastos.forEach((gasto) => {
    const li = document.createElement('li');
    li.textContent = `${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}`;
    listaGastosEl.appendChild(li);
  });
}
