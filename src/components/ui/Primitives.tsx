import React, { createContext, useContext } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle, Wifi, Battery } from 'lucide-react';
import { AppointmentStatus, OrderStatus, ToastMessage } from '../../types/salon';

const ContainedModalContext = createContext(false);

export const ContainedModalProvider: React.FC<{
  contained?: boolean;
  children: React.ReactNode;
}> = ({ contained = true, children }) => (
  <ContainedModalContext.Provider value={contained}>
    {children}
  </ContainedModalContext.Provider>
);

type BadgeTone = 'neutral' | 'terracotta' | 'sage' | 'ochre' | 'crimson' | 'slate' | 'dark';

const TONE_MAP: Record<BadgeTone, string> = {
  neutral: 'bg-[#EFE9E1] text-[#5A4F48] border-[#E3DBD0]',
  terracotta: 'bg-[#F6E6E0] text-[#8F3F29] border-[#E8C8BD]',
  sage: 'bg-[#E3EFE8] text-[#28503B] border-[#C3DEC9]',
  ochre: 'bg-[#FBF0DC] text-[#8B5910] border-[#EDD6A9]',
  crimson: 'bg-[#FAE6E6] text-[#922B2B] border-[#ECC4C4]',
  slate: 'bg-[#E9EEF2] text-[#3B4B59] border-[#CED8E0]',
  dark: 'bg-[#1F1815] text-[#FAF7F2] border-[#1F1815]',
};

