# iPretty · Salão de Beleza (Protótipo Web + Plugin Figma)

Protótipo funcional, identidade visual e gerador nativo de telas no Figma para o sistema do salão **iPretty**, cobrindo todos os perfis de usuário e fluxos operacionais.

## Estrutura do Repositório

```text
IPretty/
├── .vscode/                 # Configurações recomendadas do workspace para o VS Code
├── figma-plugin/            # Plugin local do Figma Desktop (Auto Layout + Tokens + Protótipo)
│   ├── manifest.json        # Manifesto do plugin (documentAccess: dynamic-page)
│   ├── ui.html              # Painel de controle do plugin
│   └── code.js              # Geração dos tokens e das 48 telas top-level (23 Mobile + 25 Desktop)
├── public/                  # Arquivos estáticos e manifesto PWA
│   ├── favicon.svg
│   └── manifest.webmanifest
├── src/                     # Protótipo web interativo (React + TypeScript + Vite + Tailwind CSS v4)
│   ├── components/
│   │   ├── brand/           # Ativos visuais e identidade da marca
│   │   └── ui/              # Primitivos de interface reutilizáveis
│   ├── context/             # Estado global compartilhado do protótipo (SalonContext)
│   ├── data/                # Dados iniciais de demonstração (seedData)
│   ├── design-system/       # Tokens de design exportáveis para Figma
│   ├── styles/              # Variáveis CSS e estilização base
│   ├── types/               # Tipagens TypeScript de domínio
│   ├── utils/               # Cálculos financeiros, horários e utilitários
│   └── views/               # Telas por perfil (Entrada, Cliente, Recepção, Profissional PWA, Admin, Tokens, Canvas Figma)
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

## Módulos Incluídos

- **Entrada (`SplashLoginView`):** seleção de perfil e acesso ao sistema.
- **Cliente (`ClientView`):** vitrine inicial, catálogo de serviços, seleção de profissional/data/horário, catálogo de produtos, meus agendamentos/pedidos, lembrete e histórico.
- **Recepção (`ReceptionView`):** operação diária de agenda, confirmações, check-in, pagamentos e atendimento presencial.
- **Profissional PWA (`ProfessionalView`):** agenda móvel, repasses/financeiro e solicitação de folgas.
- **Admin (`AdminView`):** visão geral, equipe e escalas, serviços, fornecedores e produtos, vendas/lucro/repasses e banners da vitrine.
- **Identidade & Tokens (`DesignSystemView` & `FigmaCanvasView`):** documentação da identidade visual e visualização organizada dos frames Mobile e Desktop.

## Como Rodar o Protótipo Web

Pré-requisito: Node.js 18+ e npm.

```bash
npm install
npm run dev
```

Para validar tipos e gerar o build de produção:

```bash
npm run build
npm run preview
```

## Como Usar o Plugin Local no Figma Desktop

1. Abra seu arquivo no **Figma Desktop**.
2. Acesse **Plugins → Development → Import plugin from manifest...**.
3. Selecione o arquivo `figma-plugin/manifest.json`.
4. Execute **iPretty · Studio Figma Generator** para gerar tokens de identidade visual, os 23 frames Mobile (`390×844`) e os 25 frames Desktop (`1280×800`) com Auto Layout e ligações de protótipo.
