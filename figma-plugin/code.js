// iPretty · Gerador Direto de Telas, Identidade Visual & Protótipo no Figma
// Executa no sandbox do Figma Desktop (documentAccess: dynamic-page)

figma.showUI(__html__, { width: 370, height: 495, themeColors: false });

const PALETTE = {
  linen: '#F7F3EE',
  cream: '#FAF7F2',
  sand: '#EFE9E1',
  border: '#E3DBD0',
  borderStrong: '#D9CFC3',
  white: '#FFFFFF',
  ink: '#1F1815',
  inkMid: '#342A25',
  muted: '#5A4F48',
  softText: '#8B7F77',
  terracotta: '#B85D43',
  terracottaHover: '#9F4D35',
  terracottaSoft: '#F6E6E0',
  terracottaBorder: '#E8C8BD',
  terracottaText: '#8F3F29',
  sage: '#38664E',
  sageSoft: '#E3EFE8',
  sageBorder: '#C3DEC9',
  sageText: '#28503B',
  ochre: '#8B5910',
  ochreSoft: '#FBF0DC',
  ochreBorder: '#EDD6A9',
  crimson: '#922B2B',
  crimsonSoft: '#FAE6E6',
  crimsonBorder: '#ECC4C4',
  slate: '#3B4B59',
  slateSoft: '#E9EEF2',
  slateBorder: '#CED8E0',
  studioBlush: '#F4EAE4',
  studioBlushBorder: '#E7D8CF',
  studioSage: '#D8E5DD',
  studioSageBorder: '#C2D4C9',
  canvasBg: '#EFEAE3',
};

const FONTS = {
  display: { family: 'Inter', style: 'Bold' },
  displaySemi: { family: 'Inter', style: 'Semi Bold' },
  sansReg: { family: 'Inter', style: 'Regular' },
  sansMed: { family: 'Inter', style: 'Medium' },
  sansSemi: { family: 'Inter', style: 'Semi Bold' },
  sansBold: { family: 'Inter', style: 'Bold' },
  monoReg: { family: 'Inter', style: 'Regular' },
  monoSemi: { family: 'Inter', style: 'Semi Bold' },
};

let fontsReady = false;

async function ensureFonts() {
  if (fontsReady) return;
  const required = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Semi Bold' },
    { family: 'Inter', style: 'Bold' },
  ];
  for (const f of required) {
    await figma.loadFontAsync(f);
  }
  const optionalTry = async (family, style, assignKey) => {
    try {
      await figma.loadFontAsync({ family, style });
      FONTS[assignKey] = { family, style };
    } catch (_e) {
      // Fallback silencioso para Inter já carregada
    }
  };
  await Promise.all([
    optionalTry('Fraunces', 'SemiBold', 'displaySemi'),
    optionalTry('Fraunces', 'Bold', 'display'),
    optionalTry('Plus Jakarta Sans', 'Regular', 'sansReg'),
    optionalTry('Plus Jakarta Sans', 'Medium', 'sansMed'),
    optionalTry('Plus Jakarta Sans', 'SemiBold', 'sansSemi'),
    optionalTry('Plus Jakarta Sans', 'Bold', 'sansBold'),
    optionalTry('JetBrains Mono', 'Regular', 'monoReg'),
    optionalTry('JetBrains Mono', 'SemiBold', 'monoSemi'),
  ]);
  fontsReady = true;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

function solid(hex, opacity = 1) {
  return [{ type: 'SOLID', color: hexToRgb(hex), opacity }];
}

function addText(parent, content, opts = {}) {
  const t = figma.createText();
  const font = opts.font || FONTS.sansReg;
  t.fontName = font;
  t.characters = String(content);
  t.fontSize = opts.size || 12;
  t.fills = solid(opts.color || PALETTE.ink, opts.opacity ?? 1);
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.lineHeight) {
    t.lineHeight = { unit: 'PIXELS', value: opts.lineHeight };
  }
  parent.appendChild(t);
  if (opts.fillWidth && parent.layoutMode !== 'NONE') {
    if (parent.layoutSizingHorizontal === 'HUG') {
      parent.layoutSizingHorizontal = 'FIXED';
    }
    t.layoutSizingHorizontal = 'FILL';
    t.textAutoResize = 'HEIGHT';
  }
  return t;
}

function makeAutoFrame(name, dir = 'VERTICAL', opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.primaryAxisSizingMode = opts.primarySizing || 'AUTO';
  f.counterAxisSizingMode = opts.counterSizing || 'AUTO';
  f.itemSpacing = opts.gap ?? 8;
  f.paddingTop = opts.py ?? opts.p ?? 0;
  f.paddingBottom = opts.py ?? opts.p ?? 0;
  f.paddingLeft = opts.px ?? opts.p ?? 0;
  f.paddingRight = opts.px ?? opts.p ?? 0;
  f.cornerRadius = opts.radius ?? 0;
  f.fills = opts.bg ? solid(opts.bg, opts.bgOpacity ?? 1) : [];
  if (opts.border) {
    f.strokes = solid(opts.border, opts.borderOpacity ?? 1);
    f.strokeWeight = opts.strokeWeight ?? 1;
  }
  if (opts.align) f.primaryAxisAlignItems = opts.align;
  if (opts.crossAlign) f.counterAxisAlignItems = opts.crossAlign;
  if (opts.clip !== undefined) f.clipsContent = opts.clip;
  if (opts.shadow) {
    f.effects = [
      {
        type: 'DROP_SHADOW',
        color: { r: 0.12, g: 0.09, b: 0.08, a: 0.12 },
        offset: { x: 0, y: 12 },
        radius: 28,
        spread: -4,
        visible: true,
        blendMode: 'NORMAL',
      },
    ];
  }
  return f;
}

function appendFill(parent, child) {
  parent.appendChild(child);
  if (parent.layoutMode === 'VERTICAL' || parent.layoutMode === 'HORIZONTAL') {
    if (parent.layoutSizingHorizontal === 'HUG') {
      parent.layoutSizingHorizontal = 'FIXED';
    }
    child.layoutSizingHorizontal = 'FILL';
  }
  return child;
}

const ICONS = {
  spark: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z" stroke="${c}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  calendar: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="3" stroke="${c}" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  bag: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7h12l1 13H5L6 7z" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M9 7a3 3 0 0 1 6 0" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  user: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="${c}" stroke-width="2"/><path d="M4 20a8 8 0 0 1 16 0" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  check: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  close: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  scissors: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="3" stroke="${c}" stroke-width="2"/><circle cx="6" cy="18" r="3" stroke="${c}" stroke-width="2"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  chart: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  bell: (c) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
};

function addIcon(parent, key, color, size = 14) {
  const svgStr = (ICONS[key] || ICONS.spark)(color);
  const icon = figma.createNodeFromSvg(svgStr);
  icon.name = 'icon/' + key;
  icon.resize(size, size);
  parent.appendChild(icon);
  return icon;
}

const TONE_MAP = {
  neutral: { bg: PALETTE.sand, fg: PALETTE.muted, bd: PALETTE.border },
  terracotta: { bg: PALETTE.terracottaSoft, fg: PALETTE.terracottaText, bd: PALETTE.terracottaBorder },
  sage: { bg: PALETTE.sageSoft, fg: PALETTE.sageText, bd: PALETTE.sageBorder },
  ochre: { bg: PALETTE.ochreSoft, fg: PALETTE.ochre, bd: PALETTE.ochreBorder },
  crimson: { bg: PALETTE.crimsonSoft, fg: PALETTE.crimson, bd: PALETTE.crimsonBorder },
  slate: { bg: PALETTE.slateSoft, fg: PALETTE.slate, bd: PALETTE.slateBorder },
  dark: { bg: PALETTE.ink, fg: PALETTE.cream, bd: PALETTE.ink },
};

function makeBadge(label, tone = 'neutral') {
  const t = TONE_MAP[tone] || TONE_MAP.neutral;
  const f = makeAutoFrame('Badge/' + label, 'HORIZONTAL', {
    bg: t.bg,
    border: t.bd,
    radius: 999,
    px: 9,
    py: 3,
    gap: 4,
    crossAlign: 'CENTER',
  });
  addText(f, label, { font: FONTS.sansSemi, size: 10, color: t.fg });
  return f;
}

function makeButton(label, variant = 'primary', opts = {}) {
  const styles = {
    primary: { bg: PALETTE.terracotta, fg: PALETTE.cream, bd: null },
    dark: { bg: PALETTE.ink, fg: PALETTE.cream, bd: null },
    secondary: { bg: PALETTE.white, fg: PALETTE.ink, bd: PALETTE.borderStrong },
    sage: { bg: PALETTE.sage, fg: PALETTE.cream, bd: null },
    danger: { bg: PALETTE.crimsonSoft, fg: PALETTE.crimson, bd: PALETTE.crimsonBorder },
  };
  const s = styles[variant] || styles.primary;
  const btn = makeAutoFrame('Btn/' + label, 'HORIZONTAL', {
    bg: s.bg,
    border: s.bd,
    radius: 10,
    px: opts.sm ? 10 : 14,
    py: opts.sm ? 6 : 9,
    gap: 6,
    align: 'CENTER',
    crossAlign: 'CENTER',
  });
  if (opts.icon) addIcon(btn, opts.icon, s.fg, opts.sm ? 12 : 14);
  addText(btn, label, { font: FONTS.sansSemi, size: opts.sm ? 11 : 12, color: s.fg });
  return btn;
}

function makeCard(name, opts = {}) {
  return makeAutoFrame(name, opts.dir || 'VERTICAL', {
    bg: opts.bg || PALETTE.white,
    border: opts.border || PALETTE.border,
    radius: opts.radius ?? 14,
    px: opts.px ?? opts.p ?? 12,
    py: opts.py ?? opts.p ?? 12,
    gap: opts.gap ?? 6,
  });
}

function makeKpiCard(label, value, hint, tone = 'terracotta') {
  const card = makeCard('KPI/' + label, { p: 12, gap: 4 });
  const top = makeAutoFrame('Row', 'HORIZONTAL', { gap: 6, crossAlign: 'CENTER', align: 'SPACE_BETWEEN' });
  addText(top, label, { font: FONTS.monoSemi, size: 10, color: PALETTE.muted });
  top.appendChild(makeBadge(hint, tone));
  appendFill(card, top);
  addText(card, value, { font: FONTS.display, size: 20, color: PALETTE.ink });
  return card;
}

// ============================================================================
// DEFINIÇÃO DAS 48 TELAS (23 MOBILE + 25 DESKTOP) COM DADOS & LIGAÇÕES
// ============================================================================

