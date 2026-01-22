
import React, { useState, useEffect } from 'react';
import { INITIAL_STATE } from './constants';
import { AppState } from './types';
import EditorPanel from './components/Editor/EditorPanel';
import MockupDevice from './components/Preview/MockupDevice';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fake-chat-v2026-final-state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('fake-chat-v2026-final-state', JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [state]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async (quality: 'normal' | '4k') => {
    const mockup = document.getElementById('preview-mockup');
    if (!mockup) return;

    showToast(`Preparando exportação (${quality.toUpperCase()})...`);
    
    try {
      // Para evitar que o html2canvas capture a escala visual do CSS,
      // precisamos garantir que o elemento seja processado como se estivesse em escala 1:1
      const originalStyle = mockup.style.cssText;
      
      const canvas = await (window as any).html2canvas(mockup, {
        scale: quality === '4k' ? 4 : 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedMockup = clonedDoc.getElementById('preview-mockup');
          if (clonedMockup) {
            // Remove transformações que podem bugar a captura de fontes
            clonedMockup.style.transform = 'none';
            clonedMockup.style.margin = '0';
          }
        }
      });

      const link = document.createElement('a');
      link.download = `fake_chat_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showToast("Exportação concluída!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao exportar", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden">
      {/* App Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 transform -rotate-3 transition-transform hover:rotate-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800 leading-none">WhatsApp Fake</h1>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 block">Gerador Premium 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleExport('normal')}
            className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            PNG Full HD
          </button>
          <button 
             onClick={() => handleExport('4k')}
             className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            Exportar 4K
          </button>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor (Sidebar) */}
        <aside className="w-[35%] min-w-[420px] max-w-[500px]">
          <EditorPanel state={state} setState={setState} />
        </aside>

        {/* Live Preview Area - FIXED Mockup positioned at top */}
        <section className="flex-1 bg-[#F1F5F9] relative flex flex-col items-center overflow-hidden h-full">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="flex-1 w-full flex flex-col items-center pt-10 pb-20 overflow-y-auto no-scrollbar">
             <div className="relative transform transition-all duration-700 ease-out scale-[0.8] xl:scale-[0.9] 2xl:scale-100 origin-top h-fit mb-4">
                <div className="absolute -inset-20 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                <MockupDevice id="preview-mockup" state={state} />
             </div>

             <div className="flex flex-col items-center gap-2 py-10">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Preview Digital</p>
               <p className="text-[9px] font-medium text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">Modo de Alta Fidelidade Habilitado</p>
             </div>
          </div>
        </section>
      </main>

      {/* Notifications */}
      {toast && (
        <div className={`fixed bottom-10 right-10 px-6 py-4 rounded-2xl shadow-2xl text-white font-black uppercase tracking-widest text-[11px] flex items-center gap-3 z-[100] animate-in slide-in-from-right-5 fade-in transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
