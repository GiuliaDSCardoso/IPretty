import React, { useState } from 'react';
import {
  Calendar,
  Eye,
  EyeOff,
  Home,
  LayoutGrid,
  Palette,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  UserCheck,
} from 'lucide-react';
import { ToastContainer } from './components/ui/Primitives';
import { SalonProvider, useSalon } from './context/SalonContext';
import { WorkspaceSection } from './types/salon';
import { AdminView } from './views/AdminView';
import { ClientView } from './views/ClientView';
import { DesignSystemView } from './views/DesignSystemView';
import { FigmaCanvasView } from './views/FigmaCanvasView';
import { ProfessionalView } from './views/ProfessionalView';
import { ReceptionView } from './views/ReceptionView';
import { SplashLoginView } from './views/SplashLoginView';

const PrototypeShell: React.FC = () => {
  const { activeSection, setActiveSection, toasts, dismissToast, resetDemoData } =
    useSalon();
  const [hideSwitcher, setHideSwitcher] = useState(false);

  const navItems: { id: WorkspaceSection; label: string; icon: React.ReactNode }[] = [
    { id: 'splash', label: 'Entrada', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'cliente', label: 'Juliana · Cliente', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'recepcao', label: 'Carla · Recepção', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'profissional', label: 'Patrícia · PWA', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Dona Marta · Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'identidade', label: 'Identidade & Tokens', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'canvas', label: 'Frames (Figma)', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      {/* Barra superior do protótipo (ocultável para captura limpa no Figma) */}
      {!hideSwitcher ? (
        <div className="sticky top-0 z-40 bg-[#1F1815] text-[#FAF7F2] border-b border-[#342A25] px-3 sm:px-5 py-2">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {navItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#B85D43] text-white'
                        : 'text-[#D3C8BF] hover:bg-[#2D2420] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={resetDemoData}
                title="Restaurar dados iniciais"
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#D3C8BF] hover:bg-[#2D2420] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden md:inline">Resetar demo</span>
              </button>
              <button
                onClick={() => setHideSwitcher(true)}
                title="Ocultar barra de protótipo para capturar tela limpa no Figma"
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#2D2420] text-[#FAF7F2] hover:bg-[#3B302B] flex items-center gap-1 cursor-pointer"
              >
                <EyeOff className="w-3 h-3" />
                <span className="hidden sm:inline">Modo captura</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setHideSwitcher(false)}
          className="fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-full bg-[#1F1815]/90 text-white text-[11px] font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3 h-3" /> Mostrar barra iPretty
        </button>
      )}

      {/* Conteúdo ativo */}
      <main>
        {activeSection === 'splash' && <SplashLoginView />}
        {activeSection === 'cliente' && <ClientView />}
        {activeSection === 'recepcao' && <ReceptionView />}
        {activeSection === 'profissional' && <ProfessionalView />}
        {activeSection === 'admin' && <AdminView />}
        {activeSection === 'identidade' && <DesignSystemView />}
        {activeSection === 'canvas' && <FigmaCanvasView />}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export function App() {
  return (
    <SalonProvider>
      <PrototypeShell />
    </SalonProvider>
  );
}

export default App;
