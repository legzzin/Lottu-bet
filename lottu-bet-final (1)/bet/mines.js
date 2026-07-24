// ========== VARIÁVEIS GLOBAIS ==========

let currentBet = 10;
let minesCount = 20;
let gameActive = false;
let gameStarted = false;
let cellsOpened = 0;
let minePositions = [];
const totalCells = 25;

let stats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalWinAmount: 0,
  totalLossAmount: 0
};

// ========== INICIALIZAR GRID ==========

function initializeGrid() {
  const grid = document.getElementById('minesGrid');
  grid.innerHTML = '';

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'mine-cell';
    cell.textContent = '?';
    cell.dataset.index = i;
    cell.onclick = () => revealCell(i);
    grid.appendChild(cell);
  }
}

// ========== DEFINIR APOSTA ==========

function setBet(amount) {
  if (gameStarted) {
    alert('Termine o jogo atual antes de mudar a aposta!');
    return;
  }

  currentBet = amount;
  document.getElementById('betDisplay').textContent = 'R$ ' + currentBet.toFixed(2).replace('.', ',');

  document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ========== DEFINIR MINAS ==========

function setMines(count) {
  if (gameStarted) {
    alert('Termine o jogo atual antes de mudar as minas!');
    return;
  }

  minesCount = count;
  document.getElementById('minesCount').textContent = count;

  const safeCells = totalCells - count;
  document.getElementById('safeCells').textContent = safeCells;

  document.querySelectorAll('.mines-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  updateMultiplier();
}

// ========== ATUALIZAR MULTIPLICADOR ==========

function updateMultiplier() {
  const safeCells = totalCells - minesCount;
  const baseMultiplier = 1 + (cellsOpened / safeCells) * 2;
  const multiplier = Math.max(1, baseMultiplier).toFixed(2);

  document.getElementById('multiplierDisplay').textContent = multiplier + 'x';
  return parseFloat(multiplier);
}

// ========== INICIAR JOGO ==========

function startGame() {
  // Verificar login
  const userInfo = localStorage.getItem('googleUser');
  if (!userInfo) {
    alert('Por favor, faça login para jogar!');
    return;
  }

  // Verificar saldo
  const balance = parseFloat(localStorage.getItem('userBalance') || '0');
  if (balance < currentBet) {
    alert('❌ Saldo insuficiente! Você precisa de R$ ' + currentBet.toFixed(2));
    return;
  }

  // Desabilitar entrada
  document.getElementById('startBtn').disabled = true;
  document.getElementById('cashoutBtn').disabled = false;
  document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = true);
  document.querySelectorAll('.mines-btn').forEach(btn => btn.disabled = true);
  document.getElementById('customBet').disabled = true;

  gameActive = true;
  gameStarted = true;
  cellsOpened = 0;

  // Gerar posições de minas
  minePositions = [];
  while (minePositions.length < minesCount) {
    const pos = Math.floor(Math.random() * totalCells);
    if (!minePositions.includes(pos)) {
      minePositions.push(pos);
    }
  }

  // Desabilitar células
  document.querySelectorAll('.mine-cell').forEach(cell => {
    cell.classList.remove('revealed', 'safe', 'mine');
    cell.textContent = '?';
    cell.classList.remove('disabled');
  });

  document.getElementById('cellsOpened').textContent = '0';
  document.getElementById('resultMessage').textContent = '';
  updateMultiplier();

  console.log('Jogo iniciado. Minas em:', minePositions);
}

// ========== REVELAR CÉLULA ==========

function revealCell(index) {
  if (!gameActive || !gameStarted) return;

  const cell = document.querySelector(`[data-index="${index}"]`);
  if (cell.classList.contains('revealed')) return;

  cell.classList.add('revealed');

  if (minePositions.includes(index)) {
    // Acertou uma mina - PERDEU
    cell.classList.add('mine');
    cell.textContent = '💣';
    endGame(false);
  } else {
    // Célula segura
    cell.classList.add('safe');
    cell.textContent = '✓';
    cellsOpened++;
    document.getElementById('cellsOpened').textContent = cellsOpened;
    updateMultiplier();

    // Verificar se abriu todas as células seguras
    const safeCells = totalCells - minesCount;
    if (cellsOpened === safeCells) {
      // Ganho reduzido: 1.05x por célula aberta
      const winAmount = currentBet * (1 + cellsOpened * 0.05);
      endGame(true, winAmount);
    }
  }
}

// ========== SACAR ==========

function cashout() {
  if (!gameStarted) return;

  const multiplier = parseFloat(document.getElementById('multiplierDisplay').textContent);
  const winAmount = currentBet * multiplier;

  endGame(true, winAmount);
}

// ========== FINALIZAR JOGO ==========

function endGame(isWin, customWinAmount = null) {
  gameActive = false;
  const resultDiv = document.getElementById('resultMessage');

  // Revelar todas as minas
  minePositions.forEach(pos => {
    const cell = document.querySelector(`[data-index="${pos}"]`);
    if (!cell.classList.contains('revealed')) {
      cell.classList.add('mine', 'revealed');
      cell.textContent = '💣';
    }
  });

  // Desabilitar botões
  document.getElementById('startBtn').disabled = false;
  document.getElementById('cashoutBtn').disabled = true;
  document.querySelectorAll('.mine-cell').forEach(cell => cell.classList.add('disabled'));

  // Atualizar saldo
  const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
  let newBalance;

  if (isWin) {
    const winAmount = customWinAmount || (currentBet * parseFloat(document.getElementById('multiplierDisplay').textContent));
    newBalance = currentBalance - currentBet + winAmount;

    resultDiv.textContent = `✅ VOCÊ GANHOU! +R$ ${winAmount.toFixed(2)}`;
    resultDiv.classList.add('win');
    resultDiv.classList.remove('lose');

    stats.totalWins++;
    stats.totalWinAmount += winAmount;
  } else {
    newBalance = currentBalance - currentBet;

    resultDiv.textContent = `❌ VOCÊ PERDEU! -R$ ${currentBet.toFixed(2)}`;
    resultDiv.classList.add('lose');
    resultDiv.classList.remove('win');

    stats.totalLosses++;
    stats.totalLossAmount += currentBet;
  }

  stats.totalGames++;

  // Salvar saldo
  localStorage.setItem('userBalance', newBalance.toString());

  // Atualizar UI
  updateBalance();
  updateStats();

  // Habilitar botões de entrada
  document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = false);
  document.querySelectorAll('.mines-btn').forEach(btn => btn.disabled = false);
  document.getElementById('customBet').disabled = false;

  gameStarted = false;
}

