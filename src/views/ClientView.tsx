import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  IPrettyWordmark,
  ProductEditorialArt,
  ServiceEditorialArt,
} from '../components/brand/BrandAssets';
import {
  AppointmentStatusBadge,
  Badge,
  Button,
  Modal,
  OrderStatusBadge,
  PhoneFrame,
} from '../components/ui/Primitives';
import { useSalon } from '../context/SalonContext';
import { Appointment, Product, ProductOrder, ServiceCategory, ServiceItem } from '../types/salon';
import {
  addDaysISO,
  formatCurrency,
  formatDateBR,
  formatDateShortBR,
  getAvailableTimeSlots,
} from '../utils/calculations';

export type ClientTab = 'inicio' | 'agendar' | 'produtos' | 'meus' | 'lembrete' | 'perfil';

export type ClientModalType =
  | 'detalhe-servico'
  | 'conflito'
  | 'confirmacao-agendamento'
  | 'detalhe-produto'
  | 'sacola'
  | 'confirmacao-pedido'
  | 'remarcar'
  | 'cancelar'
  | 'detalhe-pedido';

export interface ClientViewProps {
  embedded?: boolean;
  initialTab?: ClientTab;
  initialMeusSubTab?: 'agendamentos' | 'pedidos';
  initialAgendarStep?: 'catalogo' | 'horarios';
  initialModal?: ClientModalType;
}