const MOBILE_SCREENS = [
  {
    code: 'POP-S01C', title: 'Popup Instalar PWA na Tela Inicial', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-08', url: 'app.ipretty.salao/pwa',
    links: ['P-01'],
    modal: {
      badge: 'POP-S01C · PWA OFFLINE',
      title: 'Instalar iPretty Pro no Celular',
      subtitle: 'Acesse sua agenda e repasses direto da tela inicial.',
      rows: [
        ['Passo 1 (iOS / Android)', 'Toque em Compartilhar ou ⋮ no navegador'],
        ['Passo 2', 'Selecione "Adicionar à Tela de Início"'],
        ['Benefício', 'Carregamento instantâneo e modo sem distrações'],
      ],
      cta: { label: 'Entendi · Ir para Minha Agenda', target: 'P-01', variant: 'primary' },
      secondary: { label: 'Fechar', target: 'C-01' },
    },
    base: 'client-home',
  },
  {
    code: 'C-01', title: 'Vitrine Inicial (Home Marketplace)', w: 390, h: 844, dark: false,
    story: 'US-01 · US-02 · US-14', url: 'vitrine.ipretty.salao',
    links: ['C-02', 'C-04', 'POP-C01', 'POP-C05'],
    type: 'client-home',
  },
  {
    code: 'C-02', title: 'Catálogo de Serviços da Vitrine', w: 390, h: 844, dark: false,
    story: 'US-01', url: 'vitrine.ipretty.salao/servicos',
    links: ['POP-C01', 'C-03'],
    type: 'client-services',
  },
  {
    code: 'C-03', title: 'Escolha Profissional, Data & Slots Livres', w: 390, h: 844, dark: false,
    story: 'US-01', url: 'vitrine.ipretty.salao/agendar',
    links: ['POP-C03', 'POP-C02'],
    type: 'client-slots',
  },
  {
    code: 'C-04', title: 'Vitrine de Produtos (Sem Preço de Custo)', w: 390, h: 844, dark: false,
    story: 'US-02', url: 'vitrine.ipretty.salao/produtos',
    links: ['POP-C04', 'POP-C05'],
    type: 'client-products',
  },
  {
    code: 'C-05', title: 'Meus Agendamentos & Pedidos', w: 390, h: 844, dark: false,
    story: 'US-01 · US-02 · US-10', url: 'vitrine.ipretty.salao/meus-horarios',
    links: ['POP-C07', 'POP-C08', 'POP-C09'],
    type: 'client-meus',
  },
  {
    code: 'C-06', title: 'Lembrete 24h & Confirmação por Link', w: 390, h: 844, dark: false,
    story: 'US-09 · US-10', url: 'vitrine.ipretty.salao/lembrete-24h',
    links: ['C-05', 'POP-C07'],
    type: 'client-reminder',
  },
  {
    code: 'C-07', title: 'Perfil & Histórico da Cliente', w: 390, h: 844, dark: false,
    story: 'Perfil', url: 'vitrine.ipretty.salao/perfil',
    links: ['POP-S01C', 'C-01'],
    type: 'client-profile',
  },
  {
    code: 'POP-C01', title: 'Popup Detalhe do Serviço', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-01', url: 'vitrine.ipretty.salao/servico',
    links: ['C-03'],
    base: 'client-services',
    modal: {
      badge: 'POP-C01 · SERVIÇO',
      title: 'Escova Modeladora + Finalização',
      subtitle: 'Duração média: 50 min · Profissionais habilitadas: Patrícia, Camila',
      rows: [
        ['Valor na vitrine', 'R$ 95,00'],
        ['Incluso no atendimento', 'Lavagem nutritiva + proteção térmica + modelagem'],
        ['Política de remarcação', 'Grátis até 12h antes pelo link do WhatsApp'],
      ],
      cta: { label: 'Escolher Profissional & Horário', target: 'C-03', variant: 'primary' },
      secondary: { label: 'Voltar ao catálogo', target: 'C-02' },
    },
  },
  {
    code: 'POP-C02', title: 'Popup Conflito de Horário (US-01)', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-01', url: 'vitrine.ipretty.salao/conflito',
    links: ['C-03'],
    base: 'client-slots',
    modal: {
      badge: 'POP-C02 · VALIDAÇÃO US-01',
      title: 'Horário Indisponível para Escolha',
      subtitle: 'O slot das 15:00 com Patrícia acabou de ser reservado.',
      rows: [
        ['Motivo', 'Conflito simultâneo / intervalo ocupado'],
        ['Próximos livres hoje', '15:30 · 16:30 · 17:30'],
      ],
      cta: { label: 'Selecionar Outro Horário Livre', target: 'C-03', variant: 'primary' },
      secondary: { label: 'Fechar', target: 'C-03' },
    },
  },
  {
    code: 'POP-C03', title: 'Popup Agendamento Confirmado', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-01 · US-09', url: 'vitrine.ipretty.salao/confirmado',
    links: ['C-05'],
    base: 'client-slots',
    modal: {
      badge: 'POP-C03 · SUCESSO',
      title: 'Horário Reservado! (#AG-408)',
      subtitle: 'Enviaremos o lembrete automático 24h antes no seu WhatsApp.',
      rows: [
        ['Serviço', 'Escova Modeladora · R$ 95,00'],
        ['Profissional', 'Patrícia Alves · Terça, 14:30'],
        ['Status inicial', 'Aguardando confirmação 24h'],
      ],
      cta: { label: 'Ver em Meus Agendamentos', target: 'C-05', variant: 'sage' },
      secondary: { label: 'Continuar na vitrine', target: 'C-01' },
    },
  },
  {
    code: 'POP-C04', title: 'Popup Detalhe do Produto', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-02', url: 'vitrine.ipretty.salao/produto',
    links: ['POP-C05'],
    base: 'client-products',
    modal: {
      badge: 'POP-C04 · PRODUTO VITRINE',
      title: 'Sérum Reparador Brilho Ouro 60ml',
      subtitle: 'Categoria: Finalizadores · Retirada na recepção do salão',
      rows: [
        ['Preço de venda', 'R$ 89,90'],
        ['Disponibilidade', '6 unidades prontas para separação'],
        ['Observação', 'Pagamento somente na retirada presencial'],
      ],
      cta: { label: 'Adicionar à Sacola de Retirada', target: 'POP-C05', variant: 'primary' },
      secondary: { label: 'Voltar aos produtos', target: 'C-04' },
    },
  },
  {
    code: 'POP-C05', title: 'Popup Sacola de Retirada', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-02', url: 'vitrine.ipretty.salao/sacola',
    links: ['POP-C06'],
    base: 'client-products',
    modal: {
      badge: 'POP-C05 · SACOLA (1 ITEM)',
      title: 'Sacola para Retirar no Salão',
      subtitle: 'Juliana Mendes · Reserva sem cobrança antecipada',
      rows: [
        ['1× Sérum Reparador Brilho Ouro 60ml', 'R$ 89,90'],
        ['Subtotal para pagar no balcão', 'R$ 89,90'],
        ['Local de retirada', 'Recepção iPretty · Hoje até 19:30'],
      ],
      cta: { label: 'Enviar Pedido para Separação', target: 'POP-C06', variant: 'primary' },
      secondary: { label: 'Adicionar mais itens', target: 'C-04' },
    },
  },
  {
    code: 'POP-C06', title: 'Popup Pedido Solicitado (#PED)', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-02', url: 'vitrine.ipretty.salao/pedido-enviado',
    links: ['POP-C09', 'C-05'],
    base: 'client-products',
    modal: {
      badge: 'POP-C06 · PEDIDO #PED-109',
      title: 'Pedido Recebido pela Recepção!',
      subtitle: 'A Carla já visualiza seu pedido na fila de separação.',
      rows: [
        ['Código do pedido', '#PED-109 · Status: Solicitado'],
        ['Total a pagar na retirada', 'R$ 89,90'],
      ],
      cta: { label: 'Acompanhar Status do Pedido', target: 'POP-C09', variant: 'sage' },
      secondary: { label: 'Ir para Meus Horários', target: 'C-05' },
    },
  },
  {
    code: 'POP-C07', title: 'Popup Remarcar Horário (US-10)', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-10', url: 'vitrine.ipretty.salao/remarcar',
    links: ['C-05'],
    base: 'client-meus',
    modal: {
      badge: 'POP-C07 · AUTONOMIA US-10',
      title: 'Remarcar Atendimento #AG-402',
      subtitle: 'Dentro da janela de 12h · Sem taxa adicional',
      rows: [
        ['Horário atual', 'Hoje às 14:30 · Patrícia Alves'],
        ['Novo horário escolhido', 'Amanhã às 16:00 · Patrícia Alves'],
      ],
      cta: { label: 'Confirmar Nova Data e Hora', target: 'C-05', variant: 'primary' },
      secondary: { label: 'Manter horário original', target: 'C-05' },
    },
  },
  {
    code: 'POP-C08', title: 'Popup Cancelar Agendamento (US-10)', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-10', url: 'vitrine.ipretty.salao/cancelar',
    links: ['C-05'],
    base: 'client-meus',
    modal: {
      badge: 'POP-C08 · CANCELAMENTO US-10',
      title: 'Cancelar Horário #AG-402?',
      subtitle: 'O horário será liberado imediatamente para outras clientes.',
      rows: [
        ['Atendimento', 'Hidratação Profunda Argan · R$ 140,00'],
        ['Regra do salão', 'Antecedência >= 12h · Sem registro de falta'],
      ],
      cta: { label: 'Confirmar Cancelamento', target: 'C-05', variant: 'danger' },
      secondary: { label: 'Voltar sem cancelar', target: 'C-05' },
    },
  },
  {
    code: 'POP-C09', title: 'Popup Acompanhamento de Pedido', w: 390, h: 844, dark: false, isPopup: true,
    story: 'US-02 · US-04', url: 'vitrine.ipretty.salao/pedido',
    links: ['C-05'],
    base: 'client-meus',
    modal: {
      badge: 'POP-C09 · TIMELINE DO PEDIDO',
      title: 'Pedido #PED-104 · Separado',
      subtitle: 'Pronto na recepção! Basta informar seu nome no balcão.',
      rows: [
        ['1. Solicitado pela vitrine', '11/11 às 10:15 · Concluído'],
        ['2. Separado pela recepção', '11/11 às 10:28 · Atual'],
        ['3. Retirada & Pagamento', 'Aguardando cliente · R$ 89,90'],
      ],
      cta: { label: 'Fechar Acompanhamento', target: 'C-05', variant: 'dark' },
      secondary: { label: 'Ver Vitrine', target: 'C-01' },
    },
  },
  {
    code: 'P-01', title: 'Minha Agenda Mobile (360px PWA)', w: 360, h: 780, dark: true,
    story: 'US-08', url: 'pro.ipretty.salao/agenda',
    links: ['POP-P02', 'P-02', 'P-03'],
    type: 'pro-agenda',
  },
  {
    code: 'P-02', title: 'Meu Financeiro (Exclusivo / Isolado)', w: 360, h: 780, dark: true,
    story: 'US-08', url: 'pro.ipretty.salao/financeiro',
    links: ['P-01', 'P-03'],
    type: 'pro-finance',
  },
  {
    code: 'P-03', title: 'Meus Bloqueios de Folgas (US-11)', w: 360, h: 780, dark: true,
    story: 'US-11', url: 'pro.ipretty.salao/folgas',
    links: ['POP-P03', 'P-01'],
    type: 'pro-folgas',
  },
  {
    code: 'POP-P01', title: 'Popup PWA Instalável na Tela Inicial', w: 360, h: 780, dark: true, isPopup: true,
    story: 'US-08', url: 'pro.ipretty.salao/instalar',
    links: ['P-01'],
    base: 'pro-agenda',
    modal: {
      badge: 'POP-P01 · ATALHO PWA',
      title: 'App Patrícia Alves · Salão iPretty',
      subtitle: 'Modo exclusivo com visão isolada dos seus atendimentos.',
      rows: [
        ['Privacidade (US-08)', 'Acesso apenas à sua própria agenda e comissão'],
        ['Instalação', 'Adicionar atalho offline na tela inicial'],
      ],
      cta: { label: 'Abrir Minha Agenda', target: 'P-01', variant: 'primary' },
      secondary: { label: 'Fechar', target: 'P-01' },
    },
  },
  {
    code: 'POP-P02', title: 'Popup Detalhe Atendimento (Profissional)', w: 360, h: 780, dark: true, isPopup: true,
    story: 'US-08', url: 'pro.ipretty.salao/atendimento',
    links: ['P-01', 'P-02'],
    base: 'pro-agenda',
    modal: {
      badge: 'POP-P02 · ATENDIMENTO 14:30',
      title: 'Juliana Mendes · Escova Modeladora',
      subtitle: 'Status: Confirmado · Duração: 50 min',
      rows: [
        ['Valor do serviço', 'R$ 95,00'],
        ['Sua comissão (45%)', 'R$ 42,75 estimados após baixa'],
        ['Observação da cliente', 'Preferência por pontas modeladas para fora'],
      ],
      cta: { label: 'Voltar à Minha Agenda', target: 'P-01', variant: 'dark' },
      secondary: { label: 'Ver Meu Financeiro', target: 'P-02' },
    },
  },
  {
    code: 'POP-P03', title: 'Popup Bloquear Folga / Horário', w: 360, h: 780, dark: true, isPopup: true,
    story: 'US-11', url: 'pro.ipretty.salao/bloquear-folga',
    links: ['P-03'],
    base: 'pro-folgas',
    modal: {
      badge: 'POP-P03 · BLOQUEIO US-11',
      title: 'Solicitar Bloqueio na Agenda',
      subtitle: 'Remove automaticamente os slots livres da vitrine.',
      rows: [
        ['Data selecionada', 'Sexta-feira, 14/11 · 13:00 às 18:00'],
        ['Motivo', 'Consulta médica / compromisso pessoal'],
        ['Impacto na vitrine', 'Nenhum agendamento conflitante detectado'],
      ],
      cta: { label: 'Confirmar Bloqueio de Horário', target: 'P-03', variant: 'primary' },
      secondary: { label: 'Cancelar', target: 'P-03' },
    },
  },
];

