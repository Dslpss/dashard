This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Configuração de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto com:

```
MONGODB_URI="mongodb+srv://<usuario>:<senha>@<cluster>/<opcional>"
MONGODB_DB="dashard"
```

No seu caso, use seu URI real com segurança apenas em `.env.local` (não comite este arquivo).

2. Reinicie o servidor de desenvolvimento após criar/alterar `.env.local`.

### Segurança e boas práticas

- Nunca comite credenciais. `.env.local` já está no `.gitignore` por padrão.
- Use variáveis de ambiente diferentes por ambiente (dev/staging/prod).
- No deploy (ex.: Vercel), configure `MONGODB_URI` e `MONGODB_DB` nas Environment Variables do projeto.
- A API implementa operações básicas de notas em `app/api/notes` e valida entradas obrigatórias.

### Funcionalidades

- Sistema de organização hierárquica: **Cursos → Aulas → Anotações**
- Dashboard de notas com design premium utilizando Tailwind CSS
- Suporte a Markdown nas anotações com syntax highlighting para código
- Persistência no MongoDB (driver oficial) com cliente compartilhado em `lib/mongodb.ts`
- Interface navegável com botão de voltar
- CRUD completo para cursos, aulas e anotações

### Como Usar

1. **Criar um Curso**: Clique em "Novo curso" e digite o nome
2. **Abrir o Curso**: Clique no curso para ver suas aulas
3. **Adicionar Aulas**: Clique em "Nova aula" e digite o título
4. **Ver Anotações**: Clique na aula para ver suas anotações
5. **Criar Anotações**: Use Markdown para formatar:
   - **Negrito**: `**texto**`
   - *Itálico*: `*texto*`
   - Código inline: `` `código` ``
   - Bloco de código:
     ```` 
     ```javascript
     const exemplo = "código";
     ```
     ````

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
