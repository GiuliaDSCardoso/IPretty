import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEMO_TODAY_ISO,
  INITIAL_APPOINTMENTS,
  INITIAL_BANNERS,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_OVERRIDES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_STAFF,
  INITIAL_SUPPLIERS,
  INITIAL_TIMEOFF,
} from '../data/seedData';
import {
  Appointment,
  AppointmentStatus,
  ClientProfile,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductOrder,
  ScheduleOverride,
  ServiceItem,
  StaffMember,
  Supplier,
  TimeOffBlock,
  ToastMessage,
  VitrineBanner,
  WorkspaceSection,
} from '../types/salon';
import {
  formatTimeToMinutes,
  getAllowedNextOrderStatuses,
  getAvailableTimeSlots,
  hoursBetweenNowAndAppointment,
  isAppointmentInPast,
  isOrderFreeSample,
  minutesToHHMM,
} from '../utils/calculations';

interface PersistedState {
  staff: StaffMember[];
  services: ServiceItem[];
  suppliers: Supplier[];
  products: Product[];
  clients: ClientProfile[];
  appointments: Appointment[];
  orders: ProductOrder[];
  overrides: ScheduleOverride[];
  timeOffBlocks: TimeOffBlock[];
  banners: VitrineBanner[];
  simulatedTimeHHMM: string;
  activeClientId: string;
  activeProfessionalId: string;
}

const STORAGE_KEY = 'ipretty_salon_prototype_v1';

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed.staff && parsed.services && parsed.appointments && parsed.orders) {
        return {
          staff: parsed.staff,
          services: parsed.services,
          suppliers: parsed.suppliers ?? INITIAL_SUPPLIERS,
          products: parsed.products ?? INITIAL_PRODUCTS,
          clients: parsed.clients ?? INITIAL_CLIENTS,
          appointments: parsed.appointments,
          orders: parsed.orders,
          overrides: parsed.overrides ?? INITIAL_OVERRIDES,
          timeOffBlocks: parsed.timeOffBlocks ?? INITIAL_TIMEOFF,
          banners: parsed.banners ?? INITIAL_BANNERS,
          simulatedTimeHHMM: parsed.simulatedTimeHHMM ?? '13:30',
          activeClientId: parsed.activeClientId ?? 'cli-juliana',
          activeProfessionalId: parsed.activeProfessionalId ?? 'staff-patricia',
        };
      }
    }
  } catch {
    // ignore storage errors
  }

  return {
    staff: INITIAL_STAFF,
    services: INITIAL_SERVICES,
    suppliers: INITIAL_SUPPLIERS,
    products: INITIAL_PRODUCTS,
    clients: INITIAL_CLIENTS,
    appointments: INITIAL_APPOINTMENTS,
    orders: INITIAL_ORDERS,
    overrides: INITIAL_OVERRIDES,
    timeOffBlocks: INITIAL_TIMEOFF,
    banners: INITIAL_BANNERS,
    simulatedTimeHHMM: '13:30',
    activeClientId: 'cli-juliana',
    activeProfessionalId: 'staff-patricia',
  };
}

export interface NavigationIntent {
  section: WorkspaceSection;
  subTab?: string;
  openModal?: string;
  targetId?: string;
  timestamp: number;
}

interface SalonContextValue extends PersistedState {
  activeSection: WorkspaceSection;
  setActiveSection: (s: WorkspaceSection) => void;
  navIntent: NavigationIntent | null;
  navigateTo: (intent: Omit<NavigationIntent, 'timestamp'>) => void;
  clearNavIntent: () => void;
  todayISO: string;
  setSimulatedTimeHHMM: (time: string) => void;
  setActiveProfessionalId: (id: string) => void;
  setActiveClientId: (id: string) => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;

  // --- Ações de Agendamento (US-01, US-03, US-09, US-10) ---
  createAppointment: (input: {
    clientId?: string;
    clientName: string;
    clientPhone: string;
    serviceId: string;
    staffId: string;
    date: string;
    startTime: string;
    source: 'vitrine' | 'encaixe';
    notes?: string;
    simulateRaceConflict?: boolean;
  }) => { ok: true; appointment: Appointment } | { ok: false; error: string };

