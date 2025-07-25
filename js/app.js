// Seletores
const inputValorDiario = document.getElementById('valor-diario');
const btnSalvarConfig = document.getElementById('btn-salvar-config');
const saldoDiaEl = document.getElementById('saldo-dia');
const saldoAcumuladoEl = document.getElementById('saldo-acumulado');
const listaGastosEl = document.getElementById('lista-gastos');
const formGasto = document.getElementById('form-gasto');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const resumoSemanaEl = document.getElementById('resumo-semana');
const resumoMesEl = document.getElementById('resumo-mes');

let dados = JSON.parse(localStorage.getItem('saboya-financeiro')) || {
  valorDiario: 50,
  ultimaData: new Date().toISOString().slice(0,10),
  saldoAcumulado: 50,
  gastos: []
};

// Ajusta saldo acumulado considerando dias passados sem uso
function atualizarSaldoAcumulado() {
  const hoje = new Date().toISOString().slice(0,10);
  if(dados.ultimaData !== hoje) {
    const diffDias = Math.floor((new Date(hoje) - new Date(dados.ultimaData)) / (1000*60*60*24));
    if(diffDias > 0) {
      dados.saldoAcumulado += dados.valorDiario * diffDias;
      dados.ultimaData = hoje;
      dados.gastos = [];
    }
  }
}

// Salva dados no localStorage
function salvarDados() {
  localStorage.setItem('saboya-financeiro', JSON.stringify(dados));
}

// Atualiza a UI com dados atuais
function atualizarUI() {
  saldoDiaEl.textContent = `R$ ${dados.valorDiario.toFixed(2)}`;
  saldoAcumuladoEl.textContent = `R$ ${dados.saldoAcumulado.toFixed(2)}`;
  inputValorDiario.value = dados.valorDiario.toFixed(2);

  // Lista gastos
  listaGastosEl.innerHTML = '';
  dados.gastos.forEach((gasto, index) => {
    const li = document.createElement('li');

    const descSpan = document.createElement('span');
    descSpan.classList.add('desc');
    descSpan.textContent = `${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}`;

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.classList.add('edit');
    btnEditar.onclick = () => editarGasto(index);

    const btnApagar = document.createElement('button');
    btnApagar.textContent = 'Apagar';
    btnApagar.onclick = () => apagarGasto(index);

    li.appendChild(descSpan);
    li.appendChild(btnEditar);
    li.appendChild(btnApagar);

    listaGastosEl.appendChild(li);
  });

  atualizarResumo();
}

// Atualiza resumo semanal e mensal
function atualizarResumo() {
  const hoje = new Date();
  let somaSemana = 0;
  let somaMes = 0;

  dados.gastos.forEach(gasto => {
    const dataGasto = new Date(gasto.data);
    const diffDias = (hoje - dataGasto) / (1000*60*60*24);

    if(diffDias <= 7) somaSemana += gasto.valor;
    if(diffDias <= 30) somaMes += gasto.valor;
  });

  resumoSemanaEl.textContent = `R$ ${somaSemana.toFixed(2)}`;
  resumoMesEl.textContent = `R$ ${somaMes.toFixed(2)}`;
}

// Edita gasto (carrega para formulário)
function editarGasto(index) {
  const gasto = dados.gastos[index];
  descricaoInput.value = gasto.descricao;
  valorInput.value = gasto.valor;
  btnSalvarConfig.disabled = true;
  formGasto.dataset.editIndex = index;
  formGasto.querySelector('button[type="submit"]').textContent = 'Salvar';
}

// Apaga gasto
function apagarGasto(index) {
  const gasto = dados.gastos[index];
  dados.saldoAcumulado += gasto.valor;
  dados.gastos.splice(index, 1);
  salvarDados();
  atualizarUI();
}

// Salvar configuração do valor diário
btnSalvarConfig.onclick = () => {
  const novoValor = parseFloat(inputValorDiario.value);
  if(isNaN(novoValor) || novoValor <= 0) {
    alert('Informe um valor diário válido maior que zero.');
    return;
  }
  // Ajusta saldo acumulado para o novo valor do dia atual
  const diff = novoValor - dados.valorDiario;
  dados.saldoAcumulado += diff;
  dados.valorDiario = novoValor;
  salvarDados();
  atualizarUI();
  alert('Saldo diário atualizado com sucesso!');
}

// Evento submit do formulário de gasto
formGasto.onsubmit = (e) => {
  e.preventDefault();
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  if(!descricao || isNaN(valor) || valor <= 0) {
    alert('Preencha a descrição e um valor válido maior que zero.');
    return;
  }

  if(formGasto.dataset.editIndex !== undefined) {
    // Editando gasto existente
    const index = parseInt(formGasto.dataset.editIndex);
    const gastoAntigo = dados.gastos[index];
    // Ajusta saldo acumulado com a diferença do valor gasto
    dados.saldoAcumulado += gastoAntigo.valor;
    dados.gastos[index] = { descricao, valor, data: new Date().toISOString() };
    dados.saldoAcumulado -= valor;
    delete formGasto.dataset.editIndex;
    formGasto.querySelector('button[type="submit"]').textContent = 'Adicionar';
  } else {
    // Novo gasto
    dados.gastos.push({ descricao, valor, data: new Date().toISOString() });
    dados.saldoAcumulado -= valor;
  }

  salvarDados();
  atualizarUI();
  formGasto.reset();
}

// Inicialização
atualizarSaldoAcumulado();
atualizarUI();
