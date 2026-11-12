import React, { useState } from 'react';
import {
  ArrowRight,
  Expand,
  Eye,
  EyeOff,
  Layers,
  Monitor,
  Smartphone,
} from 'lucide-react';
import {
  ContainedModalProvider,
  DesktopFrame,
  PhoneFrame,
} from '../components/ui/Primitives';
import { NavigationIntent, useSalon } from '../context/SalonContext';
import { AdminView } from './AdminView';
import { ClientView } from './ClientView';
import { DesignSystemView } from './DesignSystemView';
import { ProfessionalView } from './ProfessionalView';
import { ReceptionView } from './ReceptionView';
import { SplashLoginView } from './SplashLoginView';

type CanvasFilter =
  | 'todas'
  | 'mobile'
  | 'desktop'
  | 'sistema'
  | 'cliente'
  | 'recepcao'
  | 'profissional'
  | 'admin'
  | 'popups';

interface ArtboardSpec {
  id: string;
  code: string;
  title: string;
  device: 'mobile' | 'desktop';
  category: 'sistema' | 'cliente' | 'recepcao' | 'profissional' | 'admin';
  isPopup?: boolean;
  darkStatusBar?: boolean;
  frameSize: string;
  urlLabel: string;
  linksTo: string[];
  storyRef: string;
  intent: Omit<NavigationIntent, 'timestamp'>;
  render: () => React.ReactNode;
}

