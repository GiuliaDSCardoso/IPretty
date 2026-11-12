import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  Image,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  Scissors,
  Trash2,
  Users,
} from 'lucide-react';
import { IPrettyWordmark, ProductEditorialArt } from '../components/brand/BrandAssets';
import { Badge, Button, Modal, SectionCard } from '../components/ui/Primitives';
import { useSalon } from '../context/SalonContext';
import {
  EmploymentType,
  Product,
  ServiceCategory,
  ServiceItem,
  StaffMember,
  StaffRole,
  Supplier,
  VitrineBanner,
  WeeklySchedule,
} from '../types/salon';
import {
  addDaysISO,
  calculateProductProfit,
  calculateStaffPayout,
  formatCurrency,
  formatDateBR,
  StaffPayoutBreakdown,
} from '../utils/calculations';

export type AdminTab = 'resumo' | 'equipe' | 'servicos' | 'produtos' | 'relatorios' | 'banners';

export type AdminModalType =
  | 'equipe'
  | 'troca-escala'
  | 'servico'
  | 'fornecedor'
  | 'produto'
  | 'extrato'
  | 'banner';

export interface AdminViewProps {
  embedded?: boolean;
  initialTab?: AdminTab;
  initialCatalogSubTab?: 'produtos' | 'fornecedores';
  initialReportSubTab?: 'vendas' | 'repasses' | 'produtos';
  initialModal?: AdminModalType;
}

const WEEKDAYS = [
  { dow: 0, label: 'Dom' },
  { dow: 1, label: 'Seg' },
  { dow: 2, label: 'Ter' },
  { dow: 3, label: 'Qua' },
  { dow: 4, label: 'Qui' },
  { dow: 5, label: 'Sex' },
  { dow: 6, label: 'Sáb' },
];

