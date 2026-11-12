import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Download,
  KeyRound,
  LayoutGrid,
  Palette,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { IPrettyMonogram, IPrettyWordmark } from '../components/brand/BrandAssets';
import { Badge, Button, Modal, SectionCard } from '../components/ui/Primitives';
import { useSalon } from '../context/SalonContext';
import { WorkspaceSection } from '../types/salon';

export interface SplashLoginViewProps {
  embedded?: boolean;
  initialModal?: 'login' | 'recuperar' | 'pwa';
}

export const SplashLoginView: React.FC<SplashLoginViewProps> = ({
  embedded = false,
  initialModal,
}) => {
  const { navigateTo, setActiveSection, pushToast, resetDemoData, appointments, orders } =
    useSalon();

  const [showAuthModal, setShowAuthModal] = useState(initialModal === 'login');
  const [selectedAccessTarget, setSelectedAccessTarget] =
    useState<WorkspaceSection>('cliente');
  const [authPhoneOrEmail, setAuthPhoneOrEmail] = useState('(11) 98534-2190');
  const [authCode, setAuthCode] = useState('4821');

  const [showRecoveryModal, setShowRecoveryModal] = useState(initialModal === 'recuperar');
  const [recoveryInput, setRecoveryInput] = useState('(11) 98534-2190');

  const [showPwaInstallModal, setShowPwaInstallModal] = useState(initialModal === 'pwa');

  const personas = [
    {
      id: 'cliente' as WorkspaceSection,
      code: 'C-01 · C-07',
      name: 'Juliana · Cliente',
      role: 'Vitrine, Agendamento & Pedidos',
      routine: 'Marca escova e unha às 21h sem esperar WhatsApp e retira produtos no salão.',
      stories: ['US-01', 'US-02', 'US-09', 'US-10'],
      accent: 'bg-[#F6E6E0] text-[#8F3F29] border-[#E8C8BD]',
      icon: <Calendar className="w-5 h-5 text-[#B85D43]" />,
      cta: 'Abrir app da Cliente',
    },
    {
      id: 'recepcao' as WorkspaceSection,
      code: 'R-01 · R-04',
      name: 'Carla · Recepção & Caixa',
      role: 'Painel do Dia, Encaixe & Pagamentos',
      routine: 'Agenda por profissional sem conflito, movimenta pedidos e fecha o caixa.',
      stories: ['US-03', 'US-04'],
      accent: 'bg-[#E9EEF2] text-[#3B4B59] border-[#CED8E0]',
      icon: <UserCheck className="w-5 h-5 text-[#4B5B6B]" />,
      cta: 'Abrir painel da Recepção',
    },
    {
      id: 'profissional' as WorkspaceSection,
      code: 'P-01 · P-03',
      name: 'Patrícia · Profissional (PWA)',
      role: 'Agenda Mobile & Meu Financeiro',
      routine: 'Abre no celular (360px+) sua própria agenda, bloqueia folgas e confere repasses.',
      stories: ['US-08', 'US-11'],
      accent: 'bg-[#E3EFE8] text-[#28503B] border-[#C3DEC9]',
      icon: <Smartphone className="w-5 h-5 text-[#38664E]" />,
      cta: 'Abrir PWA da Profissional',
    },
    {
      id: 'admin' as WorkspaceSection,
      code: 'A-01 · A-06',
      name: 'Dona Marta · Administradora',
      role: 'Equipe, Produtos, Repasses & Banners',
      routine: 'Cadastra vínculos (Lei Salão-Parceiro / CLT), fornecedores, lucros e fechamento.',
      stories: ['US-05', 'US-06', 'US-07', 'US-12', 'US-13', 'US-14'],
      accent: 'bg-[#EFE9E1] text-[#1F1815] border-[#D9CFC3]',
      icon: <ShieldCheck className="w-5 h-5 text-[#1F1815]" />,
      cta: 'Abrir gestão da Admin',
    },
  ];

  const pendingOrders = orders.filter((o) =>
    ['solicitado', 'separado', 'retirado'].includes(o.status),
  ).length;
  const activeTodayCount = appointments.filter((a) => a.status !== 'cancelado').length;

  return (
    <div
      className={
        embedded
          ? 'relative h-full overflow-hidden bg-[#F7F3EE] text-[#1F1815]'
          : 'min-h-screen bg-[#F7F3EE] text-[#1F1815]'
      }
    >
      <div className={embedded ? 'h-full overflow-y-auto' : ''}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#E3DBD0]">
          <IPrettyWordmark />
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPwaInstallModal(true)}
            >
              <Download className="w-3.5 h-3.5" />
              Instalar PWA
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAuthModal(true)}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Tela de Login / Acesso
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveSection('identidade')}
            >
              <Palette className="w-3.5 h-3.5" />
              Identidade Visual & Tokens
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={() => setActiveSection('canvas')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Frames Mobile & Desktop
            </Button>
          </div>
        </header>

        {/* Hero Editorial */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9E1] border border-[#E3DBD0] text-xs font-medium text-[#5A4F48]">
              <span>Protótipo funcional integrado</span>
              <span className="text-[#B85D43]">•</span>
              <span className="font-mono-num">US-01 a US-14</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#1F1815] leading-[1.08]">
              O salão inteiro em um único sistema, do horário à comissão.
            </h1>

            <p className="text-base sm:text-lg text-[#5A4F48] max-w-2xl leading-relaxed">
              Navegue entre as quatro visões conectadas em tempo real: o que a{' '}
              <strong className="text-[#1F1815]">Juliana</strong> agenda na vitrine já cai no
              painel da <strong className="text-[#1F1815]">Carla</strong> e na agenda móvel da{' '}
              <strong className="text-[#1F1815]">Patrícia</strong>, e o que é finalizado no caixa
              atualiza o fechamento da <strong className="text-[#1F1815]">Dona Marta</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setActiveSection('cliente')}
              >
                Começar pela Vitrine (Cliente)
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setActiveSection('canvas')}
              >
                <LayoutGrid className="w-4 h-4" />
                Ver Todas as Telas & Popups
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={resetDemoData}
                title="Restaurar dados de demonstração"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar dados iniciais
              </Button>
            </div>
          </div>

          {/* Right Live Pulse Card */}
          <div className="lg:col-span-5">
            <SectionCard className="p-6 bg-white space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#8B7F77]">
                    Estado ao vivo da base compartilhada
                  </span>
                  <h2 className="font-display text-xl font-semibold mt-0.5">
                    Salão iPretty · Hoje
                  </h2>
                </div>
                <IPrettyMonogram size={40} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                  <div className="text-xs text-[#5A4F48]">Atendimentos na base</div>
                  <div className="font-display text-2xl font-semibold mt-1 tabular-nums">
                    {activeTodayCount}
                  </div>
                  <div className="text-[11px] text-[#8B7F77] mt-0.5">
                    3 profissionais ativas
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                  <div className="text-xs text-[#5A4F48]">Pedidos em balcão</div>
                  <div className="font-display text-2xl font-semibold mt-1 tabular-nums">
                    {pendingOrders}
                  </div>
                  <div className="text-[11px] text-[#8B7F77] mt-0.5">
                    Solicitado → Pago / Brinde
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] p-4 space-y-2">
                <div className="text-xs font-semibold text-[#1F1815] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#B85D43]" />
                  Exportação para Figma preparada
                </div>
                <p className="text-xs text-[#5A4F48] leading-relaxed">
                  Abra <strong>Frames Mobile &amp; Desktop</strong> para visualizar todos os frames
                  organizados (<code className="font-mono-num">390px</code> mobile e{' '}
                  <code className="font-mono-num">1280px</code> desktop), ativar o modo limpo de
                  captura (<code className="font-mono-num">html.to.design</code>) e baixar os
                  tokens <code className="font-mono-num">.json</code> e logos{' '}
                  <code className="font-mono-num">.svg</code>.
                </p>
              </div>
            </SectionCard>
          </div>
        </section>

        {/* 4 Persona Cards */}
        <section className="pt-2 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold">
              Escolha uma persona para testar o fluxo
            </h2>
            <span className="text-xs text-[#5A4F48] hidden sm:inline">
              Todas as telas permanecem sincronizadas via localStorage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personas.map((p) => (
              <SectionCard
                key={p.id}
                className="p-6 flex flex-col justify-between hover:border-[#B85D43] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0] flex items-center justify-center shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono-num text-[#8B7F77]">
                          {p.code}
                        </span>
                        <h3 className="font-display text-xl font-semibold text-[#1F1815]">
                          {p.name}
                        </h3>
                      </div>
                    </div>
                    <Badge tone="neutral">{p.role.split(',')[0]}</Badge>
                  </div>

                  <p className="text-sm text-[#5A4F48] mt-3.5 leading-relaxed">
                    {p.routine}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {p.stories.map((st) => (
                      <span
                        key={st}
                        className={`text-[11px] font-mono-num px-2 py-0.5 rounded-md border ${p.accent}`}
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#EFE9E1] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setSelectedAccessTarget(p.id);
                      setShowAuthModal(true);
                    }}
                    className="text-xs font-medium text-[#5A4F48] hover:text-[#1F1815] underline underline-offset-2 cursor-pointer"
                  >
                    Simular login dessa conta
                  </button>
                  <Button
                    variant={p.id === 'cliente' ? 'primary' : 'dark'}
                    size="sm"
                    onClick={() => setActiveSection(p.id)}
                  >
                    {p.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
        </section>

        {/* Quick Story Shortcut Bar */}
        <section className="pt-2">
          <SectionCard className="p-5 bg-[#FAF7F2]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#B85D43]" />
                <span className="text-sm font-semibold">
                  Atalhos diretos para telas específicas e popups:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    navigateTo({ section: 'cliente', subTab: 'lembrete' })
                  }
                >
                  Link Lembrete 24h (US-09)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    navigateTo({ section: 'recepcao', subTab: 'agenda', openModal: 'encaixe' })
                  }
                >
                  Popup Novo Encaixe (US-03)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    navigateTo({ section: 'recepcao', subTab: 'pedidos' })
                  }
                >
                  Fila de Pedidos & Caixa (US-04)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    navigateTo({ section: 'admin', subTab: 'relatorios' })
                  }
                >
                  Repasses & Lucro Real (US-07)
                </Button>
              </div>
            </div>
          </SectionCard>
        </section>
        </div>
      </div>

      {/* POPUP S-01A · Login Unificado / Verificação */}
      <Modal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        badge="Tela S-01A · Autenticação PWA"
        title="Entrar no iPretty"
        subtitle="Acesso rápido por celular ou credencial da equipe"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1.5">
              Perfil de acesso
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'cliente', label: 'Juliana (Cliente)' },
                  { id: 'recepcao', label: 'Carla (Recepção)' },
                  { id: 'profissional', label: 'Patrícia (Profissional)' },
                  { id: 'admin', label: 'Dona Marta (Admin)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedAccessTarget(item.id);
                    setAuthPhoneOrEmail(
                      item.id === 'cliente'
                        ? '(11) 98534-2190'
                        : item.id === 'recepcao'
                          ? 'carla@ipretty.com.br'
                          : item.id === 'profissional'
                            ? 'patricia@ipretty.com.br'
                            : 'marta@ipretty.com.br',
                    );
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left cursor-pointer transition-colors ${
                    selectedAccessTarget === item.id
                      ? 'bg-[#1F1815] text-[#FAF7F2] border-[#1F1815]'
                      : 'bg-[#F7F3EE] text-[#1F1815] border-[#E3DBD0]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
              Celular (WhatsApp) ou E-mail cadastrado
            </label>
            <input
              type="text"
              value={authPhoneOrEmail}
              onChange={(e) => setAuthPhoneOrEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC3] bg-white text-sm focus:outline-none focus:border-[#B85D43]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#5A4F48]">
                Código de acesso / PIN
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setShowRecoveryModal(true);
                }}
                className="text-xs font-semibold text-[#B85D43] hover:underline cursor-pointer"
              >
                Primeiro acesso ou esqueci o PIN
              </button>
            </div>
            <input
              type="password"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC3] bg-white text-sm font-mono-num tracking-widest focus:outline-none focus:border-[#B85D43]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAuthModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowAuthModal(false);
                setActiveSection(selectedAccessTarget);
                pushToast({
                  type: 'success',
                  title: 'Sessão iniciada',
                  description: `Bem-vinda ao ambiente ${selectedAccessTarget}.`,
                });
              }}
            >
              Entrar agora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Modal>

      {/* POPUP S-01B · Recuperar Acesso */}
      <Modal
        open={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        badge="Popup S-01B · Recuperação"
        title="Receber novo código de acesso"
        subtitle="Enviamos um código de 4 dígitos para confirmar seu cadastro no salão."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
              Seu WhatsApp ou e-mail
            </label>
            <input
              type="text"
              value={recoveryInput}
              onChange={(e) => setRecoveryInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC3] text-sm"
            />
          </div>
          <div className="p-3 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0] text-xs text-[#5A4F48]">
            Se for sua primeira vez agendando na vitrine, seu cadastro é criado na hora ao
            confirmar o primeiro horário.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRecoveryModal(false)}>
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowRecoveryModal(false);
                setShowAuthModal(true);
                pushToast({
                  type: 'info',
                  title: 'Código enviado',
                  description: `Código de demonstração 4821 enviado para ${recoveryInput}.`,
                });
              }}
            >
              Enviar código
            </Button>
          </div>
        </div>
      </Modal>

      {/* POPUP S-01C · Instalar PWA (US-08) */}
      <Modal
        open={showPwaInstallModal}
        onClose={() => setShowPwaInstallModal(false)}
        badge="Popup US-08 · App Web Progressivo (PWA)"
        title="Adicionar iPretty à tela inicial"
        subtitle="Experiência em tela cheia no celular para Clientes e Profissionais sem baixar na loja."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F3EE] border border-[#E3DBD0]">
            <IPrettyMonogram size={52} />
            <div>
              <div className="font-display text-lg font-semibold">iPretty · Salão</div>
              <div className="text-xs text-[#5A4F48]">app.ipretty.salao · Instalável (PWA)</div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#5A4F48]">
            <div className="p-3 rounded-xl border border-[#E3DBD0] bg-white">
              <strong className="text-[#1F1815]">Android (Chrome):</strong> Toque no menu{' '}
              <code className="font-mono-num">⋮</code> e escolha{' '}
              <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong> ou{' '}
              <strong>&ldquo;Instalar aplicativo&rdquo;</strong>.
            </div>
            <div className="p-3 rounded-xl border border-[#E3DBD0] bg-white">
              <strong className="text-[#1F1815]">iPhone (Safari):</strong> Toque em{' '}
              <strong>Compartilhar</strong> e depois em{' '}
              <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>. Abre já na agenda da
              profissional.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setShowPwaInstallModal(false)}>
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowPwaInstallModal(false);
                setActiveSection('profissional');
                pushToast({
                  type: 'success',
                  title: 'Abrindo visão PWA da Patrícia',
                  description: 'Simulando abertura em tela cheia no celular (360px+).',
                });
              }}
            >
              Simular abertura instalada (Patrícia)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
