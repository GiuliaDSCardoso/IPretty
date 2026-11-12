export type PersonaId = 'cliente' | 'recepcao' | 'profissional' | 'admin';

export type WorkspaceSection =
  | 'splash'
  | 'cliente'
  | 'recepcao'
  | 'profissional'
  | 'admin'
  | 'identidade'
  | 'canvas';

export type EmploymentType = 'parceira' | 'clt_comissao' | 'clt_sem_comissao';

export type StaffRole = 'cabeleireira' | 'manicure' | 'sobrancelha' | 'recepcionista';

export interface DayShift {
  enabled: boolean;
  start: string; // HH:mm
  end: string;   // HH:mm
  breakStart?: string;
  breakEnd?: string;
}

// 0 = Domingo ... 6 = Sábado
export type WeeklySchedule = Record<number, DayShift>;

export interface StaffMember {
  id: string;
  name: string;
  fullName: string;
  role: StaffRole;
  specialtyLabel: string;
  isReceptionist: boolean;
  employmentType: EmploymentType;
  fixedSalary: number;
  // Percentual (0 a 100) definido por serviço (US-05)
  serviceCommissions: Record<string, number>;
  defaultCommissionPercent: number;
  schedule: WeeklySchedule;
  active: boolean;
  avatarColor: string;
  bio: string;
  phone: string;
}

export interface ScheduleOverride {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  enabled: boolean;
  start: string;
  end: string;
  reason: string;
  createdBy: string;
}

export interface TimeOffBlock {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  start: string;
  end: string;
  reason: string;
  createdAt: string;
}

export type ServiceCategory = 'cabelo' | 'unhas' | 'sobrancelha' | 'combos';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number;
  description: string;
  includes: string[];
  active: boolean;
  professionalIds: string[];
}

export interface Supplier {
  id: string;
  companyName: string;
  representativeName: string;
  phone: string;
  notes?: string;
}

export type ProductVisualType = 'shampoo' | 'serum' | 'cream' | 'nail' | 'kit' | 'sample';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  supplierId: string;
  costPrice: number;
  salePrice: number;
  description: string;
  usageTip: string;
  visualType: ProductVisualType;
  accentTone: string;
  active: boolean;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
}

export type AppointmentStatus =
  | 'aguardando_confirmacao'
  | 'confirmado'
  | 'compareceu'
  | 'nao_compareceu'
  | 'pago'
  | 'cancelado';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao';

export interface PaymentAudit {
  originalAmount: number;
  finalAmount: number;
  method: PaymentMethod;
  adjusted: boolean;
  adjustmentReason?: string;
  recordedBy: string;
  recordedAt: string;
  isGift?: boolean;
}

export interface Appointment {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMin: number;
  servicePrice: number;
  staffId: string;
  staffName: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: AppointmentStatus;
  source: 'vitrine' | 'encaixe';
  reminder24hStatus: 'nao_aplicavel' | 'agendado' | 'enviado' | 'confirmado_link';
  notes?: string;
  createdAt: string;
  payment?: PaymentAudit;
}

export type OrderStatus =
  | 'solicitado'
  | 'separado'
  | 'retirado'
  | 'pago'
  | 'brinde'
  | 'cancelado';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unitSalePrice: number;
  unitCostPrice: number;
  visualType: ProductVisualType;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export interface ProductOrder {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: OrderItemSnapshot[];
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  timeline: OrderTimelineEntry[];
  payment?: PaymentAudit;
}

export interface VitrineBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaLabel: string;
  targetTab: 'servicos' | 'produtos';
  targetId?: string;
  theme: 'terracotta' | 'espresso' | 'sage' | 'sand';
  active: boolean;
  order: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}
