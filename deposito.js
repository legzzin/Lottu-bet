// ========== SELEÇÃO DE MÉTODO DE PAGAMENTO ==========

let selectedPaymentMethod = 'pix';

function selectPaymentMethod(method, element) {
  selectedPaymentMethod = method;

  // Remover classe active de todos os métodos
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('active');
  });

  // Adicionar classe active ao selecionado
  element.classList.add('active');

  // Esconder todos os formulários
  document.querySelectorAll('.payment-method-form').forEach(form => {
    form.style.display = 'none';
  });

  // Mostrar formulário selecionado
  const formId = method + 'Form';
  const form = document.getElementById(formId);
  if (form) {
    form.style.display = 'block';
  }

  console.log('Método de pagamento selecionado:', method);
}

// ========== DEFINIR VALOR ==========

function setAmount(value) {
  const pixAmount = document.getElementById('pixAmount');
  const cartaoAmount = document.getElementById('cartaoAmount');
  const transferenciaAmount = document.getElementById('transferenciaAmount');

  if (pixAmount) pixAmount.value = value;
  if (cartaoAmount) cartaoAmount.value = value;
  if (transferenciaAmount) transferenciaAmount.value = value;

  // Atualizar botões ativos
  document.querySelectorAll('.amount-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  event.target.classList.add('active');

  console.log('Valor selecionado: R$', value);
}

// ========== COPIAR CHAVE PIX ==========

function copyToClipboard() {
  const pixKey = 'e900862@gmail.com';

  navigator.clipboard.writeText(pixKey).then(() => {
    alert('✅ Chave PIX copiada para a área de transferência!');
    console.log('Chave PIX copiada');
  }).catch(() => {
    alert('❌ Erro ao copiar. Tente novamente.');
  });
}

// ========== PROCESSAR PAGAMENTO ==========

function processPayment(method) {
  console.log('Processando pagamento via:', method);

  // Verificar se usuário está logado
  const userInfo = localStorage.getItem('googleUser');
  if (!userInfo) {
    alert('❌ Você precisa estar logado para fazer um depósito!');
    window.location.href = 'index.html';
    return;
  }

  let amount = 0;

  if (method === 'pix') {
    amount = parseFloat(document.getElementById('pixAmount').value);
  } else if (method === 'cartao') {
    amount = parseFloat(document.getElementById('cartaoAmount').value);
  } else if (method === 'transferencia') {
    amount = parseFloat(document.getElementById('transferenciaAmount').value);
  }

  // Validar valor
  if (!amount || amount < 10 || amount > 50000) {
    showError('Por favor, insira um valor entre R$ 10 e R$ 50.000');
    return;
  }

  // Validações específicas por método
  if (method === 'cartao') {
    const numeroCartao = document.querySelector('#cartaoForm input[placeholder*="0000"]').value;
    const validade = document.querySelector('#cartaoForm input[placeholder*="12/25"]').value;
    const cvv = document.querySelector('#cartaoForm input[placeholder*="123"]').value;
    const titular = document.querySelector('#cartaoForm input[placeholder*="JOÃO"]').value;

    if (!numeroCartao || !validade || !cvv || !titular) {
      showError('Por favor, preencha todos os dados do cartão');
      return;
    }

    if (numeroCartao.replace(/\s/g, '').length !== 16) {
      showError('Número do cartão inválido');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(validade)) {
      showError('Validade deve estar no formato MM/AA');
      return;
    }

    if (cvv.length !== 3) {
      showError('CVV deve ter 3 dígitos');
      return;
    }
  }

  // Simular processamento
  console.log('Processando depósito de R$', amount, 'via', method);

  // Mostrar mensagem de sucesso
  setTimeout(() => {
    showSuccess(`✅ Depósito de R$ ${amount.toFixed(2)} processado com sucesso!`);

    // Atualizar saldo no localStorage
    const user = JSON.parse(userInfo);
    const currentBalance = parseFloat(localStorage.getItem('userBalance') || '0');
    const newBalance = currentBalance + amount;
    localStorage.setItem('userBalance', newBalance.toString());

    // Atualizar saldo na página
    updateBalance();

    // Redirecionar após 2 segundos
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }, 1500);
}

// ========== MOSTRAR MENSAGENS ==========

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  const errorDiv = document.getElementById('errorMessage');

  successDiv.textContent = message;
  successDiv.classList.add('active');
  errorDiv.classList.remove('active');

  console.log('Sucesso:', message);
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');

  errorDiv.textContent = '❌ ' + message;
  errorDiv.classList.add('active');
  successDiv.classList.remove('active');

  console.log('Erro:', message);
}

// ========== ATUALIZAR SALDO ==========

function updateBalance() {
  const balance = parseFloat(localStorage.getItem('userBalance') || '0');
  const balanceElements = document.querySelectorAll('.balance');

  balanceElements.forEach(el => {
    el.textContent = 'R$ ' + balance.toFixed(2).replace('.', ',');
  });
}

// ========== INICIALIZAR ==========

window.addEventListener('load', function() {
  console.log('Página de depósito carregada');

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

  // Formatar número do cartão
  const cartaoInput = document.querySelector('#cartaoForm input[placeholder*="0000"]');
  if (cartaoInput) {
    cartaoInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formatted;
    });
  }

  // Formatar validade
  const validadeInput = document.querySelector('#cartaoForm input[placeholder*="12/25"]');
  if (validadeInput) {
    validadeInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  // Formatar CVV
  const cvvInput = document.querySelector('#cartaoForm input[placeholder*="123"]');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
  }

  // Formatar nome do titular
  const titularInput = document.querySelector('#cartaoForm input[placeholder*="JOÃO"]');
  if (titularInput) {
    titularInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.toUpperCase();
    });
  }
});

// ========== EVENTOS DOS BOTÕES ==========

document.addEventListener('DOMContentLoaded', function() {
  // Botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logout();
      window.location.href = 'index.html';
    });
  }

  // Botão de login
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});
