/**
 * W3C / Figma Tokens Studio compatible Design Tokens JSON for iPretty
 */
export const IPRETTY_FIGMA_TOKENS = {
  $metadata: {
    brand: 'iPretty · Salão & Gestão',
    version: '1.0.0',
    description: 'Identidade visual editorial calorosa — pronta para importação no Figma (Tokens Studio).',
  },
  color: {
    bg: {
      canvas: { $value: '#F7F3EE', $type: 'color', $description: 'Fundo principal linho claro' },
      surface: { $value: '#FFFFFF', $type: 'color', $description: 'Cartões, modais e sheets' },
      subtle: { $value: '#EFE9E1', $type: 'color', $description: 'Áreas secundárias e cabeçalhos de tabela' },
      muted: { $value: '#E6DFD6', $type: 'color', $description: 'Chips inativos e divisores suaves' },
      espresso: { $value: '#1F1815', $type: 'color', $description: 'Superfície escura primária e botões secundários' },
    },
    text: {
      primary: { $value: '#1F1815', $type: 'color' },
      secondary: { $value: '#5A4F48', $type: 'color' },
      muted: { $value: '#8B7F77', $type: 'color' },
      inverse: { $value: '#FAF7F2', $type: 'color' },
    },
    accent: {
      terracotta: { $value: '#B85D43', $type: 'color', $description: 'Cor primária da marca (CTAs e destaques)' },
      terracottaHover: { $value: '#9F4D35', $type: 'color' },
      terracottaSoft: { $value: '#F6E6E0', $type: 'color' },
      sage: { $value: '#38664E', $type: 'color', $description: 'Confirmado, pago e margem positiva' },
      sageSoft: { $value: '#E3EFE8', $type: 'color' },
      ochre: { $value: '#B2761E', $type: 'color', $description: 'Aguardando confirmação, separado, aviso' },
      ochreSoft: { $value: '#FBF0DC', $type: 'color' },
      crimson: { $value: '#B43B3B', $type: 'color', $description: 'Falta, cancelamento, lucro negativo' },
      crimsonSoft: { $value: '#FAE6E6', $type: 'color' },
      slate: { $value: '#4B5B6B', $type: 'color', $description: 'Recepção / encaixe / neutro institucional' },
      slateSoft: { $value: '#E9EEF2', $type: 'color' },
    },
    border: {
      hairline: { $value: '#E3DBD0', $type: 'color' },
      strong: { $value: '#C9BEB0', $type: 'color' },
    },
  },
  typography: {
    fontFamilies: {
      display: { $value: 'Fraunces', $type: 'fontFamilies' },
      body: { $value: 'Plus Jakarta Sans', $type: 'fontFamilies' },
      mono: { $value: 'JetBrains Mono', $type: 'fontFamilies' },
    },
    fontSizes: {
      xs: { $value: '11px', $type: 'dimension' },
      sm: { $value: '13px', $type: 'dimension' },
      base: { $value: '15px', $type: 'dimension' },
      lg: { $value: '18px', $type: 'dimension' },
      xl: { $value: '22px', $type: 'dimension' },
      '2xl': { $value: '28px', $type: 'dimension' },
      '3xl': { $value: '36px', $type: 'dimension' },
    },
  },
  borderRadius: {
    xs: { $value: '6px', $type: 'dimension' },
    sm: { $value: '10px', $type: 'dimension' },
    md: { $value: '14px', $type: 'dimension' },
    lg: { $value: '20px', $type: 'dimension' },
    xl: { $value: '28px', $type: 'dimension' },
    full: { $value: '9999px', $type: 'dimension' },
  },
  spacing: {
    gridUnit: { $value: '4px', $type: 'dimension' },
    cardPadding: { $value: '20px', $type: 'dimension' },
    mobileFrameWidth: { $value: '390px', $type: 'dimension' },
    pwaMinWidth: { $value: '360px', $type: 'dimension' },
    desktopFrameWidth: { $value: '1280px', $type: 'dimension' },
  },
};

export const BRAND_COLOR_SWATCHES = [
  { token: '--bg-canvas', name: 'Linho Claro', hex: '#F7F3EE', usage: 'Fundo geral do sistema e vitrine' },
  { token: '--bg-surface', name: 'Porcelana', hex: '#FFFFFF', usage: 'Cards, modais, planilhas e barras' },
  { token: '--bg-subtle', name: 'Areia Morna', hex: '#EFE9E1', usage: 'Áreas secundárias e inputs suaves' },
  { token: '--bg-espresso', name: 'Espresso', hex: '#1F1815', usage: 'Textos principais e menus de navegação' },
  { token: '--accent-terracotta', name: 'Terracota Argila', hex: '#B85D43', usage: 'Marca iPretty, ações primárias e destaques' },
  { token: '--accent-sage', name: 'Verde Sálvia', hex: '#38664E', usage: 'Pago, confirmado e lucro positivo' },
  { token: '--accent-ochre', name: 'Âmbar Mel', hex: '#B2761E', usage: 'Aguardando confirmação, separado e lembretes' },
  { token: '--accent-crimson', name: 'Carmim Vinho', hex: '#B43B3B', usage: 'Falta, erro de escala e margem negativa' },
];
