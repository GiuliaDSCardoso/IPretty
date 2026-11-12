import {
  Appointment,
  OrderStatus,
  Product,
  ProductOrder,
  ScheduleOverride,
  StaffMember,
  TimeOffBlock,
} from '../types/salon';

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-R$ ${formatted}` : `R$ ${formatted}`;
}

export function formatTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDateShortBR(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${weekdays[date.getDay()]}, ${String(d).padStart(2, '0')} ${months[m - 1]}`;
}

export function addDaysISO(baseDateISO: string, days: number): string {
  const [y, m, d] = baseDateISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function getDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

export interface ProductProfitResult {
  profitValue: number;
  profitPercent: number | null; // null quando custo === 0 ("—")
  percentDisplay: string;
  isNegativeMargin: boolean;
  isFreeSample: boolean;
  isZeroCostSale: boolean;
}

/**
 * Regras de negócio de lucro de produtos (US-06 / US-07):
 * - Lucro = venda - custo
 * - % = (venda - custo) / custo * 100
 * - Custo zero com venda > 0: lucro = venda inteira e % = "—"
 * - Custo zero com venda zero: amostra grátis (brinde)
 * - Venda abaixo do custo: lucro negativo e flag de aviso (não bloqueia)
 */
export function calculateProductProfit(costPrice: number, salePrice: number): ProductProfitResult {
  const profitValue = Number((salePrice - costPrice).toFixed(2));
  const isFreeSample = costPrice === 0 && salePrice === 0;
  const isZeroCostSale = costPrice === 0 && salePrice > 0;
  const isNegativeMargin = salePrice < costPrice;

  if (costPrice === 0) {
    return {
      profitValue,
      profitPercent: null,
      percentDisplay: '—',
      isNegativeMargin: false,
      isFreeSample,
      isZeroCostSale,
    };
  }

  const profitPercent = Number((((salePrice - costPrice) / costPrice) * 100).toFixed(1));
  return {
    profitValue,
    profitPercent,
    percentDisplay: `${profitPercent.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    isNegativeMargin,
    isFreeSample,
    isZeroCostSale,
  };
}

export function isProductFreeSample(product: Pick<Product, 'costPrice' | 'salePrice'>): boolean {
  return product.costPrice === 0 && product.salePrice === 0;
}

export function isOrderFreeSample(order: ProductOrder): boolean {
  return order.items.every((item) => item.unitCostPrice === 0 && item.unitSalePrice === 0);
}

/**
 * Calcula repasse de cada colaboradora conforme vínculo (US-05 / US-07 / US-08).
 * Considera APENAS atendimentos finalizados como 'pago'.
 */
export interface StaffPayoutBreakdown {
  staff: StaffMember;
  paidCount: number;
  grossServicesTotal: number;
  commissionEarned: number;
  fixedSalary: number;
  totalPayout: number;
  salonShare: number;
  items: {
    appointment: Appointment;
    serviceRevenue: number;
    percentApplied: number;
    staffCut: number;
    salonCut: number;
  }[];
}

export function calculateStaffPayout(
  staff: StaffMember,
  appointments: Appointment[],
): StaffPayoutBreakdown {
  const paidForStaff = appointments.filter(
    (a) => a.staffId === staff.id && a.status === 'pago',
  );

  const items = paidForStaff.map((apt) => {
    const serviceRevenue = apt.payment?.finalAmount ?? apt.servicePrice;
    let percentApplied = 0;

    if (staff.employmentType === 'parceira' || staff.employmentType === 'clt_comissao') {
      percentApplied =
        staff.serviceCommissions[apt.serviceId] ?? staff.defaultCommissionPercent ?? 0;
    }

    const staffCut = Number(((serviceRevenue * percentApplied) / 100).toFixed(2));
    const salonCut = Number((serviceRevenue - staffCut).toFixed(2));

    return {
      appointment: apt,
      serviceRevenue,
      percentApplied,
      staffCut,
      salonCut,
    };
  });

  const grossServicesTotal = items.reduce((sum, i) => sum + i.serviceRevenue, 0);
  const commissionEarned = items.reduce((sum, i) => sum + i.staffCut, 0);
  const fixedSalary =
    staff.employmentType === 'parceira' ? 0 : Number(staff.fixedSalary.toFixed(2));
  const totalPayout = Number((fixedSalary + commissionEarned).toFixed(2));
  const salonShare = Number((grossServicesTotal - commissionEarned).toFixed(2));

  return {
    staff,
    paidCount: paidForStaff.length,
    grossServicesTotal,
    commissionEarned,
    fixedSalary,
    totalPayout,
    salonShare,
    items,
  };
}

/**
 * Gera horários disponíveis dentro da escala da profissional (US-01 / US-03 / US-05 / US-11 / US-12)
 * onde a duração completa do serviço cabe sem sobrepor outro atendimento nem bloqueio/intervalo.
 */
export function getAvailableTimeSlots(params: {
  staff: StaffMember;
  serviceDurationMin: number;
  date: string;
  appointments: Appointment[];
  overrides: ScheduleOverride[];
  timeOffBlocks: TimeOffBlock[];
  excludeAppointmentId?: string;
  minTimeHHMM?: string;
  stepMinutes?: number;
}): { time: string; endTime: string; available: boolean; reason?: string }[] {
  const {
    staff,
    serviceDurationMin,
    date,
    appointments,
    overrides,
    timeOffBlocks,
    excludeAppointmentId,
    minTimeHHMM,
    stepMinutes = 30,
  } = params;

  if (!staff.active || staff.isReceptionist) return [];

  const override = overrides.find((o) => o.staffId === staff.id && o.date === date);
  const dow = getDayOfWeek(date);
  const baseShift = staff.schedule[dow];

  const isEnabled = override ? override.enabled : baseShift?.enabled;
  if (!isEnabled) return [];

  const shiftStart = formatTimeToMinutes(override ? override.start : baseShift.start);
  const shiftEnd = formatTimeToMinutes(override ? override.end : baseShift.end);
  const breakStart = !override && baseShift.breakStart ? formatTimeToMinutes(baseShift.breakStart) : null;
  const breakEnd = !override && baseShift.breakEnd ? formatTimeToMinutes(baseShift.breakEnd) : null;

  const dayAppointments = appointments.filter(
    (a) =>
      a.staffId === staff.id &&
      a.date === date &&
      a.status !== 'cancelado' &&
      a.id !== excludeAppointmentId,
  );

  const dayBlocks = timeOffBlocks.filter((b) => b.staffId === staff.id && b.date === date);
  const minMins = minTimeHHMM ? formatTimeToMinutes(minTimeHHMM) : null;

  const slots: { time: string; endTime: string; available: boolean; reason?: string }[] = [];

  for (let start = shiftStart; start + serviceDurationMin <= shiftEnd; start += stepMinutes) {
    const end = start + serviceDurationMin;
    const startStr = minutesToHHMM(start);
    const endStr = minutesToHHMM(end);

    if (minMins !== null && start <= minMins) {
      slots.push({ time: startStr, endTime: endStr, available: false, reason: 'Horário já passou' });
      continue;
    }

    if (breakStart !== null && breakEnd !== null && start < breakEnd && end > breakStart) {
      slots.push({ time: startStr, endTime: endStr, available: false, reason: 'Intervalo' });
      continue;
    }

    const blocked = dayBlocks.find((b) => {
      const bs = formatTimeToMinutes(b.start);
      const be = formatTimeToMinutes(b.end);
      return start < be && end > bs;
    });
    if (blocked) {
      slots.push({ time: startStr, endTime: endStr, available: false, reason: `Folga: ${blocked.reason}` });
      continue;
    }

    const conflict = dayAppointments.find((a) => {
      const as = formatTimeToMinutes(a.startTime);
      const ae = formatTimeToMinutes(a.endTime);
      return start < ae && end > as;
    });

    if (conflict) {
      slots.push({
        time: startStr,
        endTime: endStr,
        available: false,
        reason: `Ocupado (${conflict.startTime}–${conflict.endTime})`,
      });
      continue;
    }

    slots.push({ time: startStr, endTime: endStr, available: true });
  }

  return slots;
}

/**
 * Regras de transição de status do pedido (US-04):
 * solicitado → separado → retirado → pago (ou brinde)
 * cancelado somente antes de retirado (solicitado ou separado).
 */
export function getAllowedNextOrderStatuses(
  current: OrderStatus,
  isFreeSample: boolean,
): OrderStatus[] {
  switch (current) {
    case 'solicitado':
      return ['separado', 'cancelado'];
    case 'separado':
      return ['retirado', 'cancelado'];
    case 'retirado':
      return isFreeSample ? ['brinde'] : ['pago'];
    default:
      return [];
  }
}

export function isAppointmentInPast(
  aptDate: string,
  aptStartTime: string,
  todayISO: string,
  currentTimeHHMM: string,
): boolean {
  if (aptDate < todayISO) return true;
  if (aptDate > todayISO) return false;
  return formatTimeToMinutes(aptStartTime) <= formatTimeToMinutes(currentTimeHHMM);
}

export function hoursBetweenNowAndAppointment(
  todayISO: string,
  currentTimeHHMM: string,
  aptDate: string,
  aptStartTime: string,
): number {
  const [ty, tm, td] = todayISO.split('-').map(Number);
  const [th, tmin] = currentTimeHHMM.split(':').map(Number);
  const [ay, am, ad] = aptDate.split('-').map(Number);
  const [ah, amin] = aptStartTime.split(':').map(Number);

  const nowDt = new Date(ty, tm - 1, td, th, tmin);
  const aptDt = new Date(ay, am - 1, ad, ah, amin);
  return (aptDt.getTime() - nowDt.getTime()) / (1000 * 60 * 60);
}