export const AdminView: React.FC<AdminViewProps> = ({
  embedded = false,
  initialTab = 'resumo',
  initialCatalogSubTab = 'produtos',
  initialReportSubTab = 'vendas',
  initialModal,
}) => {
  const {
    staff,
    services,
    suppliers,
    products,
    appointments,
    orders,
    overrides,
    banners,
    todayISO,
    navIntent,
    clearNavIntent,
    saveStaffMember,
    saveService,
    saveSupplier,
    saveProduct,
    toggleProductActive,
    addScheduleOverride,
    removeScheduleOverride,
    saveBanner,
    deleteBanner,
    pushToast,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [catalogSubTab, setCatalogSubTab] = useState<'produtos' | 'fornecedores'>(
    initialCatalogSubTab,
  );
  const [reportSubTab, setReportSubTab] = useState<'vendas' | 'repasses' | 'produtos'>(
    initialReportSubTab,
  );
  const [rankingOrder, setRankingOrder] = useState<'mais' | 'menos'>('mais');

  // Filtro de Período nos Relatórios (US-07)
  const [periodStart, setPeriodStart] = useState(addDaysISO(todayISO, -30));
  const [periodEnd, setPeriodEnd] = useState(addDaysISO(todayISO, 1));

  // Modais Admin (POP-A01 .. POP-A07)
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [overrideModalOpen, setOverrideModalOpen] = useState(initialModal === 'troca-escala');
  const [ovrStaffId, setOvrStaffId] = useState('staff-patricia');
  const [ovrDate, setOvrDate] = useState(addDaysISO(todayISO, 1));
  const [ovrEnabled, setOvrEnabled] = useState(true);
  const [ovrStart, setOvrStart] = useState('09:00');
  const [ovrEnd, setOvrEnd] = useState('18:00');
  const [ovrReason, setOvrReason] = useState('Troca pontual de turno');

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<string | null>(null);

  const [payoutDetailModal, setPayoutDetailModal] = useState<StaffPayoutBreakdown | null>(null);

  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<VitrineBanner | null>(null);

  useEffect(() => {
    if (!initialModal) return;
    if (initialModal === 'equipe') openNewStaffModal();
    if (initialModal === 'troca-escala') setOverrideModalOpen(true);
    if (initialModal === 'servico') openNewServiceModal();
    if (initialModal === 'fornecedor') openNewSupplierModal();
    if (initialModal === 'produto') openNewProductModal();
    if (initialModal === 'banner') openNewBannerModal();
    if (initialModal === 'extrato') {
      const pat = staff.find((s) => s.id === 'staff-patricia') ?? staff[0];
      if (pat) {
        const paidInWindow = appointments.filter(
          (a) => a.status === 'pago' && a.date >= periodStart && a.date <= periodEnd,
        );
        setPayoutDetailModal(calculateStaffPayout(pat, paidInWindow));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialModal]);

  useEffect(() => {
    if (embedded || !navIntent || navIntent.section !== 'admin') return;
    if (navIntent.subTab) setActiveTab(navIntent.subTab as AdminTab);
    if (navIntent.openModal === 'equipe') openNewStaffModal();
    if (navIntent.openModal === 'troca-escala') {
      setActiveTab('equipe');
      setOverrideModalOpen(true);
    }
    if (navIntent.openModal === 'servico') {
      setActiveTab('servicos');
      openNewServiceModal();
    }
    if (navIntent.openModal === 'fornecedor') {
      setActiveTab('produtos');
      setCatalogSubTab('fornecedores');
      openNewSupplierModal();
    }
    if (navIntent.openModal === 'produto') {
      setActiveTab('produtos');
      setCatalogSubTab('produtos');
      openNewProductModal();
    }
    if (navIntent.openModal === 'banner') {
      setActiveTab('banners');
      openNewBannerModal();
    }
    if (navIntent.openModal === 'extrato') {
      setActiveTab('relatorios');
      setReportSubTab('repasses');
      const pat = staff.find((s) => s.id === 'staff-patricia') ?? staff[0];
      if (pat) {
        setPayoutDetailModal(calculateStaffPayout(pat, paidAppointmentsInPeriod));
      }
    }
    clearNavIntent();
  }, [navIntent, embedded]);

  // --- Helpers de Abertura de Modais ---
  const defaultSchedule: WeeklySchedule = {
    0: { enabled: false, start: '09:00', end: '18:00' },
    1: { enabled: false, start: '09:00', end: '18:00' },
    2: { enabled: true, start: '09:00', end: '18:30' },
    3: { enabled: true, start: '09:00', end: '18:30' },
    4: { enabled: true, start: '09:00', end: '18:30' },
    5: { enabled: true, start: '09:00', end: '19:00' },
    6: { enabled: true, start: '08:30', end: '17:30' },
  };

  const openNewStaffModal = () => {
    setStaffError(null);
    setEditingStaff({
      id: `staff-${Date.now()}`,
      name: '',
      fullName: '',
      role: 'manicure',
      specialtyLabel: 'Manicure',
      isReceptionist: false,
      employmentType: 'parceira',
      fixedSalary: 0,
      defaultCommissionPercent: 40,
      serviceCommissions: {},
      schedule: defaultSchedule,
      active: true,
      avatarColor: '#B85D43',
      bio: '',
      phone: '',
    });
    setStaffModalOpen(true);
  };

  const openEditStaffModal = (member: StaffMember) => {
    setStaffError(null);
    setEditingStaff(JSON.parse(JSON.stringify(member)));
    setStaffModalOpen(true);
  };

  const openNewServiceModal = () => {
    setEditingService({
      id: `srv-${Date.now()}`,
      name: '',
      category: 'cabelo',
      durationMin: 45,
      price: 80,
      description: '',
      includes: ['Atendimento completo'],
      active: true,
      professionalIds: ['staff-marta'],
    });
    setServiceModalOpen(true);
  };

  const openNewSupplierModal = () => {
    setEditingSupplier({
      id: `sup-${Date.now()}`,
      companyName: '',
      representativeName: '',
      phone: '',
      notes: '',
    });
    setSupplierModalOpen(true);
  };

  const openNewProductModal = () => {
    setProductError(null);
    setEditingProduct({
      id: `prd-${Date.now()}`,
      name: '',
      brand: '',
      category: 'Cabelo',
      supplierId: suppliers[0]?.id ?? '',
      costPrice: 50,
      salePrice: 100,
      description: '',
      usageTip: '',
      visualType: 'serum',
      accentTone: '#B85D43',
      active: true,
    });
    setProductModalOpen(true);
  };

  const openNewBannerModal = () => {
    setEditingBanner({
      id: `ban-${Date.now()}`,
      tag: 'Novidade do Salão',
      title: '',
      subtitle: '',
      ctaLabel: 'Agendar agora',
      targetTab: 'servicos',
      theme: 'terracotta',
      active: true,
      order: banners.length + 1,
    });
    setBannerModalOpen(true);
  };

  // --- Cálculos de Relatórios do Período (US-07 & US-13) ---
  const paidAppointmentsInPeriod = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === 'pago' && a.date >= periodStart && a.date <= periodEnd,
      ),
    [appointments, periodStart, periodEnd],
  );

  const paidOrdersInPeriod = useMemo(
    () =>
      orders.filter((o) => {
        const d = o.createdAt.slice(0, 10);
        return o.status === 'pago' && d >= periodStart && d <= periodEnd;
      }),
    [orders, periodStart, periodEnd],
  );

  const giftOrdersInPeriod = useMemo(
    () =>
      orders.filter((o) => {
        const d = o.createdAt.slice(0, 10);
        return o.status === 'brinde' && d >= periodStart && d <= periodEnd;
      }),
    [orders, periodStart, periodEnd],
  );

  const totalServicesRevenue = paidAppointmentsInPeriod.reduce(
    (s, a) => s + (a.payment?.finalAmount ?? a.servicePrice),
    0,
  );
  const totalProductsRevenue = paidOrdersInPeriod.reduce(
    (s, o) =>
      s +
      (o.payment?.finalAmount ??
        o.items.reduce((is, it) => is + it.unitSalePrice * it.quantity, 0)),
    0,
  );

  const staffPayouts = useMemo(
    () => staff.map((member) => calculateStaffPayout(member, paidAppointmentsInPeriod)),
    [staff, paidAppointmentsInPeriod],
  );
  const totalStaffPayouts = staffPayouts.reduce((s, p) => s + p.totalPayout, 0);

  // Lucro real por produto vendido no período (US-07 + Ranking US-13)
  const productSalesSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        productId: string;
        productName: string;
        qtySold: number;
        revenue: number;
        totalCost: number;
        profitReais: number;
      }
    >();

    // Inicializa com todos os produtos para que "menos vendidos" também mostre itens com 0 vendas
    for (const p of products) {
      if (p.costPrice === 0 && p.salePrice === 0) continue; // amostra grátis não entra em vendas
      map.set(p.id, {
        productId: p.id,
        productName: p.name,
        qtySold: 0,
        revenue: 0,
        totalCost: 0,
        profitReais: 0,
      });
    }

    for (const ord of paidOrdersInPeriod) {
      for (const it of ord.items) {
        if (it.unitCostPrice === 0 && it.unitSalePrice === 0) continue;
        const curr = map.get(it.productId) ?? {
          productId: it.productId,
          productName: it.productName,
          qtySold: 0,
          revenue: 0,
          totalCost: 0,
          profitReais: 0,
        };
        const itemRev = it.unitSalePrice * it.quantity;
        const itemCost = it.unitCostPrice * it.quantity;
        curr.qtySold += it.quantity;
        curr.revenue += itemRev;
        curr.totalCost += itemCost;
        curr.profitReais += itemRev - itemCost;
        map.set(it.productId, curr);
      }
    }

    const list = Array.from(map.values());
    list.sort((a, b) =>
      rankingOrder === 'mais' ? b.qtySold - a.qtySold : a.qtySold - b.qtySold,
    );
    return list;
  }, [products, paidOrdersInPeriod, rankingOrder]);

  const totalProductsProfit = productSalesSummary.reduce((s, p) => s + p.profitReais, 0);

  // Métricas de Visão de Negócio (Product Vision Board)
  const totalNonCancelledApts = appointments.filter((a) => a.status !== 'cancelado').length;
  const onlineAptsCount = appointments.filter(
    (a) => a.status !== 'cancelado' && a.source === 'vitrine',
  ).length;
  const noShowCount = appointments.filter((a) => a.status === 'nao_compareceu').length;
  const onlineSharePct =
    totalNonCancelledApts > 0 ? Math.round((onlineAptsCount / totalNonCancelledApts) * 100) : 0;
  const noShowPct =
    totalNonCancelledApts > 0 ? Math.round((noShowCount / totalNonCancelledApts) * 100) : 0;

  return (
    <div
      className={
        embedded
          ? 'relative h-full overflow-hidden bg-[#F7F3EE] text-[#1F1815]'
          : 'min-h-screen bg-[#F7F3EE] text-[#1F1815] pb-16'
      }
    >
      <div className={embedded ? 'h-full overflow-y-auto pb-8' : ''}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Admin */}
        <header className="bg-white rounded-2xl border border-[#E3DBD0] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IPrettyWordmark compact />
            <div className="h-7 w-px bg-[#E3DBD0] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold">
                  Dona Marta · Administração
                </span>
                <Badge tone="dark">US-05 · US-06 · US-07 · US-12..14</Badge>
              </div>
              <div className="text-xs text-[#5A4F48]">
                Gestão de equipe, vínculos, fornecedores, produtos, banners e repasses sem planilha
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('equipe')}>
              + Profissional
            </Button>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('relatorios')}>
              Fechamento & Repasses
            </Button>
          </div>
        </header>

        {/* Navegação Admin */}
        <nav className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[#EFE9E1] border border-[#E3DBD0]">
          {(
            [
              { id: 'resumo', label: 'A-01 · Visão Geral', icon: LayoutDashboard },
              { id: 'equipe', label: 'A-02 · Equipe & Escalas', icon: Users },
              { id: 'servicos', label: 'A-03 · Serviços', icon: Scissors },
              { id: 'produtos', label: 'A-04 · Fornecedores & Produtos', icon: Package },
              { id: 'relatorios', label: 'A-05 · Vendas, Lucro & Repasses', icon: BarChart3 },
              { id: 'banners', label: 'A-06 · Banners da Vitrine', icon: Image },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#1F1815] shadow-xs'
                    : 'text-[#5A4F48] hover:text-[#1F1815]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* === A-01: VISÃO GERAL === */}
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SectionCard className="p-5">
                <div className="text-xs text-[#8B7F77]">Faturamento Pago (Serviços + Produtos)</div>
                <div className="font-display text-3xl font-semibold mt-1 tabular-nums">
                  {formatCurrency(totalServicesRevenue + totalProductsRevenue)}
                </div>
                <div className="text-xs text-[#38664E] font-medium mt-1">
                  Serviços {formatCurrency(totalServicesRevenue)} · Produtos{' '}
                  {formatCurrency(totalProductsRevenue)}
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="text-xs text-[#8B7F77]">Lucro Líquido de Produtos</div>
                <div
                  className={`font-display text-3xl font-semibold mt-1 tabular-nums ${
                    totalProductsProfit >= 0 ? 'text-[#38664E]' : 'text-[#B43B3B]'
                  }`}
                >
                  {formatCurrency(totalProductsProfit)}
                </div>
                <div className="text-xs text-[#5A4F48] mt-1">
                  Já descontando itens vendidos abaixo do custo
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="text-xs text-[#8B7F77]">Agendamentos Online (Meta: 60%)</div>
                <div className="font-display text-3xl font-semibold mt-1 tabular-nums">
                  {onlineSharePct}%
                </div>
                <div className="text-xs text-[#5A4F48] mt-1">
                  {onlineAptsCount} de {totalNonCancelledApts} via vitrine
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="text-xs text-[#8B7F77]">Taxa de Faltas (Meta: até 10%)</div>
                <div className="font-display text-3xl font-semibold mt-1 tabular-nums text-[#B85D43]">
                  {noShowPct}%
                </div>
                <div className="text-xs text-[#5A4F48] mt-1">
                  {noShowCount} falta(s) registradas no período
                </div>
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <SectionCard className="lg:col-span-7 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">
                    Prévia do Repasse do Mês (Sem Planilha)
                  </h2>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActiveTab('relatorios');
                      setReportSubTab('repasses');
                    }}
                  >
                    Ver aba de repasses
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {staffPayouts.map((sp) => (
                    <div
                      key={sp.staff.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-sm">{sp.staff.name}</div>
                        <div className="text-[11px] text-[#5A4F48]">
                          {sp.staff.employmentType === 'parceira'
                            ? 'Profissional-parceira (Lei 13.352/2016)'
                            : sp.staff.employmentType === 'clt_comissao'
                              ? `CLT + comissão (Fixo ${formatCurrency(sp.fixedSalary)})`
                              : 'CLT sem comissão (Fixo)'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-num font-bold text-base">
                          {formatCurrency(sp.totalPayout)}
                        </div>
                        <div className="text-[11px] text-[#8B7F77]">
                          {sp.paidCount} atendimentos pagos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard className="lg:col-span-5 p-5 space-y-4">
                <h2 className="font-display text-xl font-semibold">Ações de Gestão Rápida</h2>
                <div className="grid grid-cols-1 gap-2.5">
                  <Button variant="secondary" onClick={openNewStaffModal}>
                    <Users className="w-4 h-4" /> Cadastrar profissional / recepcionista (US-05)
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveTab('produtos');
                      openNewProductModal();
                    }}
                  >
                    <Package className="w-4 h-4" /> Cadastrar novo produto e margem (US-06)
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveTab('equipe');
                      setOverrideModalOpen(true);
                    }}
                  >
                    <CalendarClock className="w-4 h-4" /> Registrar troca na escala (US-12)
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveTab('banners');
                      openNewBannerModal();
                    }}
                  >
                    <Image className="w-4 h-4" /> Criar banner para a vitrine (US-14)
                  </Button>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* === A-02: EQUIPE, REMUNERAÇÃO & ESCALAS (US-05 / US-12) === */}
        {activeTab === 'equipe' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Equipe, Vínculos & Escalas (US-05)
                </h2>
                <p className="text-xs text-[#5A4F48]">
                  Percentuais entre 0% e 100% definidos por serviço. Recepcionista é sempre CLT sem
                  comissão.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setOverrideModalOpen(true)}>
                  <CalendarClock className="w-4 h-4" /> Troca na escala (US-12)
                </Button>
                <Button variant="primary" size="sm" onClick={openNewStaffModal}>
                  <Plus className="w-4 h-4" /> Nova colaboradora
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map((member) => {
                const activeDays = WEEKDAYS.filter((w) => member.schedule[w.dow]?.enabled).map(
                  (w) => w.label,
                );
                return (
                  <SectionCard key={member.id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-full text-white font-bold flex items-center justify-center"
                          style={{ backgroundColor: member.avatarColor }}
                        >
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-semibold">{member.name}</h3>
                            <Badge tone={member.isReceptionist ? 'slate' : 'terracotta'}>
                              {member.specialtyLabel}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#5A4F48]">
                            {member.fullName} · {member.phone}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditStaffModal(member)}
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0]">
                        <div className="text-[#8B7F77]">Vínculo contratual</div>
                        <div className="font-semibold mt-0.5">
                          {member.employmentType === 'parceira'
                            ? 'Parceira (Lei 13.352)'
                            : member.employmentType === 'clt_comissao'
                              ? 'CLT com comissão'
                              : 'CLT sem comissão'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0]">
                        <div className="text-[#8B7F77]">Remuneração base</div>
                        <div className="font-mono-num font-bold mt-0.5">
                          {member.employmentType === 'parceira'
                            ? `${member.defaultCommissionPercent}% por serviço`
                            : member.employmentType === 'clt_comissao'
                              ? `${formatCurrency(member.fixedSalary)} + ${member.defaultCommissionPercent}%`
                              : `${formatCurrency(member.fixedSalary)} fixo`}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#5A4F48]">
                      <strong>Escala semanal:</strong> {activeDays.join(', ')}
                    </div>
                  </SectionCard>
                );
              })}
            </div>

            {/* Trocas na Escala (US-12) */}
            <SectionCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">
                  Trocas Pontuais na Escala (US-12)
                </h3>
                <Button size="sm" variant="secondary" onClick={() => setOverrideModalOpen(true)}>
                  + Registrar troca pontual
                </Button>
              </div>
              {overrides.length === 0 ? (
                <p className="text-xs text-[#8B7F77]">
                  Nenhuma troca pontual registrada. Use o botão ao lado para abrir ou alterar o
                  horário de um dia específico de uma profissional.
                </p>
              ) : (
                <div className="space-y-2">
                  {overrides.map((ov) => {
                    const person = staff.find((s) => s.id === ov.staffId);
                    return (
                      <div
                        key={ov.id}
                        className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong>{person?.name}</strong> em{' '}
                          <span className="font-mono-num">{formatDateBR(ov.date)}</span>:{' '}
                          {ov.enabled ? `Trabalha ${ov.start}–${ov.end}` : 'Folga excepcional'} (
                          {ov.reason})
                        </div>
                        <button
                          onClick={() => removeScheduleOverride(ov.id)}
                          className="text-[#922B2B] hover:underline cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* === A-03: SERVIÇOS === */}
        {activeTab === 'servicos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Catálogo de Serviços</h2>
              <Button variant="primary" size="sm" onClick={openNewServiceModal}>
                <Plus className="w-4 h-4" /> Novo serviço
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((srv) => (
                <SectionCard key={srv.id} className="p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge tone="neutral">{srv.category}</Badge>
                      <Badge tone={srv.active ? 'sage' : 'crimson'}>
                        {srv.active ? 'Ativo na vitrine' : 'Oculto'}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg font-semibold mt-2">{srv.name}</h3>
                    <p className="text-xs text-[#5A4F48] mt-1">{srv.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#EFE9E1] flex items-center justify-between">
                    <div className="font-mono-num text-xs">
                      <strong>{formatCurrency(srv.price)}</strong> · {srv.durationMin} min
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingService(JSON.parse(JSON.stringify(srv)));
                        setServiceModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </SectionCard>
              ))}
            </div>
          </div>
        )}

        {/* === A-04: FORNECEDORES & PRODUTOS (US-06) === */}
        {activeTab === 'produtos' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-xl bg-[#EFE9E1] border border-[#E3DBD0]">
                <button
                  onClick={() => setCatalogSubTab('produtos')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    catalogSubTab === 'produtos' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
                  }`}
                >
                  Produtos ({products.length})
                </button>
                <button
                  onClick={() => setCatalogSubTab('fornecedores')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    catalogSubTab === 'fornecedores' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
                  }`}
                >
                  Fornecedores ({suppliers.length})
                </button>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={openNewSupplierModal}>
                  <Building2 className="w-4 h-4" /> Novo fornecedor
                </Button>
                <Button variant="primary" size="sm" onClick={openNewProductModal}>
                  <Plus className="w-4 h-4" /> Novo produto
                </Button>
              </div>
            </div>

            {catalogSubTab === 'produtos' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prd) => {
                  const sup = suppliers.find((s) => s.id === prd.supplierId);
                  const profit = calculateProductProfit(prd.costPrice, prd.salePrice);

                  return (
                    <SectionCard key={prd.id} className="p-4 flex flex-col justify-between gap-3">
                      <div>
                        <ProductEditorialArt
                          type={prd.visualType}
                          accent={prd.accentTone}
                          className="w-full h-28 rounded-xl"
                        />
                        <div className="flex items-center justify-between mt-3 gap-2">
                          <span className="text-[11px] font-medium text-[#8B7F77]">
                            {sup?.companyName ?? 'Fornecedor'}
                          </span>
                          <Badge tone={prd.active ? 'sage' : 'neutral'}>
                            {prd.active ? 'Ativo na vitrine' : 'Desativado'}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-sm mt-1">{prd.name}</h3>

                        <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#8B7F77]">Custo</span>
                            <span className="font-mono-num">{formatCurrency(prd.costPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8B7F77]">Venda</span>
                            <span className="font-mono-num font-bold">
                              {formatCurrency(prd.salePrice)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-[#E3DBD0]">
                            <span className="text-[#5A4F48] font-medium">Lucro</span>
                            {profit.isFreeSample ? (
                              <span className="font-semibold text-[#38664E]">
                                Amostra grátis (Brinde)
                              </span>
                            ) : (
                              <span
                                className={`font-mono-num font-bold ${
                                  profit.isNegativeMargin ? 'text-[#B43B3B]' : 'text-[#38664E]'
                                }`}
                              >
                                {formatCurrency(profit.profitValue)} ({profit.percentDisplay})
                              </span>
                            )}
                          </div>
                        </div>

                        {profit.isNegativeMargin && (
                          <div className="mt-2 p-2 rounded-lg bg-[#FAE6E6] text-[#922B2B] text-[11px] font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Venda abaixo do custo: gera lucro negativo nos relatórios.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EFE9E1]">
                        <button
                          onClick={() => toggleProductActive(prd.id)}
                          className="text-xs font-semibold text-[#5A4F48] hover:text-[#1F1815] flex items-center gap-1 cursor-pointer"
                        >
                          {prd.active ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Desativar vitrine
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Reativar vitrine
                            </>
                          )}
                        </button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setProductError(null);
                            setEditingProduct(JSON.parse(JSON.stringify(prd)));
                            setProductModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.map((sup) => {
                  const linkedCount = products.filter((p) => p.supplierId === sup.id).length;
                  return (
                    <SectionCard key={sup.id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-mono-num text-[#8B7F77]">
                            {linkedCount} produto(s) vinculado(s)
                          </span>
                          <h3 className="font-display text-lg font-semibold mt-0.5">
                            {sup.companyName}
                          </h3>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingSupplier(JSON.parse(JSON.stringify(sup)));
                            setSupplierModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                      <div className="text-xs text-[#5A4F48] space-y-1">
                        <div>
                          <strong>Representante:</strong> {sup.representativeName}
                        </div>
                        <div>
                          <strong>Contato:</strong> {sup.phone}
                        </div>
                        {sup.notes && <div className="italic pt-1">{sup.notes}</div>}
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === A-05: RELATÓRIOS DE VENDAS, REPASSES & RANKING (US-07 & US-13) === */}
        {activeTab === 'relatorios' && (
          <div className="space-y-5">
            {/* Filtro de período */}
            <SectionCard className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Relatórios do Período (US-07 & US-13)
                </h2>
                <p className="text-xs text-[#5A4F48]">
                  Contabiliza exclusivamente atendimentos e pedidos finalizados como{' '}
                  <strong>Pago</strong> (brindes não entram nas vendas).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D9CFC3] font-mono-num"
                />
                <span>até</span>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D9CFC3] font-mono-num"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setPeriodStart(todayISO);
                    setPeriodEnd(todayISO);
                  }}
                >
                  Só hoje
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setPeriodStart(addDaysISO(todayISO, -30));
                    setPeriodEnd(addDaysISO(todayISO, 1));
                  }}
                >
                  Últimos 30 dias
                </Button>
              </div>
            </SectionCard>

            {/* Sub-abas do Relatório */}
            <div className="inline-flex p-1 rounded-xl bg-[#EFE9E1] border border-[#E3DBD0]">
              <button
                onClick={() => setReportSubTab('vendas')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  reportSubTab === 'vendas' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
                }`}
              >
                Vendas do Período
              </button>
              <button
                onClick={() => setReportSubTab('repasses')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  reportSubTab === 'repasses' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
                }`}
              >
                Repasse das Profissionais (US-07)
              </button>
              <button
                onClick={() => setReportSubTab('produtos')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  reportSubTab === 'produtos' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
                }`}
              >
                Lucro dos Produtos & Ranking (US-13)
              </button>
            </div>

            {reportSubTab === 'vendas' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SectionCard className="p-5">
                    <div className="text-xs text-[#8B7F77]">Serviços Pagos ({paidAppointmentsInPeriod.length})</div>
                    <div className="font-display text-3xl font-semibold mt-1 tabular-nums">
                      {formatCurrency(totalServicesRevenue)}
                    </div>
                  </SectionCard>
                  <SectionCard className="p-5">
                    <div className="text-xs text-[#8B7F77]">Produtos Pagos ({paidOrdersInPeriod.length})</div>
                    <div className="font-display text-3xl font-semibold mt-1 tabular-nums">
                      {formatCurrency(totalProductsRevenue)}
                    </div>
                  </SectionCard>
                  <SectionCard className="p-5 bg-[#1F1815] text-[#FAF7F2]">
                    <div className="text-xs text-[#C8BCB3]">Total Geral Faturado</div>
                    <div className="font-display text-3xl font-semibold mt-1 tabular-nums">
                      {formatCurrency(totalServicesRevenue + totalProductsRevenue)}
                    </div>
                  </SectionCard>
                </div>

                <SectionCard className="p-5 space-y-3">
                  <h3 className="font-display text-lg font-semibold">
                    Lançamentos pagos contabilizados no período
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#E3DBD0] text-[#8B7F77]">
                        <tr>
                          <th className="py-2 pr-3">Data</th>
                          <th className="py-2 pr-3">Tipo</th>
                          <th className="py-2 pr-3">Cliente / Descrição</th>
                          <th className="py-2 pr-3">Forma</th>
                          <th className="py-2 text-right">Valor Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE9E1]">
                        {paidAppointmentsInPeriod.map((a) => (
                          <tr key={a.id}>
                            <td className="py-2.5 pr-3 font-mono-num">{formatDateBR(a.date)}</td>
                            <td className="py-2.5 pr-3">
                              <Badge tone="terracotta">Serviço</Badge>
                            </td>
                            <td className="py-2.5 pr-3">
                              <strong>{a.clientName}</strong> · {a.serviceName} ({a.staffName})
                            </td>
                            <td className="py-2.5 pr-3 uppercase font-mono-num">
                              {a.payment?.method ?? 'pix'}
                            </td>
                            <td className="py-2.5 text-right font-mono-num font-bold">
                              {formatCurrency(a.payment?.finalAmount ?? a.servicePrice)}
                            </td>
                          </tr>
                        ))}
                        {paidOrdersInPeriod.map((o) => {
                          const val =
                            o.payment?.finalAmount ??
                            o.items.reduce((s, it) => s + it.unitSalePrice * it.quantity, 0);
                          return (
                            <tr key={o.id}>
                              <td className="py-2.5 pr-3 font-mono-num">
                                {formatDateBR(o.createdAt.slice(0, 10))}
                              </td>
                              <td className="py-2.5 pr-3">
                                <Badge tone="sage">Produto</Badge>
                              </td>
                              <td className="py-2.5 pr-3">
                                <strong>{o.clientName}</strong> · {o.code} (
                                {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')})
                              </td>
                              <td className="py-2.5 pr-3 uppercase font-mono-num">
                                {o.payment?.method ?? 'pix'}
                              </td>
                              <td className="py-2.5 text-right font-mono-num font-bold">
                                {formatCurrency(val)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            )}

            {reportSubTab === 'repasses' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#1F1815] text-[#FAF7F2] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#C8BCB3]">
                      Total consolidado de folha e repasses no período
                    </div>
                    <div className="font-display text-3xl font-semibold tabular-nums">
                      {formatCurrency(totalStaffPayouts)}
                    </div>
                  </div>
                  <div className="text-xs text-[#D3C8BF]">
                    Calculado automaticamente pelas regras de Parceira (Lei 13.352/2016), CLT com
                    comissão e CLT sem comissão.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffPayouts.map((sp) => (
                    <SectionCard key={sp.staff.id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg font-semibold">{sp.staff.name}</h3>
                          <div className="text-xs text-[#5A4F48]">
                            {sp.staff.employmentType === 'parceira'
                              ? 'Profissional-parceira (Lei 13.352/2016)'
                              : sp.staff.employmentType === 'clt_comissao'
                                ? 'CLT com comissão'
                                : 'CLT sem comissão'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPayoutDetailModal(sp)}
                        >
                          Ver extrato
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#E3DBD0]">
                        <div>
                          <div className="text-[#8B7F77]">Fixo</div>
                          <div className="font-mono-num font-semibold mt-0.5">
                            {formatCurrency(sp.fixedSalary)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#8B7F77]">Comissão</div>
                          <div className="font-mono-num font-semibold mt-0.5 text-[#38664E]">
                            {formatCurrency(sp.commissionEarned)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#8B7F77]">Total a pagar</div>
                          <div className="font-mono-num font-bold mt-0.5 text-[#1F1815]">
                            {formatCurrency(sp.totalPayout)}
                          </div>
                        </div>
                      </div>

                      {sp.staff.employmentType === 'parceira' && (
                        <div className="text-xs text-[#5A4F48] flex justify-between">
                          <span>Cota-parte retida pelo salão:</span>
                          <strong className="font-mono-num">{formatCurrency(sp.salonShare)}</strong>
                        </div>
                      )}
                    </SectionCard>
                  ))}
                </div>
              </div>
            )}

            {reportSubTab === 'produtos' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SectionCard className="p-5">
                    <div className="text-xs text-[#8B7F77]">Receita de Produtos Pagos</div>
                    <div className="font-display text-2xl font-semibold mt-1 tabular-nums">
                      {formatCurrency(totalProductsRevenue)}
                    </div>
                  </SectionCard>
                  <SectionCard className="p-5">
                    <div className="text-xs text-[#8B7F77]">
                      Lucro Líquido Real (inclui margem negativa)
                    </div>
                    <div
                      className={`font-display text-2xl font-semibold mt-1 tabular-nums ${
                        totalProductsProfit >= 0 ? 'text-[#38664E]' : 'text-[#B43B3B]'
                      }`}
                    >
                      {formatCurrency(totalProductsProfit)}
                    </div>
                  </SectionCard>
                  <SectionCard className="p-5">
                    <div className="text-xs text-[#8B7F77]">Saídas como Brinde (fora das vendas)</div>
                    <div className="font-display text-2xl font-semibold mt-1 tabular-nums">
                      {giftOrdersInPeriod.length} pedido(s)
                    </div>
                  </SectionCard>
                </div>

                {/* Ranking US-13: ordena por quantidade vendida e mostra lucro em REAIS, nunca percentual */}
                <SectionCard className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        Ranking de Produtos Mais e Menos Vendidos (US-13)
                      </h3>
                      <p className="text-xs text-[#5A4F48]">
                        Ordenado por quantidade vendida, exibindo o lucro em reais (R$) — nunca
                        percentual.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setRankingOrder((r) => (r === 'mais' ? 'menos' : 'mais'))
                      }
                    >
                      <ArrowDownUp className="w-3.5 h-3.5" />
                      {rankingOrder === 'mais'
                        ? 'Ordem: Mais vendidos'
                        : 'Ordem: Menos vendidos'}
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[#E3DBD0] text-[#8B7F77]">
                        <tr>
                          <th className="py-2 pr-3">#</th>
                          <th className="py-2 pr-3">Produto</th>
                          <th className="py-2 pr-3 text-right">Qtd. vendida</th>
                          <th className="py-2 pr-3 text-right">Faturamento</th>
                          <th className="py-2 text-right">Lucro (R$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFE9E1]">
                        {productSalesSummary.map((row, idx) => (
                          <tr key={row.productId}>
                            <td className="py-2.5 pr-3 font-mono-num text-[#8B7F77]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 pr-3 font-semibold">{row.productName}</td>
                            <td className="py-2.5 pr-3 text-right font-mono-num font-bold">
                              {row.qtySold} un.
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono-num">
                              {formatCurrency(row.revenue)}
                            </td>
                            <td
                              className={`py-2.5 text-right font-mono-num font-bold ${
                                row.profitReais < 0
                                  ? 'text-[#B43B3B]'
                                  : row.profitReais > 0
                                    ? 'text-[#38664E]'
                                    : 'text-[#8B7F77]'
                              }`}
                            >
                              {formatCurrency(row.profitReais)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

                {giftOrdersInPeriod.length > 0 && (
                  <SectionCard className="p-4 bg-[#FAF7F2]">
                    <div className="text-xs font-semibold flex items-center gap-1.5 text-[#28503B]">
                      <Gift className="w-4 h-4" /> Amostras grátis entregues como brinde (não
                      entram no faturamento nem lucro):
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-[#5A4F48]">
                      {giftOrdersInPeriod.map((g) => (
                        <div key={g.id}>
                          {g.code} · {g.clientName} ·{' '}
                          {g.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>
            )}
          </div>
        )}

        {/* === A-06: BANNERS DA VITRINE (US-14) === */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Banners da Vitrine (US-14)
                </h2>
                <p className="text-xs text-[#5A4F48]">
                  Controla os destaques exibidos na tela inicial da Juliana (Cliente).
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={openNewBannerModal}>
                <Plus className="w-4 h-4" /> Novo banner
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <SectionCard key={b.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge tone={b.active ? 'sage' : 'neutral'}>
                      {b.active ? 'Visível na vitrine' : 'Pausado'}
                    </Badge>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingBanner(JSON.parse(JSON.stringify(b)));
                          setBannerModalOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBanner(b.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#922B2B]" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono-num uppercase text-[#B85D43]">
                      {b.tag}
                    </div>
                    <h3 className="font-display text-lg font-semibold mt-0.5">{b.title}</h3>
                    <p className="text-xs text-[#5A4F48] mt-1">{b.subtitle}</p>
                  </div>
                  <div className="text-xs text-[#8B7F77]">
                    Botão: <strong>{b.ctaLabel}</strong> → Aba{' '}
                    <code className="font-mono-num">{b.targetTab}</code>
                  </div>
                </SectionCard>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* POP-A01 · Modal Cadastrar / Editar Profissional (US-05) */}
      <Modal
        open={staffModalOpen && !!editingStaff}
        onClose={() => setStaffModalOpen(false)}
        badge="Popup POP-A01 · Equipe & Remuneração (US-05)"
        title={editingStaff?.name ? `Editar ${editingStaff.name}` : 'Cadastrar colaboradora'}
        maxWidthClass="max-w-2xl"
      >
        {editingStaff && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Nome na agenda
                </label>
                <input
                  value={editingStaff.name}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, name: e.target.value })
                  }
                  placeholder="Ex: Patrícia"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Nome completo
                </label>
                <input
                  value={editingStaff.fullName}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Função
                </label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => {
                    const role = e.target.value as StaffRole;
                    const isRec = role === 'recepcionista';
                    setEditingStaff({
                      ...editingStaff,
                      role,
                      isReceptionist: isRec,
                      specialtyLabel:
                        role === 'cabeleireira'
                          ? 'Cabeleireira'
                          : role === 'manicure'
                            ? 'Manicure'
                            : role === 'sobrancelha'
                              ? 'Designer de Sobrancelha'
                              : 'Recepção & Caixa',
                      employmentType: isRec ? 'clt_sem_comissao' : editingStaff.employmentType,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm bg-white"
                >
                  <option value="cabeleireira">Cabeleireira</option>
                  <option value="manicure">Manicure</option>
                  <option value="sobrancelha">Designer de Sobrancelha</option>
                  <option value="recepcionista">Recepcionista (sempre CLT sem comissão)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Vínculo de remuneração
                </label>
                <select
                  disabled={editingStaff.isReceptionist}
                  value={editingStaff.employmentType}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      employmentType: e.target.value as EmploymentType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm bg-white disabled:bg-[#EFE9E1]"
                >
                  <option value="parceira">Profissional-parceira (Lei 13.352/2016)</option>
                  <option value="clt_comissao">CLT com comissão</option>
                  <option value="clt_sem_comissao">CLT sem comissão</option>
                </select>
              </div>
            </div>

            {/* Campos dinâmicos conforme vínculo (US-05) */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E3DBD0] space-y-3">
              {editingStaff.employmentType !== 'parceira' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                    Salário fixo mensal (R$)
                  </label>
                  <input
                    type="number"
                    value={editingStaff.fixedSalary}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        fixedSalary: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] bg-white font-mono-num text-sm"
                  />
                </div>
              )}

              {editingStaff.employmentType !== 'clt_sem_comissao' && !editingStaff.isReceptionist && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                      Percentual padrão por serviço (0% a 100%)
                    </label>
                    <input
                      type="number"
                      value={editingStaff.defaultCommissionPercent}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          defaultCommissionPercent: Number(e.target.value),
                        })
                      }
                      className={`w-full px-3 py-2 rounded-xl border bg-white font-mono-num text-sm ${
                        editingStaff.defaultCommissionPercent < 0 ||
                        editingStaff.defaultCommissionPercent > 100
                          ? 'border-[#B43B3B] bg-[#FAE6E6]'
                          : 'border-[#D9CFC3]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#5A4F48] mb-1.5">
                      Percentual específico por serviço (0% a 100%)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {services.map((srv) => {
                        const val =
                          editingStaff.serviceCommissions[srv.id] ??
                          editingStaff.defaultCommissionPercent;
                        const invalid = val < 0 || val > 100;
                        return (
                          <div
                            key={srv.id}
                            className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#E3DBD0] text-xs"
                          >
                            <span className="truncate">{srv.name}</span>
                            <input
                              type="number"
                              value={val}
                              onChange={(e) =>
                                setEditingStaff({
                                  ...editingStaff,
                                  serviceCommissions: {
                                    ...editingStaff.serviceCommissions,
                                    [srv.id]: Number(e.target.value),
                                  },
                                })
                              }
                              className={`w-16 px-1.5 py-1 rounded border text-right font-mono-num ${
                                invalid ? 'border-[#B43B3B] bg-[#FAE6E6]' : 'border-[#D9CFC3]'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Escala Semanal */}
            <div>
              <div className="text-xs font-semibold text-[#5A4F48] mb-1.5">
                Escala semanal (dias e horários exibidos na vitrine US-01)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WEEKDAYS.map((w) => {
                  const dayCfg = editingStaff.schedule[w.dow] ?? {
                    enabled: false,
                    start: '09:00',
                    end: '18:00',
                  };
                  return (
                    <div
                      key={w.dow}
                      className="p-2 rounded-xl border border-[#E3DBD0] bg-[#FAF7F2] text-xs space-y-1"
                    >
                      <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayCfg.enabled}
                          onChange={(e) =>
                            setEditingStaff({
                              ...editingStaff,
                              schedule: {
                                ...editingStaff.schedule,
                                [w.dow]: { ...dayCfg, enabled: e.target.checked },
                              },
                            })
                          }
                        />
                        {w.label}
                      </label>
                      {dayCfg.enabled && (
                        <div className="flex gap-1 font-mono-num text-[10px]">
                          <input
                            type="time"
                            value={dayCfg.start}
                            onChange={(e) =>
                              setEditingStaff({
                                ...editingStaff,
                                schedule: {
                                  ...editingStaff.schedule,
                                  [w.dow]: { ...dayCfg, start: e.target.value },
                                },
                              })
                            }
                            className="w-full px-1 py-0.5 rounded border border-[#D9CFC3] bg-white"
                          />
                          <input
                            type="time"
                            value={dayCfg.end}
                            onChange={(e) =>
                              setEditingStaff({
                                ...editingStaff,
                                schedule: {
                                  ...editingStaff.schedule,
                                  [w.dow]: { ...dayCfg, end: e.target.value },
                                },
                              })
                            }
                            className="w-full px-1 py-0.5 rounded border border-[#D9CFC3] bg-white"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {staffError && (
              <div className="p-3 rounded-xl bg-[#FAE6E6] border border-[#ECC4C4] text-xs text-[#922B2B] font-semibold">
                {staffError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!editingStaff.name.trim()) {
                    setStaffError('Informe o nome na agenda.');
                    return;
                  }
                  const res = saveStaffMember(editingStaff);
                  if (!res.ok) {
                    setStaffError(res.error);
                    return;
                  }
                  setStaffModalOpen(false);
                }}
              >
                Salvar colaboradora
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-A02 · Troca Pontual na Escala (US-12) */}
      <Modal
        open={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        badge="Popup POP-A02 · Troca na Escala (US-12)"
        title="Registrar ajuste pontual em uma data"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Profissional</label>
            <select
              value={ovrStaffId}
              onChange={(e) => setOvrStaffId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm bg-white"
            >
              {staff
                .filter((s) => !s.isReceptionist)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Data</label>
              <input
                type="date"
                value={ovrDate}
                onChange={(e) => setOvrDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-mono-num"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={ovrEnabled}
                  onChange={(e) => setOvrEnabled(e.target.checked)}
                />
                Atende nesta data
              </label>
            </div>
          </div>
          {ovrEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Início</label>
                <input
                  type="time"
                  value={ovrStart}
                  onChange={(e) => setOvrStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Fim</label>
                <input
                  type="time"
                  value={ovrEnd}
                  onChange={(e) => setOvrEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-mono-num"
                />
              </div>
            </div>
          )}
          <input
            value={ovrReason}
            onChange={(e) => setOvrReason(e.target.value)}
            placeholder="Motivo da troca"
            className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOverrideModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                addScheduleOverride({
                  staffId: ovrStaffId,
                  date: ovrDate,
                  enabled: ovrEnabled,
                  start: ovrStart,
                  end: ovrEnd,
                  reason: ovrReason,
                  createdBy: 'Dona Marta',
                });
                setOverrideModalOpen(false);
              }}
            >
              Aplicar troca
            </Button>
          </div>
        </div>
      </Modal>

      {/* POP-A03 · Serviço */}
      <Modal
        open={serviceModalOpen && !!editingService}
        onClose={() => setServiceModalOpen(false)}
        badge="Popup POP-A03 · Cadastro de Serviço"
        title={editingService?.name || 'Novo serviço'}
      >
        {editingService && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Nome do serviço
              </label>
              <input
                value={editingService.name}
                onChange={(e) =>
                  setEditingService({ ...editingService, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Categoria
                </label>
                <select
                  value={editingService.category}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      category: e.target.value as ServiceCategory,
                    })
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-[#D9CFC3] text-xs bg-white"
                >
                  <option value="cabelo">Cabelo</option>
                  <option value="unhas">Unhas</option>
                  <option value="sobrancelha">Sobrancelha</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={editingService.durationMin}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      durationMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-[#D9CFC3] text-xs font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  value={editingService.price}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-[#D9CFC3] text-xs font-mono-num"
                />
              </div>
            </div>
            <textarea
              value={editingService.description}
              onChange={(e) =>
                setEditingService({ ...editingService, description: e.target.value })
              }
              rows={2}
              placeholder="Descrição para a vitrine"
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
            />
            <div>
              <div className="text-xs font-semibold text-[#5A4F48] mb-1.5">
                Profissionais que realizam este serviço
              </div>
              <div className="flex flex-wrap gap-2">
                {staff
                  .filter((s) => !s.isReceptionist)
                  .map((prof) => {
                    const checked = editingService.professionalIds.includes(prof.id);
                    return (
                      <label
                        key={prof.id}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                          checked
                            ? 'bg-[#1F1815] text-white border-[#1F1815]'
                            : 'bg-[#FAF7F2] text-[#5A4F48] border-[#E3DBD0]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...editingService.professionalIds, prof.id]
                              : editingService.professionalIds.filter((id) => id !== prof.id);
                            setEditingService({ ...editingService, professionalIds: next });
                          }}
                          className="sr-only"
                        />
                        {prof.name}
                      </label>
                    );
                  })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={editingService.active}
                onChange={(e) =>
                  setEditingService({ ...editingService, active: e.target.checked })
                }
              />
              Serviço ativo na vitrine
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setServiceModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!editingService.name.trim()) return;
                  saveService(editingService);
                  setServiceModalOpen(false);
                }}
              >
                Salvar serviço
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-A04 · Fornecedor (US-06) */}
      <Modal
        open={supplierModalOpen && !!editingSupplier}
        onClose={() => setSupplierModalOpen(false)}
        badge="Popup POP-A04 · Fornecedor (US-06)"
        title={editingSupplier?.companyName || 'Cadastrar fornecedor'}
      >
        {editingSupplier && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Nome da empresa
              </label>
              <input
                value={editingSupplier.companyName}
                onChange={(e) =>
                  setEditingSupplier({ ...editingSupplier, companyName: e.target.value })
                }
                placeholder="Ex: Distribuidora Beleza Pura Ltda"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Representante comercial
              </label>
              <input
                value={editingSupplier.representativeName}
                onChange={(e) =>
                  setEditingSupplier({
                    ...editingSupplier,
                    representativeName: e.target.value,
                  })
                }
                placeholder="Ex: Marcos Tavares"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Telefone</label>
              <input
                value={editingSupplier.phone}
                onChange={(e) =>
                  setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSupplierModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!editingSupplier.companyName.trim() || !editingSupplier.representativeName.trim()) {
                    pushToast({
                      type: 'error',
                      title: 'Preencha empresa e representante comercial.',
                    });
                    return;
                  }
                  saveSupplier(editingSupplier);
                  setSupplierModalOpen(false);
                }}
              >
                Salvar fornecedor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-A05 · Produto com Cálculo ao Vivo de Lucro & Margem (US-06) */}
      <Modal
        open={productModalOpen && !!editingProduct}
        onClose={() => setProductModalOpen(false)}
        badge="Popup POP-A05 · Produto & Margem (US-06)"
        title={editingProduct?.name || 'Cadastrar produto'}
      >
        {editingProduct && (() => {
          const preview = calculateProductProfit(
            editingProduct.costPrice,
            editingProduct.salePrice,
          );
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Nome do produto
                </label>
                <input
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                    Fornecedor
                  </label>
                  <select
                    value={editingProduct.supplierId}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, supplierId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Marca</label>
                  <input
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                    Preço de custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice}
                    onChange={(e) => {
                      setProductError(null);
                      setEditingProduct({
                        ...editingProduct,
                        costPrice: Number(e.target.value),
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-xl border font-mono-num text-sm ${
                      editingProduct.costPrice < 0
                        ? 'border-[#B43B3B] bg-[#FAE6E6]'
                        : 'border-[#D9CFC3]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                    Preço de venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.salePrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] font-mono-num text-sm"
                  />
                </div>
              </div>

              {/* Simulador de Lucro ao vivo (US-06) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E3DBD0] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#5A4F48] font-semibold">Lucro calculado do salão</span>
                  {preview.isFreeSample ? (
                    <Badge tone="sage">Amostra grátis (Brinde — fora das vendas)</Badge>
                  ) : (
                    <span
                      className={`font-mono-num text-base font-bold ${
                        preview.isNegativeMargin ? 'text-[#B43B3B]' : 'text-[#38664E]'
                      }`}
                    >
                      {formatCurrency(preview.profitValue)} ({preview.percentDisplay})
                    </span>
                  )}
                </div>

                {preview.isZeroCostSale && (
                  <div className="text-[11px] text-[#5A4F48]">
                    Custo zero com venda positiva: o lucro é o valor inteiro da venda e o
                    percentual aparece como &ldquo;—&rdquo; (não se aplica).
                  </div>
                )}

                {preview.isNegativeMargin && (
                  <div className="p-2.5 rounded-xl bg-[#FBF0DC] border border-[#EDD6A9] text-[#8B5910] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Aviso:</strong> preço de venda menor que o custo. O sistema aceita o
                      cadastro, mas o lucro entrará negativo nos relatórios.
                    </span>
                  </div>
                )}
              </div>

              {productError && (
                <div className="p-3 rounded-xl bg-[#FAE6E6] border border-[#ECC4C4] text-xs text-[#922B2B] font-semibold">
                  {productError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setProductModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!editingProduct.name.trim()) {
                      setProductError('Informe o nome do produto.');
                      return;
                    }
                    const res = saveProduct(editingProduct);
                    if (!res.ok) {
                      setProductError(res.error);
                      return;
                    }
                    setProductModalOpen(false);
                  }}
                >
                  Salvar produto
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* POP-A06 · Extrato Detalhado do Repasse da Profissional */}
      <Modal
        open={!!payoutDetailModal}
        onClose={() => setPayoutDetailModal(null)}
        badge="Popup POP-A06 · Conferência de Repasse (US-07)"
        title={`Extrato · ${payoutDetailModal?.staff.name ?? ''}`}
        subtitle={`Total a pagar: ${formatCurrency(payoutDetailModal?.totalPayout ?? 0)}`}
      >
        {payoutDetailModal && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] space-y-1">
              <div className="flex justify-between">
                <span>Salário fixo</span>
                <strong className="font-mono-num">
                  {formatCurrency(payoutDetailModal.fixedSalary)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Comissão total ({payoutDetailModal.paidCount} serviços pagos)</span>
                <strong className="font-mono-num text-[#38664E]">
                  {formatCurrency(payoutDetailModal.commissionEarned)}
                </strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E3DBD0] text-sm">
                <strong>Total do repasse</strong>
                <strong className="font-mono-num">
                  {formatCurrency(payoutDetailModal.totalPayout)}
                </strong>
              </div>
            </div>

            {payoutDetailModal.items.length === 0 ? (
              <div className="text-[#8B7F77]">Sem atendimentos comissionados pagos no período.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {payoutDetailModal.items.map((it) => (
                  <div
                    key={it.appointment.id}
                    className="p-2.5 rounded-xl border border-[#E3DBD0] flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">
                        {formatDateBR(it.appointment.date)} · {it.appointment.clientName}
                      </div>
                      <div className="text-[#5A4F48]">
                        {it.appointment.serviceName} ({it.percentApplied}%)
                      </div>
                    </div>
                    <div className="text-right font-mono-num">
                      <div className="font-bold text-[#38664E]">+{formatCurrency(it.staffCut)}</div>
                      <div className="text-[10px] text-[#8B7F77]">
                        Salão: {formatCurrency(it.salonCut)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* POP-A07 · Banner da Vitrine (US-14) */}
      <Modal
        open={bannerModalOpen && !!editingBanner}
        onClose={() => setBannerModalOpen(false)}
        badge="Popup POP-A07 · Banner Vitrine (US-14)"
        title={editingBanner?.title || 'Novo banner promocional'}
      >
        {editingBanner && (
          <div className="space-y-4">
            <input
              value={editingBanner.tag}
              onChange={(e) => setEditingBanner({ ...editingBanner, tag: e.target.value })}
              placeholder="Etiqueta (ex: Agenda Online 24h)"
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
            />
            <input
              value={editingBanner.title}
              onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
              placeholder="Título principal do banner"
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-semibold"
            />
            <textarea
              value={editingBanner.subtitle}
              onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
              rows={2}
              placeholder="Subtítulo curto"
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editingBanner.theme}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    theme: e.target.value as VitrineBanner['theme'],
                  })
                }
                className="px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs bg-white"
              >
                <option value="terracotta">Tema Terracota</option>
                <option value="espresso">Tema Espresso</option>
                <option value="sage">Tema Verde Sálvia</option>
                <option value="sand">Tema Areia Clara</option>
              </select>
              <select
                value={editingBanner.targetTab}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    targetTab: e.target.value as 'servicos' | 'produtos',
                  })
                }
                className="px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs bg-white"
              >
                <option value="servicos">Direcionar p/ Serviços</option>
                <option value="produtos">Direcionar p/ Produtos</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={editingBanner.active}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, active: e.target.checked })
                }
              />
              Exibir na vitrine inicial da cliente
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setBannerModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!editingBanner.title.trim()) return;
                  saveBanner(editingBanner);
                  setBannerModalOpen(false);
                }}
              >
                Salvar banner
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
