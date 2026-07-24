// ========== CONFIGURAÇÃO GOOGLE SIGN-IN ==========

// Variável global para armazenar o token
let googleToken = null;

// Função chamada quando o usuário faz login com Google
function handleCredentialResponse(response) {
  console.log('Login bem-sucedido!', response);
  
  // Decodificar o JWT
  const userInfo = parseJwt(response.credential);
  console.log('Informações do usuário:', userInfo);
  
  // Salvar token e informações
  googleToken = response.credential;
  localStorage.setItem('googleToken', response.credential);
  localStorage.setItem('googleUser', JSON.stringify(userInfo));
  
  // Exibir informações do usuário
  displayUserInfo(userInfo);
}

// Função para decodificar JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

// Função para exibir informações do usuário
function displayUserInfo(userInfo) {
  if (!userInfo) return;
  
  const userInfoDiv = document.getElementById('userInfo');
  const loginButtonsDiv = document.getElementById('loginButtons');
  const userNameSpan = document.getElementById('userName');
  const userEmailSpan = document.getElementById('userEmail');
  const userPhotoImg = document.getElementById('userPhoto');
  
  // Exibir nome, email e foto
  userNameSpan.textContent = userInfo.name || 'Usuário';
  userEmailSpan.textContent = userInfo.email || '';
  if (userInfo.picture) {
    userPhotoImg.src = userInfo.picture;
    userPhotoImg.style.display = 'block';
  }
  
  // Mostrar informações do usuário e esconder botões de login
  userInfoDiv.style.display = 'flex';
  loginButtonsDiv.style.display = 'none';
  
  console.log('Usuário logado:', userInfo.name);
}

// Função para fazer logout
function logout() {
  console.log('Fazendo logout...');
  
  // Limpar dados
  googleToken = null;
  localStorage.removeItem('googleToken');
  localStorage.removeItem('googleUser');
  
  // Fazer logout do Google
  google.accounts.id.disableAutoSelect();
  
  // Esconder informações do usuário
  document.getElementById('userInfo').style.display = 'none';
  document.getElementById('loginButtons').style.display = 'flex';
  
  console.log('Logout realizado');
}

// Inicializar quando a página carrega
window.addEventListener('load', function() {
  console.log('Página carregada, inicializando Google Sign-In...');
  
  // Atualizar saldo
  updateBalance();
  
  // Verificar se há um usuário já logado
  const savedUser = localStorage.getItem('googleUser');
  if (savedUser) {
    try {
      const userInfo = JSON.parse(savedUser);
      displayUserInfo(userInfo);
    } catch (error) {
      console.error('Erro ao carregar usuário salvo:', error);
    }
  }
  
  // Renderizar o botão do Google Sign-In
  if (window.google && window.google.accounts && window.google.accounts.id) {
    console.log('Google Sign-In disponível');
    
    google.accounts.id.initialize({
      client_id: document.getElementById('g_id_onload').getAttribute('data-client_id'),
      callback: handleCredentialResponse,
      auto_select: false,
      itp_support: true
    });
    
    // Renderizar o botão quando "Entrar" é clicado
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        google.accounts.id.renderButton(
          document.createElement('div'),
          {
            type: 'standard',
            size: 'large',
            text: 'signin_with',
            locale: 'pt_BR'
          }
        );
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Se o prompt não aparecer, mostrar o botão em um modal
            showGoogleSignInButton();
          }
        });
      });
    }
  } else {
    console.error('Google Sign-In não carregou corretamente');
  }
  
  // Renderizar partidas
  renderLiveMatches();
});

// Função para mostrar botão do Google em um modal
function showGoogleSignInButton() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Fazer Login</h2>
      <p>Selecione sua conta Google para continuar</p>
      <div id="googleButtonContainer" style="display: flex; justify-content: center; margin-top: 20px;"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Renderizar botão do Google no modal
  google.accounts.id.renderButton(
    document.getElementById('googleButtonContainer'),
    {
      type: 'standard',
      size: 'large',
      text: 'signin_with',
      locale: 'pt_BR'
    }
  );
  
  // Fechar modal
  modal.querySelector('.close-modal').addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ========== EVENTOS DOS BOTÕES ==========

document.addEventListener('DOMContentLoaded', function() {
  // Botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logout();
    });
  }
});

// ========== DADOS E RENDERIZAÇÃO DE PARTIDAS ==========

const liveMatches = [
  {
    time: "AO VIVO",
    team1: "Flamengo",
    team2: "Palmeiras",
    score: "1 - 0",
    odds: ["2.45", "3.10", "2.80"]
  },
  {
    time: "AO VIVO",
    team1: "São Paulo",
    team2: "Santos",
    score: "2 - 2",
    odds: ["1.95", "3.50", "3.80"]
  },
  {
    time: "14:30",
    team1: "Corinthians",
    team2: "Grêmio",
    score: "-",
    odds: ["2.10", "3.40", "3.20"]
  },
  {
    time: "16:00",
    team1: "Atlético MG",
    team2: "Botafogo",
    score: "-",
    odds: ["2.30", "3.25", "3.10"]
  }
];

function renderLiveMatches() {
  const container = document.getElementById('liveMatches');
  if (!container) return;
  
  container.innerHTML = liveMatches.map(match => `
    <div class="match-card">
      <div class="match-header">
        <span style="color:#ff3333;">${match.time}</span>
        <span>Brasileirão Série A</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin:15px 0;">
        <div style="flex:1;">${match.team1}</div>
        <div style="font-size:2rem; font-weight:bold; color:#00ff88;">${match.score}</div>
        <div style="flex:1; text-align:right;">${match.team2}</div>
      </div>
      <div class="odds">
        <div class="odd">${match.odds[0]}</div>
        <div class="odd">${match.odds[1]}</div>
        <div class="odd">${match.odds[2]}</div>
      </div>
    </div>
  `).join('');
}

// Ir para página de depósito
function goToDeposit() {
  const userInfo = localStorage.getItem('googleUser');
  if (!userInfo) {
    alert('Por favor, faça login para adicionar saldo!');
    document.getElementById('loginBtn').click();
  } else {
    window.location.href = 'deposito.html';
  }
}

// Atualizar saldo na página
function updateBalance() {
  const balance = parseFloat(localStorage.getItem('userBalance') || '0');
  const balanceBtn = document.getElementById('balanceBtn');
  if (balanceBtn) {
    balanceBtn.textContent = 'R$ ' + balance.toFixed(2).replace('.', ',');
  }
}

// Clique nas odds
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('odd')) {
    const userInfo = localStorage.getItem('googleUser');
    if (!userInfo) {
      alert('Por favor, faça login para fazer uma aposta!');
      document.getElementById('loginBtn').click();
    } else {
      alert('Odd selecionada! (Simulação - adicione lógica de aposta aqui)');
    }
  }
});
