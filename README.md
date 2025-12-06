
<h1>Lúmina AI - Inteligência Financeira</h1>

<p>
    O futuro do seu controle financeiro. Um dashboard inteligente com insights de IA para maximizar seu patrimônio e simplificar sua vida financeira.
</p>

<p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="ExpressJS">
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
    <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI">
</p>

</div>

## 📋 Índice

*   [Sobre o Projeto](#-sobre-o-projeto)
*   [✨ Funcionalidades](#-funcionalidades)
*   [🛠️ Tecnologias Utilizadas](#-tecnologias-utilizadas)
*   [🚀 Começando](#-começando)
    *   [Pré-requisitos](#pré-requisitos)
    *   [Instalação](#instalação)
*   [API Endpoints](#-api-endpoints)
*   [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 🎯 Sobre o Projeto

**Lúmina AI** é uma aplicação full-stack de gestão financeira pessoal que vai além do básico. Construída com uma interface moderna em React e um backend robusto em Node.js, seu grande diferencial é a integração com a API **Gemini do Google**, que fornece insights e conselhos financeiros personalizados com base nos dados do usuário.

O objetivo é oferecer uma experiência de usuário fluida e inteligente, transformando dados brutos de transações em análises claras e acionáveis, ajudando os usuários a entenderem melhor sua saúde financeira e a atingirem suas metas.

---

## ✨ Funcionalidades

- **Dashboard Intuitivo:** Visão geral da saúde financeira com saldo, receitas, despesas e gráficos interativos.
- **Gestão de Transações:** Adicione, edite e remova transações de entrada e saída com categorização.
- **Metas Financeiras:** Crie e acompanhe o progresso de suas metas de economia.
- **Autenticação Segura:** Login com e-mail/senha, e também via OAuth com **Google** e **Facebook**.
- **Análise com IA (Gemini):**
    - **Insights Automáticos:** Receba análises e dicas inteligentes diretamente no seu dashboard.
    - **Consultor Financeiro AI:** Converse com um assistente virtual para tirar dúvidas e receber conselhos.
- **Onboarding Amigável:** Novos usuários recebem dados de exemplo para explorar a plataforma imediatamente.
- **Perfil de Usuário:** Personalize seu nome e avatar.
- **Design Responsivo:** Acessível em desktops, tablets e celulares.

---

## 🛠️ Tecnologias Utilizadas

| Frontend                 | Backend                  | Banco de Dados | Autenticação         | IA                |
| ------------------------ | ------------------------ | -------------- | -------------------- | ----------------- |
| React                    | Node.js                  | SQLite         | Passport.js          | Google Gemini Pro |
| TypeScript               | Express.js               | Sequelize (ORM)| JWT (JSON Web Token) |                   |
| TailwindCSS              |                          |                | bcrypt.js            |                   |
| Vite                     |                          |                |                      |                   |

---

## 🚀 Começando

Siga estas instruções para obter uma cópia do projeto em funcionamento na sua máquina local para desenvolvimento e testes.

### Pré-requisitos

*   **Node.js** (versão 18.x ou superior)
*   **npm** (geralmente vem com o Node.js)
*   Uma chave de API do **Google Gemini**. Você pode obter uma no Google AI Studio.

### Instalação

1.  **Clone o repositório:**
    ```sh
    git clone https://github.com/seu-usuario/lumina-ai.git
    cd lumina-ai
    ```

2.  **Instale as dependências do Frontend e Backend:**
    Este projeto é um monorepo. O `package.json` na raiz gerencia ambos os ambientes.
    ```sh
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione sua chave da API do Gemini:
    ```env
    # Chave da API para o serviço de IA
    GEMINI_API_KEY="SUA_CHAVE_API_AQUI"

    # URL do frontend para callbacks do OAuth
    CLIENT_URL="http://localhost:5173"
    ```

4.  **Inicie o Servidor e o Cliente simultaneamente:**
    O comando `dev` no `package.json` principal utiliza o `concurrently` para rodar ambos os servidores.
    ```sh
    npm run dev
    ```

    *   O Backend estará rodando em `http://localhost:5000`
    *   O Frontend estará rodando em `http://localhost:5173`

5.  **(Opcional) Popular o banco de dados com dados de exemplo:**
    Se você quiser começar com um banco de dados limpo e populá-lo com dados de teste mais robustos, pode rodar o script de *seed*.
    ```sh
    npm run seed
    ```
    Isso criará um usuário de teste (`joao@example.com` / `password123`) com 6 meses de transações.

---

## ⬆️ Publicando no GitHub

Se você clonou este projeto e fez suas próprias alterações, pode publicá-lo em um novo repositório seguindo estes passos:

1.  **Crie um novo repositório** no seu perfil do GitHub (sem inicializá-lo com README ou .gitignore).

2.  **Execute os comandos abaixo** no terminal, na raiz do projeto:

    ```sh
    # Inicializa o repositório local e define o branch principal como 'main'
    git init -b main

    # Adiciona, faz o commit e conecta ao seu novo repositório
    git add .
    git commit -m "Primeiro commit"
    git remote add origin URL_DO_SEU_NOVO_REPOSITORIO.git
    git push -u origin main
    ```

---

## 📖 API Endpoints

O servidor backend expõe uma API REST para o frontend. Todos os endpoints estão sob o prefixo `/api`.

*   `POST /api/auth/register`: Registrar um novo usuário.
*   `POST /api/auth/login`: Autenticar um usuário.
*   `GET /api/user/me`: Obter dados do usuário logado.
*   `GET, POST /api/transactions`: Gerenciar transações.
*   `GET, POST /api/goals`: Gerenciar metas.
*   `GET, POST /api/categories`: Gerenciar categorias.

---

## 📂 Estrutura do Projeto

```
lumina-ai/
├── public/
├── server/
│   ├── index.js        # Ponto de entrada do backend (Express)
│   └── seed.js         # Script para popular o banco de dados
├── src/
│   ├── components/     # Componentes React
│   ├── services/       # Lógica de chamada para APIs (ex: Gemini)
│   ├── App.tsx         # Componente principal do frontend
│   └── index.css       # Estilos globais
├── .env                # Variáveis de ambiente (local)
├── package.json        # Dependências e scripts
└── README.md           # Este arquivo
```