export const Badge: React.FC<{
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}> = ({ tone = 'neutral', children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${TONE_MAP[tone]} ${className}`}
  >
    {children}
  </span>
);

export const AppointmentStatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const map: Record<AppointmentStatus, { label: string; tone: BadgeTone }> = {
    aguardando_confirmacao: { label: 'Aguardando confirmação', tone: 'ochre' },
    confirmado: { label: 'Confirmado', tone: 'sage' },
    compareceu: { label: 'Compareceu', tone: 'terracotta' },
    nao_compareceu: { label: 'Não compareceu', tone: 'crimson' },
    pago: { label: 'Pago', tone: 'dark' },
    cancelado: { label: 'Cancelado', tone: 'neutral' },
  };
  const cfg = map[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const map: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
    solicitado: { label: 'Solicitado', tone: 'ochre' },
    separado: { label: 'Separado', tone: 'slate' },
    retirado: { label: 'Retirado', tone: 'terracotta' },
    pago: { label: 'Pago', tone: 'sage' },
    brinde: { label: 'Brinde', tone: 'sage' },
    cancelado: { label: 'Cancelado', tone: 'crimson' },
  };
  const cfg = map[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger' | 'sage';
    size?: 'sm' | 'md' | 'lg';
  }
> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const variants = {
    primary:
      'bg-[#B85D43] text-[#FAF7F2] hover:bg-[#9F4D35] border border-transparent disabled:opacity-45',
    dark: 'bg-[#1F1815] text-[#FAF7F2] hover:bg-[#342A25] border border-transparent disabled:opacity-45',
    secondary:
      'bg-white text-[#1F1815] border border-[#D9CFC3] hover:bg-[#F7F3EE] disabled:opacity-45',
    ghost: 'bg-transparent text-[#5A4F48] hover:bg-[#EFE9E1] border border-transparent',
    danger: 'bg-[#FAE6E6] text-[#922B2B] border border-[#ECC4C4] hover:bg-[#F5D0D0]',
    sage: 'bg-[#38664E] text-[#FAF7F2] hover:bg-[#2C523E] border border-transparent disabled:opacity-45',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-[15px] px-5 py-3 rounded-xl gap-2',
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  maxWidthClass?: string;
  contained?: boolean;
  children: React.ReactNode;
}> = ({
  open,
  onClose,
  title,
  subtitle,
  badge,
  maxWidthClass = 'max-w-lg',
  contained,
  children,
}) => {
  const ctxContained = useContext(ContainedModalContext);
  const isContained = contained ?? ctxContained;

  if (!open) return null;

  return (
    <div
      className={`${
        isContained ? 'absolute inset-0 z-30 p-3' : 'fixed inset-0 z-50 p-4'
      } flex items-center justify-center bg-[#1F1815]/45 backdrop-blur-[2px] animate-fade-in`}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} bg-white rounded-2xl border border-[#E3DBD0] shadow-[var(--shadow-modal)] overflow-hidden animate-sheet-up ${
          isContained ? 'max-h-[92%]' : 'max-h-[90vh]'
        } flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${
            isContained ? 'px-4 py-3' : 'px-6 py-4'
          } border-b border-[#E3DBD0] bg-[#FAF7F2] flex items-start justify-between gap-3 shrink-0`}
        >
          <div className="min-w-0">
            {badge && (
              <span className="inline-block text-[10px] font-mono-num uppercase tracking-widest text-[#B85D43] font-semibold mb-0.5">
                {badge}
              </span>
            )}
            <h3
              className={`font-display ${
                isContained ? 'text-base' : 'text-xl'
              } font-semibold text-[#1F1815] leading-snug`}
            >
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#5A4F48] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 rounded-lg text-[#5A4F48] hover:bg-[#EFE9E1] hover:text-[#1F1815] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className={`${isContained ? 'p-4' : 'p-6'} overflow-y-auto`}>{children}</div>
      </div>
    </div>
  );
};

export const PhoneFrame: React.FC<{
  label?: string;
  children: React.ReactNode;
  widthClass?: string;
  heightClass?: string;
  showFrameChrome?: boolean;
  darkStatusBar?: boolean;
}> = ({
  label,
  children,
  widthClass = 'w-full max-w-[390px]',
  heightClass = '',
  showFrameChrome = true,
  darkStatusBar = false,
}) => (
  <div className={`${widthClass} mx-auto flex flex-col`}>
    {label && (
      <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#8B7F77] mb-2 text-center">
        {label}
      </div>
    )}
    <div
      className={
        showFrameChrome
          ? 'rounded-[38px] bg-white p-[7px] ring-1 ring-[#E4DAD0] shadow-[0_24px_48px_-14px_rgba(61,42,35,0.16)]'
          : 'rounded-2xl border border-[#E3DBD0] bg-white'
      }
    >
      <div
        className={`relative bg-[#F7F3EE] overflow-hidden flex flex-col ${heightClass} ${
          showFrameChrome ? 'rounded-[31px] border border-[#EFE9E1]' : 'rounded-2xl'
        }`}
      >
        {showFrameChrome && (
          <div
            className={`px-5 pt-2.5 pb-1.5 flex items-center justify-between text-[11px] font-mono-num shrink-0 ${
              darkStatusBar ? 'bg-[#1F1815] text-[#FAF7F2]' : 'bg-white text-[#1F1815]'
            }`}
          >
            <span className="font-semibold">13:30</span>
            <div
              className={`w-14 h-3 rounded-full ${
                darkStatusBar ? 'bg-[#2E2521]' : 'bg-[#EFE9E1]'
              }`}
            />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const DesktopFrame: React.FC<{
  children: React.ReactNode;
  title?: string;
  urlLabel?: string;
  className?: string;
}> = ({ children, title, urlLabel = 'app.ipretty.salao', className = '' }) => (
  <div
    className={`w-full rounded-[24px] bg-white ring-1 ring-[#C9D6CD] shadow-[0_26px_54px_-18px_rgba(31,24,21,0.15)] overflow-hidden relative flex flex-col ${className}`}
  >
    <div className="px-5 py-2.5 bg-[#FAF8F5] border-b border-[#EAE3DA] flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#E3C1B5]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#E8D5AF]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#BFD4C6]" />
      </div>
      <div className="px-3.5 py-1 rounded-full bg-[#F2EDE6] text-[10px] font-mono-num text-[#6F635B] truncate max-w-xs">
        {urlLabel}
      </div>
      <div className="text-[10px] font-mono-num text-[#8B7F77] truncate">
        {title ?? 'Desktop 1280px'}
      </div>
    </div>
    <div className="relative flex-1 min-h-0 overflow-hidden bg-[#F7F3EE] flex flex-col">
      {children}
    </div>
  </div>
);

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const styles = {
    success: {
      bg: 'bg-[#1F1815] text-[#FAF7F2] border-[#38664E]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#7CC79D] shrink-0" />,
    },
    error: {
      bg: 'bg-[#1F1815] text-[#FAF7F2] border-[#B43B3B]',
      icon: <AlertCircle className="w-4 h-4 text-[#F28B8B] shrink-0" />,
    },
    warning: {
      bg: 'bg-[#1F1815] text-[#FAF7F2] border-[#B2761E]',
      icon: <AlertTriangle className="w-4 h-4 text-[#F3C16E] shrink-0" />,
    },
    info: {
      bg: 'bg-[#1F1815] text-[#FAF7F2] border-[#B85D43]',
      icon: <Info className="w-4 h-4 text-[#E39A83] shrink-0" />,
    },
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const s = styles[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border-l-4 px-4 py-3 shadow-[var(--shadow-float)] flex items-start gap-3 animate-sheet-up ${s.bg}`}
          >
            <div className="mt-0.5">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-snug">{t.title}</div>
              {t.description && (
                <div className="text-xs text-[#D3C8BF] mt-0.5 leading-relaxed">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-[#9E9187] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const SectionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-[#E3DBD0] shadow-[var(--shadow-card)] ${className}`}
  >
    {children}
  </div>
);
