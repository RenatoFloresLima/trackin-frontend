# 🚀 Guia de Deploy - Frontend (Vercel)

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (gratuita)
2. Repositório no GitHub com o código do frontend
3. Backend já deployado e URL disponível

## Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que seu código está no GitHub:

```bash
cd frontend
git add .
git commit -m "Preparar para deploy"
git push origin main
```

### 2. Criar Projeto no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Conecte seu repositório GitHub (se ainda não conectou)
4. Selecione o repositório do frontend

### 3. Configurar o Projeto

**Configurações Automáticas:**
- **Framework Preset**: Vite (detectado automaticamente)
- **Root Directory**: `frontend` (se estiver em monorepo)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Variáveis de Ambiente:**
Adicione a seguinte variável:

```
VITE_API_BASE_URL=https://trackin-4aao.onrender.com
```

**Importante:**
- Use a URL exata do seu backend: `https://trackin-4aao.onrender.com`
- Não inclua barra no final da URL

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy (geralmente 2-3 minutos)
3. Anote a URL gerada (ex: `https://trackin-frontend.vercel.app`)

### 5. Atualizar CORS no Backend

Após obter a URL do frontend, atualize a variável de ambiente no Render:

```
APP_CORS_ALLOWED_ORIGINS=https://trackin-frontend.vercel.app
```

E reinicie o serviço no Render.

### 6. Verificar Deploy

Acesse a URL do frontend e teste o login.

## Alternativa: Netlify

Se preferir Netlify:

1. Acesse [Netlify](https://netlify.com)
2. Conecte seu repositório
3. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**: `VITE_API_BASE_URL`

## Troubleshooting

- **Erro de build**: Verifique se todas as dependências estão no `package.json`
- **Erro de API**: Verifique se `VITE_API_BASE_URL` está configurada corretamente
- **CORS Error**: Verifique se o backend permite a origem do frontend

