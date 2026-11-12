import React, { useState } from 'react';
import { Check, Copy, Download, ArrowLeft, Layers, Sparkles } from 'lucide-react';
import {
  IPrettyMonogram,
  IPrettyWordmark,
  ProductEditorialArt,
  ServiceEditorialArt,
} from '../components/brand/BrandAssets';
import {
  AppointmentStatusBadge,
  Badge,
  Button,
  OrderStatusBadge,
  SectionCard,
} from '../components/ui/Primitives';
import { useSalon } from '../context/SalonContext';
import { BRAND_COLOR_SWATCHES, IPRETTY_FIGMA_TOKENS } from '../design-system/figmaTokens';

function downloadTextFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SVG_LOGO_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#1F1815"/>
  <path d="M22 24C22 20.6863 24.6863 18 28 18H36C39.3137 18 42 20.6863 42 24V27C42 28.6569 40.6569 30 39 30H25C23.3431 30 22 28.6569 22 27V24Z" fill="#B85D43"/>
  <circle cx="22" cy="18" r="3.5" fill="#F7F3EE"/>
  <path d="M22 33V45C22 46.1046 22.8954 47 24 47H25.5C26.6046 47 27.5 46.1046 27.5 45V33H22Z" fill="#F7F3EE"/>
  <path d="M31 33H38C41.866 33 45 36.134 45 40C45 43.866 41.866 47 38 47H34.5V41.5H38C38.8284 41.5 39.5 40.8284 39.5 40C39.5 39.1716 38.8284 38.5 38 38.5H31V33Z" fill="#F7F3EE"/>
  <text x="80" y="36" fill="#1F1815" font-family="Fraunces, Georgia, serif" font-size="28" font-weight="600">iPretty</text>
  <text x="81" y="51" fill="#7D7068" font-family="Plus Jakarta Sans, sans-serif" font-size="10" letter-spacing="2.2" font-weight="600">SALÃO &amp; GESTÃO</text>
