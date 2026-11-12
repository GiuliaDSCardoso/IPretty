import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CalendarOff,
  Download,
  Lock,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react';
import { IPrettyMonogram, IPrettyWordmark } from '../components/brand/BrandAssets';
import {
  AppointmentStatusBadge,
  Badge,
  Button,
  Modal,
  PhoneFrame,
} from '../components/ui/Primitives';
import { useSalon } from '../context/SalonContext';
import { Appointment } from '../types/salon';
import {
  addDaysISO,
  calculateStaffPayout,
  formatCurrency,
  formatDateBR,
  formatDateShortBR,
  getDayOfWeek,
} from '../utils/calculations';

export type ProfTab = 'agenda' | 'financeiro' | 'folgas';

export interface ProfessionalViewProps {
  embedded?: boolean;
  initialTab?: ProfTab;
  initialModal?: 'pwa' | 'detalhe' | 'folga';
}

export const ProfessionalView: React.FC<ProfessionalViewProps> = ({
  embedded = false,
  initialTab = 'agenda',
  initialModal,
}) => {
  const {
    staff,
    appointments,
    overrides,
    timeOffBlocks,
    activeProfessionalId,
    setActiveProfessionalId,
    todayISO,
    navIntent,
    clearNavIntent,
    addTimeOffBlock,
    removeTimeOffBlock,
  } = useSalon();

  const professionals = useMemo(
    () => staff.filter((s) => s.active && !s.isReceptionist),
    [staff],
  );
  const currentProf =
    professionals.find((p) => p.id === activeProfessionalId) ?? professionals[0];

  const [activeTab, setActiveTab] = useState<ProfTab>(initialTab);
  const [frameWidth, setFrameWidth] = useState<'360' | '390'>('360');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [detailApt, setDetailApt] = useState<Appointment | null>(null);
  const [pwaModalOpen, setPwaModalOpen] = useState(initialModal === 'pwa');

  // Bloqueio de folga (US-11 / POP-P03)
  const [blockModalOpen, setBlockModalOpen] = useState(initialModal === 'folga');
  const [blockDate, setBlockDate] = useState(addDaysISO(todayISO, 1));
  const [blockStart, setBlockStart] = useState('14:00');
  const [blockEnd, setBlockEnd] = useState('17:00');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (!initialModal) return;
    if (initialModal === 'pwa') setPwaModalOpen(true);
    if (initialModal === 'folga') setBlockModalOpen(true);
    if (initialModal === 'detalhe') {
      setDetailApt(
        appointments.find((a) => a.staffId === currentProf.id) ?? appointments[0] ?? null,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialModal]);

  useEffect(() => {
    if (embedded || !navIntent || navIntent.section !== 'profissional') return;
    if (navIntent.subTab) setActiveTab(navIntent.subTab as ProfTab);
    if (navIntent.openModal === 'pwa') setPwaModalOpen(true);
    if (navIntent.openModal === 'folga') {
      setActiveTab('folgas');
      setBlockModalOpen(true);
    }
    if (navIntent.openModal === 'detalhe') {
      setDetailApt(
        appointments.find((a) => a.staffId === currentProf.id) ?? appointments[0] ?? null,
      );
    }
    clearNavIntent();
  }, [navIntent, embedded]);

  const myDayAppointments = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            a.staffId === currentProf.id &&
            a.date === selectedDate &&
            a.status !== 'cancelado',
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, currentProf.id, selectedDate],
  );

  // US-08: Financeiro exclusivo da profissional logada (só atendimentos PAGOS)
  const payout = useMemo(
    () => calculateStaffPayout(currentProf, appointments),
    [currentProf, appointments],
  );

  const pendingForecast = useMemo(() => {
    const open = appointments.filter(
      (a) =>
        a.staffId === currentProf.id &&
        ['aguardando_confirmacao', 'confirmado', 'compareceu'].includes(a.status),
    );
    return open.reduce((sum, apt) => {
      const pct =
        currentProf.employmentType === 'clt_sem_comissao'
          ? 0
          : currentProf.serviceCommissions[apt.serviceId] ??
            currentProf.defaultCommissionPercent;
      return sum + (apt.servicePrice * pct) / 100;
    }, 0);
  }, [appointments, currentProf]);

  const myTimeOffs = useMemo(
    () => timeOffBlocks.filter((b) => b.staffId === currentProf.id),
    [timeOffBlocks, currentProf.id],
  );

  const dow = getDayOfWeek(selectedDate);
  const override = overrides.find(
    (o) => o.staffId === currentProf.id && o.date === selectedDate,
  );
  const shiftToday = override ?? currentProf.schedule[dow];

  const employmentLabel = {
    parceira: 'Profissional-parceira (Lei 13.352/2016)',
    clt_comissao: 'CLT com comissão',
    clt_sem_comissao: 'CLT sem comissão',
  }[currentProf.employmentType];

  const pwaContent = (
    <div
      className={`flex flex-col ${
        embedded ? 'h-full min-h-0' : 'min-h-[650px]'
      } bg-[#F7F3EE] text-[#1F1815] overflow-x-hidden`}
    >
      {/* PWA Top Bar (Fullscreen App feel) */}
      <div className="bg-[#1F1815] text-[#FAF7F2] px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <IPrettyMonogram size={30} dark={false} />
          <div className="min-w-0">
            <div className="font-display text-base font-semibold leading-tight truncate">
              Olá, {currentProf.name}
            </div>
            <div className="text-[10px] text-[#C8BCB3] truncate">
              {currentProf.specialtyLabel}
            </div>
          </div>
        </div>
        <button
          onClick={() => setPwaModalOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-[#2D2420] text-[#FAF7F2] text-[10px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3 h-3 text-[#E39A83]" />
          PWA
        </button>
      </div>

      {/* Main Scrollable Content (Strict vertical layout, zero horizontal scroll) */}
      <div
        className={`flex-1 p-3.5 space-y-3.5 overflow-y-auto overflow-x-hidden ${
          embedded ? 'pb-6' : 'pb-20'
        }`}
      >
        {/* === P-01: MINHA AGENDA === */}
        {activeTab === 'agenda' && (
          <>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#B85D43] font-semibold">
                  Tela P-01 · Minha Agenda
                </span>
                <h1 className="font-display text-lg font-semibold leading-tight">
                  {formatDateShortBR(selectedDate)}
                </h1>
              </div>
              <Badge tone={shiftToday?.enabled ? 'sage' : 'neutral'}>
                {shiftToday?.enabled ? `${shiftToday.start}–${shiftToday.end}` : 'Folga'}
              </Badge>
            </div>

            {/* Seletor de data compacto */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((offset) => {
                const iso = addDaysISO(todayISO, offset);
                const active = selectedDate === iso;
                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`py-2 px-1 rounded-xl border text-center cursor-pointer ${
                      active
                        ? 'bg-[#B85D43] text-white border-[#B85D43]'
                        : 'bg-white text-[#1F1815] border-[#E3DBD0]'
                    }`}
                  >
                    <div className="text-[10px] opacity-85">
                      {offset === 0 ? 'Hoje' : formatDateShortBR(iso).split(',')[0]}
                    </div>
                    <div className="font-mono-num text-xs font-bold">
                      {iso.split('-')[2]}/{iso.split('-')[1]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bloqueios do dia */}
            {myTimeOffs
              .filter((b) => b.date === selectedDate)
              .map((blk) => (
                <div
                  key={blk.id}
                  className="p-3 rounded-xl bg-[#FBF0DC] border border-[#EDD6A9] text-xs text-[#8B5910]"
                >
                  <strong>Bloqueio ({blk.start}–{blk.end}):</strong> {blk.reason}
                </div>
              ))}

            {/* Lista Vertical de Atendimentos (Apenas da Profissional!) */}
            {myDayAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E3DBD0] p-6 text-center text-xs text-[#5A4F48]">
                Você não tem atendimentos marcados para este dia.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myDayAppointments.map((apt) => {
                  const pct =
                    currentProf.employmentType === 'clt_sem_comissao'
                      ? 0
                      : currentProf.serviceCommissions[apt.serviceId] ??
                        currentProf.defaultCommissionPercent;
                  const amountBase = apt.payment?.finalAmount ?? apt.servicePrice;
                  const estShare = (amountBase * pct) / 100;

                  return (
                    <button
                      key={apt.id}
                      onClick={() => setDetailApt(apt)}
                      className="w-full text-left bg-white rounded-2xl border border-[#E3DBD0] p-3.5 space-y-2 hover:border-[#B85D43] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-num text-xs font-bold text-[#1F1815]">
                          {apt.startTime} – {apt.endTime}
                        </span>
                        <AppointmentStatusBadge status={apt.status} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#1F1815]">{apt.clientName}</div>
                        <div className="text-xs text-[#5A4F48]">{apt.serviceName}</div>
                      </div>
                      <div className="pt-2 border-t border-[#EFE9E1] flex items-center justify-between text-[11px]">
                        <span className="text-[#8B7F77]">
                          {apt.source === 'encaixe' ? 'Encaixe da recepção' : 'Agendado online'}
                        </span>
                        {currentProf.employmentType !== 'clt_sem_comissao' && (
                          <span className="font-mono-num font-semibold text-[#38664E]">
                            Sua parte: {formatCurrency(estShare)} ({pct}%)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* === P-02: MEU FINANCEIRO (US-08) === */}
        {activeTab === 'financeiro' && (
          <>
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#B85D43] font-semibold">
                Tela P-02 · Meu Financeiro (US-08)
              </span>
              <h1 className="font-display text-lg font-semibold">Resumo do mês até hoje</h1>
            </div>

            <div className="p-3 rounded-xl bg-[#EFE9E1] border border-[#E3DBD0] flex items-center gap-2 text-[11px] text-[#5A4F48]">
              <Lock className="w-3.5 h-3.5 text-[#1F1815] shrink-0" />
              <span>
                Acesso individual: você visualiza apenas o seu próprio financeiro e vínculo.
              </span>
            </div>

            {/* Card Saldo Garantido */}
            <div className="bg-[#1F1815] text-[#FAF7F2] rounded-2xl p-4 space-y-2">
              <div className="text-[11px] text-[#C8BCB3]">{employmentLabel}</div>
              <div className="text-xs text-[#D3C8BF]">Valor a receber (atendimentos pagos)</div>
              <div className="font-display text-3xl font-semibold tabular-nums">
                {formatCurrency(payout.totalPayout)}
              </div>

              <div className="pt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <div className="text-[#B5AAA1]">Comissões pagas</div>
                  <div className="font-mono-num font-bold text-[#7CC79D]">
                    {formatCurrency(payout.commissionEarned)}
                  </div>
                </div>
                <div>
                  <div className="text-[#B5AAA1]">
                    {currentProf.employmentType === 'parceira'
                      ? 'Cota-parte salão'
                      : 'Salário fixo'}
                  </div>
                  <div className="font-mono-num font-bold">
                    {currentProf.employmentType === 'parceira'
                      ? formatCurrency(payout.salonShare)
                      : formatCurrency(payout.fixedSalary)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E3DBD0] p-3.5 flex items-center justify-between text-xs">
              <span className="text-[#5A4F48]">Previsto em agendamentos abertos</span>
              <span className="font-mono-num font-semibold text-[#B2761E]">
                +{formatCurrency(pendingForecast)}
              </span>
            </div>

            {/* Extrato detalhado somente de pagos */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#5A4F48]">
                Extrato de atendimentos finalizados como pagos ({payout.items.length})
              </div>
              {payout.items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E3DBD0] p-4 text-xs text-[#8B7F77]">
                  Nenhum atendimento finalizado como pago ainda neste período.
                </div>
              ) : (
                payout.items.map((item) => (
                  <div
                    key={item.appointment.id}
                    className="bg-white rounded-2xl border border-[#E3DBD0] p-3 space-y-1 text-xs"
                  >
                    <div className="flex justify-between font-semibold">
                      <span className="truncate pr-2">{item.appointment.clientName}</span>
                      <span className="font-mono-num text-[#38664E] shrink-0">
                        +{formatCurrency(item.staffCut)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5A4F48] truncate">
                      {item.appointment.serviceName}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono-num text-[#8B7F77]">
                      <span>{formatDateBR(item.appointment.date)}</span>
                      <span>
                        Base {formatCurrency(item.serviceRevenue)} × {item.percentApplied}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* === P-03: BLOQUEAR FOLGAS (US-11) === */}
        {activeTab === 'folgas' && (
          <>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#B85D43] font-semibold">
                  Tela P-03 · Folgas (US-11)
                </span>
                <h1 className="font-display text-lg font-semibold">Meus bloqueios</h1>
              </div>
              <Button size="sm" variant="primary" onClick={() => setBlockModalOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Bloquear
              </Button>
            </div>

            <p className="text-xs text-[#5A4F48] leading-relaxed">
              Horários bloqueados aqui deixam de aparecer imediatamente na vitrine da cliente e no
              painel de encaixe da recepção.
            </p>

            {myTimeOffs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E3DBD0] p-5 text-center text-xs text-[#8B7F77]">
                Nenhum bloqueio de folga registrado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myTimeOffs.map((blk) => (
                  <div
                    key={blk.id}
                    className="bg-white rounded-2xl border border-[#E3DBD0] p-3.5 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-mono-num text-xs font-bold text-[#1F1815]">
                        {formatDateBR(blk.date)} · {blk.start}–{blk.end}
                      </div>
                      <div className="text-xs text-[#5A4F48] mt-0.5">{blk.reason}</div>
                    </div>
                    <button
                      onClick={() => removeTimeOffBlock(blk.id)}
                      className="p-1.5 rounded-lg text-[#922B2B] hover:bg-[#FAE6E6] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Tab Bar (Mobile PWA) */}
      <nav className="bg-white border-t border-[#E3DBD0] px-2 py-2 grid grid-cols-3 gap-1 sticky bottom-0">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center py-1 rounded-xl text-[11px] font-semibold cursor-pointer ${
            activeTab === 'agenda' ? 'text-[#B85D43] bg-[#F6E6E0]/60' : 'text-[#5A4F48]'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          Minha Agenda
        </button>
        <button
          onClick={() => setActiveTab('financeiro')}
          className={`flex flex-col items-center py-1 rounded-xl text-[11px] font-semibold cursor-pointer ${
            activeTab === 'financeiro' ? 'text-[#B85D43] bg-[#F6E6E0]/60' : 'text-[#5A4F48]'
          }`}
        >
          <Wallet className="w-4 h-4 mb-0.5" />
          Meu Financeiro
        </button>
        <button
          onClick={() => setActiveTab('folgas')}
          className={`flex flex-col items-center py-1 rounded-xl text-[11px] font-semibold cursor-pointer ${
            activeTab === 'folgas' ? 'text-[#B85D43] bg-[#F6E6E0]/60' : 'text-[#5A4F48]'
          }`}
        >
          <CalendarOff className="w-4 h-4 mb-0.5" />
          Folgas
        </button>
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
        pwaContent
      ) : (
        <div className="max-w-6xl mx-auto">
        {/* Top Bar da Simulação PWA */}
        <div className="mb-6 bg-white rounded-2xl border border-[#E3DBD0] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="sage">Persona 3 · Profissional (PWA Mobile)</Badge>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#5A4F48]">Simular acesso como:</span>
              <select
                value={currentProf.id}
                onChange={(e) => setActiveProfessionalId(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#D9CFC3] bg-[#FAF7F2] font-semibold text-xs cursor-pointer"
              >
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.employmentType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFrameWidth((w) => (w === '360' ? '390' : '360'))}
              className="px-3 py-1.5 rounded-lg border border-[#D9CFC3] text-xs font-semibold hover:bg-[#F7F3EE] cursor-pointer"
            >
              Largura: {frameWidth}px
            </button>
            <Button size="sm" variant="secondary" onClick={() => setPwaModalOpen(true)}>
              <Download className="w-3.5 h-3.5" />
              Tela de instalação PWA
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6">
            <PhoneFrame
              label={`PWA Profissional · ${frameWidth}px (sem rolagem horizontal)`}
              widthClass={frameWidth === '360' ? 'w-full max-w-[360px]' : 'w-full max-w-[390px]'}
            >
              {pwaContent}
            </PhoneFrame>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E3DBD0] p-5 space-y-3">
              <div className="text-[11px] font-mono-num uppercase tracking-wider text-[#8B7F77]">
                Telas & Popups da Profissional
              </div>
              <h2 className="font-display text-xl font-semibold">
                Atalhos desta jornada (US-08 e US-11)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('agenda')}>
                  P-01 · Minha Agenda Mobile
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('financeiro')}>
                  P-02 · Meu Financeiro (Isolado)
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('folgas')}>
                  P-03 · Bloquear Folgas
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPwaModalOpen(true)}>
                  POP-P01 · Instalar na Tela Inicial
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailApt(myDayAppointments[0] ?? appointments[0] ?? null)}
                >
                  POP-P02 · Detalhe Atendimento
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setBlockModalOpen(true)}>
                  POP-P03 · Modal Bloquear Folga
                </Button>
              </div>
            </div>

            <div className="bg-[#FAF7F2] rounded-2xl border border-[#E3DBD0] p-5 text-xs text-[#5A4F48] space-y-2">
              <div className="font-semibold text-[#1F1815]">
                Teste a troca de profissional acima:
              </div>
              <p>
                Alterne entre <strong>Patrícia</strong> (Parceira 45%) e <strong>Camila</strong>{' '}
                (CLT R$ 1.600 + 15%/20%) para ver o cálculo individual de &ldquo;Meu
                Financeiro&rdquo; respeitando exatamente a regra do vínculo e exibindo apenas os
                atendimentos da profissional selecionada.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* POP-P01 · Instalar PWA */}
      <Modal
        open={pwaModalOpen}
        onClose={() => setPwaModalOpen(false)}
        badge="Popup POP-P01 · App Instalável (US-08)"
        title="Adicionar à tela inicial do celular"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F7F3EE] border border-[#E3DBD0]">
            <IPrettyWordmark compact />
          </div>
          <p className="text-xs text-[#5A4F48] leading-relaxed">
            Ao tocar em <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong> no navegador do
            celular, o sistema abre em modo <code className="font-mono-num">standalone</code> (tela
            cheia, sem barra de URL) diretamente na agenda da profissional logada.
          </p>
          <div className="flex justify-end">
            <Button variant="dark" onClick={() => setPwaModalOpen(false)}>
              Entendi
            </Button>
          </div>
        </div>
      </Modal>

      {/* POP-P02 · Detalhe Atendimento da Profissional */}
      <Modal
        open={!!detailApt}
        onClose={() => setDetailApt(null)}
        badge="Popup POP-P02 · Detalhe na Agenda"
        title={detailApt?.clientName ?? ''}
        subtitle={detailApt ? `${detailApt.serviceName} · ${detailApt.startTime}–${detailApt.endTime}` : ''}
      >
        {detailApt && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#5A4F48]">Status atual</span>
              <AppointmentStatusBadge status={detailApt.status} />
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E3DBD0] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Data</span>
                <span className="font-semibold">{formatDateBR(detailApt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Duração</span>
                <span className="font-mono-num">{detailApt.serviceDurationMin} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7F77]">Valor do serviço</span>
                <span className="font-mono-num font-bold">
                  {formatCurrency(detailApt.payment?.finalAmount ?? detailApt.servicePrice)}
                </span>
              </div>
            </div>
            {detailApt.notes && (
              <div className="p-3 rounded-xl bg-[#F7F3EE] border border-[#E3DBD0]">
                <strong>Observação:</strong> {detailApt.notes}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* POP-P03 · Bloquear Folga (US-11) */}
      <Modal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        badge="Popup POP-P03 · Bloquear Folga (US-11)"
        title="Bloquear horário na minha agenda"
        subtitle={`Profissional: ${currentProf.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Data</label>
            <div className="grid grid-cols-3 gap-2">
              {[todayISO, addDaysISO(todayISO, 1), addDaysISO(todayISO, 2)].map((iso) => (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setBlockDate(iso)}
                  className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    blockDate === iso
                      ? 'bg-[#B85D43] text-white border-[#B85D43]'
                      : 'bg-[#F7F3EE] border-[#E3DBD0]'
                  }`}
                >
                  {formatDateShortBR(iso)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Início</label>
              <input
                type="time"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Fim</label>
              <input
                type="time"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm font-mono-num"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A4F48] mb-1">Motivo</label>
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Ex: Compromisso familiar / Curso"
              className="w-full px-3 py-2 rounded-xl border border-[#D9CFC3] text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBlockModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                addTimeOffBlock({
                  staffId: currentProf.id,
                  date: blockDate,
                  start: blockStart,
                  end: blockEnd,
                  reason: blockReason || 'Folga pessoal',
                });
                setBlockModalOpen(false);
                setBlockReason('');
              }}
            >
              Salvar bloqueio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
