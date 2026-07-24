# Lottu Bet - Apostas Esportivas

Um site de apostas esportivas com autenticação real via Google OAuth.

## 🚀 Início Rápido

### 1. Obter o Client ID do Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto (ou selecione um existente)
3. Vá para **APIs e Serviços** → **Biblioteca**
4. Procure por **Google Identity Services** e clique em **Ativar**
5. Vá para **Credenciais** no menu lateral
6. Clique em **+ Criar Credenciais** → **ID do Cliente OAuth 2.0**
7. Selecione **Aplicativo da Web**
8. Configure as **URIs de redirecionamento autorizadas**:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `http://localhost:8000`
   - `http://127.0.0.1:5500` (se usar Live Server do VS Code)
   - Seu domínio final (ex: `https://seu-site.com`)

9. Clique em **Criar**
10. Copie o **Client ID** (formato: `xxxxx-xxxxx.apps.googleusercontent.com`)

### 2. Adicionar o Client ID ao Código

Abra o arquivo `index.html` e procure por esta linha:

```html
<div id="g_id_onload"
     data-client_id="SEU_CLIENT_ID_AQUI"
     data-callback="handleCredentialResponse"
     style="display: none;">
</div>
```

Substitua `SEU_CLIENT_ID_AQUI` pelo seu Client ID real:

```html
<div id="g_id_onload"
     data-client_id="123456789-abcdefg.apps.googleusercontent.com"
     data-callback="handleCredentialResponse"
     style="display: none;">
</div>
```

### 3. Testar Localmente

1. Abra o arquivo `index.html` em um navegador
2. Clique no botão **"Entrar"**
3. Selecione sua conta Google
4. Seu nome e foto devem aparecer no topo do site

## 📋 Funcionalidades

✅ **Login com Google Real** - Autenticação 100% real via Google OAuth  
✅ **Exibição do Nome e Foto** - Dados do usuário aparecem no topo  
✅ **Logout** - Botão para desconectar  
✅ **Persistência** - Usuário permanece logado ao recarregar  
✅ **Proteção de Apostas** - Requer login para fazer apostas  
✅ **Design Responsivo** - Funciona em desktop e mobile  

## 📁 Arquivos

- `index.html` - Estrutura HTML com Google Sign-In
- `script.js` - Lógica de autenticação e renderização
- `style.css` - Estilos do site
- `README.md` - Este arquivo

## 🔍 Troubleshooting

### "Erro: Google Sign-In não carregou"
- Verifique se o Client ID está correto
- Verifique se o domínio está na lista de URIs autorizadas
- Abra o console do navegador (F12) para ver mensagens de erro

### "Botão do Google não aparece"
- Aguarde alguns segundos para a biblioteca carregar
- Verifique se JavaScript está ativado
- Tente recarregar a página

### "Erro ao fazer login"
- Verifique se está usando HTTPS em produção
- Certifique-se de que o Client ID está correto
- Verifique as URIs autorizadas no Google Cloud Console

## 🌐 Deploy em Produção

1. Atualize o Client ID para seu domínio final
2. Adicione seu domínio às URIs autorizadas:
   - JavaScript: `https://seu-site.com`
   - Redirecionamento: `https://seu-site.com`
3. Certifique-se de usar HTTPS
4. Faça upload dos arquivos para seu servidor

## 📝 Estrutura do Código

### handleCredentialResponse()
Função chamada quando o usuário faz login com sucesso. Decodifica o JWT e exibe as informações.

### parseJwt()
Decodifica o token JWT para extrair informações do usuário (nome, email, foto).

### displayUserInfo()
Exibe o nome, email e foto do usuário no topo do site.

### logout()
Remove os dados de login e restaura os botões de login.

## ⚠️ Segurança

Este é um exemplo de cliente. Para produção:

1. **Implemente um backend** para validar tokens
2. **Use HTTPS** sempre em produção
3. **Implemente CSRF protection**
4. **Valide tokens no servidor**
5. **Use cookies seguros** (HttpOnly, Secure, SameSite)
6. **Nunca exponha secrets** no código frontend

## 📞 Suporte

Para mais informações:
- [Documentação Google Sign-In](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Guia de Configuração OAuth](https://developers.google.com/identity/protocols/oauth2)

## 📄 Licença

Este projeto é fornecido como exemplo educacional.