// ========== RESETAR JOGO ==========

function resetGame() {
  gameActive = false;
  gameStarted = false;
  cellsOpened = 0;
  minePositions = [];

  document.getElementById('startBtn').disabled = false;
  document.getElementById('cashoutBtn').disabled = true;
  document.getElementById('resultMessage').textContent = '';

  document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = false);
  document.querySelectorAll('.mines-btn').forEach(btn => btn.disabled = false);
  document.getElementById('customBet').disabled = false;

  document.getElementById('cellsOpened').textContent = '0';
  document.getElementById('multiplierDisplay').textContent = '1.00x';

  initializeGrid();
}

// ========== ATUALIZAR SALDO ==========

function updateBalance() {
  const balance = parseFloat(localStorage.getItem('userBalance') || '0');
  const balanceText = 'R$ ' + balance.toFixed(2).replace('.', ',');

  document.getElementById('headerBalance').textContent = balanceText;
  document.getElementById('balanceBtn').textContent = balanceText;
}

// ========== ATUALIZAR ESTATÍSTICAS ==========

function updateStats() {
  document.getElementById('totalGames').textContent = stats.totalGames;
  document.getElementById('totalWinsCount').textContent = stats.totalWins;
  document.getElementById('totalLossesCount').textContent = stats.totalLosses;
  document.getElementById('totalWins').textContent = 'R$ ' + stats.totalWinAmount.toFixed(2).replace('.', ',');
  document.getElementById('totalLosses').textContent = 'R$ ' + stats.totalLossAmount.toFixed(2).replace('.', ',');
}

// ========== IR PARA DEPÓSITO ==========

function goToDeposit() {
  const userInfo = localStorage.getItem('googleUser');
  if (!userInfo) {
    alert('Por favor, faça login para adicionar saldo!');
    document.getElementById('loginBtn').click();
  } else {
    window.location.href = 'deposito.html';
  }
}

// ========== INICIALIZAR ==========

window.addEventListener('load', function() {
  console.log('Jogo Mines carregado');

  // Carregar informações do usuário
  const userInfo = localStorage.getItem('googleUser');
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      displayUserInfo(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  }

  // Inicializar grid
  initializeGrid();

  // Atualizar saldo
  updateBalance();

  // Carregar estatísticas
  const savedStats = localStorage.getItem('minesStats');
  if (savedStats) {
    try {
      stats = JSON.parse(savedStats);
      updateStats();
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  // Definir valores padrão
  setBet(10);
  setMines(20);
});

// ========== SALVAR ESTATÍSTICAS ==========

window.addEventListener('beforeunload', function() {
  localStorage.setItem('minesStats', JSON.stringify(stats));
});

// ========== EVENTOS DOS BOTÕES ==========

document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logout();
      window.location.href = 'index.html';
    });
  }

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});
