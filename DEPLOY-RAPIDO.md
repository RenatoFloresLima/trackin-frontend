# 🚀 Deploy Rápido - Frontend no Vercel

## ✅ Backend já está online!
**URL do Backend:** `https://trackin-4aao.onrender.com`

## 📋 Passo a Passo

### 1️⃣ Preparar o Código

```bash
cd frontend
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### 2️⃣ Criar Projeto no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Se ainda não conectou, conecte seu repositório GitHub
4. Selecione o repositório do frontend

### 3️⃣ Configurar o Projeto

**Configurações:**
- **Framework Preset**: `Vite` (deve ser detectado automaticamente)
- **Root Directory**: `frontend` (se estiver em monorepo, caso contrário deixe vazio)
- **Build Command**: `npm run build` (já vem preenchido)
- **Output Directory**: `dist` (já vem preenchido)
- **Install Command**: `npm install` (já vem preenchido)

**Variáveis de Ambiente:**
Clique em **"Environment Variables"** e adicione:

```
Nome: VITE_API_BASE_URL
Valor: https://trackin-4aao.onrender.com
```

⚠️ **IMPORTANTE:**
- Não inclua barra no final da URL
- Certifique-se de que a variável está marcada para **Production**, **Preview** e **Development**

### 4️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Anote a URL gerada (ex: `https://trackin-frontend.vercel.app`)

### 5️⃣ Atualizar CORS no Backend

Após obter a URL do frontend:

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Vá no seu serviço `trackin-backend`
3. Clique em **"Environment"**
4. Atualize a variável `APP_CORS_ALLOWED_ORIGINS`:
   ```
   APP_CORS_ALLOWED_ORIGINS=https://sua-url-frontend.vercel.app
   ```
5. Clique em **"Save Changes"**
6. Aguarde o redeploy automático (1-2 minutos)

### 6️⃣ Testar

1. Acesse a URL do frontend
2. Tente fazer login
3. Verifique se está funcionando!

## 🐛 Problemas Comuns

### Erro de CORS
- Verifique se atualizou `APP_CORS_ALLOWED_ORIGINS` no Render
- Aguarde o redeploy do backend

### Erro de API
- Verifique se `VITE_API_BASE_URL` está configurada corretamente no Vercel
- Certifique-se de que não há barra no final da URL

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Tente fazer um build local: `npm run build`

## ✅ Pronto!

Sua aplicação está online! 🎉

