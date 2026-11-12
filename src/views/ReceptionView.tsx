import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  History,
  Package,
  Plus,
  QrCode,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { IPrettyWordmark } from '../components/brand/BrandAssets';
import {
  AppointmentStatusBadge,
  Badge,
  Button,
  Modal,
  OrderStatusBadge,
  SectionCard,
} from '../components/ui/Primitives';
import { useSalon } from '../context/SalonContext';
import { Appointment, PaymentMethod, ProductOrder } from '../types/salon';
import {
  addDaysISO,
  formatCurrency,
  formatDateBR,
  formatDateShortBR,
  getAllowedNextOrderStatuses,
  getAvailableTimeSlots,
  getDayOfWeek,
  isAppointmentInPast,
  isOrderFreeSample,
} from '../utils/calculations';

export type ReceptionTab = 'agenda' | 'pedidos' | 'caixa';

export type ReceptionModalType =
  | 'detalhe-atendimento'
  | 'encaixe'
  | 'detalhe-pedido'
  | 'pagamento'
  | 'pedido-balcao';

export interface ReceptionViewProps {
  embedded?: boolean;
  initialTab?: ReceptionTab;
  initialModal?: ReceptionModalType;
}

export const ReceptionView: React.FC<ReceptionViewProps> = ({
  embedded = false,
  initialTab = 'agenda',
  initialModal,
}) => {
  const {
    staff,
    services,
    products,
    clients,
    appointments,
    orders,
    overrides,
    timeOffBlocks,
    todayISO,
    simulatedTimeHHMM,
    setSimulatedTimeHHMM,
    navIntent,
    clearNavIntent,
    createAppointment,
    markAppointmentAttendance,
    payAppointment,
    cancelAppointment,
    createProductOrder,
    advanceOrderStatus,
    finalizeOrderPayment,
    pushToast,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<ReceptionTab>(initialTab);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ativos');

  // Modais Recepção (POP-R01 .. POP-R04)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(initialModal === 'encaixe');
  const [walkInClientMode, setWalkInClientMode] = useState<'existente' | 'nova'>('existente');
  const [walkInClientId, setWalkInClientId] = useState(clients[0]?.id ?? '');
  const [walkInClientName, setWalkInClientName] = useState('');
  const [walkInClientPhone, setWalkInClientPhone] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState(services[0]?.id ?? '');
  const [walkInStaffId, setWalkInStaffId] = useState('staff-marta');
  const [walkInDate, setWalkInDate] = useState(todayISO);
  const [walkInTime, setWalkInTime] = useState('');
  const [walkInNotes, setWalkInNotes] = useState('');

  const [selectedOrderModal, setSelectedOrderModal] = useState<ProductOrder | null>(null);
  const [counterOrderOpen, setCounterOrderOpen] = useState(initialModal === 'pedido-balcao');
  const [counterClientId, setCounterClientId] = useState(clients[0]?.id ?? '');
  const [counterProductId, setCounterProductId] = useState(products.find((p) => p.active)?.id ?? '');
  const [counterQty, setCounterQty] = useState(1);

  // Payment Modal (POP-R04)
  const [paymentTarget, setPaymentTarget] = useState<
    | { kind: 'appointment'; item: Appointment }
    | { kind: 'order'; item: ProductOrder }
    | null
  >(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('pix');
  const [payReason, setPayReason] = useState('');
  const [cashGiven, setCashGiven] = useState('');

  useEffect(() => {
    if (!initialModal) return;
    if (initialModal === 'encaixe') setWalkInOpen(true);
    if (initialModal === 'pedido-balcao') setCounterOrderOpen(true);
    if (initialModal === 'detalhe-atendimento') {
      setSelectedAppointment(appointments.find((a) => a.date === todayISO) ?? appointments[0] ?? null);
    }
    if (initialModal === 'detalhe-pedido') {
      setSelectedOrderModal(orders[0] ?? null);
    }
    if (initialModal === 'pagamento') {
      const ready =
        appointments.find((a) => a.status === 'compareceu') ??
        appointments.find((a) => a.status !== 'pago' && a.status !== 'cancelado') ??
        appointments[0];
      if (ready) {
        setPaymentTarget({ kind: 'appointment', item: ready });
        setPayAmountInput(String(ready.servicePrice));
        setPayMethod('pix');
        setPayReason('');
        setCashGiven('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialModal]);

  useEffect(() => {
    if (embedded || !navIntent || navIntent.section !== 'recepcao') return;
    if (navIntent.subTab) setActiveTab(navIntent.subTab as ReceptionTab);
    if (navIntent.openModal === 'encaixe') setWalkInOpen(true);
    if (navIntent.openModal === 'pedido-balcao') setCounterOrderOpen(true);
    if (navIntent.openModal === 'detalhe-atendimento') {
      setSelectedAppointment(appointments.find((a) => a.date === todayISO) ?? appointments[0] ?? null);
    }
    if (navIntent.openModal === 'pagamento') {
      const ready = appointments.find((a) => a.status === 'compareceu') ?? appointments[0];
      if (ready) openPaymentForAppointment(ready);
    }
    if (navIntent.openModal === 'detalhe-pedido') {
      setSelectedOrderModal(orders[0] ?? null);
    }
    clearNavIntent();
  }, [navIntent, embedded]);

  const professionals = useMemo(
    () => staff.filter((s) => s.active && !s.isReceptionist),
    [staff],
  );

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === selectedDate && a.status !== 'cancelado')
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, selectedDate],
  );

  const walkInService = services.find((s) => s.id === walkInServiceId) ?? services[0];
  const walkInStaff = staff.find((s) => s.id === walkInStaffId) ?? professionals[0];

  const walkInSlots = useMemo(() => {
    if (!walkInService || !walkInStaff) return [];
    return getAvailableTimeSlots({
      staff: walkInStaff,
      serviceDurationMin: walkInService.durationMin,
      date: walkInDate,
      appointments,
      overrides,
      timeOffBlocks,
    });
  }, [walkInService, walkInStaff, walkInDate, appointments, overrides, timeOffBlocks]);

  const openPaymentForAppointment = (apt: Appointment) => {
    setPaymentTarget({ kind: 'appointment', item: apt });
    setPayAmountInput(String(apt.servicePrice));
    setPayMethod('pix');
    setPayReason('');
    setCashGiven('');
  };

  const openPaymentForOrder = (ord: ProductOrder) => {
    const total = ord.items.reduce((s, i) => s + i.unitSalePrice * i.quantity, 0);
    setPaymentTarget({ kind: 'order', item: ord });
    setPayAmountInput(String(total));
    setPayMethod('pix');
    setPayReason('');
    setCashGiven('');
  };

  const handleConfirmWalkIn = () => {
    if (!walkInService || !walkInStaff || !walkInTime) return;
    let cId: string | undefined;
    let cName = walkInClientName.trim();
    let cPhone = walkInClientPhone.trim();

    if (walkInClientMode === 'existente') {
      const found = clients.find((c) => c.id === walkInClientId);
      if (found) {
        cId = found.id;
        cName = found.name;
        cPhone = found.phone;
      }
    }

    if (!cName) {
      pushToast({ type: 'error', title: 'Informe o nome da cliente para o encaixe.' });
      return;
    }

    const res = createAppointment({
      clientId: cId,
      clientName: cName,
      clientPhone: cPhone || '(11) 99999-0000',
      serviceId: walkInService.id,
      staffId: walkInStaff.id,
      date: walkInDate,
      startTime: walkInTime,
      source: 'encaixe',
      notes: walkInNotes || 'Encaixe registrado na recepção.',
    });

    if (!res.ok) {
      pushToast({ type: 'error', title: 'Conflito de horário', description: res.error });
      return;
    }

    pushToast({
      type: 'success',
      title: 'Encaixe agendado com sucesso',
      description: `${cName} · ${walkInTime} com ${walkInStaff.name}`,
    });
    setWalkInOpen(false);
    setWalkInTime('');
    setWalkInNotes('');
    setSelectedDate(walkInDate);
  };

  const handleSubmitPayment = (asGift = false) => {
    if (!paymentTarget) return;
    const numeric = Number(payAmountInput.replace(',', '.'));
    if (!asGift && (Number.isNaN(numeric) || numeric < 0)) {
      pushToast({ type: 'error', title: 'Informe um valor válido.' });
      return;
    }

    if (paymentTarget.kind === 'appointment') {
      const res = payAppointment({
        appointmentId: paymentTarget.item.id,
        finalAmount: numeric,
        method: payMethod,
        adjustmentReason: payReason,
        recordedBy: 'Carla · Recepção',
      });
      if (!res.ok) {
        pushToast({ type: 'error', title: 'Pagamento bloqueado (US-04)', description: res.error });
        return;
      }
      setPaymentTarget(null);
      setSelectedAppointment(null);
    } else {
      const res = finalizeOrderPayment({
        orderId: paymentTarget.item.id,
        finalAmount: asGift ? 0 : numeric,
        method: payMethod,
        adjustmentReason: payReason,
        recordedBy: 'Carla · Recepção',
        asGift,
      });
      if (!res.ok) {
        pushToast({ type: 'error', title: 'Ação bloqueada', description: res.error });
        return;
      }
      setPaymentTarget(null);
      setSelectedOrderModal(null);
    }
  };

  // Resumos do Caixa (R-04)
  const paidAppointmentsToday = appointments.filter(
    (a) => a.status === 'pago' && a.date === selectedDate,
  );
  const paidOrdersToday = orders.filter(
    (o) =>
      (o.status === 'pago' || o.status === 'brinde') &&
      o.createdAt.startsWith(selectedDate),
  );

  const allPaymentsToday = [
    ...paidAppointmentsToday.map((a) => ({
      id: a.id,
      label: `${a.clientName} · ${a.serviceName}`,
      type: 'Serviço',
      payment: a.payment!,
    })),
    ...paidOrdersToday
      .filter((o) => o.payment)
      .map((o) => ({
        id: o.id,
        label: `${o.clientName} · ${o.code}`,
        type: o.status === 'brinde' ? 'Brinde' : 'Produto',
        payment: o.payment!,
      })),
  ];

  const totalByMethod = {
    pix: allPaymentsToday
      .filter((p) => !p.payment.isGift && p.payment.method === 'pix')
      .reduce((s, p) => s + p.payment.finalAmount, 0),
    dinheiro: allPaymentsToday
      .filter((p) => !p.payment.isGift && p.payment.method === 'dinheiro')
      .reduce((s, p) => s + p.payment.finalAmount, 0),
    cartao: allPaymentsToday
      .filter((p) => !p.payment.isGift && p.payment.method === 'cartao')
      .reduce((s, p) => s + p.payment.finalAmount, 0),
  };

  const pendingOrdersCount = orders.filter((o) =>
    ['solicitado', 'separado', 'retirado'].includes(o.status),
  ).length;

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'ativos') {
      return ['solicitado', 'separado', 'retirado'].includes(o.status);
    }
    if (orderStatusFilter === 'todos') return true;
    return o.status === orderStatusFilter;
  });

  const getClientHistoryStats = (clientId: string) => {
    const list = appointments.filter((a) => a.clientId === clientId);
    const attended = list.filter((a) => a.status === 'compareceu' || a.status === 'pago').length;
    const missed = list.filter((a) => a.status === 'nao_compareceu').length;
    return { total: list.length, attended, missed };
  };

  return (
    <div
      className={
        embedded
          ? 'relative h-full overflow-hidden bg-[#F7F3EE] text-[#1F1815]'
          : 'min-h-screen bg-[#F7F3EE] text-[#1F1815] pb-14'
      }
    >
      <div className={embedded ? 'h-full overflow-y-auto pb-8' : ''}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Balcão */}
        <header className="bg-white rounded-2xl border border-[#E3DBD0] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IPrettyWordmark compact />
            <div className="h-7 w-px bg-[#E3DBD0] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold">Carla · Recepção & Caixa</span>
                <Badge tone="slate">US-03 / US-04</Badge>
              </div>
              <div className="text-xs text-[#5A4F48]">
                Agenda sem conflito, encaixe rápido e fechamento de caixa
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simulador de Hora para testar regra de futuro vs passado */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E3DBD0] rounded-xl px-3 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#B85D43]" />
              <span className="text-[#5A4F48]">Hora simulada:</span>
              <select
                value={simulatedTimeHHMM}
                onChange={(e) => setSimulatedTimeHHMM(e.target.value)}
                className="font-mono-num font-bold bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="09:00">09:00 (início)</option>
                <option value="13:30">13:30 (meio do dia)</option>
                <option value="17:00">17:00 (fim da tarde)</option>
                <option value="20:00">20:00 (encerramento)</option>
              </select>
            </div>

            <Button variant="primary" size="sm" onClick={() => setWalkInOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo encaixe
            </Button>
          </div>
        </header>

        {/* Sub-navegação Recepção */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[#EFE9E1] border border-[#E3DBD0] gap-1">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeTab === 'agenda' ? 'bg-white text-[#1F1815] shadow-xs' : 'text-[#5A4F48]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              R-01 · Painel do Dia
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeTab === 'pedidos' ? 'bg-white text-[#1F1815] shadow-xs' : 'text-[#5A4F48]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              R-02 · Pedidos da Vitrine
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#B85D43] text-white text-[10px] font-mono-num">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('caixa')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeTab === 'caixa' ? 'bg-white text-[#1F1815] shadow-xs' : 'text-[#5A4F48]'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              R-04 · Caixa & Clientes
            </button>
          </div>

          {activeTab === 'agenda' && (
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Ontem', iso: addDaysISO(todayISO, -1) },
                { label: 'Hoje', iso: todayISO },
                { label: 'Amanhã', iso: addDaysISO(todayISO, 1) },
              ].map((d) => (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                    selectedDate === d.iso
                      ? 'bg-[#1F1815] text-white border-[#1F1815]'
                      : 'bg-white text-[#5A4F48] border-[#E3DBD0]'
                  }`}
                >
                  {d.label} ({d.iso.split('-')[2]}/{d.iso.split('-')[1]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === R-01: PAINEL DO DIA MULTI-COLUNA (US-03) === */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            {/* KPIs do Dia */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SectionCard className="p-4">
                <div className="text-xs text-[#8B7F77]">Atendimentos em {formatDateBR(selectedDate)}</div>
                <div className="font-display text-2xl font-semibold mt-1 tabular-nums">
                  {dayAppointments.length}
                </div>
              </SectionCard>
              <SectionCard className="p-4">
                <div className="text-xs text-[#8B7F77]">Confirmados</div>
                <div className="font-display text-2xl font-semibold mt-1 text-[#38664E] tabular-nums">
                  {
                    dayAppointments.filter((a) =>
                      ['confirmado', 'compareceu', 'pago'].includes(a.status),
                    ).length
                  }
                </div>
              </SectionCard>
              <SectionCard className="p-4">
                <div className="text-xs text-[#8B7F77]">Aguardando pagamento</div>
                <div className="font-display text-2xl font-semibold mt-1 text-[#B85D43] tabular-nums">
                  {dayAppointments.filter((a) => a.status === 'compareceu').length}
                </div>
              </SectionCard>
              <SectionCard className="p-4">
                <div className="text-xs text-[#8B7F77]">Faltas no dia</div>
                <div className="font-display text-2xl font-semibold mt-1 text-[#B43B3B] tabular-nums">
                  {dayAppointments.filter((a) => a.status === 'nao_compareceu').length}
                </div>
              </SectionCard>
            </div>

            {/* Colunas por Profissional */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              {professionals.map((prof) => {
                const profApts = dayAppointments.filter((a) => a.staffId === prof.id);
                const dow = getDayOfWeek(selectedDate);
                const override = overrides.find(
                  (o) => o.staffId === prof.id && o.date === selectedDate,
                );
                const shift = override ?? prof.schedule[dow];
                const blocks = timeOffBlocks.filter(
                  (b) => b.staffId === prof.id && b.date === selectedDate,
                );

                return (
                  <SectionCard key={prof.id} className="overflow-hidden">
                    <div className="px-4 py-3.5 bg-[#FAF7F2] border-b border-[#E3DBD0] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ backgroundColor: prof.avatarColor }}
                        >
                          {prof.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{prof.name}</div>
                          <div className="text-[11px] text-[#5A4F48]">
                            {shift?.enabled
                              ? `Escala ${shift.start}–${shift.end}`
                              : 'Folga na escala'}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setWalkInStaffId(prof.id);
                          const firstSrv = services.find((s) =>
                            s.professionalIds.includes(prof.id),
                          );
                          if (firstSrv) setWalkInServiceId(firstSrv.id);
                          setWalkInDate(selectedDate);
                          setWalkInOpen(true);
                        }}
                      >
                        + Encaixar
                      </Button>
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      {blocks.map((blk) => (
                        <div
                          key={blk.id}
                          className="p-2.5 rounded-xl bg-[#FBF0DC] border border-[#EDD6A9] text-xs text-[#8B5910]"
                        >
                          <strong>Bloqueio ({blk.start}–{blk.end}):</strong> {blk.reason}
                        </div>
                      ))}

                      {profApts.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#8B7F77]">
                          Nenhum horário marcado para {prof.name} nesta data.
                        </div>
                      ) : (
                        profApts.map((apt) => {
                          const isPast = isAppointmentInPast(
                            apt.date,
                            apt.startTime,
                            todayISO,
                            simulatedTimeHHMM,
                          );
                          return (
                            <div
                              key={apt.id}
                              onClick={() => setSelectedAppointment(apt)}
                              className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                                apt.status === 'compareceu'
                                  ? 'bg-[#F6E6E0]/45 border-[#E8C8BD]'
                                  : apt.status === 'pago'
                                    ? 'bg-[#FAF7F2] border-[#E3DBD0] opacity-85'
                                    : 'bg-white border-[#E3DBD0] hover:border-[#B85D43]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono-num text-xs font-bold text-[#1F1815]">
                                  {apt.startTime} – {apt.endTime}
                                </span>
                                <AppointmentStatusBadge status={apt.status} />
                              </div>

                              <div className="mt-1.5 font-semibold text-sm">{apt.clientName}</div>
                              <div className="text-xs text-[#5A4F48]">{apt.serviceName}</div>

                              <div className="mt-2.5 pt-2 border-t border-[#EFE9E1] flex items-center justify-between gap-2">
                                <span className="text-[11px] font-mono-num text-[#8B7F77]">
                                  {apt.source === 'encaixe' ? 'Encaixe balcão' : 'Via vitrine'} ·{' '}
                                  {formatCurrency(apt.payment?.finalAmount ?? apt.servicePrice)}
                                </span>

                                <div
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {(apt.status === 'aguardando_confirmacao' ||
                                    apt.status === 'confirmado') && (
                                    <>
                                      <button
                                        onClick={() => {
                                          const r = markAppointmentAttendance(apt.id, 'compareceu');
                                          if (!r.ok) {
                                            pushToast({
                                              type: 'warning',
                                              title: 'Regra de horário (US-03)',
                                              description: r.error,
                                            });
                                          }
                                        }}
                                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                          isPast
                                            ? 'bg-[#E3EFE8] text-[#28503B] hover:bg-[#CDE2D5]'
                                            : 'bg-[#EFE9E1] text-[#8B7F77]'
                                        }`}
                                      >
                                        Compareceu
                                      </button>
                                      <button
                                        onClick={() => {
                                          const r = markAppointmentAttendance(
                                            apt.id,
                                            'nao_compareceu',
                                          );
                                          if (!r.ok) {
                                            pushToast({
                                              type: 'warning',
                                              title: 'Regra de horário (US-03)',
                                              description: r.error,
                                            });
                                          }
                                        }}
                                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                          isPast
                                            ? 'bg-[#FAE6E6] text-[#922B2B] hover:bg-[#F4CCCC]'
                                            : 'bg-[#EFE9E1] text-[#8B7F77]'
                                        }`}
                                      >
                                        Faltou
                                      </button>
                                    </>
                                  )}

                                  {apt.status === 'compareceu' && (
                                    <button
                                      onClick={() => openPaymentForAppointment(apt)}
                                      className="px-2.5 py-1 rounded-lg bg-[#1F1815] text-white text-[11px] font-semibold cursor-pointer hover:bg-[#B85D43]"
                                    >
                                      Registrar pagamento
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </div>
        )}

        {/* === R-02: FILA DE PEDIDOS DE PRODUTOS (US-04) === */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'ativos', label: 'Em andamento' },
                    { id: 'solicitado', label: 'Solicitados' },
                    { id: 'separado', label: 'Separados' },
                    { id: 'retirado', label: 'Retirados (p/ pagar)' },
                    { id: 'pago', label: 'Pagos / Brindes' },
                    { id: 'todos', label: 'Todos' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                      orderStatusFilter === f.id
                        ? 'bg-[#1F1815] text-white border-[#1F1815]'
                        : 'bg-white text-[#5A4F48] border-[#E3DBD0]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <Button variant="dark" size="sm" onClick={() => setCounterOrderOpen(true)}>
                <Plus className="w-4 h-4" />
                Novo pedido no balcão
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] text-xs text-[#5A4F48]">
              <strong>Fluxo obrigatório (US-04):</strong>{' '}
              <code className="font-mono-num">
                solicitado → separado → retirado → pago (ou brinde)
              </code>
              . O cancelamento só é permitido antes da retirada no balcão.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((ord) => {
                const freeSample = isOrderFreeSample(ord);
                const nextStatuses = getAllowedNextOrderStatuses(ord.status, freeSample);
                const total = ord.items.reduce(
                  (sum, it) => sum + it.unitSalePrice * it.quantity,
                  0,
                );

                return (
                  <SectionCard key={ord.id} className="p-5 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-mono-num text-[#8B7F77]">
                            {ord.code} · {ord.createdAt}
                          </span>
                          <h3 className="font-display text-lg font-semibold">{ord.clientName}</h3>
                          <div className="text-xs text-[#5A4F48]">{ord.clientPhone}</div>
                        </div>
                        <OrderStatusBadge status={ord.status} />
                      </div>

                      <div className="mt-3 space-y-1.5">
                        {ord.items.map((it) => (
                          <div
                            key={it.productId}
                            className="flex justify-between text-xs bg-[#F7F3EE] px-3 py-2 rounded-xl"
                          >
                            <span>
                              <strong>{it.quantity}x</strong> {it.productName}
                            </span>
                            <span className="font-mono-num font-semibold">
                              {it.unitSalePrice === 0 && it.unitCostPrice === 0
                                ? 'Amostra grátis'
                                : formatCurrency(it.unitSalePrice * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <div className="mt-2 text-xs text-[#5A4F48] italic">
                          Obs.: {ord.notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#EFE9E1] flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-[#8B7F77] mr-1.5">Total:</span>
                        <span className="font-mono-num text-sm font-bold">
                          {freeSample ? 'Amostra (Brinde)' : formatCurrency(ord.payment?.finalAmount ?? total)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrderModal(ord)}
                        >
                          <History className="w-3.5 h-3.5" />
                          Histórico
                        </Button>

                        {nextStatuses.includes('separado') && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => advanceOrderStatus(ord.id, 'separado')}
                          >
                            Marcar separado
                          </Button>
                        )}
                        {nextStatuses.includes('retirado') && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => advanceOrderStatus(ord.id, 'retirado')}
                          >
                            Confirmar retirada
                          </Button>
                        )}
                        {nextStatuses.includes('cancelado') && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => advanceOrderStatus(ord.id, 'cancelado')}
                          >
                            Cancelar
                          </Button>
                        )}
                        {ord.status === 'retirado' && (
                          <Button
                            size="sm"
                            variant={freeSample ? 'sage' : 'dark'}
                            onClick={() => openPaymentForOrder(ord)}
                          >
                            {freeSample ? (
                              <>
                                <Gift className="w-3.5 h-3.5" /> Finalizar como Brinde
                              </>
                            ) : (
                              'Registrar pagamento'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </div>
        )}

        {/* === R-04: CAIXA DO TURNO & CLIENTES === */}
        {activeTab === 'caixa' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <SectionCard className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#8B7F77]">
                      Fechamento do dia {formatDateBR(selectedDate)}
                    </span>
                    <h2 className="font-display text-2xl font-semibold">
                      Caixa da Recepção
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#8B7F77]">Total recebido</div>
                    <div className="font-display text-2xl font-semibold text-[#38664E] tabular-nums">
                      {formatCurrency(
                        totalByMethod.pix + totalByMethod.dinheiro + totalByMethod.cartao,
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                    <div className="text-xs text-[#5A4F48] flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#38664E]" /> Pix
                    </div>
                    <div className="font-mono-num font-bold text-base mt-1">
                      {formatCurrency(totalByMethod.pix)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                    <div className="text-xs text-[#5A4F48] flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-[#B85D43]" /> Dinheiro
                    </div>
                    <div className="font-mono-num font-bold text-base mt-1">
                      {formatCurrency(totalByMethod.dinheiro)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                    <div className="text-xs text-[#5A4F48] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#4B5B6B]" /> Cartão
                    </div>
                    <div className="font-mono-num font-bold text-base mt-1">
                      {formatCurrency(totalByMethod.cartao)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-[#5A4F48]">
                    Lançamentos finalizados nesta data (com auditoria de ajuste):
                  </div>
                  {allPaymentsToday.length === 0 ? (
                    <div className="text-xs text-[#8B7F77] py-4">
                      Nenhum pagamento registrado nesta data ainda.
                    </div>
                  ) : (
                    allPaymentsToday.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold">{entry.label}</div>
                          <div className="text-[11px] text-[#5A4F48]">
                            {entry.type} · {entry.payment.method.toUpperCase()} · por{' '}
                            {entry.payment.recordedBy}
                          </div>
                          {entry.payment.adjusted && (
                            <div className="text-[11px] text-[#B85D43] font-medium mt-0.5">
                              Ajustado de {formatCurrency(entry.payment.originalAmount)} →{' '}
                              {formatCurrency(entry.payment.finalAmount)} (
                              {entry.payment.adjustmentReason})
                            </div>
                          )}
                        </div>
                        <div className="font-mono-num font-bold text-sm">
                          {entry.payment.isGift
                            ? 'Brinde (R$ 0)'
                            : formatCurrency(entry.payment.finalAmount)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>

            <div className="lg:col-span-5">
              <SectionCard className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#B85D43]" />
                  <h3 className="font-display text-lg font-semibold">
                    Histórico de Clientes (Faltas & Visitas)
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {clients.map((cli) => {
                    const stats = getClientHistoryStats(cli.id);
                    return (
                      <div
                        key={cli.id}
                        className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-sm">{cli.name}</div>
                          <div className="text-[11px] font-mono-num text-[#5A4F48]">
                            {cli.phone}
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-semibold text-[#38664E]">
                            {stats.attended} comparecimentos
                          </div>
                          <div
                            className={`text-[11px] font-medium ${
                              stats.missed > 0 ? 'text-[#B43B3B]' : 'text-[#8B7F77]'
                            }`}
                          >
                            {stats.missed} faltas
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* POP-R01 · Detalhe do Atendimento (Recepção) */}
      <Modal
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        badge="Popup POP-R01 · Controle de Atendimento"
        title={selectedAppointment?.clientName ?? ''}
        subtitle={
          selectedAppointment
            ? `#${selectedAppointment.code} · ${formatDateBR(selectedAppointment.date)} às ${selectedAppointment.startTime}`
            : ''
        }
      >
        {selectedAppointment && (() => {
          const isPast = isAppointmentInPast(
            selectedAppointment.date,
            selectedAppointment.startTime,
            todayISO,
            simulatedTimeHHMM,
          );
          const stats = getClientHistoryStats(selectedAppointment.clientId);
          const canPay = selectedAppointment.status === 'compareceu';

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E3DBD0]">
                <div>
                  <div className="text-sm font-semibold">{selectedAppointment.serviceName}</div>
                  <div className="text-xs text-[#5A4F48]">
                    Profissional: <strong>{selectedAppointment.staffName}</strong> ·{' '}
                    {selectedAppointment.serviceDurationMin} min
                  </div>
                </div>
                <AppointmentStatusBadge status={selectedAppointment.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#F7F3EE]">
                  <div className="text-[#8B7F77]">Valor tabelado</div>
                  <div className="font-mono-num font-bold mt-0.5">
                    {formatCurrency(selectedAppointment.servicePrice)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#E3EFE8]">
                  <div className="text-[#28503B]">Comparecimentos</div>
                  <div className="font-mono-num font-bold mt-0.5">{stats.attended}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAE6E6]">
                  <div className="text-[#922B2B]">Faltas no histórico</div>
                  <div className="font-mono-num font-bold mt-0.5">{stats.missed}</div>
                </div>
              </div>

              {!isPast && (
                <div className="p-3 rounded-xl bg-[#FBF0DC] border border-[#EDD6A9] text-xs text-[#8B5910]">
                  Horário futuro em relação às <strong>{simulatedTimeHHMM}</strong>: pelas regras
                  US-03/US-04, ainda não é possível marcar falta nem finalizar como pago.
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedAppointment.status === 'aguardando_confirmacao' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      markAppointmentAttendance(selectedAppointment.id, 'confirmado');
                      setSelectedAppointment(null);
                    }}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Confirmar presença
                  </Button>
                )}

                {(selectedAppointment.status === 'aguardando_confirmacao' ||
                  selectedAppointment.status === 'confirmado') && (
                  <>
                    <Button
                      size="sm"
                      variant="sage"
                      onClick={() => {
                        const r = markAppointmentAttendance(selectedAppointment.id, 'compareceu');
                        if (!r.ok) pushToast({ type: 'warning', title: r.error });
                        else setSelectedAppointment(null);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Marcar Compareceu
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        const r = markAppointmentAttendance(
                          selectedAppointment.id,
                          'nao_compareceu',
                        );
                        if (!r.ok) pushToast({ type: 'warning', title: r.error });
                        else setSelectedAppointment(null);
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Marcar Falta
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="dark"
                  onClick={() => {
                    if (!canPay) {
                      pushToast({
                        type: 'warning',
                        title: 'Pagamento não permitido (US-04)',
                        description:
                          selectedAppointment.status === 'nao_compareceu'
                            ? 'Atendimento com falta não pode ser finalizado como pago.'
                            : 'Marque "Compareceu" antes de registrar o pagamento.',
                      });
                      return;
                    }
                    openPaymentForAppointment(selectedAppointment);
                  }}
                >
                  <Banknote className="w-3.5 h-3.5" /> Finalizar como Pago
                </Button>

                {selectedAppointment.status !== 'pago' &&
                  selectedAppointment.status !== 'cancelado' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        cancelAppointment(selectedAppointment.id, 'Cancelado na recepção');
                        setSelectedAppointment(null);
                      }}
                    >
                      Cancelar horário
                    </Button>
                  )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* POP-R02 · Modal Novo Encaixe Manual (US-03) */}
      <Modal
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        badge="Popup POP-R02 · Encaixe Manual (US-03)"
        title="Registrar encaixe no painel"
        subtitle="Aplica as mesmas regras de escala e não sobreposição da vitrine online (US-01)."
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#EFE9E1]">
            <button
              type="button"
              onClick={() => setWalkInClientMode('existente')}
              className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                walkInClientMode === 'existente' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
              }`}
            >
              Cliente cadastrada
            </button>
            <button
              type="button"
              onClick={() => setWalkInClientMode('nova')}
              className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 ${
                walkInClientMode === 'nova' ? 'bg-white text-[#1F1815]' : 'text-[#5A4F48]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Nova cliente rápida
            </button>
          </div>

          {walkInClientMode === 'existente' ? (
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Selecione a cliente
              </label>
              <select
                value={walkInClientId}
                onChange={(e) => setWalkInClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC3] text-sm bg-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.phone}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  Nome completo
                </label>
                <input
                  value={walkInClientName}
                  onChange={(e) => setWalkInClientName(e.target.value)}
                  placeholder="Ex: Mariana Lopes"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                  WhatsApp
                </label>
                <input
                  value={walkInClientPhone}
                  onChange={(e) => setWalkInClientPhone(e.target.value)}
                  placeholder="(11) 99999-0000"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Serviço</label>
              <select
                value={walkInServiceId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setWalkInServiceId(nextId);
                  const srv = services.find((s) => s.id === nextId);
                  if (srv && !srv.professionalIds.includes(walkInStaffId)) {
                    setWalkInStaffId(srv.professionalIds[0] ?? professionals[0]?.id ?? '');
                  }
                  setWalkInTime('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm bg-white"
              >
                {services
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMin}min · {formatCurrency(s.price)})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                Profissional
              </label>
              <select
                value={walkInStaffId}
                onChange={(e) => {
                  setWalkInStaffId(e.target.value);
                  setWalkInTime('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm bg-white"
              >
                {professionals
                  .filter((p) => walkInService?.professionalIds.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.specialtyLabel})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Data</label>
            <div className="grid grid-cols-3 gap-2">
              {[todayISO, addDaysISO(todayISO, 1), addDaysISO(todayISO, 2)].map((iso) => (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setWalkInDate(iso);
                    setWalkInTime('');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    walkInDate === iso
                      ? 'bg-[#B85D43] text-white border-[#B85D43]'
                      : 'bg-[#F7F3EE] border-[#E3DBD0]'
                  }`}
                >
                  {formatDateShortBR(iso)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1.5">
              Horários na escala de {walkInStaff?.name} (vermelho = conflito/bloqueio)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-44 overflow-y-auto p-1">
              {walkInSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  title={slot.reason ?? 'Disponível'}
                  onClick={() => setWalkInTime(slot.time)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-mono-num font-semibold ${
                    !slot.available
                      ? 'bg-[#FAE6E6]/60 text-[#922B2B]/60 border-[#ECC4C4] line-through cursor-not-allowed'
                      : walkInTime === slot.time
                        ? 'bg-[#1F1815] text-white border-[#1F1815] cursor-pointer'
                        : 'bg-white text-[#1F1815] border-[#D9CFC3] hover:border-[#B85D43] cursor-pointer'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={walkInNotes}
            onChange={(e) => setWalkInNotes(e.target.value)}
            placeholder="Observação do encaixe (opcional)"
            className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-xs"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setWalkInOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" disabled={!walkInTime} onClick={handleConfirmWalkIn}>
              Confirmar encaixe {walkInTime ? `às ${walkInTime}` : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* POP-R03 · Detalhe & Histórico do Pedido */}
      <Modal
        open={!!selectedOrderModal}
        onClose={() => setSelectedOrderModal(null)}
        badge="Popup POP-R03 · Auditoria do Pedido"
        title={`Pedido ${selectedOrderModal?.code ?? ''}`}
        subtitle={selectedOrderModal ? `Cliente: ${selectedOrderModal.clientName}` : ''}
      >
        {selectedOrderModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A4F48]">Status atual</span>
              <OrderStatusBadge status={selectedOrderModal.status} />
            </div>
            <div className="space-y-2">
              {selectedOrderModal.items.map((it) => (
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
            <div className="space-y-1.5 border-t border-[#EFE9E1] pt-3">
              <div className="text-xs font-semibold">Histórico de movimentação:</div>
              {selectedOrderModal.timeline.map((step, idx) => (
                <div key={idx} className="flex justify-between text-xs text-[#5A4F48]">
                  <span>
                    <strong className="capitalize text-[#1F1815]">{step.status}</strong> · {step.by}
                  </span>
                  <span className="font-mono-num">{step.at}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* POP-R04 · Registrar Pagamento / Brinde (US-04) */}
      <Modal
        open={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        badge="Popup POP-R04 · Caixa & Pagamento (US-04)"
        title={
          paymentTarget?.kind === 'order' && isOrderFreeSample(paymentTarget.item)
            ? 'Finalizar saída como Brinde'
            : 'Registrar pagamento recebido'
        }
        subtitle="O pagamento é feito fora do sistema; aqui registramos o recebimento para o caixa, lucro e repasses."
      >
        {paymentTarget && (() => {
          const isGiftSample =
            paymentTarget.kind === 'order' && isOrderFreeSample(paymentTarget.item);
          const originalValue =
            paymentTarget.kind === 'appointment'
              ? paymentTarget.item.servicePrice
              : paymentTarget.item.items.reduce(
                  (s, i) => s + i.unitSalePrice * i.quantity,
                  0,
                );
          const parsedVal = Number(payAmountInput.replace(',', '.')) || 0;
          const isAdjusted = !isGiftSample && Math.abs(parsedVal - originalValue) > 0.001;
          const cashNum = Number(cashGiven.replace(',', '.')) || 0;
          const troco = cashNum > parsedVal ? cashNum - parsedVal : 0;

          return (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] text-xs space-y-1">
                <div className="font-semibold text-sm text-[#1F1815]">
                  {paymentTarget.kind === 'appointment'
                    ? `${paymentTarget.item.clientName} · ${paymentTarget.item.serviceName}`
                    : `${paymentTarget.item.clientName} · ${paymentTarget.item.code}`}
                </div>
                <div className="text-[#5A4F48]">
                  Valor sugerido da vitrine:{' '}
                  <strong className="font-mono-num text-[#1F1815]">
                    {isGiftSample ? 'Amostra grátis (R$ 0,00)' : formatCurrency(originalValue)}
                  </strong>
                </div>
              </div>

              {isGiftSample ? (
                <div className="p-4 rounded-xl bg-[#E3EFE8] border border-[#C3DEC9] text-xs text-[#28503B] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Gift className="w-4 h-4" /> Amostra grátis (custo R$ 0 e venda R$ 0)
                  </div>
                  <p>
                    Será registrada como <strong>Brinde</strong> e não entrará no relatório de
                    vendas nem no lucro.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4F48] mb-1">
                      Valor final recebido (R$) — permite ajuste manual
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={payAmountInput}
                      onChange={(e) => setPayAmountInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CFC3] font-mono-num text-base font-bold"
                    />
                  </div>

                  {isAdjusted && (
                    <div className="p-3 rounded-xl bg-[#FBF0DC] border border-[#EDD6A9] space-y-2">
                      <div className="text-xs font-semibold text-[#8B5910] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Ajuste detectado — será gravado como alterado por Carla · Recepção
                      </div>
                      <input
                        type="text"
                        value={payReason}
                        onChange={(e) => setPayReason(e.target.value)}
                        placeholder="Motivo do ajuste (ex: desconto fidelidade, adicional)"
                        className="w-full px-3 py-2 rounded-lg border border-[#E5C98B] bg-white text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#5A4F48] mb-1.5">
                      Forma de pagamento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'pix', label: 'Pix', icon: QrCode },
                          { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                          { id: 'cartao', label: 'Cartão', icon: CreditCard },
                        ] as const
                      ).map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPayMethod(m.id)}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                              payMethod === m.id
                                ? 'bg-[#1F1815] text-white border-[#1F1815]'
                                : 'bg-white border-[#D9CFC3]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {payMethod === 'dinheiro' && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5A4F48] mb-1">
                          Valor entregue (troco)
                        </label>
                        <input
                          type="number"
                          value={cashGiven}
                          onChange={(e) => setCashGiven(e.target.value)}
                          placeholder="Ex: 100"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#D9CFC3] bg-white text-xs font-mono-num"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-[#8B7F77]">Troco</span>
                        <span className="font-mono-num font-bold text-sm text-[#38664E]">
                          {formatCurrency(troco)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setPaymentTarget(null)}>
                  Cancelar
                </Button>
                <Button
                  variant={isGiftSample ? 'sage' : 'primary'}
                  onClick={() => handleSubmitPayment(isGiftSample)}
                >
                  {isGiftSample ? 'Confirmar entrega de brinde' : 'Finalizar como Pago'}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* POP-R05 · Novo Pedido Rápido no Balcão */}
      <Modal
        open={counterOrderOpen}
        onClose={() => setCounterOrderOpen(false)}
        badge="Popup POP-R05 · Pedido Balcão"
        title="Registrar pedido presencial ou brinde"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Cliente</label>
            <select
              value={counterClientId}
              onChange={(e) => setCounterClientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D9CFC3] text-sm bg-white"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Produto</label>
            <select
              value={counterProductId}
              onChange={(e) => setCounterProductId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D9CFC3] text-sm bg-white"
            >
              {products
                .filter((p) => p.active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.salePrice === 0 && p.costPrice === 0 ? 'Amostra grátis' : formatCurrency(p.salePrice)})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Quantidade</label>
            <input
              type="number"
              min={1}
              value={counterQty}
              onChange={(e) => setCounterQty(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-mono-num"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCounterOrderOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const cli = clients.find((c) => c.id === counterClientId) ?? clients[0];
                const r = createProductOrder({
                  clientId: cli.id,
                  clientName: cli.name,
                  clientPhone: cli.phone,
                  items: [{ productId: counterProductId, quantity: counterQty }],
                  notes: 'Lançado no balcão pela recepção.',
                });
                if (r.ok) {
                  setCounterOrderOpen(false);
                  pushToast({
                    type: 'success',
                    title: `Pedido ${r.order.code} criado`,
                    description: 'Siga a movimentação até Retirado → Pago/Brinde.',
                  });
                }
              }}
            >
              Criar pedido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