const DESKTOP_SCREENS = [
  {
    code: 'S-01', title: 'Boas-vindas & Escolha de Perfil', w: 1280, h: 800,
    story: 'Entrada Unificada', url: 'app.ipretty.salao/entrada',
    links: ['POP-S01A', 'R-01', 'A-01'],
    type: 'splash',
  },
  {
    code: 'POP-S01A', title: 'Popup Autenticação / PIN Unificado', w: 1280, h: 800, isPopup: true,
    story: 'Acesso', url: 'app.ipretty.salao/login',
    links: ['POP-S01B', 'A-01', 'R-01'],
    base: 'splash',
    modal: {
      badge: 'POP-S01A · ACESSO SEGURO',
      title: 'Entrar no iPretty Salão',
      subtitle: 'Selecione seu perfil ou informe telefone + PIN de 4 dígitos.',
      rows: [
        ['Perfil selecionado', 'Dona Marta · Administração Geral'],
        ['Credencial demo', '(11) 99812-0001 · PIN ••••'],
      ],
      cta: { label: 'Acessar Painel Admin', target: 'A-01', variant: 'primary' },
      secondary: { label: 'Esqueci meu PIN', target: 'POP-S01B' },
    },
  },
  {
    code: 'POP-S01B', title: 'Popup Recuperar Acesso / PIN', w: 1280, h: 800, isPopup: true,
    story: 'Acesso', url: 'app.ipretty.salao/recuperar-acesso',
    links: ['POP-S01A'],
    base: 'splash',
    modal: {
      badge: 'POP-S01B · RECUPERAÇÃO',
      title: 'Redefinir PIN por WhatsApp / E-mail',
      subtitle: 'Enviaremos um código temporário para validar sua conta.',
      rows: [
        ['Telefone cadastrado', '(11) 99812-0001'],
        ['Canal de envio', 'WhatsApp Oficial iPretty (imediato)'],
      ],
      cta: { label: 'Enviar Código & Voltar ao Login', target: 'POP-S01A', variant: 'primary' },
      secondary: { label: 'Fechar', target: 'S-01' },
    },
  },
  {
    code: 'S-02', title: 'Identidade Visual & Brand Book (Tokens)', w: 1280, h: 800,
    story: 'Design System', url: 'app.ipretty.salao/identidade-visual',
    links: ['S-01', 'A-01'],
    type: 'brand',
  },
  {
    code: 'R-01', title: 'Painel do Dia Multi-Coluna por Profissional', w: 1280, h: 800,
    story: 'US-03', url: 'balcao.ipretty.salao/painel',
    links: ['POP-R01', 'POP-R02', 'R-02', 'R-04'],
    type: 'reception-agenda',
  },
  {
    code: 'R-02', title: 'Fila de Pedidos & Máquina de Estados', w: 1280, h: 800,
    story: 'US-04', url: 'balcao.ipretty.salao/pedidos',
    links: ['POP-R03', 'POP-R04', 'POP-R05', 'R-01'],
    type: 'reception-orders',
  },
  {
    code: 'R-04', title: 'Caixa do Turno & Histórico de Faltas', w: 1280, h: 800,
    story: 'US-03 · US-04', url: 'balcao.ipretty.salao/caixa',
    links: ['POP-R04', 'R-01', 'A-05'],
    type: 'reception-cashier',
  },
  {
    code: 'POP-R01', title: 'Popup Detalhe Atendimento (Recepção)', w: 1280, h: 800, isPopup: true,
    story: 'US-03 · US-04', url: 'balcao.ipretty.salao/atendimento',
    links: ['POP-R04', 'R-01'],
    base: 'reception-agenda',
    modal: {
      badge: 'POP-R01 · CHECK-IN BALCÃO',
      title: 'Juliana Mendes · Escova Modeladora',
      subtitle: '14:30 com Patrícia Alves · Status atual: Confirmado',
      rows: [
        ['Ações rápidas', 'Marcar Compareceu · Não Compareceu · Cancelar'],
        ['Valor previsto', 'R$ 95,00 (pronto para checkout após serviço)'],
      ],
      cta: { label: 'Confirmar Comparecimento & Cobrar', target: 'POP-R04', variant: 'sage' },
      secondary: { label: 'Voltar ao Painel', target: 'R-01' },
    },
  },
  {
    code: 'POP-R02', title: 'Popup Novo Encaixe Manual (US-03)', w: 1280, h: 800, isPopup: true,
    story: 'US-03', url: 'balcao.ipretty.salao/encaixe',
    links: ['R-01'],
    base: 'reception-agenda',
    modal: {
      badge: 'POP-R02 · NOVO ENCAIXE US-03',
      title: 'Registrar Encaixe na Agenda',
      subtitle: 'Valida conflitos e horário de funcionamento em tempo real.',
      rows: [
        ['Cliente', 'Beatriz Nogueira · (11) 98401-2233'],
        ['Serviço & Profissional', 'Manicure Gel (R$ 85,00) · Camila Rocha'],
        ['Data & Horário', 'Hoje · 16:00 às 17:00 (Livre)'],
      ],
      cta: { label: 'Salvar Encaixe no Painel', target: 'R-01', variant: 'primary' },
      secondary: { label: 'Cancelar', target: 'R-01' },
    },
  },
  {
    code: 'POP-R03', title: 'Popup Auditoria & Histórico do Pedido', w: 1280, h: 800, isPopup: true,
    story: 'US-04', url: 'balcao.ipretty.salao/auditoria-pedido',
    links: ['R-02'],
    base: 'reception-orders',
    modal: {
      badge: 'POP-R03 · LOG IMUTÁVEL',
      title: 'Auditoria do Pedido #PED-104',
      subtitle: 'Máquina de estados rastreada com responsável e carimbo de hora.',
      rows: [
        ['10:15 · Solicitado', 'Juliana Mendes via Vitrine Mobile'],
        ['10:28 · Separado', 'Carla Souza (Recepção) confirmou estoque'],
        ['Próximo passo válido', 'Retirado → Pago (ou Cancelado)'],
      ],
      cta: { label: 'Voltar à Fila de Pedidos', target: 'R-02', variant: 'dark' },
      secondary: { label: 'Ir para Pagamento', target: 'POP-R04' },
    },
  },
  {
    code: 'POP-R04', title: 'Popup Registrar Pagamento / Brinde', w: 1280, h: 800, isPopup: true,
    story: 'US-04', url: 'balcao.ipretty.salao/pagamento',
    links: ['R-04', 'A-05'],
    base: 'reception-cashier',
    modal: {
      badge: 'POP-R04 · CHECKOUT CAIXA',
      title: 'Finalizar Pagamento · Comanda #AG-402',
      subtitle: 'Atualiza o caixa do turno, estoque e extrato da profissional.',
      rows: [
        ['Itens incluídos', 'Escova Modeladora (R$ 95,00) + Sérum (R$ 89,90)'],
        ['Forma de pagamento', 'PIX Instantâneo · Desconto: R$ 0,00'],
        ['Total líquido recebido', 'R$ 184,90'],
      ],
      cta: { label: 'Confirmar Recebimento & Baixar', target: 'R-04', variant: 'sage' },
      secondary: { label: 'Cancelar', target: 'R-04' },
    },
  },
  {
    code: 'POP-R05', title: 'Popup Pedido Balcão / Amostra Grátis', w: 1280, h: 800, isPopup: true,
    story: 'US-04', url: 'balcao.ipretty.salao/novo-pedido',
    links: ['R-02'],
    base: 'reception-orders',
    modal: {
      badge: 'POP-R05 · VENDA / BRINDE BALCÃO',
      title: 'Lançar Pedido Direto no Balcão',
      subtitle: 'Suporta venda normal ou amostra grátis (custo R$ 0,00 → Brinde).',
      rows: [
        ['Cliente', 'Fernanda Dias (balcão presencial)'],
        ['Produto', 'Ampola Nutrição Flash 15ml · 1 un · R$ 0,00 (Brinde)'],
        ['Estado final automático', 'Brinde (sem gerar cobrança no caixa)'],
      ],
      cta: { label: 'Registrar Pedido no Balcão', target: 'R-02', variant: 'primary' },
      secondary: { label: 'Fechar', target: 'R-02' },
    },
  },
  {
    code: 'A-01', title: 'Visão Geral & Metas de Negócio', w: 1280, h: 800,
    story: 'Vision Board', url: 'admin.ipretty.salao/visao-geral',
    links: ['A-02', 'A-03', 'A-04', 'A-05', 'A-06'],
    type: 'admin-overview',
  },
  {
    code: 'A-02', title: 'Equipe, Vínculos & Trocas na Escala', w: 1280, h: 800,
    story: 'US-05 · US-12', url: 'admin.ipretty.salao/equipe',
    links: ['POP-A01', 'POP-A02', 'A-01', 'A-03'],
    type: 'admin-team',
  },
  {
    code: 'A-03', title: 'Catálogo de Serviços do Salão', w: 1280, h: 800,
    story: 'Catálogo', url: 'admin.ipretty.salao/servicos',
    links: ['POP-A03', 'A-01', 'A-04'],
    type: 'admin-services',
  },
  {
    code: 'A-04', title: 'Fornecedores & Produtos (Margens e Lucro)', w: 1280, h: 800,
    story: 'US-06', url: 'admin.ipretty.salao/produtos',
    links: ['POP-A04', 'POP-A05', 'A-01', 'A-05'],
    type: 'admin-products',
  },
  {
    code: 'A-05', title: 'Relatórios: Vendas, Repasses & Ranking R$', w: 1280, h: 800,
    story: 'US-07 · US-13', url: 'admin.ipretty.salao/relatorios',
    links: ['POP-A06', 'A-01', 'A-04'],
    type: 'admin-reports',
  },
  {
    code: 'A-06', title: 'Gestão de Banners da Vitrine', w: 1280, h: 800,
    story: 'US-14', url: 'admin.ipretty.salao/banners',
    links: ['POP-A07', 'A-01'],
    type: 'admin-banners',
  },
  {
    code: 'POP-A01', title: 'Popup Profissional & Remuneração (US-05)', w: 1280, h: 800, isPopup: true,
    story: 'US-05', url: 'admin.ipretty.salao/equipe/novo',
    links: ['A-02'],
    base: 'admin-team',
    modal: {
      badge: 'POP-A01 · VÍNCULO & COMISSÃO US-05',
      title: 'Editar Profissional: Patrícia Alves',
      subtitle: 'Define modalidade contratual e % de comissão por serviço.',
      rows: [
        ['Tipo de vínculo', 'Parceira · Repasse por atendimento pago'],
        ['Comissão padrão / Escova', '45% · Serviços habilitados: 4 ativos'],
        ['Jornada padrão', 'Ter a Sáb · 09:00 às 19:00'],
      ],
      cta: { label: 'Salvar Regras da Profissional', target: 'A-02', variant: 'primary' },
      secondary: { label: 'Cancelar', target: 'A-02' },
    },
  },
  {
    code: 'POP-A02', title: 'Popup Troca Pontual na Escala (US-12)', w: 1280, h: 800, isPopup: true,
    story: 'US-12', url: 'admin.ipretty.salao/equipe/troca-escala',
    links: ['A-02'],
    base: 'admin-team',
    modal: {
      badge: 'POP-A02 · COBERTURA PONTUAL US-12',
      title: 'Transferir Turno na Escala',
      subtitle: 'Mantém a agenda recorrente intacta e move só o dia escolhido.',
      rows: [
        ['Dia da troca', 'Sábado, 15/11 · Turno Integral'],
        ['De → Para', 'Camila Rocha → Patrícia Alves'],
        ['Agendamentos impactados', '2 horários reatribuídos automaticamente'],
      ],
      cta: { label: 'Aplicar Troca Pontual', target: 'A-02', variant: 'primary' },
      secondary: { label: 'Voltar', target: 'A-02' },
    },
  },
  {
    code: 'POP-A03', title: 'Popup Cadastrar / Editar Serviço', w: 1280, h: 800, isPopup: true,
    story: 'Catálogo', url: 'admin.ipretty.salao/servicos/novo',
    links: ['A-03'],
    base: 'admin-services',
    modal: {
      badge: 'POP-A03 · CATÁLOGO DE SERVIÇOS',
      title: 'Novo Serviço do Salão',
      subtitle: 'Fica visível imediatamente na vitrine da cliente e no encaixe.',
      rows: [
        ['Nome do serviço', 'Mechas Iluminadas + Tonalização'],
        ['Duração & Preço', '150 min · R$ 380,00'],
        ['Profissionais habilitadas', 'Patrícia Alves · Mariana Costa'],
      ],
      cta: { label: 'Publicar Serviço na Vitrine', target: 'A-03', variant: 'primary' },
      secondary: { label: 'Cancelar', target: 'A-03' },
    },
  },
  {
    code: 'POP-A04', title: 'Popup Cadastrar Fornecedor (US-06)', w: 1280, h: 800, isPopup: true,
    story: 'US-06', url: 'admin.ipretty.salao/fornecedores/novo',
    links: ['A-04'],
    base: 'admin-products',
    modal: {
      badge: 'POP-A04 · FORNECEDORES US-06',
      title: 'Cadastrar Fornecedor Homologado',
      subtitle: 'Vincula catálogo de compra, CNPJ e prazo de reposição.',
      rows: [
        ['Razão Social / Fantasia', 'Atelier Botânico Distribuidora Ltda'],
        ['Contato Comercial', '(11) 3042-8810 · pedidos@atelierbotanico.com.br'],
        ['Prazo médio de entrega', '2 dias úteis'],
      ],
      cta: { label: 'Salvar Fornecedor', target: 'A-04', variant: 'primary' },
      secondary: { label: 'Fechar', target: 'A-04' },
    },
  },
  {
    code: 'POP-A05', title: 'Popup Produto: Lucro & Aviso Negativo', w: 1280, h: 800, isPopup: true,
    story: 'US-06', url: 'admin.ipretty.salao/produtos/novo',
    links: ['A-04'],
    base: 'admin-products',
    modal: {
      badge: 'POP-A05 · MARGEM AUTOMÁTICA US-06',
      title: 'Cadastrar Produto & Validar Lucro',
      subtitle: 'Calcula margem real e alerta se preço de venda < custo.',
      rows: [
        ['Produto', 'Sérum Reparador Brilho Ouro 60ml'],
        ['Custo: R$ 42,00 · Venda: R$ 89,90', 'Lucro: +R$ 47,90 (+114,0%) · Saudável'],
        ['Regra de proteção', 'Bloqueia prejuízo silencioso antes de publicar'],
      ],
      cta: { label: 'Salvar Produto no Estoque', target: 'A-04', variant: 'sage' },
      secondary: { label: 'Cancelar', target: 'A-04' },
    },
  },
  {
    code: 'POP-A06', title: 'Popup Extrato Detalhado de Repasse (US-07)', w: 1280, h: 800, isPopup: true,
    story: 'US-07', url: 'admin.ipretty.salao/repasses/extrato',
    links: ['A-05'],
    base: 'admin-reports',
    modal: {
      badge: 'POP-A06 · FECHAMENTO US-07',
      title: 'Extrato de Repasse · Patrícia Alves',
      subtitle: 'Considera apenas atendimentos com status PAGO no período.',
      rows: [
        ['Base de serviços pagos (14 itens)', 'R$ 2.180,00'],
        ['Comissão calculada (45% média)', 'R$ 981,00 a repassar'],
        ['Status de conferência', 'Pronto para quitação do ciclo semanal'],
      ],
      cta: { label: 'Exportar / Marcar Conferido', target: 'A-05', variant: 'dark' },
      secondary: { label: 'Voltar aos Relatórios', target: 'A-05' },
    },
  },
  {
    code: 'POP-A07', title: 'Popup Criar / Editar Banner (US-14)', w: 1280, h: 800, isPopup: true,
    story: 'US-14', url: 'admin.ipretty.salao/banners/novo',
    links: ['A-06'],
    base: 'admin-banners',
    modal: {
      badge: 'POP-A07 · VITRINE PROMOCIONAL US-14',
      title: 'Editor de Banner da Home Cliente',
      subtitle: 'Altera em tempo real o destaque na tela inicial da Juliana.',
      rows: [
        ['Título do banner', 'Combo Brilho de Outono · Escova + Hidratação'],
        ['CTA de destino', 'Abrir Catálogo de Serviços (C-02)'],
        ['Vigência', 'Ativo na vitrine até 30/11'],
      ],
      cta: { label: 'Publicar Banner na Home', target: 'A-06', variant: 'primary' },
      secondary: { label: 'Cancelar', target: 'A-06' },
    },
  },
];