export const FigmaCanvasView: React.FC = () => {
  const { navigateTo, setActiveSection } = useSalon();
  const [filter, setFilter] = useState<CanvasFilter>('todas');
  const [cleanCaptureMode, setCleanCaptureMode] = useState(false);
  const [figmaExactMode, setFigmaExactMode] = useState(false);

  const artboards: ArtboardSpec[] = [
    // ================= SISTEMA & ENTRADA (DESKTOP + MOBILE PWA) =================
    {
      id: 'S-01',
      code: 'S-01',
      title: 'Boas-vindas & Escolha de Perfil',
      device: 'desktop',
      category: 'sistema',
      frameSize: '1280×800',
      urlLabel: 'app.ipretty.salao/entrada',
      storyRef: 'Entrada Unificada',
      linksTo: ['POP-S01A', 'C-01', 'R-01', 'P-01', 'A-01'],
      intent: { section: 'splash' },
      render: () => <SplashLoginView embedded />,
    },
    {
      id: 'S-01A',
      code: 'POP-S01A',
      title: 'Popup Autenticação / PIN Unificado',
      device: 'desktop',
      category: 'sistema',
      isPopup: true,
      frameSize: '1280×800 · Modal 440px',
      urlLabel: 'app.ipretty.salao/login',
      storyRef: 'Acesso',
      linksTo: ['POP-S01B', 'C-01 / R-01 / P-01 / A-01'],
      intent: { section: 'splash' },
      render: () => <SplashLoginView embedded initialModal="login" />,
    },
    {
      id: 'S-01B',
      code: 'POP-S01B',
      title: 'Popup Recuperar Acesso / PIN',
      device: 'desktop',
      category: 'sistema',
      isPopup: true,
      frameSize: '1280×800 · Modal 440px',
      urlLabel: 'app.ipretty.salao/recuperar-acesso',
      storyRef: 'Acesso',
      linksTo: ['POP-S01A'],
      intent: { section: 'splash' },
      render: () => <SplashLoginView embedded initialModal="recuperar" />,
    },
    {
      id: 'S-01C',
      code: 'POP-S01C',
      title: 'Popup Instalar PWA na Tela Inicial',
      device: 'mobile',
      category: 'sistema',
      isPopup: true,
      frameSize: '390×844 · Modal PWA',
      urlLabel: 'app.ipretty.salao/pwa',
      storyRef: 'US-08',
      linksTo: ['P-01 Minha Agenda'],
      intent: { section: 'profissional', openModal: 'pwa' },
      render: () => <SplashLoginView embedded initialModal="pwa" />,
    },
    {
      id: 'S-02',
      code: 'S-02',
      title: 'Identidade Visual & Brand Book (Tokens)',
      device: 'desktop',
      category: 'sistema',
      frameSize: '1280×800',
      urlLabel: 'app.ipretty.salao/identidade-visual',
      storyRef: 'Design System',
      linksTo: ['tokens.json', 'logo.svg'],
      intent: { section: 'identidade' },
      render: () => <DesignSystemView embedded />,
    },

    // ================= CLIENTE · JULIANA (MOBILE 390×844) =================
    {
      id: 'C-01',
      code: 'C-01',
      title: 'Vitrine Inicial (Home Marketplace)',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao',
      storyRef: 'US-01 · US-02 · US-14',
      linksTo: ['C-02', 'C-04', 'POP-C01', 'POP-C05'],
      intent: { section: 'cliente', subTab: 'inicio' },
      render: () => <ClientView embedded initialTab="inicio" />,
    },
    {
      id: 'C-02',
      code: 'C-02',
      title: 'Catálogo de Serviços da Vitrine',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao/servicos',
      storyRef: 'US-01',
      linksTo: ['POP-C01', 'C-03'],
      intent: { section: 'cliente', subTab: 'agendar' },
      render: () => <ClientView embedded initialTab="agendar" />,
    },
    {
      id: 'C-03',
      code: 'C-03',
      title: 'Escolha Profissional, Data & Slots Livres',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao/agendar',
      storyRef: 'US-01',
      linksTo: ['POP-C03', 'POP-C02'],
      intent: { section: 'cliente', subTab: 'agendar' },
      render: () => (
        <ClientView embedded initialTab="agendar" initialAgendarStep="horarios" />
      ),
    },
    {
      id: 'C-04',
      code: 'C-04',
      title: 'Vitrine de Produtos (Sem Preço de Custo)',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao/produtos',
      storyRef: 'US-02',
      linksTo: ['POP-C04', 'POP-C05'],
      intent: { section: 'cliente', subTab: 'produtos' },
      render: () => <ClientView embedded initialTab="produtos" />,
    },
    {
      id: 'C-05',
      code: 'C-05',
      title: 'Meus Agendamentos & Pedidos',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao/meus-horarios',
      storyRef: 'US-01 · US-02 · US-10',
      linksTo: ['POP-C07', 'POP-C08', 'POP-C09'],
      intent: { section: 'cliente', subTab: 'meus' },
      render: () => <ClientView embedded initialTab="meus" />,
    },
    {
      id: 'C-06',
      code: 'C-06',
      title: 'Lembrete 24h & Confirmação por Link',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao/lembrete-24h',
      storyRef: 'US-09 · US-10',
      linksTo: ['R-01', 'POP-C07'],
      intent: { section: 'cliente', subTab: 'lembrete' },
      render: () => <ClientView embedded initialTab="lembrete" />,
    },
    {
      id: 'C-07',
      code: 'C-07',
      title: 'Perfil & Histórico da Cliente',
      device: 'mobile',
      category: 'cliente',
      frameSize: '390×844',
      urlLabel: 'vitrine.ipretty.salao/perfil',
      storyRef: 'Perfil',
      linksTo: ['POP-S01C'],
      intent: { section: 'cliente', subTab: 'perfil' },
      render: () => <ClientView embedded initialTab="perfil" />,
    },
    {
      id: 'POP-C01',
      code: 'POP-C01',
      title: 'Popup Detalhe do Serviço',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/servico',
      storyRef: 'US-01',
      linksTo: ['C-03 Agenda'],
      intent: { section: 'cliente', openModal: 'detalhe-servico' },
      render: () => <ClientView embedded initialTab="inicio" initialModal="detalhe-servico" />,
    },
    {
      id: 'POP-C02',
      code: 'POP-C02',
      title: 'Popup Conflito de Horário (US-01)',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/conflito',
      storyRef: 'US-01',
      linksTo: ['C-03 Slots'],
      intent: { section: 'cliente', openModal: 'conflito' },
      render: () => <ClientView embedded initialTab="agendar" initialModal="conflito" />,
    },
    {
      id: 'POP-C03',
      code: 'POP-C03',
      title: 'Popup Agendamento Confirmado',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/confirmado',
      storyRef: 'US-01 · US-09',
      linksTo: ['C-05 Meus Horários'],
      intent: { section: 'cliente', openModal: 'confirmacao-agendamento' },
      render: () => (
        <ClientView embedded initialTab="agendar" initialModal="confirmacao-agendamento" />
      ),
    },
    {
      id: 'POP-C04',
      code: 'POP-C04',
      title: 'Popup Detalhe do Produto',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/produto',
      storyRef: 'US-02',
      linksTo: ['POP-C05 Sacola'],
      intent: { section: 'cliente', openModal: 'detalhe-produto' },
      render: () => <ClientView embedded initialTab="produtos" initialModal="detalhe-produto" />,
    },
    {
      id: 'POP-C05',
      code: 'POP-C05',
      title: 'Popup Sacola de Retirada',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/sacola',
      storyRef: 'US-02',
      linksTo: ['POP-C06 Pedido'],
      intent: { section: 'cliente', openModal: 'sacola' },
      render: () => <ClientView embedded initialTab="produtos" initialModal="sacola" />,
    },
    {
      id: 'POP-C06',
      code: 'POP-C06',
      title: 'Popup Pedido Solicitado (#PED)',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/pedido-enviado',
      storyRef: 'US-02',
      linksTo: ['R-02 Fila Recepção'],
      intent: { section: 'cliente', openModal: 'confirmacao-pedido' },
      render: () => <ClientView embedded initialTab="produtos" initialModal="confirmacao-pedido" />,
    },
    {
      id: 'POP-C07',
      code: 'POP-C07',
      title: 'Popup Remarcar Horário (US-10)',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/remarcar',
      storyRef: 'US-10',
      linksTo: ['C-05', 'R-01'],
      intent: { section: 'cliente', openModal: 'remarcar' },
      render: () => <ClientView embedded initialTab="meus" initialModal="remarcar" />,
    },
    {
      id: 'POP-C08',
      code: 'POP-C08',
      title: 'Popup Cancelar Agendamento (US-10)',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/cancelar',
      storyRef: 'US-10',
      linksTo: ['C-05', 'R-01 Livre'],
      intent: { section: 'cliente', openModal: 'cancelar' },
      render: () => <ClientView embedded initialTab="meus" initialModal="cancelar" />,
    },
    {
      id: 'POP-C09',
      code: 'POP-C09',
      title: 'Popup Acompanhamento de Pedido',
      device: 'mobile',
      category: 'cliente',
      isPopup: true,
      frameSize: '390×844 · Modal',
      urlLabel: 'vitrine.ipretty.salao/pedido',
      storyRef: 'US-02 · US-04',
      linksTo: ['C-05 Pedidos'],
      intent: { section: 'cliente', subTab: 'meus', openModal: 'detalhe-pedido' },
      render: () => (
        <ClientView
          embedded
          initialTab="meus"
          initialMeusSubTab="pedidos"
          initialModal="detalhe-pedido"
        />
      ),
    },

    // ================= PROFISSIONAL · PATRÍCIA PWA (MOBILE 360×780) =================
    {
      id: 'P-01',
      code: 'P-01',
      title: 'Minha Agenda Mobile (360px PWA)',
      device: 'mobile',
      category: 'profissional',
      darkStatusBar: true,
      frameSize: '360×780',
      urlLabel: 'pro.ipretty.salao/agenda',
      storyRef: 'US-08',
      linksTo: ['POP-P02', 'P-02'],
      intent: { section: 'profissional', subTab: 'agenda' },
      render: () => <ProfessionalView embedded initialTab="agenda" />,
    },
    {
      id: 'P-02',
      code: 'P-02',
      title: 'Meu Financeiro (Exclusivo / Isolado)',
      device: 'mobile',
      category: 'profissional',
      darkStatusBar: true,
      frameSize: '360×780',
      urlLabel: 'pro.ipretty.salao/financeiro',
      storyRef: 'US-08',
      linksTo: ['P-01'],
      intent: { section: 'profissional', subTab: 'financeiro' },
      render: () => <ProfessionalView embedded initialTab="financeiro" />,
    },
    {
      id: 'P-03',
      code: 'P-03',
      title: 'Meus Bloqueios de Folgas (US-11)',
      device: 'mobile',
      category: 'profissional',
      darkStatusBar: true,
      frameSize: '360×780',
      urlLabel: 'pro.ipretty.salao/folgas',
      storyRef: 'US-11',
      linksTo: ['POP-P03', 'C-03', 'R-01'],
      intent: { section: 'profissional', subTab: 'folgas' },
      render: () => <ProfessionalView embedded initialTab="folgas" />,
    },
    {
      id: 'POP-P01',
      code: 'POP-P01',
      title: 'Popup PWA Instalável na Tela Inicial',
      device: 'mobile',
      category: 'profissional',
      isPopup: true,
      darkStatusBar: true,
      frameSize: '360×780 · Modal',
      urlLabel: 'pro.ipretty.salao/instalar',
      storyRef: 'US-08',
      linksTo: ['P-01 Agenda'],
      intent: { section: 'profissional', openModal: 'pwa' },
      render: () => <ProfessionalView embedded initialTab="agenda" initialModal="pwa" />,
    },
    {
      id: 'POP-P02',
      code: 'POP-P02',
      title: 'Popup Detalhe Atendimento (Profissional)',
      device: 'mobile',
      category: 'profissional',
      isPopup: true,
      darkStatusBar: true,
      frameSize: '360×780 · Modal',
      urlLabel: 'pro.ipretty.salao/atendimento',
      storyRef: 'US-08',
      linksTo: ['P-01 Agenda'],
      intent: { section: 'profissional', openModal: 'detalhe' },
      render: () => <ProfessionalView embedded initialTab="agenda" initialModal="detalhe" />,
    },
    {
      id: 'POP-P03',
      code: 'POP-P03',
      title: 'Popup Bloquear Folga / Horário',
      device: 'mobile',
      category: 'profissional',
      isPopup: true,
      darkStatusBar: true,
      frameSize: '360×780 · Modal',
      urlLabel: 'pro.ipretty.salao/bloquear-folga',
      storyRef: 'US-11',
      linksTo: ['P-03', 'C-03', 'R-01'],
      intent: { section: 'profissional', openModal: 'folga' },
      render: () => <ProfessionalView embedded initialTab="folgas" initialModal="folga" />,
    },

    // ================= RECEPÇÃO · CARLA (DESKTOP 1280×800) =================
    {
      id: 'R-01',
      code: 'R-01',
      title: 'Painel do Dia Multi-Coluna por Profissional',
      device: 'desktop',
      category: 'recepcao',
      frameSize: '1280×800',
      urlLabel: 'balcao.ipretty.salao/painel',
      storyRef: 'US-03',
      linksTo: ['POP-R01', 'POP-R02', 'POP-R04'],
      intent: { section: 'recepcao', subTab: 'agenda' },
      render: () => <ReceptionView embedded initialTab="agenda" />,
    },
    {
      id: 'R-02',
      code: 'R-02',
      title: 'Fila de Pedidos & Máquina de Estados',
      device: 'desktop',
      category: 'recepcao',
      frameSize: '1280×800',
      urlLabel: 'balcao.ipretty.salao/pedidos',
      storyRef: 'US-04',
      linksTo: ['POP-R03', 'POP-R04', 'POP-R05'],
      intent: { section: 'recepcao', subTab: 'pedidos' },
      render: () => <ReceptionView embedded initialTab="pedidos" />,
    },
    {
      id: 'R-04',
      code: 'R-04',
      title: 'Caixa do Turno & Histórico de Faltas',
      device: 'desktop',
      category: 'recepcao',
      frameSize: '1280×800',
      urlLabel: 'balcao.ipretty.salao/caixa',
      storyRef: 'US-03 · US-04',
      linksTo: ['A-05 Relatórios'],
      intent: { section: 'recepcao', subTab: 'caixa' },
      render: () => <ReceptionView embedded initialTab="caixa" />,
    },
    {
      id: 'POP-R01',
      code: 'POP-R01',
      title: 'Popup Detalhe Atendimento (Recepção)',
      device: 'desktop',
      category: 'recepcao',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'balcao.ipretty.salao/atendimento',
      storyRef: 'US-03 · US-04',
      linksTo: ['POP-R04 Pagamento'],
      intent: { section: 'recepcao', subTab: 'agenda', openModal: 'detalhe-atendimento' },
      render: () => <ReceptionView embedded initialTab="agenda" initialModal="detalhe-atendimento" />,
    },
    {
      id: 'POP-R02',
      code: 'POP-R02',
      title: 'Popup Novo Encaixe Manual (US-03)',
      device: 'desktop',
      category: 'recepcao',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'balcao.ipretty.salao/encaixe',
      storyRef: 'US-03',
      linksTo: ['R-01 Painel'],
      intent: { section: 'recepcao', subTab: 'agenda', openModal: 'encaixe' },
      render: () => <ReceptionView embedded initialTab="agenda" initialModal="encaixe" />,
    },
    {
      id: 'POP-R03',
      code: 'POP-R03',
      title: 'Popup Auditoria & Histórico do Pedido',
      device: 'desktop',
      category: 'recepcao',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'balcao.ipretty.salao/auditoria-pedido',
      storyRef: 'US-04',
      linksTo: ['R-02 Pedidos'],
      intent: { section: 'recepcao', subTab: 'pedidos', openModal: 'detalhe-pedido' },
      render: () => <ReceptionView embedded initialTab="pedidos" initialModal="detalhe-pedido" />,
    },
    {
      id: 'POP-R04',
      code: 'POP-R04',
      title: 'Popup Registrar Pagamento / Brinde',
      device: 'desktop',
      category: 'recepcao',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'balcao.ipretty.salao/pagamento',
      storyRef: 'US-04',
      linksTo: ['R-04 Caixa', 'P-02 Financeiro', 'A-05'],
      intent: { section: 'recepcao', subTab: 'caixa', openModal: 'pagamento' },
      render: () => <ReceptionView embedded initialTab="caixa" initialModal="pagamento" />,
    },
    {
      id: 'POP-R05',
      code: 'POP-R05',
      title: 'Popup Pedido Balcão / Amostra Grátis',
      device: 'desktop',
      category: 'recepcao',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'balcao.ipretty.salao/novo-pedido',
      storyRef: 'US-04',
      linksTo: ['R-02 Pedidos'],
      intent: { section: 'recepcao', subTab: 'pedidos', openModal: 'pedido-balcao' },
      render: () => <ReceptionView embedded initialTab="pedidos" initialModal="pedido-balcao" />,
    },

    // ================= ADMINISTRAÇÃO · DONA MARTA (DESKTOP 1280×800) =================
    {
      id: 'A-01',
      code: 'A-01',
      title: 'Visão Geral & Metas de Negócio',
      device: 'desktop',
      category: 'admin',
      frameSize: '1280×800',
      urlLabel: 'admin.ipretty.salao/visao-geral',
      storyRef: 'Vision Board',
      linksTo: ['A-02', 'A-04', 'A-05'],
      intent: { section: 'admin', subTab: 'resumo' },
      render: () => <AdminView embedded initialTab="resumo" />,
    },
    {
      id: 'A-02',
      code: 'A-02',
      title: 'Equipe, Vínculos & Trocas na Escala',
      device: 'desktop',
      category: 'admin',
      frameSize: '1280×800',
      urlLabel: 'admin.ipretty.salao/equipe',
      storyRef: 'US-05 · US-12',
      linksTo: ['POP-A01', 'POP-A02'],
      intent: { section: 'admin', subTab: 'equipe' },
      render: () => <AdminView embedded initialTab="equipe" />,
    },
    {
      id: 'A-03',
      code: 'A-03',
      title: 'Catálogo de Serviços do Salão',
      device: 'desktop',
      category: 'admin',
      frameSize: '1280×800',
      urlLabel: 'admin.ipretty.salao/servicos',
      storyRef: 'Catálogo',
      linksTo: ['POP-A03', 'C-02 Vitrine'],
      intent: { section: 'admin', subTab: 'servicos' },
      render: () => <AdminView embedded initialTab="servicos" />,
    },
    {
      id: 'A-04',
      code: 'A-04',
      title: 'Fornecedores & Produtos (Margens e Lucro)',
      device: 'desktop',
      category: 'admin',
      frameSize: '1280×800',
      urlLabel: 'admin.ipretty.salao/produtos',
      storyRef: 'US-06',
      linksTo: ['POP-A04', 'POP-A05'],
      intent: { section: 'admin', subTab: 'produtos' },
      render: () => <AdminView embedded initialTab="produtos" />,
    },
    {
      id: 'A-05',
      code: 'A-05',
      title: 'Relatórios: Vendas, Repasses & Ranking R$',
      device: 'desktop',
      category: 'admin',
      frameSize: '1280×800',
      urlLabel: 'admin.ipretty.salao/relatorios',
      storyRef: 'US-07 · US-13',
      linksTo: ['POP-A06 Extrato'],
      intent: { section: 'admin', subTab: 'relatorios' },
      render: () => <AdminView embedded initialTab="relatorios" />,
    },
    {
      id: 'A-06',
      code: 'A-06',
      title: 'Gestão de Banners da Vitrine',
      device: 'desktop',
      category: 'admin',
      frameSize: '1280×800',
      urlLabel: 'admin.ipretty.salao/banners',
      storyRef: 'US-14',
      linksTo: ['POP-A07', 'C-01 Vitrine'],
      intent: { section: 'admin', subTab: 'banners' },
      render: () => <AdminView embedded initialTab="banners" />,
    },
    {
      id: 'POP-A01',
      code: 'POP-A01',
      title: 'Popup Profissional & Remuneração (US-05)',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/equipe/novo',
      storyRef: 'US-05',
      linksTo: ['A-02 Equipe'],
      intent: { section: 'admin', subTab: 'equipe', openModal: 'equipe' },
      render: () => <AdminView embedded initialTab="equipe" initialModal="equipe" />,
    },
    {
      id: 'POP-A02',
      code: 'POP-A02',
      title: 'Popup Troca Pontual na Escala (US-12)',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/equipe/troca-escala',
      storyRef: 'US-12',
      linksTo: ['A-02', 'C-03', 'R-01'],
      intent: { section: 'admin', subTab: 'equipe', openModal: 'troca-escala' },
      render: () => <AdminView embedded initialTab="equipe" initialModal="troca-escala" />,
    },
    {
      id: 'POP-A03',
      code: 'POP-A03',
      title: 'Popup Cadastrar / Editar Serviço',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/servicos/novo',
      storyRef: 'Catálogo',
      linksTo: ['A-03', 'C-02'],
      intent: { section: 'admin', subTab: 'servicos', openModal: 'servico' },
      render: () => <AdminView embedded initialTab="servicos" initialModal="servico" />,
    },
    {
      id: 'POP-A04',
      code: 'POP-A04',
      title: 'Popup Cadastrar Fornecedor (US-06)',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/fornecedores/novo',
      storyRef: 'US-06',
      linksTo: ['A-04 Fornecedores', 'POP-A05'],
      intent: { section: 'admin', subTab: 'produtos', openModal: 'fornecedor' },
      render: () => (
        <AdminView
          embedded
          initialTab="produtos"
          initialCatalogSubTab="fornecedores"
          initialModal="fornecedor"
        />
      ),
    },
    {
      id: 'POP-A05',
      code: 'POP-A05',
      title: 'Popup Produto: Lucro & Aviso Negativo',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/produtos/novo',
      storyRef: 'US-06',
      linksTo: ['A-04 Produtos'],
      intent: { section: 'admin', subTab: 'produtos', openModal: 'produto' },
      render: () => (
        <AdminView
          embedded
          initialTab="produtos"
          initialCatalogSubTab="produtos"
          initialModal="produto"
        />
      ),
    },
    {
      id: 'POP-A06',
      code: 'POP-A06',
      title: 'Popup Extrato Detalhado de Repasse (US-07)',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/repasses/extrato',
      storyRef: 'US-07',
      linksTo: ['A-05 Repasses'],
      intent: { section: 'admin', subTab: 'relatorios', openModal: 'extrato' },
      render: () => (
        <AdminView
          embedded
          initialTab="relatorios"
          initialReportSubTab="repasses"
          initialModal="extrato"
        />
      ),
    },
    {
      id: 'POP-A07',
      code: 'POP-A07',
      title: 'Popup Criar / Editar Banner (US-14)',
      device: 'desktop',
      category: 'admin',
      isPopup: true,
      frameSize: '1280×800 · Modal',
      urlLabel: 'admin.ipretty.salao/banners/novo',
      storyRef: 'US-14',
      linksTo: ['A-06 Banners', 'C-01 Vitrine'],
      intent: { section: 'admin', subTab: 'banners', openModal: 'banner' },
      render: () => <AdminView embedded initialTab="banners" initialModal="banner" />,
    },
  ];

  const filtered = artboards.filter((a) => {
    if (filter === 'todas') return true;
    if (filter === 'mobile') return a.device === 'mobile';
    if (filter === 'desktop') return a.device === 'desktop';
    if (filter === 'popups') return !!a.isPopup;
    return a.category === filter;
  });

  const mobileArtboards = filtered.filter((a) => a.device === 'mobile');
  const desktopArtboards = filtered.filter((a) => a.device === 'desktop');

  const mobileTotal = artboards.filter((a) => a.device === 'mobile').length;
  const desktopTotal = artboards.filter((a) => a.device === 'desktop').length;
  const popupsTotal = artboards.filter((a) => !!a.isPopup).length;

  return (
    <div className="min-h-screen bg-[#EFEAE3] text-[#1F1815] pb-16">
      <div className="max-w-[1620px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Top Studio Controls (hidden in Modo Captura Limpa) */}
        {!cleanCaptureMode ? (
          <>
            <header className="bg-white rounded-2xl border border-[#DDD4C9] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                  Tela S-03 · Studio de Frames Funcionais (Mobile + Desktop)
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-0.5">
                  Todos os Frames Interativos para Exportar no Figma
                </h1>
                <p className="text-xs text-[#5A4F48] mt-1 max-w-3xl">
                  Cada frame abaixo é uma instância viva do iPretty conectada em tempo real: toque
                  nos horários, troque abas ou preencha popups dentro de qualquer aparelho Mobile ou
                  Desktop.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveSection('identidade')}
                  className="px-3.5 py-2 rounded-xl border border-[#D9CFC3] bg-white text-xs font-semibold hover:bg-[#F7F3EE] cursor-pointer"
                >
                  Tokens & Brand Book
                </button>
                <button
                  onClick={() => setFigmaExactMode((v) => !v)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    figmaExactMode
                      ? 'bg-[#B85D43] text-white border-[#B85D43]'
                      : 'bg-white text-[#1F1815] border-[#D9CFC3] hover:bg-[#F7F3EE]'
                  }`}
                >
                  {figmaExactMode ? '1:1 Figma (390 / 1280 sem corte)' : 'Escala 1:1 p/ Figma'}
                </button>
                <button
                  onClick={() => setCleanCaptureMode(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#1F1815] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#B85D43]"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Modo Captura Limpa (Figma)
                </button>
              </div>
            </header>

            {/* Story Map / Ligações */}
            <div className="bg-white rounded-2xl border border-[#DDD4C9] p-4 space-y-2.5">
              <div className="text-xs font-semibold text-[#5A4F48] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B85D43]" />
                Ligações entre Telas & Jornadas Integradas (Story Map US-01 → US-14)
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-num">
                {[
                  { label: 'S-01 Entrada', intent: { section: 'splash' } as const },
                  {
                    label: 'A-02 Equipe & Vínculos',
                    intent: { section: 'admin', subTab: 'equipe' } as const,
                  },
                  {
                    label: 'C-01 Vitrine',
                    intent: { section: 'cliente', subTab: 'inicio' } as const,
                  },
                  {
                    label: 'C-03 Agendar (US-01)',
                    intent: { section: 'cliente', subTab: 'agendar' } as const,
                  },
                  {
                    label: 'C-06 Lembrete 24h (US-09)',
                    intent: { section: 'cliente', subTab: 'lembrete' } as const,
                  },
                  {
                    label: 'R-01 Painel do Dia (US-03)',
                    intent: { section: 'recepcao', subTab: 'agenda' } as const,
                  },
                  {
                    label: 'R-02 Pedidos (US-04)',
                    intent: { section: 'recepcao', subTab: 'pedidos' } as const,
                  },
                  {
                    label: 'P-02 Meu Financeiro (US-08)',
                    intent: { section: 'profissional', subTab: 'financeiro' } as const,
                  },
                  {
                    label: 'A-05 Repasses & Ranking (US-07/13)',
                    intent: { section: 'admin', subTab: 'relatorios' } as const,
                  },
                ].map((node, i, arr) => (
                  <React.Fragment key={node.label}>
                    <button
                      onClick={() => navigateTo(node.intent)}
                      className="px-2.5 py-1 rounded-lg bg-[#F7F3EE] border border-[#E3DBD0] font-semibold hover:border-[#B85D43] hover:bg-[#F6E6E0]/60 transition-colors cursor-pointer"
                    >
                      {node.label}
                    </button>
                    {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-[#B85D43]" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'todas', label: `Todos os Frames (${artboards.length})` },
                  { id: 'mobile', label: `Mobile · ${mobileTotal}` },
                  { id: 'desktop', label: `Desktop · ${desktopTotal}` },
                  { id: 'sistema', label: 'Acesso & Sistema' },
                  { id: 'cliente', label: 'Juliana · Cliente' },
                  { id: 'recepcao', label: 'Carla · Recepção' },
                  { id: 'profissional', label: 'Patrícia · PWA' },
                  { id: 'admin', label: 'Dona Marta · Admin' },
                  { id: 'popups', label: `Só Popups & Modais (${popupsTotal})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                    filter === tab.id
                      ? 'bg-[#1F1815] text-white border-[#1F1815]'
                      : 'bg-white text-[#5A4F48] border-[#D9CFC3] hover:border-[#1F1815]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
            <button
              onClick={() => setFigmaExactMode((v) => !v)}
              className="px-3.5 py-2 rounded-full bg-white text-[#1F1815] border border-[#D9CFC3] text-xs font-semibold shadow-xl cursor-pointer hover:bg-[#F7F3EE]"
            >
              {figmaExactMode ? 'Voltar p/ Compacto' : 'Ativar 1:1 (390 / 1280)'}
            </button>
            <button
              onClick={() => setCleanCaptureMode(false)}
              className="px-3.5 py-2 rounded-full bg-[#1F1815] text-white text-xs font-semibold shadow-xl flex items-center gap-1.5 cursor-pointer hover:bg-[#B85D43]"
            >
              <Eye className="w-3.5 h-3.5" /> Sair do Modo Captura Limpa
            </button>
          </div>
        )}

        {/* ================= ZONA 1 · MOBILE STUDIO (4-COLUMN GRID ON BLUSH ROSE) ================= */}
        {mobileArtboards.length > 0 && (
          <section className="rounded-[28px] bg-[#F4EAE4] border border-[#E7D8CF] p-5 sm:p-8 lg:p-10 space-y-6">
            {!cleanCaptureMode && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/85 border border-[#E5D3C9] flex items-center justify-center text-[#B85D43]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono-num uppercase tracking-widest text-[#9C4A33] font-semibold">
                      Seção 01 · Mobile Studio ({mobileArtboards.length} frames funcionais)
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#1F1815]">
                      App Vitrine da Cliente (Juliana) + PWA Mobile da Profissional (Patrícia)
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono-num text-[#6E5C54] bg-white/80 px-3 py-1.5 rounded-full border border-[#E5D3C9]">
                  Frames Mobile 360px–390px · Role ou clique dentro de cada aparelho
                </span>
              </div>
            )}

            <ContainedModalProvider contained>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  figmaExactMode
                    ? 'xl:grid-cols-3 gap-x-8 gap-y-12'
                    : 'lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10'
                } justify-items-center items-start`}
              >
                {mobileArtboards.map((art) => (
                  <div
                    key={art.id}
                    className={`w-full ${figmaExactMode ? 'max-w-[390px]' : 'max-w-[340px]'} flex flex-col items-center`}
                  >
                    {!cleanCaptureMode && (
                      <div className="w-full mb-2.5 px-1 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono-num text-[11px] font-bold text-[#9C4A33]">
                              {art.code}
                            </span>
                            {art.isPopup && (
                              <span className="px-1.5 py-0.5 rounded bg-white/90 border border-[#E0CFC5] text-[9px] font-mono-num uppercase text-[#9C4A33]">
                                Popup
                              </span>
                            )}
                            <span className="font-mono-num text-[10px] text-[#7D6C64]">
                              {art.storyRef}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[#1F1815] truncate">
                            {art.title}
                          </div>
                        </div>
                        <button
                          onClick={() => navigateTo(art.intent)}
                          title={`Abrir ${art.code} em tela inteira`}
                          className="px-2 py-1 rounded-lg bg-white/90 border border-[#DFCFC6] text-[10px] font-semibold text-[#1F1815] hover:bg-[#1F1815] hover:text-white transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Expand className="w-2.5 h-2.5" /> Abrir
                        </button>
                      </div>
                    )}

                    <PhoneFrame
                      widthClass={figmaExactMode ? 'w-[390px]' : 'w-full max-w-[336px]'}
                      heightClass={figmaExactMode ? 'min-h-[844px]' : 'h-[670px]'}
                      darkStatusBar={art.darkStatusBar}
                    >
                      {art.render()}
                    </PhoneFrame>

                    {!cleanCaptureMode && (
                      <div className="mt-2.5 text-[10px] font-mono-num text-[#7D6C64] text-center truncate max-w-full px-2">
                        → {art.linksTo.join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ContainedModalProvider>
          </section>
        )}

        {/* ================= ZONA 2 · DESKTOP STUDIO (STACKED BROWSER FRAMES ON SAGE) ================= */}
        {desktopArtboards.length > 0 && (
          <section className="rounded-[28px] bg-[#D8E5DD] border border-[#C2D4C9] p-5 sm:p-10 lg:p-14 space-y-10">
            {!cleanCaptureMode && (
              <div className="max-w-[1160px] mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/85 border border-[#C0D2C7] flex items-center justify-center text-[#28503B]">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono-num uppercase tracking-widest text-[#28503B] font-semibold">
                      Seção 02 · Desktop Studio ({desktopArtboards.length} frames funcionais)
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#1F1815]">
                      Entrada, Brand Book, Balcão da Recepção (Carla) & Administração (Dona Marta)
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono-num text-[#465E51] bg-white/80 px-3 py-1.5 rounded-full border border-[#C0D2C7]">
                  Frames Desktop 1280×800 · Empilhados em proporção real de tela
                </span>
              </div>
            )}

            <ContainedModalProvider contained>
              <div
                className={`${
                  figmaExactMode ? 'max-w-[1280px] overflow-x-auto' : 'max-w-[1160px]'
                } mx-auto space-y-12`}
              >
                {desktopArtboards.map((art) => (
                  <div key={art.id} className="space-y-3">
                    {!cleanCaptureMode && (
                      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className="px-2.5 py-0.5 rounded-full bg-white text-[#28503B] border border-[#BDD0C4] font-mono-num text-[11px] font-bold">
                            {art.code}
                          </span>
                          {art.isPopup && (
                            <span className="px-2 py-0.5 rounded-full bg-[#F6E6E0] text-[#8F3F29] border border-[#E8C8BD] font-mono-num text-[10px] font-semibold uppercase">
                              Popup / Modal
                            </span>
                          )}
                          <h3 className="font-display text-lg font-semibold text-[#1F1815]">
                            {art.title}
                          </h3>
                          <span className="text-[11px] font-mono-num text-[#4E6458]">
                            · {art.storyRef} · → {art.linksTo.join(', ')}
                          </span>
                        </div>
                        <button
                          onClick={() => navigateTo(art.intent)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#BDD0C4] text-xs font-semibold text-[#1F1815] hover:bg-[#1F1815] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Expand className="w-3.5 h-3.5" /> Abrir em tela inteira
                        </button>
                      </div>
                    )}

                    <DesktopFrame
                      title={`${art.code} · ${art.frameSize}`}
                      urlLabel={art.urlLabel}
                      className={figmaExactMode ? 'w-[1280px] min-h-[800px]' : 'h-[680px]'}
                    >
                      {art.render()}
                    </DesktopFrame>
                  </div>
                ))}
              </div>
            </ContainedModalProvider>
          </section>
        )}
      </div>
    </div>
  );
};