  confirmAppointmentByReminder: (appointmentId: string) => void;
  cancelAppointment: (appointmentId: string, reason?: string) => void;
  rescheduleAppointment: (
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newStaffId?: string,
  ) => { ok: true } | { ok: false; error: string };
  markAppointmentAttendance: (
    appointmentId: string,
    attendance: 'compareceu' | 'nao_compareceu' | 'confirmado',
  ) => { ok: true } | { ok: false; error: string };
  payAppointment: (input: {
    appointmentId: string;
    finalAmount: number;
    method: PaymentMethod;
    adjustmentReason?: string;
    recordedBy?: string;
  }) => { ok: true } | { ok: false; error: string };

  // --- Ações de Pedido de Produto (US-02, US-04) ---
  createProductOrder: (input: {
    clientId: string;
    clientName: string;
    clientPhone: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }) => { ok: true; order: ProductOrder } | { ok: false; error: string };
  advanceOrderStatus: (
    orderId: string,
    nextStatus: OrderStatus,
    actorLabel?: string,
  ) => { ok: true } | { ok: false; error: string };
  finalizeOrderPayment: (input: {
    orderId: string;
    finalAmount: number;
    method: PaymentMethod;
    adjustmentReason?: string;
    recordedBy?: string;
    asGift?: boolean;
  }) => { ok: true } | { ok: false; error: string };

  // --- Ações Admin & Profissional (US-05, US-06, US-11, US-12, US-14) ---
  saveStaffMember: (member: StaffMember) => { ok: true } | { ok: false; error: string };
  saveService: (service: ServiceItem) => void;
  saveSupplier: (supplier: Supplier) => void;
  saveProduct: (product: Product) => { ok: true } | { ok: false; error: string };
  toggleProductActive: (productId: string) => void;
  addTimeOffBlock: (block: Omit<TimeOffBlock, 'id' | 'createdAt'>) => void;
  removeTimeOffBlock: (id: string) => void;
  addScheduleOverride: (override: Omit<ScheduleOverride, 'id'>) => void;
  removeScheduleOverride: (id: string) => void;
  saveBanner: (banner: VitrineBanner) => void;
  deleteBanner: (id: string) => void;
}