// ============================================================================
// CONSTRUTORES DE CONTEÚDO INTERNO DAS TELAS
// ============================================================================

function buildPhoneChrome(parent, dark, urlLabel) {
  const status = makeAutoFrame('StatusBar', 'HORIZONTAL', {
    bg: dark ? PALETTE.ink : PALETTE.white,
    px: 18,
    py: 8,
    align: 'SPACE_BETWEEN',
    crossAlign: 'CENTER',
  });
  addText(status, '13:30', { font: FONTS.monoSemi, size: 11, color: dark ? PALETTE.cream : PALETTE.ink });
  const notch = figma.createFrame();
  notch.name = 'DynamicPill';
  notch.resize(56, 12);
  notch.cornerRadius = 999;
  notch.fills = solid(dark ? PALETTE.inkMid : PALETTE.sand);
  status.appendChild(notch);
  addText(status, '5G · 100%', { font: FONTS.monoReg, size: 10, color: dark ? PALETTE.cream : PALETTE.ink });
  appendFill(parent, status);

  const top = makeAutoFrame('AppTopBar', 'HORIZONTAL', {
    bg: dark ? PALETTE.inkMid : PALETTE.cream,
    border: dark ? '#3B2F2A' : PALETTE.border,
    px: 14,
    py: 8,
    align: 'SPACE_BETWEEN',
    crossAlign: 'CENTER',
  });
  const brand = makeAutoFrame('Brand', 'HORIZONTAL', { gap: 6, crossAlign: 'CENTER' });
  addIcon(brand, 'spark', PALETTE.terracotta, 14);
  addText(brand, 'iPretty', { font: FONTS.display, size: 15, color: dark ? PALETTE.cream : PALETTE.ink });
  top.appendChild(brand);
  addText(top, urlLabel.replace('vitrine.ipretty.salao', '').replace('pro.ipretty.salao', '') || '/home', {
    font: FONTS.monoReg,
    size: 9,
    color: dark ? '#C7B8AD' : PALETTE.softText,
  });
  appendFill(parent, top);
}

function buildMobileBottomNav(parent, activeKey, items, reactions, dark = false) {
  const bar = makeAutoFrame('BottomTabBar', 'HORIZONTAL', {
    bg: dark ? PALETTE.ink : PALETTE.white,
    border: dark ? '#342A25' : PALETTE.border,
    px: 10,
    py: 8,
    gap: 6,
    align: 'SPACE_BETWEEN',
    crossAlign: 'CENTER',
  });
  appendFill(parent, bar);
  for (const item of items) {
    const active = item.key === activeKey;
    const pill = makeAutoFrame('Tab/' + item.label, 'VERTICAL', {
      bg: active ? (dark ? PALETTE.terracotta : PALETTE.terracottaSoft) : undefined,
      radius: 10,
      px: 8,
      py: 5,
      gap: 2,
      align: 'CENTER',
      crossAlign: 'CENTER',
    });
    addIcon(
      pill,
      item.icon,
      active ? (dark ? PALETTE.cream : PALETTE.terracottaText) : (dark ? '#A6978E' : PALETTE.muted),
      13
    );
    addText(pill, item.label, {
      font: active ? FONTS.sansSemi : FONTS.sansReg,
      size: 10,
      color: active ? (dark ? PALETTE.cream : PALETTE.terracottaText) : (dark ? '#C7B8AD' : PALETTE.muted),
    });
    appendFill(bar, pill);
    if (item.target) {
      reactions.push({ node: pill, targetCode: item.target });
    }
  }
}

function buildModalOverlay(screenFrame, modal, reactions) {
  const overlay = figma.createFrame();
  overlay.name = 'ModalOverlay/' + modal.badge;
  overlay.fills = solid(PALETTE.ink, 0.54);
  overlay.layoutMode = 'VERTICAL';
  overlay.primaryAxisSizingMode = 'FIXED';
  overlay.counterAxisSizingMode = 'FIXED';
  overlay.primaryAxisAlignItems = 'CENTER';
  overlay.counterAxisAlignItems = 'CENTER';
  overlay.paddingLeft = 18;
  overlay.paddingRight = 18;
  overlay.paddingTop = 24;
  overlay.paddingBottom = 24;
  screenFrame.appendChild(overlay);
  overlay.layoutPositioning = 'ABSOLUTE';
  overlay.resize(screenFrame.width, screenFrame.height);
  overlay.x = 0;
  overlay.y = 0;

  const sheet = makeAutoFrame('ModalSheet', 'VERTICAL', {
    bg: PALETTE.white,
    border: PALETTE.border,
    radius: 18,
    gap: 0,
    shadow: true,
    clip: true,
  });
  overlay.appendChild(sheet);
  if (screenFrame.width > 500) {
    sheet.resize(520, 100);
    sheet.layoutSizingHorizontal = 'FIXED';
    sheet.layoutSizingVertical = 'HUG';
  } else {
    sheet.layoutSizingHorizontal = 'FILL';
    sheet.layoutSizingVertical = 'HUG';
  }

  const head = makeAutoFrame('ModalHeader', 'HORIZONTAL', {
    bg: PALETTE.cream,
    border: PALETTE.border,
    px: 16,
    py: 12,
    gap: 8,
    align: 'SPACE_BETWEEN',
    crossAlign: 'MIN',
  });
  appendFill(sheet, head);
  const headText = makeAutoFrame('TitleCol', 'VERTICAL', { gap: 3 });
  appendFill(head, headText);
  addText(headText, modal.badge, { font: FONTS.monoSemi, size: 9, color: PALETTE.terracotta });
  addText(headText, modal.title, { font: FONTS.display, size: 15, color: PALETTE.ink, fillWidth: true });
  addText(headText, modal.subtitle, { font: FONTS.sansReg, size: 11, color: PALETTE.muted, fillWidth: true });
  const closeBtn = makeAutoFrame('CloseBtn', 'HORIZONTAL', {
    bg: PALETTE.sand,
    radius: 8,
    p: 5,
  });
  addIcon(closeBtn, 'close', PALETTE.ink, 12);
  head.appendChild(closeBtn);
  if (modal.secondary && modal.secondary.target) {
    reactions.push({ node: closeBtn, targetCode: modal.secondary.target });
  }

  const body = makeAutoFrame('ModalBody', 'VERTICAL', { p: 16, gap: 10 });
  appendFill(sheet, body);
  for (const [k, v] of modal.rows) {
    const row = makeAutoFrame('FieldRow', 'VERTICAL', {
      bg: PALETTE.linen,
      border: PALETTE.border,
      radius: 10,
      px: 11,
      py: 8,
      gap: 2,
    });
    appendFill(body, row);
    addText(row, k, { font: FONTS.monoSemi, size: 9, color: PALETTE.softText });
    addText(row, v, { font: FONTS.sansMed, size: 11, color: PALETTE.ink, fillWidth: true });
  }

  const actions = makeAutoFrame('ModalActions', 'VERTICAL', { gap: 7 });
  appendFill(body, actions);
  const primaryBtn = makeButton(modal.cta.label, modal.cta.variant || 'primary');
  appendFill(actions, primaryBtn);
  reactions.push({ node: primaryBtn, targetCode: modal.cta.target });

  if (modal.secondary) {
    const secBtn = makeButton(modal.secondary.label, 'secondary', { sm: true });
    appendFill(actions, secBtn);
    reactions.push({ node: secBtn, targetCode: modal.secondary.target });
  }
}

