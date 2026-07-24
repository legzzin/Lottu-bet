// ========== VARIÁVEIS GLOBAIS ==========

let currentBet = 10;
let gameActive = false;
let gameStarted = false;
let multiplier = 1.00;
let crashPoint = 0;
let startTime = 0;
let animationId = null;
let crashHistory = [];

let stats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalWinAmount: 0,
  totalLossAmount: 0
};

const canvas = document.getElementById('crashCanvas');
const ctx = canvas.getContext('2d');

// ========== REDIMENSIONAR CANVAS ==========

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = 300;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ========== DEFINIR APOSTA ==========

function setBet(amount) {
  if (gameStarted) {
    alert('Termine o jogo atual antes de mudar a aposta!');
    return;
  }

  currentBet = amount;
  document.getElementById('betDisplay').textContent = 'R$ ' + currentBet.toFixed(2).replace('.', ',');
  updatePotentialWin();

  document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ========== ATUALIZAR GANHO POTENCIAL ==========

function updatePotentialWin() {
  const potential = currentBet * multiplier;
  document.getElementById('potentialWin').textContent = 'R$ ' + potential.toFixed(2).replace('.', ',');
  document.getElementById('currentMultiplier').textContent = multiplier.toFixed(2) + 'x';
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
  document.getElementById('customBet').disabled = true;

  gameActive = true;
  gameStarted = true;
  multiplier = 1.00;
  startTime = Date.now();

  // Gerar ponto de crash aleatório (entre 1.05x e 5x)
  crashPoint = 1.05 + Math.random() * 3.95;

  document.getElementById('resultMessage').textContent = '';
  document.getElementById('multiplierDisplay').style.display = 'none';
  updatePotentialWin();

  // Iniciar animação
  animate();

  console.log('Jogo iniciado. Crash em:', crashPoint.toFixed(2) + 'x');
}

// ========== ANIMAÇÃO ==========

function animate() {
  const elapsed = (Date.now() - startTime) / 1000;
  
  // Calcular multiplicador (crescimento exponencial - mais lento)
  multiplier = 1 + (elapsed * 0.15);

  if (multiplier >= crashPoint) {
    // CRASH!
    endGame(false);
    return;
  }

  updatePotentialWin();
  drawChart();

  // Atualizar tempo
  document.getElementById('elapsedTime').textContent = elapsed.toFixed(1) + 's';

  animationId = requestAnimationFrame(animate);
}

// ========== DESENHAR GRÁFICO ==========

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;

  for (let i = 0; i < canvas.width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < canvas.height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Desenhar linha do multiplicador
  const elapsed = (Date.now() - startTime) / 1000;
  const maxTime = 20;
  const maxMultiplier = 10;

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let t = 0; t <= elapsed; t += 0.1) {
    const m = 1 + (t * 0.5);
    const x = (t / maxTime) * canvas.width;
    const y = canvas.height - (m / maxMultiplier) * canvas.height;

    if (t === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();

  // Desenhar ponto atual
  const x = (elapsed / maxTime) * canvas.width;
  const y = canvas.height - (multiplier / maxMultiplier) * canvas.height;

  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Não mostrar linha de crash (surpresa!)
}

// ========== SACAR ==========

function cashout() {
  if (!gameStarted) return;

  const winAmount = currentBet * multiplier;
  endGame(true, winAmount);
}

// ========== FINALIZAR JOGO ==========

function endGame(isWin, customWinAmount = null) {
  gameActive = false;
  cancelAnimationFrame(animationId);

  const resultDiv = document.getElementById('resultMessage');
  const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
  let newBalance;

  // Adicionar ao histórico
  const crashValue = isWin ? multiplier.toFixed(2) : crashPoint.toFixed(2);
  crashHistory.unshift({
    value: crashValue,
    win: isWin,
    amount: customWinAmount || currentBet
  });

  if (crashHistory.length > 10) {
    crashHistory.pop();
  }

  updateCrashHistory();

  if (isWin) {
    const winAmount = customWinAmount || (currentBet * multiplier);
    newBalance = currentBalance - currentBet + winAmount;

    resultDiv.textContent = `✅ VOCÊ SACOU! +R$ ${winAmount.toFixed(2)}`;
    resultDiv.classList.add('win');
    resultDiv.classList.remove('lose');

    stats.totalWins++;
    stats.totalWinAmount += winAmount;
  } else {
    newBalance = currentBalance - currentBet;

    resultDiv.textContent = `❌ VOCÊ PERDEU! Crash em ${crashPoint.toFixed(2)}x`;
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

  // Habilitar botões
  document.getElementById('startBtn').disabled = false;
  document.getElementById('cashoutBtn').disabled = true;
  document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = false);
  document.getElementById('customBet').disabled = false;

  gameStarted = false;
}

// ========== ATUALIZAR HISTÓRICO ==========

function updateCrashHistory() {
  const historyDiv = document.getElementById('crashHistory');
  
  if (crashHistory.length === 0) {
    historyDiv.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">Nenhum crash ainda</div>';
    return;
  }

  historyDiv.innerHTML = crashHistory.map(crash => `
    <div style="padding: 8px; background: #0a0a0a; border-radius: 6px; border-left: 3px solid ${crash.win ? '#00ff88' : '#ff3333'}; font-size: 0.9rem;">
      <span style="color: ${crash.win ? '#00ff88' : '#ff3333'}; font-weight: bold;">${crash.value}x</span>
      <span style="color: #999;"> - ${crash.win ? '✓' : '✗'}</span>
    </div>
  `).join('');
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
  console.log('Jogo Crash carregado');

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

  // Atualizar saldo
  updateBalance();

  // Carregar estatísticas
  const savedStats = localStorage.getItem('crashStats');
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
  resizeCanvas();
  drawChart();
});

// ========== SALVAR ESTATÍSTICAS ==========

window.addEventListener('beforeunload', function() {
  localStorage.setItem('crashStats', JSON.stringify(stats));
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