const SalonContext = createContext<SalonContextValue | null>(null);

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('splash');
  const [navIntent, setNavIntent] = useState<NavigationIntent | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const todayISO = DEMO_TODAY_ISO;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota
    }
  }, [state]);

  const pushToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (intent: Omit<NavigationIntent, 'timestamp'>) => {
    setActiveSection(intent.section);
    setNavIntent({ ...intent, timestamp: Date.now() });
  };

  const clearNavIntent = () => setNavIntent(null);

  const resetDemoData = () => {
    const fresh: PersistedState = {
      staff: INITIAL_STAFF,
      services: INITIAL_SERVICES,
      suppliers: INITIAL_SUPPLIERS,
      products: INITIAL_PRODUCTS,
      clients: INITIAL_CLIENTS,
      appointments: INITIAL_APPOINTMENTS,
      orders: INITIAL_ORDERS,
      overrides: INITIAL_OVERRIDES,
      timeOffBlocks: INITIAL_TIMEOFF,
      banners: INITIAL_BANNERS,
      simulatedTimeHHMM: '13:30',
      activeClientId: 'cli-juliana',
      activeProfessionalId: 'staff-patricia',
    };
    setState(fresh);
    localStorage.removeItem(STORAGE_KEY);
    pushToast({
      type: 'info',
      title: 'Dados do protótipo restaurados',
      description: 'Agenda, pedidos, cadastros e caixa voltaram ao cenário inicial.',
    });
  };

  const setSimulatedTimeHHMM = (simulatedTimeHHMM: string) =>
    setState((prev) => ({ ...prev, simulatedTimeHHMM }));

  const setActiveProfessionalId = (activeProfessionalId: string) =>
    setState((prev) => ({ ...prev, activeProfessionalId }));

  const setActiveClientId = (activeClientId: string) =>
    setState((prev) => ({ ...prev, activeClientId }));

  const createAppointment: SalonContextValue['createAppointment'] = (input) => {
    const service = state.services.find((s) => s.id === input.serviceId);
    const staffMember = state.staff.find((s) => s.id === input.staffId);

    if (!service || !staffMember) {
      return { ok: false, error: 'Serviço ou profissional não encontrado.' };
    }

    if (input.simulateRaceConflict) {
      return {
        ok: false,
        error: 'horário indisponível, escolha outro',
      };
    }

    const slots = getAvailableTimeSlots({
      staff: staffMember,
      serviceDurationMin: service.durationMin,
      date: input.date,
      appointments: state.appointments,
      overrides: state.overrides,
      timeOffBlocks: state.timeOffBlocks,
    });

    const matched = slots.find((s) => s.time === input.startTime);
    if (!matched || !matched.available) {
      return { ok: false, error: 'horário indisponível, escolha outro' };
    }

    const endTime = minutesToHHMM(
      formatTimeToMinutes(input.startTime) + service.durationMin,
    );

    const hoursAhead = hoursBetweenNowAndAppointment(
      todayISO,
      state.simulatedTimeHHMM,
      input.date,
      input.startTime,
    );

    // Regra US-09: < 24h de antecedência não envia lembrete e já nasce confirmado
    const lessThan24h = hoursAhead < 24;
    const status: AppointmentStatus =
      input.source === 'encaixe' || lessThan24h ? 'confirmado' : 'aguardando_confirmacao';
    const reminder24hStatus = lessThan24h ? 'nao_aplicavel' : 'agendado';

    let clientId = input.clientId;
    const newClients = [...state.clients];
    if (!clientId) {
      clientId = `cli-${Date.now()}`;
      newClients.push({
        id: clientId,
        name: input.clientName,
        phone: input.clientPhone,
        email: '',
        createdAt: todayISO,
      });
    }

    const nextNumber = 2115 + state.appointments.length;
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      code: `AG-${nextNumber}`,
      clientId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      serviceId: service.id,
      serviceName: service.name,
      serviceDurationMin: service.durationMin,
      servicePrice: service.price,
      staffId: staffMember.id,
      staffName: staffMember.name,
      date: input.date,
      startTime: input.startTime,
      endTime,
      status,
      source: input.source,
      reminder24hStatus,
      notes: input.notes,
      createdAt: `${todayISO} ${state.simulatedTimeHHMM}`,
    };

    setState((prev) => ({
      ...prev,
      clients: newClients,
      appointments: [...prev.appointments, newApt],
    }));

    return { ok: true, appointment: newApt };
  };

  const confirmAppointmentByReminder = (appointmentId: string) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: a.status === 'aguardando_confirmacao' ? 'confirmado' : a.status,
              reminder24hStatus: 'confirmado_link',
            }
          : a,
      ),
    }));
    pushToast({
      type: 'success',
      title: 'Presença confirmada!',
      description: 'O painel da recepção já exibe seu horário como confirmado.',
    });
  };

  const cancelAppointment = (appointmentId: string, reason?: string) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'cancelado',
              notes: reason ? `${a.notes ? a.notes + ' · ' : ''}Cancelado: ${reason}` : a.notes,
            }
          : a,
      ),
    }));
    pushToast({
      type: 'info',
      title: 'Agendamento cancelado',
      description: 'O horário voltou a ficar livre na agenda da profissional.',
    });
  };

  const rescheduleAppointment: SalonContextValue['rescheduleAppointment'] = (
    appointmentId,
    newDate,
    newStartTime,
    newStaffId,
  ) => {
    const existing = state.appointments.find((a) => a.id === appointmentId);
    if (!existing) return { ok: false, error: 'Agendamento não encontrado.' };

    const targetStaffId = newStaffId ?? existing.staffId;
    const staffMember = state.staff.find((s) => s.id === targetStaffId);
    if (!staffMember) return { ok: false, error: 'Profissional não encontrada.' };

    const slots = getAvailableTimeSlots({
      staff: staffMember,
      serviceDurationMin: existing.serviceDurationMin,
      date: newDate,
      appointments: state.appointments,
      overrides: state.overrides,
      timeOffBlocks: state.timeOffBlocks,
      excludeAppointmentId: existing.id,
    });

    const match = slots.find((s) => s.time === newStartTime);
    if (!match || !match.available) {
      return { ok: false, error: 'horário indisponível, escolha outro' };
    }

    const newEndTime = minutesToHHMM(
      formatTimeToMinutes(newStartTime) + existing.serviceDurationMin,
    );

    const hoursAhead = hoursBetweenNowAndAppointment(
      todayISO,
      state.simulatedTimeHHMM,
      newDate,
      newStartTime,
    );

    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              staffId: staffMember.id,
              staffName: staffMember.name,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              status: hoursAhead < 24 ? 'confirmado' : 'aguardando_confirmacao',
              reminder24hStatus: hoursAhead < 24 ? 'nao_aplicavel' : 'agendado',
            }
          : a,
      ),
    }));

    pushToast({
      type: 'success',
      title: 'Horário remarcado',
      description: `${newDate.split('-').reverse().join('/')} às ${newStartTime} com ${staffMember.name}.`,
    });
    return { ok: true };
  };

  const markAppointmentAttendance: SalonContextValue['markAppointmentAttendance'] = (
    appointmentId,
    attendance,
  ) => {
    const apt = state.appointments.find((a) => a.id === appointmentId);
    if (!apt) return { ok: false, error: 'Agendamento não encontrado.' };

    const past = isAppointmentInPast(apt.date, apt.startTime, todayISO, state.simulatedTimeHHMM);
    if (attendance === 'nao_compareceu' && !past) {
      return {
        ok: false,
        error: 'Não é permitido marcar falta para atendimentos em horários futuros.',
      };
    }

    if (attendance === 'compareceu' && !past) {
      return {
        ok: false,
        error: 'Só é possível marcar "compareceu" quando o horário do atendimento já iniciou.',
      };
    }

    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: attendance } : a,
      ),
    }));

    pushToast({
      type: attendance === 'nao_compareceu' ? 'warning' : 'success',
      title:
        attendance === 'compareceu'
          ? 'Comparecimento registrado'
          : attendance === 'nao_compareceu'
            ? 'Falta registrada no histórico'
            : 'Horário confirmado',
      description: `${apt.clientName} · ${apt.serviceName}`,
    });

    return { ok: true };
  };

  const payAppointment: SalonContextValue['payAppointment'] = ({
    appointmentId,
    finalAmount,
    method,
    adjustmentReason,
    recordedBy = 'Carla · Recepção',
  }) => {
    const apt = state.appointments.find((a) => a.id === appointmentId);
    if (!apt) return { ok: false, error: 'Atendimento não encontrado.' };

    // Regra US-04: atendimento futuro ou marcado como "não compareceu" NÃO pode ser finalizado como pago
    if (apt.status !== 'compareceu') {
      return {
        ok: false,
        error:
          apt.status === 'nao_compareceu'
            ? 'Atendimento marcado como "Não compareceu" não pode ser finalizado como pago.'
            : 'Somente atendimentos marcados como "Compareceu" podem ser finalizados como pago.',
      };
    }

    const adjusted = Math.abs(finalAmount - apt.servicePrice) > 0.001;

    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'pago',
              payment: {
                originalAmount: apt.servicePrice,
                finalAmount,
                method,
                adjusted,
                adjustmentReason: adjusted ? adjustmentReason || 'Ajuste de balcão' : undefined,
                recordedBy,
                recordedAt: `${todayISO} ${state.simulatedTimeHHMM}`,
              },
            }
          : a,
      ),
    }));

    pushToast({
      type: 'success',
      title: 'Atendimento finalizado como pago',
      description: `${apt.clientName} · Repasse e relatório atualizados automaticamente.`,
    });

    return { ok: true };
  };

  const createProductOrder: SalonContextValue['createProductOrder'] = (input) => {
    if (input.items.length === 0) {
      return { ok: false, error: 'Adicione ao menos um produto à sacola.' };
    }

    const snapshots = input.items
      .map((i) => {
        const prod = state.products.find((p) => p.id === i.productId && p.active);
        if (!prod) return null;
        return {
          productId: prod.id,
          productName: prod.name,
          brand: prod.brand,
          quantity: i.quantity,
          unitSalePrice: prod.salePrice,
          unitCostPrice: prod.costPrice,
          visualType: prod.visualType,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (snapshots.length === 0) {
      return { ok: false, error: 'Produtos selecionados não estão disponíveis.' };
    }

    const nextCodeNum = 42 + state.orders.length;
    const newOrder: ProductOrder = {
      id: `ord-${Date.now()}`,
      code: `PED-${String(nextCodeNum).padStart(3, '0')}`,
      clientId: input.clientId,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      items: snapshots,
      status: 'solicitado',
      notes: input.notes,
      createdAt: `${todayISO} ${state.simulatedTimeHHMM}`,
      timeline: [
        {
          status: 'solicitado',
          at: `${todayISO} ${state.simulatedTimeHHMM}`,
          by: `${input.clientName.split(' ')[0]} · Vitrine`,
        },
      ],
    };

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));

    return { ok: true, order: newOrder };
  };

  const advanceOrderStatus: SalonContextValue['advanceOrderStatus'] = (
    orderId,
    nextStatus,
    actorLabel = 'Carla · Recepção',
  ) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: 'Pedido não encontrado.' };

    const freeSample = isOrderFreeSample(order);
    const allowed = getAllowedNextOrderStatuses(order.status, freeSample);
    if (!allowed.includes(nextStatus)) {
      return {
        ok: false,
        error: `Transição inválida: de "${order.status}" não é possível ir direto para "${nextStatus}".`,
      };
    }

    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              timeline: [
                ...o.timeline,
                {
                  status: nextStatus,
                  at: `${todayISO} ${state.simulatedTimeHHMM}`,
                  by: actorLabel,
                },
              ],
            }
          : o,
      ),
    }));

    pushToast({
      type: nextStatus === 'cancelado' ? 'warning' : 'success',
      title: `Pedido ${order.code} atualizado`,
      description: `Status alterado para "${nextStatus}".`,
    });

    return { ok: true };
  };

  const finalizeOrderPayment: SalonContextValue['finalizeOrderPayment'] = ({
    orderId,
    finalAmount,
    method,
    adjustmentReason,
    recordedBy = 'Carla · Recepção',
    asGift,
  }) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: 'Pedido não encontrado.' };

    if (order.status !== 'retirado') {
      return {
        ok: false,
        error: 'O pedido precisa estar com status "Retirado" antes de finalizar.',
      };
    }

    const freeSample = isOrderFreeSample(order);
    const originalTotal = order.items.reduce(
      (sum, item) => sum + item.unitSalePrice * item.quantity,
      0,
    );

    const finalStatus: OrderStatus = asGift || freeSample ? 'brinde' : 'pago';
    const adjusted = !freeSample && Math.abs(finalAmount - originalTotal) > 0.001;

    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: finalStatus,
              timeline: [
                ...o.timeline,
                {
                  status: finalStatus,
                  at: `${todayISO} ${state.simulatedTimeHHMM}`,
                  by: recordedBy,
                },
              ],
              payment: {
                originalAmount: originalTotal,
                finalAmount: finalStatus === 'brinde' ? 0 : finalAmount,
                method,
                adjusted,
                adjustmentReason: adjusted ? adjustmentReason || 'Ajuste de balcão' : undefined,
                recordedBy,
                recordedAt: `${todayISO} ${state.simulatedTimeHHMM}`,
                isGift: finalStatus === 'brinde',
              },
            }
          : o,
      ),
    }));

    pushToast({
      type: 'success',
      title:
        finalStatus === 'brinde'
          ? `Pedido ${order.code} registrado como brinde`
          : `Pedido ${order.code} finalizado como pago`,
      description:
        finalStatus === 'brinde'
          ? 'Saída registrada sem entrar no faturamento ou lucro.'
          : 'Valor contabilizado nos relatórios de vendas e lucro.',
    });

    return { ok: true };
  };

  const saveStaffMember: SalonContextValue['saveStaffMember'] = (member) => {
    if (!member.isReceptionist && member.employmentType !== 'clt_sem_comissao') {
      if (member.defaultCommissionPercent < 0 || member.defaultCommissionPercent > 100) {
        return { ok: false, error: 'O percentual de comissão deve estar entre 0% e 100%.' };
      }
      for (const pct of Object.values(member.serviceCommissions)) {
        if (pct < 0 || pct > 100) {
          return { ok: false, error: 'Todos os percentuais por serviço devem estar entre 0% e 100%.' };
        }
      }
    }

    const normalized: StaffMember = member.isReceptionist
      ? {
          ...member,
          employmentType: 'clt_sem_comissao',
          defaultCommissionPercent: 0,
          serviceCommissions: {},
        }
      : member;

    setState((prev) => {
      const exists = prev.staff.some((s) => s.id === normalized.id);
      return {
        ...prev,
        staff: exists
          ? prev.staff.map((s) => (s.id === normalized.id ? normalized : s))
          : [...prev.staff, normalized],
      };
    });

    pushToast({
      type: 'success',
      title: 'Cadastro da equipe salvo',
      description: `${normalized.name} · Escala e remuneração atualizadas.`,
    });

    return { ok: true };
  };

  const saveService = (service: ServiceItem) => {
    setState((prev) => {
      const exists = prev.services.some((s) => s.id === service.id);
      return {
        ...prev,
        services: exists
          ? prev.services.map((s) => (s.id === service.id ? service : s))
          : [...prev.services, service],
      };
    });
    pushToast({
      type: 'success',
      title: 'Serviço atualizado',
      description: service.name,
    });
  };

  const saveSupplier = (supplier: Supplier) => {
    setState((prev) => {
      const exists = prev.suppliers.some((s) => s.id === supplier.id);
      return {
        ...prev,
        suppliers: exists
          ? prev.suppliers.map((s) => (s.id === supplier.id ? supplier : s))
          : [...prev.suppliers, supplier],
      };
    });
    pushToast({
      type: 'success',
      title: 'Fornecedor salvo',
      description: `${supplier.companyName} (${supplier.representativeName})`,
    });
  };

  const saveProduct: SalonContextValue['saveProduct'] = (product) => {
    if (product.costPrice < 0) {
      return { ok: false, error: 'Preço de custo negativo não é aceito no cadastro.' };
    }
    if (product.salePrice < 0) {
      return { ok: false, error: 'Preço de venda não pode ser negativo.' };
    }

    setState((prev) => {
      const exists = prev.products.some((p) => p.id === product.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [...prev.products, product],
      };
    });

    pushToast({
      type: product.salePrice < product.costPrice ? 'warning' : 'success',
      title: 'Produto salvo',
      description:
        product.salePrice < product.costPrice
          ? `${product.name} salvo com margem negativa (venda abaixo do custo).`
          : product.name,
    });

    return { ok: true };
  };

  const toggleProductActive = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, active: !p.active } : p,
      ),
    }));
  };

  const addTimeOffBlock = (block: Omit<TimeOffBlock, 'id' | 'createdAt'>) => {
    const newBlock: TimeOffBlock = {
      ...block,
      id: `off-${Date.now()}`,
      createdAt: `${todayISO} ${state.simulatedTimeHHMM}`,
    };
    setState((prev) => ({
      ...prev,
      timeOffBlocks: [...prev.timeOffBlocks, newBlock],
    }));
    pushToast({
      type: 'info',
      title: 'Bloqueio de folga registrado',
      description: 'Esses horários já foram removidos da vitrine e do encaixe.',
    });
  };

  const removeTimeOffBlock = (id: string) => {
    setState((prev) => ({
      ...prev,
      timeOffBlocks: prev.timeOffBlocks.filter((b) => b.id !== id),
    }));
  };

  const addScheduleOverride = (override: Omit<ScheduleOverride, 'id'>) => {
    setState((prev) => ({
      ...prev,
      overrides: [...prev.overrides, { ...override, id: `ovr-${Date.now()}` }],
    }));
    pushToast({
      type: 'success',
      title: 'Troca na escala aplicada',
      description: 'Disponibilidade da data atualizada em toda a agenda.',
    });
  };

  const removeScheduleOverride = (id: string) => {
    setState((prev) => ({
      ...prev,
      overrides: prev.overrides.filter((o) => o.id !== id),
    }));
  };

  const saveBanner = (banner: VitrineBanner) => {
    setState((prev) => {
      const exists = prev.banners.some((b) => b.id === banner.id);
      return {
        ...prev,
        banners: exists
          ? prev.banners.map((b) => (b.id === banner.id ? banner : b))
          : [...prev.banners, banner],
      };
    });
    pushToast({
      type: 'success',
      title: 'Banner da vitrine salvo',
      description: banner.title,
    });
  };

  const deleteBanner = (id: string) => {
    setState((prev) => ({
      ...prev,
      banners: prev.banners.filter((b) => b.id !== id),
    }));
  };

  return (
    <SalonContext.Provider
      value={{
        ...state,
        activeSection,
        setActiveSection,
        navIntent,
        navigateTo,
        clearNavIntent,
        todayISO,
        setSimulatedTimeHHMM,
        setActiveProfessionalId,
        setActiveClientId,
        toasts,
        pushToast,
        dismissToast,
        resetDemoData,
        createAppointment,
        confirmAppointmentByReminder,
        cancelAppointment,
        rescheduleAppointment,
        markAppointmentAttendance,
        payAppointment,
        createProductOrder,
        advanceOrderStatus,
        finalizeOrderPayment,
        saveStaffMember,
        saveService,
        saveSupplier,
        saveProduct,
        toggleProductActive,
        addTimeOffBlock,
        removeTimeOffBlock,
        addScheduleOverride,
        removeScheduleOverride,
        saveBanner,
        deleteBanner,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export function useSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) throw new Error('useSalon must be used inside SalonProvider');
  return ctx;
}