function populateMobileBody(body, type, reactions) {
  if (type === 'client-home') {
    const hero = makeAutoFrame('HeroBanner', 'VERTICAL', {
      bg: PALETTE.ink,
      radius: 16,
      p: 14,
      gap: 6,
    });
    hero.appendChild(makeBadge('PROMOÇÃO OUTONO · US-14', 'terracotta'));
    addText(hero, 'Combo Brilho & Seda', { font: FONTS.display, size: 18, color: PALETTE.cream, fillWidth: true });
    addText(hero, 'Escova Modeladora + Hidratação Argan com reserva online sem filas.', {
      font: FONTS.sansReg,
      size: 11,
      color: '#D3C8BF',
      fillWidth: true,
    });
    const cta = makeButton('Agendar Horário Agora', 'primary', { sm: true, icon: 'calendar' });
    appendFill(hero, cta);
    reactions.push({ node: cta, targetCode: 'C-03' });
    appendFill(body, hero);

    const rowTitle = makeAutoFrame('SecTitle', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(rowTitle, 'Mais Procurados', { font: FONTS.displaySemi, size: 14, color: PALETTE.ink });
    const verTodos = makeButton('Ver catálogo', 'secondary', { sm: true });
    rowTitle.appendChild(verTodos);
    reactions.push({ node: verTodos, targetCode: 'C-02' });
    appendFill(body, rowTitle);

    const services = [
      ['Escova Modeladora', '50 min · Patrícia, Camila', 'R$ 95,00', 'POP-C01'],
      ['Hidratação Profunda Argan', '60 min · Mariana, Patrícia', 'R$ 140,00', 'POP-C01'],
      ['Manicure & Esmaltação Gel', '45 min · Camila Rocha', 'R$ 85,00', 'C-03'],
    ];
    for (const [name, sub, price, target] of services) {
      const card = makeCard('Svc/' + name, { p: 11, gap: 4 });
      const top = makeAutoFrame('R', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      addText(top, name, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
      addText(top, price, { font: FONTS.monoSemi, size: 12, color: PALETTE.terracotta });
      appendFill(card, top);
      addText(card, sub, { font: FONTS.sansReg, size: 10, color: PALETTE.muted });
      appendFill(body, card);
      reactions.push({ node: card, targetCode: target });
    }
  } else if (type === 'client-services') {
    addText(body, 'Catálogo de Serviços', { font: FONTS.display, size: 18, color: PALETTE.ink });
    const chips = makeAutoFrame('Chips', 'HORIZONTAL', { gap: 6 });
    chips.appendChild(makeBadge('Todos (6)', 'dark'));
    chips.appendChild(makeBadge('Cabelos', 'neutral'));
    chips.appendChild(makeBadge('Unhas', 'neutral'));
    chips.appendChild(makeBadge('Tratamentos', 'neutral'));
    appendFill(body, chips);

    const list = [
      ['Escova Modeladora', '50 min', 'R$ 95,00', 'Cabelos'],
      ['Corte Bordado + Finalização', '60 min', 'R$ 130,00', 'Cabelos'],
      ['Hidratação Profunda Argan', '60 min', 'R$ 140,00', 'Tratamentos'],
      ['Manicure & Esmaltação Gel', '45 min', 'R$ 85,00', 'Unhas'],
    ];
    for (const [n, dur, pr, cat] of list) {
      const card = makeCard('SvcCard/' + n, { p: 11, gap: 5 });
      const r1 = makeAutoFrame('Row', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      addText(r1, n, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
      r1.appendChild(makeBadge(cat, 'terracotta'));
      appendFill(card, r1);
      const r2 = makeAutoFrame('Row2', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      addText(r2, dur + ' · ' + pr, { font: FONTS.monoSemi, size: 11, color: PALETTE.muted });
      const b = makeButton('Reservar', 'primary', { sm: true });
      r2.appendChild(b);
      reactions.push({ node: b, targetCode: 'C-03' });
      appendFill(card, r2);
      appendFill(body, card);
      reactions.push({ node: card, targetCode: 'POP-C01' });
    }
  } else if (type === 'client-slots') {
    addText(body, 'Agendar · Escova Modeladora', { font: FONTS.display, size: 17, color: PALETTE.ink });
    const profCard = makeCard('Profissional', { p: 10, gap: 6 });
    addText(profCard, '1. Profissional habilitada', { font: FONTS.monoSemi, size: 10, color: PALETTE.muted });
    const pRow = makeAutoFrame('Profs', 'HORIZONTAL', { gap: 6 });
    pRow.appendChild(makeBadge('Patrícia Alves ✓', 'terracotta'));
    pRow.appendChild(makeBadge('Camila Rocha', 'neutral'));
    appendFill(profCard, pRow);
    appendFill(body, profCard);

    const daysCard = makeCard('Datas', { p: 10, gap: 6 });
    addText(daysCard, '2. Escolha a data (7 dias)', { font: FONTS.monoSemi, size: 10, color: PALETTE.muted });
    const dRow = makeAutoFrame('Days', 'HORIZONTAL', { gap: 4 });
    for (const [d, active] of [['11/11', true], ['12/11', false], ['13/11', false], ['14/11', false], ['15/11', false]]) {
      const chip = makeAutoFrame('D/' + d, 'HORIZONTAL', {
        bg: active ? PALETTE.ink : PALETTE.linen,
        border: PALETTE.border,
        radius: 8,
        px: 8,
        py: 6,
      });
      addText(chip, d, { font: FONTS.monoSemi, size: 10, color: active ? PALETTE.cream : PALETTE.ink });
      dRow.appendChild(chip);
    }
    appendFill(daysCard, dRow);
    appendFill(body, daysCard);

    const slotCard = makeCard('Slots', { p: 10, gap: 8 });
    addText(slotCard, '3. Horários livres calculados', { font: FONTS.monoSemi, size: 10, color: PALETTE.muted });
    const grid = makeAutoFrame('SlotRow', 'HORIZONTAL', { gap: 6 });
    for (const [h, st] of [['13:30', 'free'], ['14:30', 'selected'], ['15:00', 'busy'], ['16:30', 'free']]) {
      const sBtn = makeAutoFrame('Slot/' + h, 'HORIZONTAL', {
        bg: st === 'selected' ? PALETTE.terracotta : st === 'busy' ? PALETTE.crimsonSoft : PALETTE.linen,
        border: st === 'selected' ? PALETTE.terracotta : PALETTE.border,
        radius: 8,
        px: 10,
        py: 7,
      });
      addText(sBtn, h, {
        font: FONTS.monoSemi,
        size: 11,
        color: st === 'selected' ? PALETTE.white : st === 'busy' ? PALETTE.crimson : PALETTE.ink,
      });
      grid.appendChild(sBtn);
      if (st === 'busy') reactions.push({ node: sBtn, targetCode: 'POP-C02' });
    }
    appendFill(slotCard, grid);
    appendFill(body, slotCard);

    const confirmBtn = makeButton('Confirmar Reserva (14:30)', 'sage', { icon: 'check' });
    appendFill(body, confirmBtn);
    reactions.push({ node: confirmBtn, targetCode: 'POP-C03' });
  } else if (type === 'client-products') {
    const top = makeAutoFrame('Head', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(top, 'Vitrine de Produtos', { font: FONTS.display, size: 17, color: PALETTE.ink });
    const bagBtn = makeButton('Sacola (1)', 'dark', { sm: true, icon: 'bag' });
    top.appendChild(bagBtn);
    reactions.push({ node: bagBtn, targetCode: 'POP-C05' });
    appendFill(body, top);
    addText(body, 'Retire e pague presencialmente no balcão (preço público).', {
      font: FONTS.sansReg,
      size: 10,
      color: PALETTE.muted,
      fillWidth: true,
    });

    const prods = [
      ['Sérum Brilho Ouro 60ml', '6 un disponíveis', 'R$ 89,90'],
      ['Máscara Cronograma Argan 250g', '4 un disponíveis', 'R$ 118,00'],
      ['Leave-in Protetor Térmico', '9 un disponíveis', 'R$ 74,00'],
    ];
    for (const [n, st, pr] of prods) {
      const c = makeCard('Prod/' + n, { p: 11, gap: 5 });
      const r = makeAutoFrame('R', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      addText(r, n, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
      addText(r, pr, { font: FONTS.monoSemi, size: 12, color: PALETTE.terracotta });
      appendFill(c, r);
      const r2 = makeAutoFrame('R2', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      addText(r2, st, { font: FONTS.sansReg, size: 10, color: PALETTE.sageText });
      const add = makeButton('+ Sacola', 'primary', { sm: true });
      r2.appendChild(add);
      reactions.push({ node: add, targetCode: 'POP-C05' });
      appendFill(c, r2);
      appendFill(body, c);
      reactions.push({ node: c, targetCode: 'POP-C04' });
    }
  } else if (type === 'client-meus') {
    addText(body, 'Meus Horários & Pedidos', { font: FONTS.display, size: 17, color: PALETTE.ink });
    const ag = makeCard('AgendamentoAtivo', { p: 12, gap: 6 });
    appendFill(body, ag);
    const top = makeAutoFrame('Top', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    appendFill(ag, top);
    addText(top, 'Hoje · 14:30', { font: FONTS.monoSemi, size: 11, color: PALETTE.terracotta });
    top.appendChild(makeBadge('Confirmado', 'sage'));
    addText(ag, 'Escova Modeladora · Patrícia Alves', { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
    const acts = makeAutoFrame('Acts', 'HORIZONTAL', { gap: 6 });
    appendFill(ag, acts);
    const rem = makeButton('Remarcar (US-10)', 'secondary', { sm: true });
    const can = makeButton('Cancelar', 'danger', { sm: true });
    appendFill(acts, rem);
    appendFill(acts, can);
    reactions.push({ node: rem, targetCode: 'POP-C07' });
    reactions.push({ node: can, targetCode: 'POP-C08' });

    const ped = makeCard('PedidoAtivo', { p: 12, gap: 6 });
    appendFill(body, ped);
    const pTop = makeAutoFrame('PTop', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    appendFill(ped, pTop);
    addText(pTop, 'Pedido #PED-104', { font: FONTS.monoSemi, size: 11, color: PALETTE.ink });
    pTop.appendChild(makeBadge('Separado', 'slate'));
    addText(ped, '1× Sérum Brilho Ouro 60ml · R$ 89,90', { font: FONTS.sansReg, size: 11, color: PALETTE.muted });
    const track = makeButton('Acompanhar Pedido', 'dark', { sm: true });
    appendFill(ped, track);
    reactions.push({ node: track, targetCode: 'POP-C09' });
  } else if (type === 'client-reminder') {
    const wa = makeCard('WhatsAppCard', { bg: '#E9F5EE', border: '#B9DEC8', p: 14, gap: 8 });
    appendFill(body, wa);
    wa.appendChild(makeBadge('LEMBRETE AUTOMÁTICO 24H · US-09', 'sage'));
    addText(wa, 'Olá, Juliana! Seu horário no iPretty é amanhã às 14:30.', {
      font: FONTS.displaySemi,
      size: 15,
      color: PALETTE.ink,
      fillWidth: true,
    });
    addText(wa, 'Serviço: Hidratação Profunda Argan · Com Patrícia Alves · R$ 140,00.', {
      font: FONTS.sansReg,
      size: 11,
      color: PALETTE.muted,
      fillWidth: true,
    });
    const ok = makeButton('Confirmar Presença Agora', 'sage', { icon: 'check' });
    const rem = makeButton('Preciso Remarcar (US-10)', 'secondary', { sm: true });
    appendFill(wa, ok);
    appendFill(wa, rem);
    reactions.push({ node: ok, targetCode: 'C-05' });
    reactions.push({ node: rem, targetCode: 'POP-C07' });
  } else if (type === 'client-profile') {
    addText(body, 'Juliana Mendes', { font: FONTS.display, size: 18, color: PALETTE.ink });
    addText(body, '(11) 99210-4488 · Cliente desde Mar/2025', { font: FONTS.monoReg, size: 10, color: PALETTE.muted });
    appendFill(body, makeKpiCard('Visitas Concluídas', '12 atendimentos', 'Fidelidade', 'sage'));
    const card = makeCard('Prefs', { p: 12, gap: 6 });
    appendFill(body, card);
    addText(card, 'Preferências salvas', { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
    addText(card, 'Profissional favorita: Patrícia Alves · Lembrete 24h via WhatsApp ativo.', {
      font: FONTS.sansReg,
      size: 11,
      color: PALETTE.muted,
      fillWidth: true,
    });
    const pwaBtn = makeButton('Instalar Atalho PWA no Celular', 'secondary', { sm: true });
    appendFill(card, pwaBtn);
    reactions.push({ node: pwaBtn, targetCode: 'POP-S01C' });
  } else if (type === 'pro-agenda') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Minha Agenda · Patrícia', { font: FONTS.display, size: 16, color: PALETTE.ink });
    hdr.appendChild(makeBadge('PWA · US-08', 'terracotta'));
    appendFill(body, hdr);

    const items = [
      ['10:00', 'Ana Clara Lima', 'Corte Bordado', 'Pago', 'dark'],
      ['14:30', 'Juliana Mendes', 'Escova Modeladora', 'Confirmado', 'sage'],
      ['16:00', 'Beatriz Nogueira', 'Hidratação Argan', 'Aguardando', 'ochre'],
    ];
    for (const [hr, cl, sv, st, tn] of items) {
      const c = makeCard('Appt/' + hr, { p: 11, gap: 4 });
      const top = makeAutoFrame('Top', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      addText(top, hr + ' · ' + cl, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
      top.appendChild(makeBadge(st, tn));
      appendFill(c, top);
      addText(c, sv, { font: FONTS.sansReg, size: 11, color: PALETTE.muted });
      appendFill(body, c);
      reactions.push({ node: c, targetCode: 'POP-P02' });
    }
  } else if (type === 'pro-finance') {
    addText(body, 'Meu Financeiro (Exclusivo)', { font: FONTS.display, size: 16, color: PALETTE.ink });
    addText(body, 'Visão isolada apenas dos seus atendimentos pagos.', { font: FONTS.sansReg, size: 10, color: PALETTE.muted });
    appendFill(body, makeKpiCard('Comissão Acumulada', 'R$ 981,00', '45% média', 'sage'));
    appendFill(body, makeKpiCard('Previsto Hoje (Confirmados)', 'R$ 105,75', '2 serviços', 'terracotta'));
    const c = makeCard('Extrato', { p: 11, gap: 5 });
    addText(c, 'Últimos repasses confirmados', { font: FONTS.sansSemi, size: 11, color: PALETTE.ink });
    addText(c, '• 10:00 Corte Bordado (R$ 130) → +R$ 58,50', { font: FONTS.monoReg, size: 10, color: PALETTE.muted });
    addText(c, '• Ontem Escova (R$ 95) → +R$ 42,75', { font: FONTS.monoReg, size: 10, color: PALETTE.muted });
    appendFill(body, c);
  } else if (type === 'pro-folgas') {
    const top = makeAutoFrame('Top', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(top, 'Bloqueios & Folgas', { font: FONTS.display, size: 16, color: PALETTE.ink });
    const addB = makeButton('+ Bloquear', 'primary', { sm: true });
    top.appendChild(addB);
    reactions.push({ node: addB, targetCode: 'POP-P03' });
    appendFill(body, top);
    const blk = makeCard('BloqueioAtivo', { p: 11, gap: 4 });
    blk.appendChild(makeBadge('Ativo na vitrine', 'ochre'));
    addText(blk, 'Sex 14/11 · 13:00 às 18:00', { font: FONTS.monoSemi, size: 11, color: PALETTE.ink });
    addText(blk, 'Motivo: Consulta médica · Slots ocultados da vitrine.', { font: FONTS.sansReg, size: 10, color: PALETTE.muted, fillWidth: true });
    appendFill(body, blk);
  }
}

function buildMobileFrame(spec, reactions) {
  const frame = figma.createFrame();
  frame.name = `${spec.code} · ${spec.title}`;
  frame.resize(spec.w, spec.h);
  frame.cornerRadius = 32;
  frame.fills = solid(PALETTE.linen);
  frame.strokes = solid(PALETTE.borderStrong);
  frame.strokeWeight = 4;
  frame.clipsContent = true;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
  frame.itemSpacing = 0;

  buildPhoneChrome(frame, spec.dark, spec.url);

  const body = makeAutoFrame('ScreenBody', 'VERTICAL', {
    bg: PALETTE.linen,
    px: 14,
    py: 12,
    gap: 10,
  });
  frame.appendChild(body);
  body.layoutSizingHorizontal = 'FILL';
  body.layoutSizingVertical = 'FILL';

  const bodyType = spec.type || spec.base;
  populateMobileBody(body, bodyType, reactions);

  const isPro = spec.code.startsWith('P-') || spec.code.startsWith('POP-P');
  if (isPro) {
    buildMobileBottomNav(
      frame,
      spec.code.includes('02') ? 'fin' : spec.code.includes('03') ? 'fol' : 'ag',
      [
        { key: 'ag', label: 'Agenda', icon: 'calendar', target: 'P-01' },
        { key: 'fin', label: 'Financeiro', icon: 'chart', target: 'P-02' },
        { key: 'fol', label: 'Folgas', icon: 'bell', target: 'P-03' },
      ],
      reactions,
      true
    );
  } else {
    buildMobileBottomNav(
      frame,
      spec.code === 'C-02' || spec.code === 'C-03' ? 'svc' : spec.code === 'C-04' ? 'prod' : spec.code === 'C-05' ? 'meus' : 'home',
      [
        { key: 'home', label: 'Início', icon: 'spark', target: 'C-01' },
        { key: 'svc', label: 'Agendar', icon: 'calendar', target: 'C-02' },
        { key: 'prod', label: 'Produtos', icon: 'bag', target: 'C-04' },
        { key: 'meus', label: 'Meus', icon: 'user', target: 'C-05' },
      ],
      reactions,
      false
    );
  }

  if (spec.isPopup && spec.modal) {
    buildModalOverlay(frame, spec.modal, reactions);
  }
  return frame;
}

// ============================================================================
// CONSTRUTOR DAS 25 TELAS DESKTOP (1280×800)
// ============================================================================

function buildDesktopChrome(frame, spec) {
  const bar = makeAutoFrame('BrowserBar', 'HORIZONTAL', {
    bg: PALETTE.cream,
    border: PALETTE.border,
    px: 18,
    py: 10,
    align: 'SPACE_BETWEEN',
    crossAlign: 'CENTER',
  });
  const dots = makeAutoFrame('Dots', 'HORIZONTAL', { gap: 6 });
  for (const c of ['#E3C1B5', '#E8D5AF', '#BFD4C6']) {
    const d = figma.createEllipse();
    d.resize(10, 10);
    d.fills = solid(c);
    dots.appendChild(d);
  }
  bar.appendChild(dots);

  const urlPill = makeAutoFrame('URL', 'HORIZONTAL', {
    bg: PALETTE.sand,
    radius: 999,
    px: 14,
    py: 4,
  });
  addText(urlPill, spec.url, { font: FONTS.monoReg, size: 11, color: PALETTE.muted });
  bar.appendChild(urlPill);
  addText(bar, `${spec.code} · 1280×800`, { font: FONTS.monoSemi, size: 11, color: PALETTE.softText });
  appendFill(frame, bar);
}

function buildRoleNavStrip(parent, activeCode, tabs, reactions) {
  const strip = makeAutoFrame('SubNavigation', 'HORIZONTAL', {
    bg: PALETTE.sand,
    border: PALETTE.border,
    radius: 14,
    p: 6,
    gap: 6,
  });
  for (const t of tabs) {
    const active = t.code === activeCode;
    const pill = makeAutoFrame('Tab/' + t.code, 'HORIZONTAL', {
      bg: active ? PALETTE.white : undefined,
      border: active ? PALETTE.border : undefined,
      radius: 10,
      px: 12,
      py: 7,
      gap: 6,
      crossAlign: 'CENTER',
    });
    addIcon(pill, t.icon || 'chart', active ? PALETTE.terracotta : PALETTE.muted, 13);
    addText(pill, t.label, {
      font: active ? FONTS.sansSemi : FONTS.sansMed,
      size: 12,
      color: active ? PALETTE.ink : PALETTE.muted,
    });
    strip.appendChild(pill);
    reactions.push({ node: pill, targetCode: t.code });
  }
  appendFill(parent, strip);
}

function populateDesktopBody(body, spec, reactions) {
  const kind = spec.type || spec.base;

  // Cabeçalho do módulo
  if (kind.startsWith('reception-')) {
    buildRoleNavStrip(
      body,
      spec.code.startsWith('POP-') ? 'R-01' : spec.code,
      [
        { code: 'R-01', label: 'R-01 · Painel do Dia', icon: 'calendar' },
        { code: 'R-02', label: 'R-02 · Fila de Pedidos', icon: 'bag' },
        { code: 'R-04', label: 'R-04 · Caixa & Faltas', icon: 'chart' },
      ],
      reactions
    );
  } else if (kind.startsWith('admin-')) {
    buildRoleNavStrip(
      body,
      spec.code.startsWith('POP-') ? 'A-01' : spec.code,
      [
        { code: 'A-01', label: 'A-01 · Visão Geral', icon: 'chart' },
        { code: 'A-02', label: 'A-02 · Equipe & Escalas', icon: 'user' },
        { code: 'A-03', label: 'A-03 · Serviços', icon: 'scissors' },
        { code: 'A-04', label: 'A-04 · Fornecedores & Produtos', icon: 'bag' },
        { code: 'A-05', label: 'A-05 · Vendas, Lucro & Repasses', icon: 'chart' },
        { code: 'A-06', label: 'A-06 · Banners da Vitrine', icon: 'spark' },
      ],
      reactions
    );
  }

  if (kind === 'splash') {
    const hero = makeAutoFrame('HeroSplit', 'HORIZONTAL', { gap: 20, crossAlign: 'MIN' });
    appendFill(body, hero);
    const left = makeAutoFrame('Left', 'VERTICAL', { gap: 12 });
    appendFill(hero, left);
    left.appendChild(makeBadge('SISTEMA INTEGRADO · SALÃO IPRETTY', 'terracotta'));
    addText(left, 'Gestão editorial para salões de beleza — da vitrine ao caixa.', {
      font: FONTS.display,
      size: 32,
      color: PALETTE.ink,
      fillWidth: true,
    });
    addText(left, 'Agenda inteligente sem conflitos, retirada de produtos sem custo oculto, PWA da profissional e cálculo exato de lucros e repasses.', {
      font: FONTS.sansReg,
      size: 14,
      color: PALETTE.muted,
      fillWidth: true,
    });
    const btns = makeAutoFrame('Btns', 'HORIZONTAL', { gap: 10 });
    const b1 = makeButton('Entrar com PIN / Perfil', 'primary', { icon: 'user' });
    const b2 = makeButton('Ver Identidade & Tokens', 'secondary');
    btns.appendChild(b1);
    btns.appendChild(b2);
    reactions.push({ node: b1, targetCode: 'POP-S01A' });
    reactions.push({ node: b2, targetCode: 'S-02' });
    left.appendChild(btns);

    const right = makeCard('Perfis', { p: 16, gap: 10 });
    appendFill(hero, right);
    addText(right, 'Acessos Diretos do Protótipo', { font: FONTS.sansSemi, size: 13, color: PALETTE.ink });
    for (const [label, target, tone] of [
      ['Carla · Balcão da Recepção', 'R-01', 'sage'],
      ['Dona Marta · Administração & Lucros', 'A-01', 'terracotta'],
      ['Brand Book & Design System', 'S-02', 'neutral'],
    ]) {
      const pCard = makeAutoFrame('Card/' + label, 'HORIZONTAL', {
        bg: PALETTE.linen,
        border: PALETTE.border,
        radius: 10,
        px: 12,
        py: 10,
        align: 'SPACE_BETWEEN',
        crossAlign: 'CENTER',
      });
      appendFill(right, pCard);
      addText(pCard, label, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
      pCard.appendChild(makeBadge('Abrir', tone));
      reactions.push({ node: pCard, targetCode: target });
    }
  } else if (kind === 'brand') {
    addText(body, 'S-02 · Identidade Visual & Design System iPretty', { font: FONTS.display, size: 24, color: PALETTE.ink });
    const row = makeAutoFrame('PaletteRow', 'HORIZONTAL', { gap: 10 });
    appendFill(body, row);
    for (const [name, hex] of [
      ['Linen Base', PALETTE.linen],
      ['Terracotta', PALETTE.terracotta],
      ['Espresso Ink', PALETTE.ink],
      ['Sage Confirm', PALETTE.sage],
      ['Ochre Alert', '#B2761E'],
    ]) {
      const sw = makeCard('Swatch/' + name, { p: 10, gap: 6 });
      appendFill(row, sw);
      const box = figma.createFrame();
      box.resize(160, 56);
      box.cornerRadius = 10;
      box.fills = solid(hex);
      sw.appendChild(box);
      addText(sw, name, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
      addText(sw, hex, { font: FONTS.monoReg, size: 11, color: PALETTE.muted });
    }
  } else if (kind === 'reception-agenda') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Agenda Multi-Coluna de Hoje (11/11)', { font: FONTS.display, size: 22, color: PALETTE.ink });
    const enc = makeButton('+ Novo Encaixe Manual (US-03)', 'primary', { icon: 'calendar' });
    hdr.appendChild(enc);
    reactions.push({ node: enc, targetCode: 'POP-R02' });
    appendFill(body, hdr);

    const cols = makeAutoFrame('Columns', 'HORIZONTAL', { gap: 14, crossAlign: 'MIN' });
    for (const [pro, cards] of [
      ['Patrícia Alves · Cabelos', [['10:00 · Ana Clara', 'Corte Bordado · R$ 130', 'Pago', 'dark'], ['14:30 · Juliana Mendes', 'Escova · R$ 95', 'Confirmado', 'sage']]],
      ['Camila Rocha · Unhas', [['11:00 · Larissa Souza', 'Manicure Gel · R$ 85', 'Compareceu', 'terracotta'], ['16:00 · Slot Livre', 'Disponível na vitrine', 'Livre', 'neutral']]],
      ['Mariana Costa · Tratamentos', [['13:30 · Sofia Prado', 'Hidratação · R$ 140', 'Aguardando', 'ochre'], ['15:30 · Bloqueio', 'Treinamento técnico', 'Bloqueado', 'slate']]],
    ]) {
      const col = makeCard('Col/' + pro, { p: 12, gap: 8 });
      addText(col, pro, { font: FONTS.sansSemi, size: 13, color: PALETTE.ink });
      for (const [t, s, st, tn] of cards) {
        const appt = makeCard('Appt/' + t, { bg: PALETTE.linen, p: 10, gap: 4 });
        const r = makeAutoFrame('R', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
        addText(r, t, { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
        r.appendChild(makeBadge(st, tn));
        appendFill(appt, r);
        addText(appt, s, { font: FONTS.sansReg, size: 11, color: PALETTE.muted });
        appendFill(col, appt);
        reactions.push({ node: appt, targetCode: 'POP-R01' });
      }
      appendFill(cols, col);
    }
    appendFill(body, cols);
  } else if (kind === 'reception-orders') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Fila de Pedidos · Máquina de Estados (US-04)', { font: FONTS.display, size: 22, color: PALETTE.ink });
    const novo = makeButton('+ Pedido Balcão / Brinde', 'primary', { icon: 'bag' });
    hdr.appendChild(novo);
    reactions.push({ node: novo, targetCode: 'POP-R05' });
    appendFill(body, hdr);

    const list = makeAutoFrame('Orders', 'VERTICAL', { gap: 10 });
    for (const [id, cli, item, val, st, tn] of [
      ['#PED-109', 'Juliana Mendes', '1× Sérum Brilho Ouro 60ml', 'R$ 89,90', 'Solicitado', 'ochre'],
      ['#PED-104', 'Beatriz Nogueira', '1× Máscara Argan 250g', 'R$ 118,00', 'Separado', 'slate'],
      ['#PED-102', 'Fernanda Dias', '1× Ampola Nutrição (amostra)', 'R$ 0,00', 'Brinde', 'sage'],
    ]) {
      const row = makeCard('Order/' + id, { dir: 'HORIZONTAL', p: 14, gap: 12, align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      const info = makeAutoFrame('Info', 'VERTICAL', { gap: 2 });
      addText(info, `${id} · ${cli}`, { font: FONTS.sansSemi, size: 13, color: PALETTE.ink });
      addText(info, item, { font: FONTS.sansReg, size: 11, color: PALETTE.muted });
      appendFill(row, info);
      row.appendChild(makeBadge(st, tn));
      addText(row, val, { font: FONTS.monoSemi, size: 13, color: PALETTE.ink });
      const bAudit = makeButton('Auditoria', 'secondary', { sm: true });
      const bPay = makeButton('Cobrar', 'sage', { sm: true });
      row.appendChild(bAudit);
      row.appendChild(bPay);
      reactions.push({ node: bAudit, targetCode: 'POP-R03' });
      reactions.push({ node: bPay, targetCode: 'POP-R04' });
      appendFill(list, row);
    }
    appendFill(body, list);
  } else if (kind === 'reception-cashier') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Caixa do Turno & Controle de Faltas', { font: FONTS.display, size: 22, color: PALETTE.ink });
    const pay = makeButton('Registrar Pagamento / Checkout', 'sage', { icon: 'check' });
    hdr.appendChild(pay);
    reactions.push({ node: pay, targetCode: 'POP-R04' });
    appendFill(body, hdr);
    const kpis = makeAutoFrame('Kpis', 'HORIZONTAL', { gap: 12 });
    appendFill(kpis, makeKpiCard('Total Recebido Hoje', 'R$ 1.420,00', '11 baixas', 'sage'));
    appendFill(kpis, makeKpiCard('A Receber (Confirmados)', 'R$ 495,00', '4 comandas', 'ochre'));
    appendFill(kpis, makeKpiCard('Faltas / No-Show', '1 cliente', 'Sinalizado', 'crimson'));
    appendFill(body, kpis);
  } else if (kind === 'admin-overview') {
    addText(body, 'Visão Geral do Salão · Dona Marta', { font: FONTS.display, size: 22, color: PALETTE.ink });
    const kpis = makeAutoFrame('Kpis', 'HORIZONTAL', { gap: 12 });
    appendFill(kpis, makeKpiCard('Receita Mensal', 'R$ 18.640,00', '+14% vs out', 'sage'));
    appendFill(kpis, makeKpiCard('Lucro Líquido Produtos', 'R$ 3.890,00', 'Margem 54%', 'terracotta'));
    appendFill(kpis, makeKpiCard('Repasses da Semana', 'R$ 4.120,00', '3 parceiras', 'slate'));
    appendFill(kpis, makeKpiCard('Ocupação Agenda', '86%', 'Meta 80%', 'sage'));
    appendFill(body, kpis);
  } else if (kind === 'admin-team') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Equipe, Vínculos & Trocas na Escala (US-05 / US-12)', { font: FONTS.display, size: 21, color: PALETTE.ink });
    const acts = makeAutoFrame('Acts', 'HORIZONTAL', { gap: 8 });
    const b1 = makeButton('+ Nova Profissional', 'primary', { sm: true });
    const b2 = makeButton('Troca Pontual Escala', 'secondary', { sm: true });
    acts.appendChild(b1);
    acts.appendChild(b2);
    reactions.push({ node: b1, targetCode: 'POP-A01' });
    reactions.push({ node: b2, targetCode: 'POP-A02' });
    hdr.appendChild(acts);
    appendFill(body, hdr);

    for (const [nm, rl, tp, com] of [
      ['Patrícia Alves', 'Cabelos & Escovas', 'Parceira', '45% comissão · Ter–Sáb'],
      ['Camila Rocha', 'Manicure & Gel', 'CLT + Comissão', '30% comissão · Seg–Sex'],
      ['Mariana Costa', 'Tratamentos & Cor', 'Salão / Fixo', 'Salário fixo · Qua–Dom'],
    ]) {
      const card = makeCard('Staff/' + nm, { dir: 'HORIZONTAL', p: 13, gap: 12, align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      const info = makeAutoFrame('Info', 'VERTICAL', { gap: 2 });
      addText(info, `${nm} · ${rl}`, { font: FONTS.sansSemi, size: 13, color: PALETTE.ink });
      addText(info, com, { font: FONTS.sansReg, size: 11, color: PALETTE.muted });
      appendFill(card, info);
      card.appendChild(makeBadge(tp, 'terracotta'));
      const edit = makeButton('Editar Vínculo', 'secondary', { sm: true });
      card.appendChild(edit);
      reactions.push({ node: edit, targetCode: 'POP-A01' });
      appendFill(body, card);
    }
  } else if (kind === 'admin-services') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Catálogo de Serviços do Salão', { font: FONTS.display, size: 22, color: PALETTE.ink });
    const add = makeButton('+ Novo Serviço', 'primary', { sm: true });
    hdr.appendChild(add);
    reactions.push({ node: add, targetCode: 'POP-A03' });
    appendFill(body, hdr);

    for (const [s, d, p, pros] of [
      ['Escova Modeladora', '50 min', 'R$ 95,00', 'Patrícia Alves, Camila Rocha'],
      ['Hidratação Profunda Argan', '60 min', 'R$ 140,00', 'Patrícia Alves, Mariana Costa'],
      ['Manicure & Esmaltação Gel', '45 min', 'R$ 85,00', 'Camila Rocha'],
    ]) {
      const card = makeCard('Svc/' + s, { dir: 'HORIZONTAL', p: 13, gap: 12, align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      const info = makeAutoFrame('Info', 'VERTICAL', { gap: 2 });
      addText(info, s, { font: FONTS.sansSemi, size: 13, color: PALETTE.ink });
      addText(info, `Duração: ${d} · Habilitadas: ${pros}`, { font: FONTS.sansReg, size: 11, color: PALETTE.muted });
      appendFill(card, info);
      addText(card, p, { font: FONTS.monoSemi, size: 13, color: PALETTE.terracotta });
      appendFill(body, card);
      reactions.push({ node: card, targetCode: 'POP-A03' });
    }
  } else if (kind === 'admin-products') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Fornecedores & Produtos · Margens (US-06)', { font: FONTS.display, size: 21, color: PALETTE.ink });
    const acts = makeAutoFrame('Acts', 'HORIZONTAL', { gap: 8 });
    const bForn = makeButton('+ Fornecedor', 'secondary', { sm: true });
    const bProd = makeButton('+ Novo Produto', 'primary', { sm: true });
    acts.appendChild(bForn);
    acts.appendChild(bProd);
    reactions.push({ node: bForn, targetCode: 'POP-A04' });
    reactions.push({ node: bProd, targetCode: 'POP-A05' });
    hdr.appendChild(acts);
    appendFill(body, hdr);

    for (const [p, cost, sell, margin, tone] of [
      ['Sérum Reparador Brilho Ouro 60ml', 'Custo: R$ 42,00', 'Venda: R$ 89,90', '+R$ 47,90 (+114,0%)', 'sage'],
      ['Máscara Cronograma Argan 250g', 'Custo: R$ 65,00', 'Venda: R$ 118,00', '+R$ 53,00 (+81,5%)', 'sage'],
      ['Kit Amostra Promocional', 'Custo: R$ 18,00', 'Venda: R$ 15,00', 'Margem negativa (-16,7%)', 'crimson'],
    ]) {
      const card = makeCard('Prod/' + p, { dir: 'HORIZONTAL', p: 13, gap: 12, align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
      const info = makeAutoFrame('Info', 'VERTICAL', { gap: 2 });
      addText(info, p, { font: FONTS.sansSemi, size: 13, color: PALETTE.ink });
      addText(info, `${cost} · ${sell}`, { font: FONTS.monoReg, size: 11, color: PALETTE.muted });
      appendFill(card, info);
      card.appendChild(makeBadge(margin, tone));
      appendFill(body, card);
      reactions.push({ node: card, targetCode: 'POP-A05' });
    }
  } else if (kind === 'admin-reports') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Relatórios Financeiros, Repasses & Ranking (US-07 / US-13)', { font: FONTS.display, size: 20, color: PALETTE.ink });
    const ext = makeButton('Abrir Extrato de Repasse', 'dark', { sm: true });
    hdr.appendChild(ext);
    reactions.push({ node: ext, targetCode: 'POP-A06' });
    appendFill(body, hdr);

    const row = makeAutoFrame('Row', 'HORIZONTAL', { gap: 12 });
    appendFill(row, makeKpiCard('Patrícia Alves (Pago)', 'R$ 981,00', '45% repasse', 'sage'));
    appendFill(row, makeKpiCard('Camila Rocha (Pago)', 'R$ 540,00', '30% repasse', 'terracotta'));
    appendFill(row, makeKpiCard('Top Serviço (R$)', 'Escova Modeladora', 'R$ 3.610,00', 'dark'));
    appendFill(body, row);
  } else if (kind === 'admin-banners') {
    const hdr = makeAutoFrame('Hdr', 'HORIZONTAL', { align: 'SPACE_BETWEEN', crossAlign: 'CENTER' });
    addText(hdr, 'Banners Promocionais da Vitrine (US-14)', { font: FONTS.display, size: 21, color: PALETTE.ink });
    const add = makeButton('+ Novo Banner Vitrine', 'primary', { sm: true });
    hdr.appendChild(add);
    reactions.push({ node: add, targetCode: 'POP-A07' });
    appendFill(body, hdr);

    const card = makeCard('BannerAtivo', { bg: PALETTE.ink, p: 18, gap: 6 });
    card.appendChild(makeBadge('ATIVO NA HOME DA CLIENTE', 'terracotta'));
    addText(card, 'Combo Brilho & Seda · Escova + Hidratação Argan', { font: FONTS.display, size: 20, color: PALETTE.cream });
    addText(card, 'CTA: Agendar Horário Agora → C-02 Catálogo', { font: FONTS.monoReg, size: 11, color: '#D3C8BF' });
    const edit = makeButton('Editar Banner', 'secondary', { sm: true });
    card.appendChild(edit);
    reactions.push({ node: edit, targetCode: 'POP-A07' });
    appendFill(body, card);
  }
}

function buildDesktopFrame(spec, reactions) {
  const frame = figma.createFrame();
  frame.name = `${spec.code} · ${spec.title}`;
  frame.resize(spec.w, spec.h);
  frame.cornerRadius = 18;
  frame.fills = solid(PALETTE.linen);
  frame.strokes = solid(PALETTE.sageBorder);
  frame.strokeWeight = 1.5;
  frame.clipsContent = true;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
  frame.itemSpacing = 0;

  buildDesktopChrome(frame, spec);

  const body = makeAutoFrame('DesktopContent', 'VERTICAL', {
    bg: PALETTE.linen,
    px: 36,
    py: 24,
    gap: 16,
  });
  frame.appendChild(body);
  body.layoutSizingHorizontal = 'FILL';
  body.layoutSizingVertical = 'FILL';

  populateDesktopBody(body, spec, reactions);

  if (spec.isPopup && spec.modal) {
    buildModalOverlay(frame, spec.modal, reactions);
  }
  return frame;
}

// ============================================================================
// PÁGINA 00 · IDENTIDADE VISUAL, VARIÁVEIS & UI KIT
// ============================================================================

async function buildTokensPage(page) {
  await figma.setCurrentPageAsync(page);

  const existing = page.children.find((n) => n.name === 'iPretty Studio · Identidade Visual & UI Kit');
  if (existing) existing.remove();

  // Tenta criar estilos de cor locais e text styles (compatível com qualquer plano)
  const colorDefs = [
    ['iPretty/bg/linen', PALETTE.linen],
    ['iPretty/surface/white', PALETTE.white],
    ['iPretty/brand/terracotta', PALETTE.terracotta],
    ['iPretty/brand/espresso', PALETTE.ink],
    ['iPretty/accent/sage', PALETTE.sage],
    ['iPretty/accent/ochre', '#B2761E'],
    ['iPretty/accent/crimson', PALETTE.crimson],
    ['iPretty/border/sand', PALETTE.border],
    ['iPretty/studio/blush', PALETTE.studioBlush],
    ['iPretty/studio/sage', PALETTE.studioSage],
  ];
  const existingPaintStyles = await figma.getLocalPaintStylesAsync();
  for (const [name, hex] of colorDefs) {
    let style = existingPaintStyles.find((s) => s.name === name);
    if (!style) style = figma.createPaintStyle();
    style.name = name;
    style.paints = solid(hex);
  }

  // Tenta também criar Variables collection (se permitido pelo plano)
  try {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    let col = cols.find((c) => c.name === 'iPretty Tokens');
    if (!col) col = figma.variables.createVariableCollection('iPretty Tokens');
    const modeId = col.modes[0].modeId;
    const allVars = await figma.variables.getLocalVariablesAsync('COLOR');
    for (const [name, hex] of colorDefs) {
      const shortName = name.replace('iPretty/', '');
      let v = allVars.find((item) => item.name === shortName && item.variableCollectionId === col.id);
      if (!v) v = figma.variables.createVariable(shortName, col, 'COLOR');
      v.setValueForMode(modeId, hexToRgb(hex));
    }
  } catch (_e) {
    // Starter/limites não impedem o restante dos estilos
  }

  const board = makeAutoFrame('iPretty Studio · Identidade Visual & UI Kit', 'VERTICAL', {
    bg: PALETTE.cream,
    border: PALETTE.border,
    radius: 24,
    p: 40,
    gap: 24,
  });
  board.resize(1280, 100);
  board.layoutSizingHorizontal = 'FIXED';
  board.layoutSizingVertical = 'HUG';
  let maxX = 0;
  let hasOther = false;
  for (const child of page.children) {
    hasOther = true;
    maxX = Math.max(maxX, child.x + child.width);
  }
  board.x = hasOther ? Math.round(maxX + 160) : Math.round(figma.viewport.center.x - 640);
  board.y = 0;

  addText(board, 'IPRETTY SALÃO · BRAND BOOK & DESIGN SYSTEM', {
    font: FONTS.monoSemi,
    size: 11,
    color: PALETTE.terracotta,
  });
  addText(board, 'Identidade Visual, Paleta Editorial & Biblioteca de Componentes', {
    font: FONTS.display,
    size: 28,
    color: PALETTE.ink,
    fillWidth: true,
  });

  const swGrid = makeAutoFrame('ColorTokens', 'HORIZONTAL', { gap: 12 });
  appendFill(board, swGrid);
  for (const [name, hex] of colorDefs.slice(0, 6)) {
    const card = makeCard(name, { p: 12, gap: 6 });
    appendFill(swGrid, card);
    const chip = figma.createFrame();
    chip.resize(150, 64);
    chip.cornerRadius = 10;
    chip.fills = solid(hex);
    card.appendChild(chip);
    addText(card, name.replace('iPretty/', ''), { font: FONTS.sansSemi, size: 12, color: PALETTE.ink });
    addText(card, hex, { font: FONTS.monoReg, size: 11, color: PALETTE.muted });
  }

  const kit = makeCard('UIKitComponents', { p: 20, gap: 12 });
  addText(kit, 'Botões & Badges Semânticos', { font: FONTS.sansSemi, size: 14, color: PALETTE.ink });
  const btnRow = makeAutoFrame('Buttons', 'HORIZONTAL', { gap: 10 });
  btnRow.appendChild(makeButton('Primary CTA', 'primary'));
  btnRow.appendChild(makeButton('Dark Action', 'dark'));
  btnRow.appendChild(makeButton('Secondary', 'secondary'));
  btnRow.appendChild(makeButton('Sage Confirm', 'sage'));
  btnRow.appendChild(makeButton('Danger Cancel', 'danger'));
  kit.appendChild(btnRow);

  const badgeRow = makeAutoFrame('Badges', 'HORIZONTAL', { gap: 8 });
  badgeRow.appendChild(makeBadge('Aguardando confirmação', 'ochre'));
  badgeRow.appendChild(makeBadge('Confirmado', 'sage'));
  badgeRow.appendChild(makeBadge('Compareceu', 'terracotta'));
  badgeRow.appendChild(makeBadge('Pago', 'dark'));
  badgeRow.appendChild(makeBadge('Não compareceu', 'crimson'));
  badgeRow.appendChild(makeBadge('Separado', 'slate'));
  kit.appendChild(badgeRow);
  appendFill(board, kit);

  page.appendChild(board);
  figma.viewport.scrollAndZoomIntoView([board]);
  return board;
}

// ============================================================================
// CONEXÃO DE PROTÓTIPO ENTRE FRAMES
// ============================================================================

async function wirePrototypeReactions(reactions, frameByCode) {
  let count = 0;
  for (const item of reactions) {
    const target = frameByCode[item.targetCode];
    if (!target || !item.node || !item.node.setReactionsAsync) continue;
    try {
      await item.node.setReactionsAsync([
        {
          trigger: { type: 'ON_CLICK' },
          actions: [
            {
              type: 'NODE',
              destinationId: target.id,
              navigation: 'NAVIGATE',
              transition: {
                type: 'SMART_ANIMATE',
                easing: { type: 'EASE_IN_AND_OUT' },
                duration: 0.22,
              },
            },
          ],
        },
      ]);
      count++;
    } catch (_e) {
      // Ignora nós que eventualmente não aceitem reaction
    }
  }
  return count;
}

async function getOrCreatePage(title, fallbackIndex = 0) {
  let p = figma.root.children.find((node) => node.name === title);
  if (!p) {
    const blankDefault = figma.root.children.find((node) => /^Page \d+$/i.test(node.name));
    if (blankDefault) {
      await blankDefault.loadAsync();
      if (blankDefault.children.length === 0) {
        blankDefault.name = title;
        p = blankDefault;
      }
    }
  }
  if (!p) {
    try {
      p = figma.createPage();
      p.name = title;
    } catch (_limitErr) {
      p = figma.root.children[Math.min(fallbackIndex, figma.root.children.length - 1)] || figma.currentPage;
    }
  }
  await figma.setCurrentPageAsync(p);
  await p.loadAsync();
  return p;
}

function placeWithoutOverlap(page, node) {
  let maxX = 0;
  let hasOther = false;
  for (const child of page.children) {
    if (child.id === node.id) continue;
    hasOther = true;
    maxX = Math.max(maxX, child.x + child.width);
  }
  node.x = hasOther ? Math.round(maxX + 180) : 0;
  node.y = 0;
}

async function cleanupPluginGroup(legacyWrapperName, groupKey) {
  for (const pg of figma.root.children) {
    await pg.loadAsync();
    const toRemove = [];
    for (const child of pg.children) {
      if (child.name === legacyWrapperName || child.getPluginData('iprettyGroup') === groupKey) {
        toRemove.push(child);
      }
    }
    for (const node of toRemove) {
      node.remove();
    }
  }
}

function getPageBaseOffsetX(page) {
  let maxX = 0;
  let hasExisting = false;
  for (const child of page.children) {
    hasExisting = true;
    maxX = Math.max(maxX, child.x + child.width);
  }
  return hasExisting ? Math.round(maxX + 240) : 0;
}

function mergeFlowStartingPoints(page, newPoints) {
  const existing = Array.isArray(page.flowStartingPoints) ? page.flowStartingPoints : [];
  const validNodeIds = new Set(page.children.map((n) => n.id));
  const newNames = new Set(newPoints.map((pt) => pt.name));
  const kept = existing.filter((pt) => validNodeIds.has(pt.nodeId) && !newNames.has(pt.name));
  return kept.concat(newPoints);
}

// ============================================================================
// ORQUESTRAÇÃO PRINCIPAL
// ============================================================================

async function runGeneration(scope, wireFlows) {
  await ensureFonts();

  let totalFrames = 0;
  let totalLinks = 0;
  const createdRoots = [];

  if (scope === 'all' || scope === 'tokens') {
    figma.ui.postMessage({
      type: 'progress',
      percent: 18,
      title: 'Montando Identidade Visual...',
      detail: 'Criando estilos de cor, variáveis e UI Kit.',
    });
    const pTokens = await getOrCreatePage('00 · Identidade & Tokens', 0);
    createdRoots.push(await buildTokensPage(pTokens));
  }

  if (scope === 'all' || scope === 'mobile') {
    figma.ui.postMessage({
      type: 'progress',
      percent: 45,
      title: 'Montando 23 Frames Mobile...',
      detail: 'App da Cliente (Juliana) + PWA Profissional (Patrícia) + Popups.',
    });
    await cleanupPluginGroup('iPretty Studio · Mobile (23 Frames)', 'mobile');
    const pMobile = await getOrCreatePage('01 · Mobile Studio (23)', 1);
    try {
      pMobile.backgrounds = solid(PALETTE.studioBlush);
    } catch (_e) {}

    const baseX = getPageBaseOffsetX(pMobile);
    const cols = 4;
    const gapX = 64;
    const gapY = 104;
    const cellW = 390;
    const cellH = 844;

    const headerTxt = figma.createText();
    headerTxt.fontName = FONTS.display;
    headerTxt.fontSize = 26;
    headerTxt.fills = solid(PALETTE.ink);
    headerTxt.characters = 'Seção 01 · Mobile Studio (23 Frames Top-Level — Cliente Juliana + PWA Patrícia + Popups)';
    headerTxt.x = baseX;
    headerTxt.y = 0;
    headerTxt.setPluginData('iprettyGroup', 'mobile');
    pMobile.appendChild(headerTxt);

    const frameByCode = {};
    const reactions = [];
    const createdMobileNodes = [];

    for (let i = 0; i < MOBILE_SCREENS.length; i++) {
      const spec = MOBILE_SCREENS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = baseX + col * (cellW + gapX);
      const y = 84 + row * (cellH + gapY);

      const label = figma.createText();
      label.fontName = FONTS.monoSemi;
      label.fontSize = 12;
      label.fills = solid(PALETTE.terracottaText);
      label.characters = `${spec.code} · ${spec.title}`;
      label.x = x;
      label.y = y - 24;
      label.setPluginData('iprettyGroup', 'mobile');
      pMobile.appendChild(label);

      const f = buildMobileFrame(spec, reactions);
      f.x = x;
      f.y = y;
      f.setPluginData('iprettyGroup', 'mobile');
      pMobile.appendChild(f);
      frameByCode[spec.code] = f;
      createdMobileNodes.push(f);
      totalFrames++;
    }

    if (wireFlows) {
      totalLinks += await wirePrototypeReactions(reactions, frameByCode);
      try {
        pMobile.flowStartingPoints = mergeFlowStartingPoints(pMobile, [
          { nodeId: frameByCode['C-01'].id, name: 'Vitrine Cliente (C-01)' },
          { nodeId: frameByCode['P-01'].id, name: 'PWA Profissional (P-01)' },
        ]);
      } catch (_e) {}
    }
    createdRoots.push(...createdMobileNodes);
    figma.viewport.scrollAndZoomIntoView(createdMobileNodes);
  }

  if (scope === 'all' || scope === 'desktop') {
    figma.ui.postMessage({
      type: 'progress',
      percent: 78,
      title: 'Montando 25 Frames Desktop...',
      detail: 'Entrada, Brand Book, Recepção (Carla) + Admin (Dona Marta) + Popups.',
    });
    await cleanupPluginGroup('iPretty Studio · Desktop (25 Frames)', 'desktop');
    const pDesktop = await getOrCreatePage('02 · Desktop Studio (25)', 2);
    try {
      pDesktop.backgrounds = solid(PALETTE.studioSage);
    } catch (_e) {}

    const baseX = getPageBaseOffsetX(pDesktop);
    const cols = 2;
    const gapX = 96;
    const gapY = 112;
    const cellW = 1280;
    const cellH = 800;

    const headerTxt = figma.createText();
    headerTxt.fontName = FONTS.display;
    headerTxt.fontSize = 30;
    headerTxt.fills = solid(PALETTE.ink);
    headerTxt.characters = 'Seção 02 · Desktop Studio (25 Frames Top-Level — Sistema, Recepção Carla & Admin Dona Marta)';
    headerTxt.x = baseX;
    headerTxt.y = 0;
    headerTxt.setPluginData('iprettyGroup', 'desktop');
    pDesktop.appendChild(headerTxt);

    const frameByCode = {};
    const reactions = [];
    const createdDesktopNodes = [];

    for (let i = 0; i < DESKTOP_SCREENS.length; i++) {
      const spec = DESKTOP_SCREENS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = baseX + col * (cellW + gapX);
      const y = 92 + row * (cellH + gapY);

      const label = figma.createText();
      label.fontName = FONTS.monoSemi;
      label.fontSize = 14;
      label.fills = solid(PALETTE.sageText);
      label.characters = `${spec.code} · ${spec.title}`;
      label.x = x;
      label.y = y - 28;
      label.setPluginData('iprettyGroup', 'desktop');
      pDesktop.appendChild(label);

      const f = buildDesktopFrame(spec, reactions);
      f.x = x;
      f.y = y;
      f.setPluginData('iprettyGroup', 'desktop');
      pDesktop.appendChild(f);
      frameByCode[spec.code] = f;
      createdDesktopNodes.push(f);
      totalFrames++;
    }

    if (wireFlows) {
      totalLinks += await wirePrototypeReactions(reactions, frameByCode);
      try {
        pDesktop.flowStartingPoints = mergeFlowStartingPoints(pDesktop, [
          { nodeId: frameByCode['S-01'].id, name: 'Entrada Sistema (S-01)' },
          { nodeId: frameByCode['R-01'].id, name: 'Recepção Carla (R-01)' },
          { nodeId: frameByCode['A-01'].id, name: 'Admin Dona Marta (A-01)' },
        ]);
      } catch (_e) {}
    }
    createdRoots.push(...createdDesktopNodes);
    figma.viewport.scrollAndZoomIntoView(createdDesktopNodes);
  }

  figma.root.setRelaunchData({ open: 'Regerar ou atualizar telas do iPretty' });
  figma.ui.postMessage({
    type: 'done',
    title: 'Telas geradas diretamente no Figma!',
    detail: `${totalFrames} frames criados com ${totalLinks} ligações de protótipo conectadas.`,
  });
}

figma.ui.onmessage = async (msg) => {
  if (!msg || msg.type !== 'generate') return;
  try {
    await runGeneration(msg.scope || 'all', msg.wireFlows !== false);
  } catch (err) {
    figma.ui.postMessage({
      type: 'error',
      detail: err && err.message ? err.message : String(err),
    });
  }
};