export const ClientView: React.FC<ClientViewProps> = ({
  embedded = false,
  initialTab = 'inicio',
  initialMeusSubTab = 'agendamentos',
  initialAgendarStep = 'catalogo',
  initialModal,
}) => {
  const {
    services,
    staff,
    products,
    appointments,
    orders,
    overrides,
    timeOffBlocks,
    banners,
    clients,
    activeClientId,
    todayISO,
    simulatedTimeHHMM,
    navIntent,
    clearNavIntent,
    createAppointment,
    createProductOrder,
    confirmAppointmentByReminder,
    cancelAppointment,
    rescheduleAppointment,
    pushToast,
  } = useSalon();

  const currentClient = clients.find((c) => c.id === activeClientId) ?? clients[0];

  const [activeTab, setActiveTab] = useState<ClientTab>(initialTab);
  const [agendarStep, setAgendarStep] = useState<'catalogo' | 'horarios'>(initialAgendarStep);
  const [responsiveMode, setResponsiveMode] = useState<'mobile' | 'full'>('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<'todas' | ServiceCategory>('todas');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('Todos');

  // Booking Flow State (C-03)
  const [bookingService, setBookingService] = useState<ServiceItem | null>(services[0] ?? null);
  const [bookingStaffId, setBookingStaffId] = useState<string>(services[0]?.professionalIds[0] ?? 'staff-marta');
  const [bookingDate, setBookingDate] = useState<string>(todayISO);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [simulateConflict, setSimulateConflict] = useState(false);

  // Cart State (US-02)
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>(() => {
    if (initialModal === 'sacola') {
      const firstActive = products.find((p) => p.active);
      return firstActive ? [{ productId: firstActive.id, quantity: 1 }] : [];
    }
    return [];
  });
  const [orderNotes, setOrderNotes] = useState('');

  // Popups State (POP-C01 .. POP-C09)
  const [detailServiceModal, setDetailServiceModal] = useState<ServiceItem | null>(null);
  const [conflictErrorModal, setConflictErrorModal] = useState<string | null>(null);
  const [confirmedAppointmentModal, setConfirmedAppointmentModal] = useState<Appointment | null>(null);
  const [detailProductModal, setDetailProductModal] = useState<Product | null>(null);
  const [bagModalOpen, setBagModalOpen] = useState(false);
  const [confirmedOrderModal, setConfirmedOrderModal] = useState<ProductOrder | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(todayISO);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [orderDetailModal, setOrderDetailModal] = useState<ProductOrder | null>(null);
  const [meusSubTab, setMeusSubTab] = useState<'agendamentos' | 'pedidos'>(initialMeusSubTab);

  useEffect(() => {
    if (!initialModal) return;
    if (initialModal === 'detalhe-servico') setDetailServiceModal(services[0] ?? null);
    if (initialModal === 'conflito') {
      setConflictErrorModal('horário indisponível, escolha outro');
    }
    if (initialModal === 'confirmacao-agendamento') {
      setConfirmedAppointmentModal(
        appointments.find((a) => a.clientId === currentClient.id) ?? appointments[0] ?? null,
      );
    }
    if (initialModal === 'detalhe-produto') {
      setDetailProductModal(products.find((p) => p.active) ?? products[0] ?? null);
    }
    if (initialModal === 'sacola') setBagModalOpen(true);
    if (initialModal === 'confirmacao-pedido') {
      setConfirmedOrderModal(orders[0] ?? null);
    }
    if (initialModal === 'remarcar') {
      const target =
        appointments.find(
          (a) => a.clientId === currentClient.id && a.status !== 'cancelado' && a.status !== 'pago',
        ) ??
        appointments[0] ??
        null;
      if (target) {
        setRescheduleTarget(target);
        setRescheduleDate(target.date);
        setRescheduleTime('');
      }
    }
    if (initialModal === 'cancelar') {
      const target =
        appointments.find(
          (a) => a.clientId === currentClient.id && a.status !== 'cancelado' && a.status !== 'pago',
        ) ??
        appointments[0] ??
        null;
      setCancelTarget(target);
    }
    if (initialModal === 'detalhe-pedido') {
      setOrderDetailModal(orders.find((o) => o.clientId === currentClient.id) ?? orders[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialModal]);

  useEffect(() => {
    if (embedded || !navIntent || navIntent.section !== 'cliente') return;
    if (navIntent.subTab) {
      setActiveTab(navIntent.subTab as ClientTab);
    }
    if (navIntent.openModal === 'sacola') setBagModalOpen(true);
    if (navIntent.openModal === 'detalhe-servico') setDetailServiceModal(services[0] ?? null);
    if (navIntent.openModal === 'detalhe-produto') setDetailProductModal(products.find((p) => p.active) ?? null);
    if (navIntent.openModal === 'conflito') setConflictErrorModal('horário indisponível, escolha outro');
    if (navIntent.openModal === 'confirmacao-agendamento') {
      setConfirmedAppointmentModal(appointments.find((a) => a.clientId === currentClient.id) ?? appointments[0] ?? null);
    }
    if (navIntent.openModal === 'confirmacao-pedido') {
      setConfirmedOrderModal(orders[0] ?? null);
    }
    if (navIntent.openModal === 'remarcar') {
      const target = appointments.find((a) => a.clientId === currentClient.id && a.status !== 'cancelado' && a.status !== 'pago') ?? appointments[0] ?? null;
      if (target) {
        setRescheduleTarget(target);
        setRescheduleDate(target.date);
        setRescheduleTime('');
      }
    }
    if (navIntent.openModal === 'cancelar') {
      const target = appointments.find((a) => a.clientId === currentClient.id && a.status !== 'cancelado' && a.status !== 'pago') ?? appointments[0] ?? null;
      setCancelTarget(target);
    }
    if (navIntent.openModal === 'detalhe-pedido') {
      setOrderDetailModal(orders.find((o) => o.clientId === currentClient.id) ?? orders[0] ?? null);
    }
    clearNavIntent();
  }, [navIntent, embedded]);

  const activeBanners = useMemo(
    () => banners.filter((b) => b.active).sort((a, b) => a.order - b.order),
    [banners],
  );
  const [bannerIdx, setBannerIdx] = useState(0);

  const activeServices = useMemo(() => services.filter((s) => s.active), [services]);
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);
  const serviceProfessionals = useMemo(
    () => staff.filter((s) => s.active && !s.isReceptionist),
    [staff],
  );

  const productCategories = useMemo(
    () => ['Todos', ...Array.from(new Set(activeProducts.map((p) => p.category)))],
    [activeProducts],
  );

  const nextSevenDays = useMemo(
    () => Array.from({ length: 8 }, (_, i) => addDaysISO(todayISO, i)),
    [todayISO],
  );

  const selectedBookingStaff =
    staff.find((s) => s.id === bookingStaffId) ?? serviceProfessionals[0];

  const availableSlots = useMemo(() => {
    if (!bookingService || !selectedBookingStaff) return [];
    return getAvailableTimeSlots({
      staff: selectedBookingStaff,
      serviceDurationMin: bookingService.durationMin,
      date: bookingDate,
      appointments,
      overrides,
      timeOffBlocks,
      minTimeHHMM: bookingDate === todayISO ? simulatedTimeHHMM : undefined,
    });
  }, [
    bookingService,
    selectedBookingStaff,
    bookingDate,
    appointments,
    overrides,
    timeOffBlocks,
    todayISO,
    simulatedTimeHHMM,
  ]);

  const rescheduleSlots = useMemo(() => {
    if (!rescheduleTarget) return [];
    const st = staff.find((s) => s.id === rescheduleTarget.staffId);
    if (!st) return [];
    return getAvailableTimeSlots({
      staff: st,
      serviceDurationMin: rescheduleTarget.serviceDurationMin,
      date: rescheduleDate,
      appointments,
      overrides,
      timeOffBlocks,
      excludeAppointmentId: rescheduleTarget.id,
      minTimeHHMM: rescheduleDate === todayISO ? simulatedTimeHHMM : undefined,
    });
  }, [
    rescheduleTarget,
    rescheduleDate,
    staff,
    appointments,
    overrides,
    timeOffBlocks,
    todayISO,
    simulatedTimeHHMM,
  ]);

  const myAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.clientId === currentClient.id)
        .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`)),
    [appointments, currentClient.id],
  );

  const myOrders = useMemo(
    () => orders.filter((o) => o.clientId === currentClient.id),
    [orders, currentClient.id],
  );

  const reminderCandidate = useMemo(
    () =>
      myAppointments.find((a) => a.status === 'aguardando_confirmacao') ??
      myAppointments.find((a) => a.status === 'confirmado'),
    [myAppointments],
  );

  const startBookingForService = (service: ServiceItem, preferredStaffId?: string) => {
    setBookingService(service);
    const validStaffId =
      preferredStaffId && service.professionalIds.includes(preferredStaffId)
        ? preferredStaffId
        : service.professionalIds[0] ?? serviceProfessionals[0]?.id ?? '';
    setBookingStaffId(validStaffId);
    setBookingTime('');
    setDetailServiceModal(null);
    setActiveTab('agendar');
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
    pushToast({
      type: 'success',
      title: 'Adicionado à sacola',
      description: product.name,
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const cartDetails = useMemo(
    () =>
      cart
        .map((c) => {
          const product = activeProducts.find((p) => p.id === c.productId);
          return product ? { ...c, product } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [cart, activeProducts],
  );

  const cartTotal = cartDetails.reduce(
    (sum, i) => sum + i.product.salePrice * i.quantity,
    0,
  );
  const cartCount = cartDetails.reduce((sum, i) => sum + i.quantity, 0);

  const handleConfirmBooking = () => {
    if (!bookingService || !selectedBookingStaff || !bookingTime) return;
    const res = createAppointment({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      serviceId: bookingService.id,
      staffId: selectedBookingStaff.id,
      date: bookingDate,
      startTime: bookingTime,
      source: 'vitrine',
      notes: bookingNotes,
      simulateRaceConflict: simulateConflict,
    });

    if (!res.ok) {
      setConflictErrorModal(res.error);
      setBookingTime('');
      setSimulateConflict(false);
      return;
    }

    setBookingTime('');
    setBookingNotes('');
    setConfirmedAppointmentModal(res.appointment);
  };

  const handleConfirmOrder = () => {
    const res = createProductOrder({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      items: cart,
      notes: orderNotes,
    });

    if (!res.ok) {
      pushToast({ type: 'error', title: res.error });
      return;
    }

    setCart([]);
    setOrderNotes('');
    setBagModalOpen(false);
    setConfirmedOrderModal(res.order);
  };

  const bannerThemeClasses = {
    terracotta: 'bg-[#B85D43] text-[#FAF7F2]',
    espresso: 'bg-[#1F1815] text-[#FAF7F2]',
    sage: 'bg-[#38664E] text-[#FAF7F2]',
    sand: 'bg-[#EFE9E1] text-[#1F1815] border border-[#D9CFC3]',
  };

  const appContent = (
    <div
      className={`flex flex-col ${
        embedded ? 'h-full min-h-0' : 'min-h-[680px]'
      } bg-[#F7F3EE] text-[#1F1815]`}
    >
      {/* App Header */}
      <div className="bg-white border-b border-[#E3DBD0] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <IPrettyWordmark compact />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('lembrete')}
            title="Lembrete 24h (US-09)"
            className="relative p-2 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0] text-[#1F1815] hover:border-[#B85D43] cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {myAppointments.some((a) => a.status === 'aguardando_confirmacao') && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B85D43] border-2 border-white" />
            )}
          </button>
          <button
            onClick={() => setBagModalOpen(true)}
            title="Sacola de retirada"
            className="relative p-2 rounded-xl bg-[#1F1815] text-[#FAF7F2] cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="text-[11px] font-mono-num font-bold bg-[#B85D43] px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className={`flex-1 p-4 space-y-5 overflow-y-auto ${embedded ? 'pb-6' : 'pb-24'}`}>
        {/* === TELA C-01: INÍCIO / VITRINE === */}
        {activeTab === 'inicio' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8B7F77]">Olá, {currentClient.name.split(' ')[0]}</div>
                <h1 className="font-display text-xl font-semibold">
                  Seu momento no iPretty
                </h1>
              </div>
              <Badge tone="terracotta">Aberto hoje</Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8B7F77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar escova, manicure, óleo capilar..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-sm focus:outline-none focus:border-[#B85D43]"
              />
            </div>

            {/* Banner Rotativo (US-14) */}
            {activeBanners.length > 0 && (
              <div className="space-y-2">
                {(() => {
                  const b = activeBanners[bannerIdx % activeBanners.length];
                  return (
                    <div className={`rounded-2xl p-5 ${bannerThemeClasses[b.theme]}`}>
                      <span className="inline-block text-[10px] font-mono-num uppercase tracking-widest opacity-80">
                        {b.tag}
                      </span>
                      <h2 className="font-display text-xl font-semibold mt-1 leading-snug">
                        {b.title}
                      </h2>
                      <p className="text-xs opacity-90 mt-1.5 leading-relaxed">{b.subtitle}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (b.targetId) {
                              const found = activeServices.find((s) => s.id === b.targetId);
                              if (found) {
                                startBookingForService(found);
                                return;
                              }
                            }
                            setActiveTab(b.targetTab === 'produtos' ? 'produtos' : 'agendar');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-white text-[#1F1815] text-xs font-semibold cursor-pointer hover:opacity-90"
                        >
                          {b.ctaLabel}
                        </button>
                        {activeBanners.length > 1 && (
                          <div className="flex gap-1.5">
                            {activeBanners.map((item, idx) => (
                              <button
                                key={item.id}
                                onClick={() => setBannerIdx(idx)}
                                aria-label={`Banner ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  idx === bannerIdx % activeBanners.length
                                    ? 'w-5 bg-white'
                                    : 'w-1.5 bg-white/45'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Equipe */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="font-display text-base font-semibold">Nossas profissionais</h2>
                <button
                  onClick={() => setActiveTab('agendar')}
                  className="text-xs font-semibold text-[#B85D43] cursor-pointer"
                >
                  Ver agenda
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {serviceProfessionals.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      const firstSrv =
                        activeServices.find((s) => s.professionalIds.includes(prof.id)) ??
                        activeServices[0];
                      if (firstSrv) startBookingForService(firstSrv, prof.id);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#E3DBD0] text-left hover:border-[#B85D43] transition-colors cursor-pointer"
                  >
                    <div
                      className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center mb-2"
                      style={{ backgroundColor: prof.avatarColor }}
                    >
                      {prof.name[0]}
                    </div>
                    <div className="text-xs font-semibold truncate">{prof.name}</div>
                    <div className="text-[10px] text-[#8B7F77] truncate">
                      {prof.specialtyLabel.split('&')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Serviços Populares */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="font-display text-base font-semibold">Serviços do salão</h2>
                <button
                  onClick={() => setActiveTab('agendar')}
                  className="text-xs font-semibold text-[#B85D43] cursor-pointer"
                >
                  Ver todos ({activeServices.length})
                </button>
              </div>
              <div className="space-y-2.5">
                {activeServices
                  .filter((s) =>
                    searchQuery
                      ? s.name.toLowerCase().includes(searchQuery.toLowerCase())
                      : true,
                  )
                  .slice(0, 4)
                  .map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3 rounded-2xl bg-white border border-[#E3DBD0] flex items-center gap-3"
                    >
                      <ServiceEditorialArt category={srv.category} className="w-12 h-12 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => setDetailServiceModal(srv)}
                          className="font-semibold text-sm text-left hover:text-[#B85D43] truncate block w-full cursor-pointer"
                        >
                          {srv.name}
                        </button>
                        <div className="text-xs text-[#5A4F48] flex items-center gap-2 mt-0.5 font-mono-num">
                          <span>{srv.durationMin} min</span>
                          <span>•</span>
                          <span className="font-semibold text-[#1F1815]">
                            {formatCurrency(srv.price)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => startBookingForService(srv)}
                      >
                        Agendar
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Produtos Ativos na Vitrine (US-02: nunca exibe custo!) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="font-display text-base font-semibold">
                  Para levar para casa
                </h2>
                <button
                  onClick={() => setActiveTab('produtos')}
                  className="text-xs font-semibold text-[#B85D43] cursor-pointer"
                >
                  Ver vitrine ({activeProducts.length})
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {activeProducts
                  .filter((p) =>
                    searchQuery
                      ? p.name.toLowerCase().includes(searchQuery.toLowerCase())
                      : true,
                  )
                  .slice(0, 4)
                  .map((prd) => (
                    <div
                      key={prd.id}
                      className="bg-white rounded-2xl border border-[#E3DBD0] p-2.5 flex flex-col justify-between"
                    >
                      <button
                        onClick={() => setDetailProductModal(prd)}
                        className="text-left cursor-pointer"
                      >
                        <ProductEditorialArt
                          type={prd.visualType}
                          accent={prd.accentTone}
                          className="w-full h-24 rounded-xl"
                        />
                        <div className="text-[10px] uppercase tracking-wider text-[#8B7F77] mt-2">
                          {prd.brand}
                        </div>
                        <div className="text-xs font-semibold leading-snug mt-0.5 line-clamp-2">
                          {prd.name}
                        </div>
                      </button>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-mono-num text-xs font-bold text-[#1F1815]">
                          {prd.salePrice === 0 ? 'Cortesia' : formatCurrency(prd.salePrice)}
                        </span>
                        <button
                          onClick={() => addToCart(prd)}
                          className="px-2.5 py-1 rounded-lg bg-[#1F1815] text-white text-[11px] font-semibold cursor-pointer hover:bg-[#B85D43] transition-colors"
                        >
                          + Sacola
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* === TELA C-02 & C-03: SERVIÇOS E AGENDAMENTO (US-01) === */}
        {activeTab === 'agendar' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                {agendarStep === 'horarios'
                  ? 'Tela C-03 · Profissional, Data & Horários (US-01)'
                  : 'Tela C-02 · Catálogo & Agendamento Online (US-01)'}
              </span>
              <h1 className="font-display text-xl font-semibold">
                {agendarStep === 'horarios'
                  ? 'Escolha profissional e horário'
                  : 'Escolha serviço e horário'}
              </h1>
            </div>

            {agendarStep === 'horarios' && bookingService ? (
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#B85D43] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ServiceEditorialArt
                    category={bookingService.category}
                    className="w-9 h-9 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{bookingService.name}</div>
                    <div className="text-[11px] font-mono-num text-[#5A4F48]">
                      {bookingService.durationMin} min · {formatCurrency(bookingService.price)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAgendarStep('catalogo')}
                  className="text-[11px] font-semibold text-[#B85D43] underline shrink-0 cursor-pointer"
                >
                  Trocar serviço
                </button>
              </div>
            ) : (
              <>
                {/* Filtro de Categoria */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(
                    [
                      { id: 'todas', label: 'Todos' },
                      { id: 'cabelo', label: 'Cabelo' },
                      { id: 'unhas', label: 'Unhas' },
                      { id: 'sobrancelha', label: 'Sobrancelha' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedServiceCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                        selectedServiceCategory === cat.id
                          ? 'bg-[#1F1815] text-white border-[#1F1815]'
                          : 'bg-white text-[#5A4F48] border-[#E3DBD0]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Lista de Serviços */}
                <div className="space-y-2">
                  {activeServices
                    .filter((s) =>
                      selectedServiceCategory === 'todas'
                        ? true
                        : s.category === selectedServiceCategory,
                    )
                    .map((srv) => {
                      const selected = bookingService?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => {
                            setBookingService(srv);
                            if (!srv.professionalIds.includes(bookingStaffId)) {
                              setBookingStaffId(
                                srv.professionalIds[0] ?? serviceProfessionals[0]?.id,
                              );
                            }
                            setBookingTime('');
                          }}
                          className={`p-3 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                            selected
                              ? 'bg-[#FAF7F2] border-[#B85D43] ring-1 ring-[#B85D43]'
                              : 'bg-white border-[#E3DBD0]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ServiceEditorialArt
                              category={srv.category}
                              className="w-10 h-10 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">{srv.name}</div>
                              <div className="text-xs text-[#5A4F48] font-mono-num">
                                {srv.durationMin} min · {formatCurrency(srv.price)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailServiceModal(srv);
                            }}
                            className="text-[11px] font-semibold text-[#B85D43] underline shrink-0 cursor-pointer"
                          >
                            Detalhes
                          </button>
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            {/* Profissional + Data + Horário */}
            {bookingService && (
              <div className="bg-white rounded-2xl border border-[#E3DBD0] p-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-[#5A4F48] mb-2">
                    1. Profissional para {bookingService.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {serviceProfessionals
                      .filter((p) => bookingService.professionalIds.includes(p.id))
                      .map((prof) => (
                        <button
                          key={prof.id}
                          onClick={() => {
                            setBookingStaffId(prof.id);
                            setBookingTime('');
                          }}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                            bookingStaffId === prof.id
                              ? 'bg-[#1F1815] text-white border-[#1F1815]'
                              : 'bg-[#F7F3EE] text-[#1F1815] border-[#E3DBD0]'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: prof.avatarColor }}
                          />
                          {prof.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Data */}
                <div>
                  <div className="text-xs font-semibold text-[#5A4F48] mb-2">
                    2. Escolha o dia (dentro da escala da profissional)
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {nextSevenDays.slice(0, 8).map((iso) => {
                      const active = bookingDate === iso;
                      return (
                        <button
                          key={iso}
                          onClick={() => {
                            setBookingDate(iso);
                            setBookingTime('');
                          }}
                          className={`px-1 py-2 rounded-xl border text-center cursor-pointer ${
                            active
                              ? 'bg-[#B85D43] text-white border-[#B85D43]'
                              : 'bg-[#F7F3EE] text-[#1F1815] border-[#E3DBD0]'
                          }`}
                        >
                          <div className="text-[10px] font-medium opacity-85">
                            {formatDateShortBR(iso).split(',')[0]}
                          </div>
                          <div className="text-[11px] font-mono-num font-bold mt-0.5 whitespace-nowrap">
                            {iso.split('-')[2]}/{iso.split('-')[1]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horários Livres */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#5A4F48]">
                      3. Horários livres ({bookingService.durationMin} min contínuos)
                    </span>
                    <span className="text-[10px] font-mono-num text-[#8B7F77]">
                      Sem sobreposição
                    </span>
                  </div>

                  {availableSlots.filter((s) => s.available).length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] text-xs text-[#5A4F48]">
                      Nenhum horário disponível nesta data na escala de {selectedBookingStaff?.name}.
                      Escolha outro dia acima.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots
                        .filter((s) => s.available)
                        .map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setBookingTime(slot.time)}
                            className={`py-2 px-2 rounded-xl border text-xs font-mono-num font-semibold cursor-pointer ${
                              bookingTime === slot.time
                                ? 'bg-[#1F1815] text-white border-[#1F1815]'
                                : 'bg-white text-[#1F1815] border-[#D9CFC3] hover:border-[#B85D43]'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Observação + Simulação de Conflito US-01 */}
                <div>
                  <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                    Observação opcional para a profissional
                  </label>
                  <input
                    type="text"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Ex: prefiro esmalte clarinho"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
                  />
                </div>

                <label className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FBF0DC]/60 border border-[#EDD6A9] text-[11px] text-[#6E4912] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateConflict}
                    onChange={(e) => setSimulateConflict(e.target.checked)}
                    className="mt-0.5 accent-[#B85D43]"
                  />
                  <span>
                    <strong>Testar regra US-01:</strong> simular que outra cliente reservou este
                    horário segundos antes ao clicar em confirmar.
                  </span>
                </label>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!bookingTime}
                  onClick={handleConfirmBooking}
                >
                  {bookingTime
                    ? `Confirmar ${bookingTime} · ${formatCurrency(bookingService.price)}`
                    : 'Selecione um horário acima'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* === TELA C-04: VITRINE DE PRODUTOS (US-02) === */}
        {activeTab === 'produtos' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                  Tela C-04 · Vitrine de Produtos (US-02)
                </span>
                <h1 className="font-display text-xl font-semibold">Produtos para retirada</h1>
              </div>
              <Badge tone="neutral">
                <MapPin className="w-3 h-3" /> Retira no salão
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] text-xs text-[#5A4F48]">
              Reserve pelo celular e retire no balcão do salão. O pagamento é feito na retirada
              (Pix, cartão ou dinheiro).
            </div>

            {/* Filtro categorias */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedProductCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                    selectedProductCategory === cat
                      ? 'bg-[#1F1815] text-white border-[#1F1815]'
                      : 'bg-white text-[#5A4F48] border-[#E3DBD0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de Produtos Ativos (NUNCA exibe preço de custo!) */}
            <div className="grid grid-cols-2 gap-3">
              {activeProducts
                .filter((p) =>
                  selectedProductCategory === 'Todos'
                    ? true
                    : p.category === selectedProductCategory,
                )
                .map((prd) => {
                  const inBag = cart.find((c) => c.productId === prd.id)?.quantity ?? 0;
                  return (
                    <div
                      key={prd.id}
                      className="bg-white rounded-2xl border border-[#E3DBD0] p-3 flex flex-col justify-between"
                    >
                      <button
                        onClick={() => setDetailProductModal(prd)}
                        className="text-left cursor-pointer"
                      >
                        <ProductEditorialArt
                          type={prd.visualType}
                          accent={prd.accentTone}
                          className="w-full h-24 rounded-xl"
                        />
                        <div className="text-[10px] font-medium text-[#8B7F77] mt-2">
                          {prd.brand} · {prd.category}
                        </div>
                        <div className="text-xs font-semibold mt-0.5 leading-snug">
                          {prd.name}
                        </div>
                      </button>

                      <div className="mt-3 pt-2.5 border-t border-[#EFE9E1] flex items-center justify-between gap-1">
                        <span className="font-mono-num text-xs font-bold text-[#1F1815]">
                          {prd.salePrice === 0 ? 'Cortesia' : formatCurrency(prd.salePrice)}
                        </span>
                        {inBag > 0 ? (
                          <div className="flex items-center gap-1 bg-[#F7F3EE] rounded-lg px-1.5 py-0.5 border border-[#E3DBD0]">
                            <button
                              onClick={() => updateCartQty(prd.id, -1)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono-num font-semibold px-1">
                              {inBag}
                            </span>
                            <button
                              onClick={() => updateCartQty(prd.id, 1)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" variant="dark" onClick={() => addToCart(prd)}>
                            Pedir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {cartCount > 0 && (
              <div className="sticky bottom-16 z-10">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-[var(--shadow-float)]"
                  onClick={() => setBagModalOpen(true)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Ver sacola ({cartCount} {cartCount === 1 ? 'item' : 'itens'}) ·{' '}
                  {formatCurrency(cartTotal)}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* === TELA C-05: MEUS AGENDAMENTOS & PEDIDOS === */}
        {activeTab === 'meus' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                Tela C-05 · Histórico & Acompanhamento
              </span>
              <h1 className="font-display text-xl font-semibold">Meus horários e pedidos</h1>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#EFE9E1] border border-[#E3DBD0]">
              <button
                onClick={() => setMeusSubTab('agendamentos')}
                className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  meusSubTab === 'agendamentos' ? 'bg-white text-[#1F1815] shadow-xs' : 'text-[#5A4F48]'
                }`}
              >
                Agendamentos ({myAppointments.length})
              </button>
              <button
                onClick={() => setMeusSubTab('pedidos')}
                className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  meusSubTab === 'pedidos' ? 'bg-white text-[#1F1815] shadow-xs' : 'text-[#5A4F48]'
                }`}
              >
                Pedidos ({myOrders.length})
              </button>
            </div>

            {meusSubTab === 'agendamentos' ? (
              <div className="space-y-3">
                {myAppointments.map((apt) => {
                  const canModify =
                    apt.status === 'aguardando_confirmacao' || apt.status === 'confirmado';
                  return (
                    <div
                      key={apt.id}
                      className="bg-white rounded-2xl border border-[#E3DBD0] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-mono-num text-[#8B7F77]">
                            #{apt.code} · {formatDateBR(apt.date)} às {apt.startTime}
                          </div>
                          <div className="font-semibold text-sm mt-0.5">{apt.serviceName}</div>
                          <div className="text-xs text-[#5A4F48]">
                            Com {apt.staffName} · {apt.serviceDurationMin} min
                          </div>
                        </div>
                        <AppointmentStatusBadge status={apt.status} />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EFE9E1]">
                        <span className="font-mono-num text-xs font-bold">
                          {formatCurrency(apt.payment?.finalAmount ?? apt.servicePrice)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {apt.status === 'aguardando_confirmacao' && (
                            <Button
                              size="sm"
                              variant="sage"
                              onClick={() => confirmAppointmentByReminder(apt.id)}
                            >
                              Confirmar
                            </Button>
                          )}
                          {canModify && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setRescheduleTarget(apt);
                                  setRescheduleDate(apt.date);
                                  setRescheduleTime('');
                                }}
                              >
                                Remarcar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setCancelTarget(apt);
                                  setCancelReason('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => {
                  const total = ord.items.reduce(
                    (s, i) => s + i.unitSalePrice * i.quantity,
                    0,
                  );
                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-[#E3DBD0] p-4 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-mono-num text-[#8B7F77]">
                            {ord.code} · {ord.createdAt}
                          </div>
                          <div className="text-sm font-semibold mt-0.5">
                            {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </div>
                        <OrderStatusBadge status={ord.status} />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EFE9E1]">
                        <span className="font-mono-num text-xs font-bold">
                          {total === 0 ? 'Brinde / Cortesia' : formatCurrency(total)}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setOrderDetailModal(ord)}
                        >
                          Acompanhar pedido
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === TELA C-06: LEMBRETE AUTOMÁTICO 24H & LINK DE CONFIRMAÇÃO (US-09 / US-10) === */}
        {activeTab === 'lembrete' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                Tela C-06 · Lembrete 24h & Link (US-09 / US-10)
              </span>
              <h1 className="font-display text-xl font-semibold">Confirmação de presença</h1>
            </div>

            {reminderCandidate ? (
              <>
                {/* Preview da mensagem automática */}
                <div className="rounded-2xl bg-[#E3EFE8] border border-[#C3DEC9] p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono-num text-[#28503B]">
                    <span>MENSAGEM AUTOMÁTICA · 24H ANTES</span>
                    <span>iPretty</span>
                  </div>
                  <p className="text-xs text-[#1F1815] leading-relaxed">
                    Olá, <strong>{currentClient.name.split(' ')[0]}</strong>! Lembrando do seu
                    atendimento de <strong>{reminderCandidate.serviceName}</strong> com{' '}
                    <strong>{reminderCandidate.staffName}</strong> em{' '}
                    <strong>{formatDateBR(reminderCandidate.date)}</strong> às{' '}
                    <strong>{reminderCandidate.startTime}</strong>. Confirme ou ajuste pelo link:
                  </p>
                  <div className="text-[11px] font-mono-num text-[#28503B] underline">
                    ipretty.salao/confirmar/{reminderCandidate.code}
                  </div>
                </div>

                {/* Página aberta ao tocar no link */}
                <div className="bg-white rounded-2xl border border-[#E3DBD0] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge tone="ochre">Link do Lembrete Aberto</Badge>
                    <AppointmentStatusBadge status={reminderCandidate.status} />
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {reminderCandidate.serviceName}
                    </h2>
                    <div className="text-xs text-[#5A4F48] mt-1 space-y-1">
                      <div>
                        Data: <strong className="text-[#1F1815]">{formatDateShortBR(reminderCandidate.date)}</strong>
                      </div>
                      <div>
                        Horário: <strong className="font-mono-num text-[#1F1815]">{reminderCandidate.startTime} – {reminderCandidate.endTime}</strong>
                      </div>
                      <div>
                        Profissional: <strong className="text-[#1F1815]">{reminderCandidate.staffName}</strong>
                      </div>
                      <div>
                        Valor estimado: <strong className="font-mono-num text-[#1F1815]">{formatCurrency(reminderCandidate.servicePrice)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      variant="sage"
                      size="lg"
                      className="w-full"
                      disabled={reminderCandidate.status === 'confirmado'}
                      onClick={() => confirmAppointmentByReminder(reminderCandidate.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {reminderCandidate.status === 'confirmado'
                        ? 'Presença já confirmada no painel!'
                        : 'Confirmo meu horário'}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setRescheduleTarget(reminderCandidate);
                          setRescheduleDate(reminderCandidate.date);
                          setRescheduleTime('');
                        }}
                      >
                        Remarcar horário
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setCancelTarget(reminderCandidate);
                          setCancelReason('');
                        }}
                      >
                        Cancelar visita
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E3DBD0] p-5 text-xs text-[#5A4F48]">
                Nenhum lembrete pendente no momento. Crie um agendamento para amanhã para ver o
                lembrete 24h ativo.
              </div>
            )}
          </div>
        )}

        {/* === TELA C-07: PERFIL DA CLIENTE === */}
        {activeTab === 'perfil' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold">
                Tela C-07 · Perfil da Cliente
              </span>
              <h1 className="font-display text-xl font-semibold">{currentClient.name}</h1>
            </div>

            <div className="bg-white rounded-2xl border border-[#E3DBD0] p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#EFE9E1]">
                <span className="text-[#8B7F77]">WhatsApp</span>
                <span className="font-mono-num font-medium">{currentClient.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFE9E1]">
                <span className="text-[#8B7F77]">E-mail</span>
                <span className="font-medium">{currentClient.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFE9E1]">
                <span className="text-[#8B7F77]">Atendimentos realizados</span>
                <span className="font-mono-num font-semibold">
                  {myAppointments.filter((a) => a.status === 'pago' || a.status === 'compareceu').length}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8B7F77]">Faltas registradas</span>
                <span className="font-mono-num font-semibold">
                  {myAppointments.filter((a) => a.status === 'nao_compareceu').length}
                </span>
              </div>
            </div>

            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E3DBD0] p-4 text-xs text-[#5A4F48]">
              <strong>Preferências salvas no salão:</strong> {currentClient.notes || 'Nenhuma anotação.'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Navigation */}
      <nav className="bg-white border-t border-[#E3DBD0] px-2 py-2 grid grid-cols-5 gap-1 sticky bottom-0 z-20">
        {(
          [
            { id: 'inicio', label: 'Vitrine', icon: Home },
            { id: 'agendar', label: 'Agendar', icon: Calendar },
            { id: 'produtos', label: 'Produtos', icon: Package },
            { id: 'meus', label: 'Meus', icon: Clock },
            { id: 'perfil', label: 'Perfil', icon: User },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 rounded-xl text-[11px] font-semibold cursor-pointer transition-colors ${
                active ? 'text-[#B85D43] bg-[#F6E6E0]/60' : 'text-[#5A4F48] hover:text-[#1F1815]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div
      className={
        embedded
          ? 'relative h-full min-h-0 flex-1 flex flex-col bg-[#F7F3EE] overflow-hidden'
          : 'min-h-screen bg-[#F7F3EE] py-6 px-4'
      }
    >
      {embedded ? (
        appContent
      ) : (
        <div className="max-w-6xl mx-auto">
        {/* Top Prototype Context Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-[#E3DBD0] px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge tone="terracotta">Persona 1 · Juliana (Cliente)</Badge>
            <span className="text-xs text-[#5A4F48] hidden sm:inline">
              US-01 Agendamento · US-02 Produtos · US-09 Lembrete · US-10 Remarcar/Cancelar
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setResponsiveMode((m) => (m === 'mobile' ? 'full' : 'mobile'))}
              className="px-3 py-1.5 rounded-lg border border-[#D9CFC3] text-xs font-semibold hover:bg-[#F7F3EE] cursor-pointer"
            >
              {responsiveMode === 'mobile' ? 'Expandir largura desktop' : 'Visualizar molde 390px'}
            </button>
            <button
              onClick={() => setActiveTab('lembrete')}
              className="px-3 py-1.5 rounded-lg bg-[#E3EFE8] text-[#28503B] text-xs font-semibold cursor-pointer"
            >
              Abrir Link Lembrete 24h
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={responsiveMode === 'mobile' ? 'lg:col-span-6' : 'lg:col-span-12'}>
            {responsiveMode === 'mobile' ? (
              <PhoneFrame label="iPretty Cliente · Mobile (390px)">{appContent}</PhoneFrame>
            ) : (
              <div className="max-w-3xl mx-auto rounded-2xl border border-[#E3DBD0] overflow-hidden shadow-[var(--shadow-card)]">
                {appContent}
              </div>
            )}
          </div>

          {responsiveMode === 'mobile' && (
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E3DBD0] p-5 space-y-3">
                <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#8B7F77]">
                  Telas & Popups desta jornada
                </div>
                <h2 className="font-display text-xl font-semibold">
                  Atalhos rápidos de inspeção (Cliente)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('inicio')}>
                    C-01 · Vitrine Inicial
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('agendar')}>
                    C-02/C-03 · Agendar Serviço
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('produtos')}>
                    C-04 · Vitrine de Produtos
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('meus')}>
                    C-05 · Meus Horários & Pedidos
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('lembrete')}>
                    C-06 · Lembrete 24h (US-09)
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('perfil')}>
                    C-07 · Perfil da Cliente
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailServiceModal(activeServices[0] ?? null)}
                  >
                    POP-C01 · Detalhe Serviço
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConflictErrorModal('horário indisponível, escolha outro')}
                  >
                    POP-C02 · Alerta Conflito (US-01)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailProductModal(activeProducts[0] ?? null)}
                  >
                    POP-C04 · Detalhe Produto
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setBagModalOpen(true)}>
                    POP-C05 · Sacola de Retirada
                  </Button>
                </div>
              </div>

              <div className="bg-[#FAF7F2] rounded-2xl border border-[#E3DBD0] p-5 space-y-2 text-xs text-[#5A4F48]">
                <div className="font-semibold text-[#1F1815] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#B85D43]" />
                  Regras implementadas nesta visão
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>US-01:</strong> Horários só aparecem dentro da escala da profissional e
                    onde a duração inteira cabe sem sobrepor outro atendimento ou folga.
                  </li>
                  <li>
                    <strong>US-02:</strong> Produtos desativados somem da vitrine, mas pedidos
                    anteriores continuam válidos em &ldquo;Meus Pedidos&rdquo;. Preço de custo nunca é
                    exibido para a cliente.
                  </li>
                  <li>
                    <strong>US-09:</strong> Agendamentos feitos com menos de 24h já nascem
                    confirmados sem lembrete; os demais permitem confirmação pelo link.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* POP-C01 · Detalhe do Serviço */}
      <Modal
        open={!!detailServiceModal}
        onClose={() => setDetailServiceModal(null)}
        badge="Popup POP-C01 · Detalhe do Serviço"
        title={detailServiceModal?.name ?? ''}
        subtitle={`${detailServiceModal?.durationMin ?? 0} minutos · ${formatCurrency(detailServiceModal?.price ?? 0)}`}
      >
        {detailServiceModal && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <ServiceEditorialArt
                category={detailServiceModal.category}
                className="w-16 h-16 shrink-0"
              />
              <p className="text-sm text-[#5A4F48] leading-relaxed">
                {detailServiceModal.description}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
              <div className="text-xs font-semibold mb-1.5">O que está incluído:</div>
              <ul className="space-y-1 text-xs text-[#5A4F48]">
                {detailServiceModal.includes.map((inc) => (
                  <li key={inc} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#38664E]" /> {inc}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDetailServiceModal(null)}>
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => startBookingForService(detailServiceModal)}
              >
                Escolher horário
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C02 · Alerta Conflito de Horário (US-01) */}
      <Modal
        open={!!conflictErrorModal}
        onClose={() => setConflictErrorModal(null)}
        badge="Popup POP-C02 · Validação US-01"
        title="Não foi possível reservar este horário"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FAE6E6] border border-[#ECC4C4] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#922B2B] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#922B2B]">{conflictErrorModal}</div>
              <p className="text-xs text-[#6E2626] mt-1">
                Outra cliente concluiu a reserva deste mesmo horário segundos antes. Os horários
                livres foram atualizados.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="dark" onClick={() => setConflictErrorModal(null)}>
              Escolher outro horário
            </Button>
          </div>
        </div>
      </Modal>

      {/* POP-C03 · Confirmação de Agendamento */}
      <Modal
        open={!!confirmedAppointmentModal}
        onClose={() => setConfirmedAppointmentModal(null)}
        badge="Popup POP-C03 · Agendamento Criado"
        title="Horário reservado com sucesso"
        maxWidthClass="max-w-md"
      >
        {confirmedAppointmentModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#E3EFE8] border border-[#C3DEC9] flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#38664E] shrink-0" />
              <div>
                <div className="text-xs font-mono-num text-[#28503B]">
                  CÓDIGO #{confirmedAppointmentModal.code}
                </div>
                <div className="text-sm font-semibold text-[#1F1815]">
                  {confirmedAppointmentModal.serviceName}
                </div>
              </div>
            </div>

            <div className="bg-[#FAF7F2] rounded-xl border border-[#E3DBD0] p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Data</span>
                <span className="font-semibold">
                  {formatDateBR(confirmedAppointmentModal.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Horário</span>
                <span className="font-mono-num font-semibold">
                  {confirmedAppointmentModal.startTime} – {confirmedAppointmentModal.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Profissional</span>
                <span className="font-semibold">{confirmedAppointmentModal.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Preço</span>
                <span className="font-mono-num font-bold">
                  {formatCurrency(confirmedAppointmentModal.servicePrice)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E3DBD0]">
                <span className="text-[#8B7F77]">Status</span>
                <AppointmentStatusBadge status={confirmedAppointmentModal.status} />
              </div>
            </div>

            <div className="text-[11px] text-[#5A4F48]">
              {confirmedAppointmentModal.reminder24hStatus === 'nao_aplicavel'
                ? 'Como falta menos de 24h para este horário, ele já nasceu confirmado no painel do salão.'
                : 'Enviaremos um lembrete automático 24h antes com link para confirmação.'}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmedAppointmentModal(null);
                  setActiveTab('meus');
                  setMeusSubTab('agendamentos');
                }}
              >
                Ver meus horários
              </Button>
              <Button variant="primary" onClick={() => setConfirmedAppointmentModal(null)}>
                Concluir
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C04 · Detalhe do Produto */}
      <Modal
        open={!!detailProductModal}
        onClose={() => setDetailProductModal(null)}
        badge="Popup POP-C04 · Produto da Vitrine"
        title={detailProductModal?.name ?? ''}
        subtitle={detailProductModal?.brand}
      >
        {detailProductModal && (
          <div className="space-y-4">
            <ProductEditorialArt
              type={detailProductModal.visualType}
              accent={detailProductModal.accentTone}
              className="w-full h-40 rounded-2xl"
            />
            <p className="text-sm text-[#5A4F48] leading-relaxed">
              {detailProductModal.description}
            </p>
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] text-xs">
              <strong>Como usar:</strong> {detailProductModal.usageTip}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[11px] text-[#8B7F77]">Preço para retirada</div>
                <div className="font-mono-num text-xl font-bold">
                  {detailProductModal.salePrice === 0
                    ? 'Amostra Grátis'
                    : formatCurrency(detailProductModal.salePrice)}
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  addToCart(detailProductModal);
                  setDetailProductModal(null);
                }}
              >
                Adicionar à sacola
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C05 · Sacola de Pedido (US-02) */}
      <Modal
        open={bagModalOpen}
        onClose={() => setBagModalOpen(false)}
        badge="Popup POP-C05 · Pedido de Retirada (US-02)"
        title="Sua sacola para retirada"
        subtitle="Retirada e pagamento diretamente no balcão do salão"
      >
        {cartDetails.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-[#5A4F48]">Sua sacola está vazia no momento.</p>
            <Button
              variant="primary"
              onClick={() => {
                setBagModalOpen(false);
                setActiveTab('produtos');
              }}
            >
              Explorar produtos da vitrine
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {cartDetails.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{item.product.name}</div>
                    <div className="text-xs font-mono-num text-[#5A4F48]">
                      {item.product.salePrice === 0
                        ? 'Cortesia'
                        : `${formatCurrency(item.product.salePrice)} un.`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-7 h-7 rounded-lg border border-[#D9CFC3] bg-white flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-num text-xs font-bold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-7 h-7 rounded-lg border border-[#D9CFC3] bg-white flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Quando pretende retirar? (opcional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ex: Retiro hoje às 14:30 quando for fazer escova"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[#E3DBD0] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8B7F77]">Total a pagar na retirada</div>
                <div className="font-mono-num text-xl font-bold">{formatCurrency(cartTotal)}</div>
              </div>
              <Button variant="primary" size="lg" onClick={handleConfirmOrder}>
                Confirmar pedido
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C06 · Pedido Confirmado */}
      <Modal
        open={!!confirmedOrderModal}
        onClose={() => setConfirmedOrderModal(null)}
        badge="Popup POP-C06 · Pedido Solicitado"
        title={`Pedido ${confirmedOrderModal?.code ?? ''} enviado!`}
        maxWidthClass="max-w-md"
      >
        {confirmedOrderModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FBF0DC] border border-[#EDD6A9]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-num font-bold text-[#8B5910]">
                  {confirmedOrderModal.code}
                </span>
                <OrderStatusBadge status={confirmedOrderModal.status} />
              </div>
              <p className="text-xs text-[#5A4F48] mt-2">
                A recepção já recebeu seu pedido e vai separar seus itens no balcão. Você paga
                somente quando retirar no salão.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmedOrderModal(null);
                  setActiveTab('meus');
                  setMeusSubTab('pedidos');
                }}
              >
                Acompanhar pedido
              </Button>
              <Button variant="dark" onClick={() => setConfirmedOrderModal(null)}>
                Ok, entendi
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C07 · Remarcar Agendamento (US-10) */}
      <Modal
        open={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        badge="Popup POP-C07 · Remarcar (US-10)"
        title="Escolher nova data e horário"
        subtitle={rescheduleTarget ? `${rescheduleTarget.serviceName} · ${rescheduleTarget.staffName}` : ''}
      >
        {rescheduleTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-1.5">
              {nextSevenDays.slice(0, 4).map((iso) => (
                <button
                  key={iso}
                  onClick={() => {
                    setRescheduleDate(iso);
                    setRescheduleTime('');
                  }}
                  className={`p-2 rounded-xl border text-center cursor-pointer text-xs ${
                    rescheduleDate === iso
                      ? 'bg-[#B85D43] text-white border-[#B85D43]'
                      : 'bg-[#F7F3EE] border-[#E3DBD0]'
                  }`}
                >
                  {formatDateShortBR(iso)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {rescheduleSlots
                .filter((s) => s.available)
                .map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setRescheduleTime(slot.time)}
                    className={`py-2 rounded-xl border text-xs font-mono-num font-semibold cursor-pointer ${
                      rescheduleTime === slot.time
                        ? 'bg-[#1F1815] text-white border-[#1F1815]'
                        : 'bg-white border-[#D9CFC3]'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRescheduleTarget(null)}>
                Voltar
              </Button>
              <Button
                variant="primary"
                disabled={!rescheduleTime}
                onClick={() => {
                  const r = rescheduleAppointment(
                    rescheduleTarget.id,
                    rescheduleDate,
                    rescheduleTime,
                  );
                  if (r.ok) setRescheduleTarget(null);
                  else setConflictErrorModal(r.error);
                }}
              >
                Confirmar novo horário
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C08 · Cancelar Agendamento (US-10) */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        badge="Popup POP-C08 · Cancelar (US-10)"
        title="Deseja cancelar este horário?"
        maxWidthClass="max-w-md"
      >
        {cancelTarget && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] text-xs">
              <strong>{cancelTarget.serviceName}</strong> · {formatDateBR(cancelTarget.date)} às{' '}
              <span className="font-mono-num">{cancelTarget.startTime}</span> com{' '}
              {cancelTarget.staffName}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Imprevisto no trabalho"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCancelTarget(null)}>
                Manter horário
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  cancelAppointment(cancelTarget.id, cancelReason);
                  setCancelTarget(null);
                }}
              >
                Confirmar cancelamento
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* POP-C09 · Detalhe do Pedido da Cliente */}
      <Modal
        open={!!orderDetailModal}
        onClose={() => setOrderDetailModal(null)}
        badge="Popup POP-C09 · Acompanhamento de Pedido"
        title={`Pedido ${orderDetailModal?.code ?? ''}`}
      >
        {orderDetailModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A4F48]">Status atual</span>
              <OrderStatusBadge status={orderDetailModal.status} />
            </div>

            <div className="space-y-2">
              {orderDetailModal.items.map((it) => (
                <div
                  key={it.productId}
                  className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex justify-between text-xs"
                >
                  <span>
                    {it.quantity}x <strong>{it.productName}</strong>
                  </span>
                  <span className="font-mono-num font-semibold">
                    {formatCurrency(it.unitSalePrice * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#EFE9E1]">
              <div className="text-xs font-semibold">Linha do tempo:</div>
              {orderDetailModal.timeline.map((step, i) => (
                <div key={i} className="flex justify-between text-[11px] text-[#5A4F48]">
                  <span className="capitalize font-medium text-[#1F1815]">{step.status}</span>
                  <span className="font-mono-num">{step.at}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