</svg>`;

export interface DesignSystemViewProps {
  embedded?: boolean;
}

export const DesignSystemView: React.FC<DesignSystemViewProps> = ({ embedded = false }) => {
  const { setActiveSection, pushToast } = useSalon();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [sampleInput, setSampleInput] = useState('Escova Modelada + Finalização');

  const copyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    pushToast({ type: 'info', title: `Cor ${hex} copiada` });
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div
      className={`${
        embedded ? 'h-full overflow-y-auto pb-8' : 'min-h-screen pb-16'
      } bg-[#F7F3EE] text-[#1F1815]`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E3DBD0]">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={() => setActiveSection('splash')}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Início
            </Button>
            <div>
              <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                Tela S-02 · Brand Book & UI Kit
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold">
                Identidade Visual & Exportação Figma
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                downloadTextFile('ipretty-logo.svg', SVG_LOGO_CONTENT, 'image/svg+xml');
                pushToast({ type: 'success', title: 'Logo .svg baixado!' });
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Logo (.svg)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                downloadTextFile(
                  'ipretty-figma-tokens.json',
                  JSON.stringify(IPRETTY_FIGMA_TOKENS, null, 2),
                );
                pushToast({
                  type: 'success',
                  title: 'Tokens Figma baixados!',
                  description: 'Importe no Figma via plugin Tokens Studio ou Variables.',
                });
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Tokens Figma (.json)
            </Button>
            <Button variant="dark" size="sm" onClick={() => setActiveSection('canvas')}>
              <Layers className="w-3.5 h-3.5" />
              Abrir Mapa de Artboards
            </Button>
          </div>
        </header>

        {/* Conceito da Marca */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard className="lg:col-span-5 p-6 space-y-4">
            <div className="text-xs font-mono-num uppercase tracking-wider text-[#8B7F77]">
              01 · Direção Criativa
            </div>
            <h2 className="font-display text-2xl font-semibold">
              Editorial de Bairro, Caloroso e Tátil
            </h2>
            <p className="text-sm text-[#5A4F48] leading-relaxed">
              A estética da <strong>iPretty</strong> foge de gradientes neon e interfaces
              genéricas. Trabalhamos sobre fundo <strong>Linho Claro (#F7F3EE)</strong> com
              bordas arquitetônicas de 1px, tipografia editorial <strong>Fraunces</strong> e
              destaques em <strong>Terracota Argila (#B85D43)</strong>,{' '}
              <strong>Espresso (#1F1815)</strong> e <strong>Verde Sálvia (#38664E)</strong> —
              transmitindo acolhimento de salão boutique e precisão financeira.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                <div className="font-semibold text-[#1F1815]">Mobile & PWA</div>
                <div className="text-[#5A4F48] mt-0.5">360px – 390px · Sem scroll horizontal</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                <div className="font-semibold text-[#1F1815]">Balcão & Gestão</div>
                <div className="text-[#5A4F48] mt-0.5">1280px+ · Alta densidade legível</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="lg:col-span-7 p-6 space-y-5">
            <div className="text-xs font-mono-num uppercase tracking-wider text-[#8B7F77]">
              02 · Sistema de Marca & Aplicações
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E3DBD0] flex flex-col justify-between gap-4">
                <IPrettyWordmark />
                <div className="text-[11px] text-[#8B7F77] font-mono-num">
                  Versão Principal · Fundo Claro
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#1F1815] border border-[#1F1815] flex flex-col justify-between gap-4">
                <IPrettyWordmark dark />
                <div className="text-[11px] text-[#B5AAA1] font-mono-num">
                  Versão Negativa · Fundo Espresso
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex flex-col items-center gap-2">
                <IPrettyMonogram size={42} dark />
                <span className="text-[10px] font-mono-num text-[#5A4F48]">Ícone PWA</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1F1815] flex flex-col items-center gap-2">
                <IPrettyMonogram size={42} dark={false} />
                <span className="text-[10px] font-mono-num text-[#D3C8BF]">App Claro</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex flex-col items-center gap-2">
                <ServiceEditorialArt category="cabelo" className="w-10 h-10" />
                <span className="text-[10px] font-mono-num text-[#5A4F48]">Cabelo</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex flex-col items-center gap-2">
                <ServiceEditorialArt category="unhas" className="w-10 h-10" />
                <span className="text-[10px] font-mono-num text-[#5A4F48]">Unhas</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex flex-col items-center gap-2">
                <ServiceEditorialArt category="sobrancelha" className="w-10 h-10" />
                <span className="text-[10px] font-mono-num text-[#5A4F48]">Sobrancelha</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex flex-col items-center gap-2">
                <ProductEditorialArt type="serum" className="w-12 h-10" />
                <span className="text-[10px] font-mono-num text-[#5A4F48]">Vitrine</span>
              </div>
            </div>
          </SectionCard>
        </section>

        {/* Paleta de Cores */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono-num uppercase tracking-wider text-[#8B7F77]">
                03 · Paleta de Cores & Tokens Semânticos
              </div>
              <h2 className="font-display text-2xl font-semibold">
                Clique em qualquer cor para copiar o Hex
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BRAND_COLOR_SWATCHES.map((sw) => (
              <button
                key={sw.hex}
                onClick={() => copyColor(sw.hex)}
                className="text-left bg-white rounded-2xl border border-[#E3DBD0] overflow-hidden hover:border-[#B85D43] transition-colors cursor-pointer group"
              >
                <div
                  className="h-24 w-full border-b border-[#E3DBD0] flex items-end justify-end p-2.5"
                  style={{ backgroundColor: sw.hex }}
                >
                  <span className="px-2 py-0.5 rounded-md bg-white/90 text-[#1F1815] text-[10px] font-mono-num flex items-center gap-1">
                    {copiedHex === sw.hex ? (
                      <>
                        <Check className="w-3 h-3 text-[#38664E]" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" /> {sw.hex}
                      </>
                    )}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-sm">{sw.name}</div>
                  <div className="text-[11px] font-mono-num text-[#8B7F77] mt-0.5">
                    {sw.token}
                  </div>
                  <div className="text-xs text-[#5A4F48] mt-1.5 leading-snug">{sw.usage}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Tipografia & Componentes */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard className="lg:col-span-5 p-6 space-y-5">
            <div className="text-xs font-mono-num uppercase tracking-wider text-[#8B7F77]">
              04 · Escala Tipográfica
            </div>
            <div className="space-y-4 divide-y divide-[#EFE9E1]">
              <div className="pt-1">
                <span className="text-[11px] font-mono-num text-[#8B7F77]">
                  Display · Fraunces Semibold · 32px
                </span>
                <div className="font-display text-3xl font-semibold mt-1">
                  Beleza com horário.
                </div>
              </div>
              <div className="pt-3">
                <span className="text-[11px] font-mono-num text-[#8B7F77]">
                  Subtítulo · Fraunces Medium · 20px
                </span>
                <div className="font-display text-xl font-medium mt-1">
                  Painel do dia · Terça a Sábado
                </div>
              </div>
              <div className="pt-3">
                <span className="text-[11px] font-mono-num text-[#8B7F77]">
                  UI & Corpo · Plus Jakarta Sans · 14px / 15px
                </span>
                <p className="text-sm text-[#5A4F48] mt-1 leading-relaxed">
                  Escolha o serviço, a profissional e veja somente os horários livres em que a
                  duração completa cabe sem sobreposição.
                </p>
              </div>
              <div className="pt-3">
                <span className="text-[11px] font-mono-num text-[#8B7F77]">
                  Valores & Horários · JetBrains Mono (Tabular)
                </span>
                <div className="font-mono-num text-base font-medium mt-1 text-[#1F1815]">
                  R$ 140,00 · +100,0% · 14:30–15:15 · #PED-041
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="lg:col-span-7 p-6 space-y-5">
            <div className="text-xs font-mono-num uppercase tracking-wider text-[#8B7F77]">
              05 · Biblioteca de Componentes (UI Kit)
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#5A4F48]">Botões</div>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary">Confirmar horário</Button>
                <Button variant="dark">Registrar pagamento</Button>
                <Button variant="sage">Confirmado</Button>
                <Button variant="secondary">Remarcar</Button>
                <Button variant="danger">Cancelar</Button>
                <Button variant="ghost">Ver histórico</Button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-[#5A4F48]">
                Badges de Agendamento & Pedidos (US-03 / US-04 / US-09)
              </div>
              <div className="flex flex-wrap gap-2">
                <AppointmentStatusBadge status="aguardando_confirmacao" />
                <AppointmentStatusBadge status="confirmado" />
                <AppointmentStatusBadge status="compareceu" />
                <AppointmentStatusBadge status="nao_compareceu" />
                <AppointmentStatusBadge status="pago" />
                <OrderStatusBadge status="solicitado" />
                <OrderStatusBadge status="separado" />
                <OrderStatusBadge status="retirado" />
                <OrderStatusBadge status="brinde" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Campo de formulário padrão
                </label>
                <input
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC3] bg-white text-sm focus:outline-none focus:border-[#B85D43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Exemplo de alerta de regra (US-06)
                </label>
                <div className="px-3.5 py-2.5 rounded-xl border border-[#ECC4C4] bg-[#FAE6E6] text-xs text-[#922B2B] font-medium">
                  Venda abaixo do custo: lucro -R$ 10,00 (-20,0%)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-[#5A4F48]">
                <Sparkles className="w-4 h-4 text-[#B85D43] shrink-0" />
                <span>
                  Dica para levar ao Figma: abra a aba <strong>Frames (Figma)</strong> e ative o{' '}
                  <strong>Modo Captura Limpa</strong> para importar todos os frames Mobile e Desktop
                  via plugin <code className="font-mono-num">html.to.design</code>.
                </span>
              </div>
              <Badge tone="terracotta">Auto-Layout Ready</Badge>
            </div>
          </SectionCard>
        </section>
      </div>
    </div>
  );
};
