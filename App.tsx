
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
  const [visibleCount, setVisibleCount] = useState(999);
  const [isRecapping, setIsRecapping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isRecapping) {
      const timeout = setTimeout(() => {
        localStorage.setItem('fake-chat-v2026-final-state', JSON.stringify(state));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [state, isRecapping]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const captureFrame = async (): Promise<string> => {
    const mockup = document.getElementById('preview-mockup');
    const h2c = (window as any).html2canvas;
    if (!mockup || !h2c) return '';
    try {
      const canvas = await h2c(mockup, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error("Falha ao capturar frame:", err);
      return '';
    }
  };

  const startRecap = async (record: boolean = false) => {
    const gifshot = (window as any).gifshot;
    const h2c = (window as any).html2canvas;

    if (record && (!gifshot || !h2c)) {
      showToast("Bibliotecas de captura não carregadas. Aguarde um momento.", "error");
      return;
    }

    if (isRecapping) return;
    setIsRecapping(true);
    setIsRecording(record);
    setVisibleCount(0);
    
    const frames: string[] = [];
    const totalMessages = state.messages.length;

    showToast(record ? "Gravando Recap (GIF)..." : "Iniciando Visualização...");

    for (let i = 0; i <= totalMessages; i++) {
      setVisibleCount(i);
      // Espera o render e scroll
      await new Promise(r => setTimeout(r, 800));
      
      if (record) {
        const frame = await captureFrame();
        if (frame) frames.push(frame);
      }
      
      await new Promise(r => setTimeout(r, 400));
    }

    if (record && frames.length > 0) {
      showToast("Processando GIF, aguarde...");
      if (gifshot) {
        gifshot.createGIF({
          images: frames,
          gifWidth: 375,
          gifHeight: 812,
          interval: 0.6,
          numFrames: frames.length,
          frameDuration: 10,
          fontWeight: 'normal',
          fontFamily: 'sans-serif',
        }, (obj: any) => {
          if (!obj.error) {
            const link = document.createElement('a');
            link.download = `recap_${new Date().getTime()}.gif`;
            link.href = obj.image;
            link.click();
            showToast("GIF salvo com sucesso!");
          } else {
            showToast("Erro ao gerar GIF", "error");
            console.error(obj.error);
          }
        });
      } else {
        showToast("Erro: gifshot não disponível", "error");
      }
    }

    setIsRecapping(false);
    setIsRecording(false);
    if (!record) showToast("Recap finalizado!");
  };

  const handleExport = async (quality: 'normal' | '4k') => {
    const mockup = document.getElementById('preview-mockup');
    const h2c = (window as any).html2canvas;
    if (!mockup || !h2c) {
      showToast("Biblioteca de exportação não carregada.", "error");
      return;
    }

    showToast(`Preparando exportação (${quality.toUpperCase()})...`);
    
    try {
      const canvas = await h2c(mockup, {
        scale: quality === '4k' ? 4 : 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedMockup = clonedDoc.getElementById('preview-mockup');
          if (clonedMockup) {
            clonedMockup.style.transform = 'none';
            clonedMockup.style.margin = '0';
            clonedMockup.style.position = 'static';
            clonedMockup.style.boxShadow = 'none';
            clonedMockup.style.border = 'none';
          }
        }
      });

      const link = document.createElement('a');
      link.download = `fake_chat_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showToast("Imagem salva com sucesso!");
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
            <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">Gerador de Conversas</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={isRecapping}
            onClick={() => startRecap(true)}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${isRecording ? 'bg-red-500 text-white recording-pulse' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}
          >
            {isRecording ? 'Gravando...' : 'Gravar GIF'}
          </button>
          <button 
            disabled={isRecapping}
            onClick={() => handleExport('normal')}
            className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            PNG Full HD
          </button>
          <button 
             disabled={isRecapping}
             onClick={() => handleExport('4k')}
             className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
          >
            Exportar 4K
          </button>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor (Sidebar) */}
        <aside className="w-[35%] min-w-[420px] max-w-[500px]">
          <EditorPanel state={state} setState={setState} onStartRecap={() => startRecap(false)} />
        </aside>

        {/* Live Preview Area */}
        <section className="flex-1 bg-[#F1F5F9] relative flex flex-col items-center overflow-hidden h-full">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="flex-1 w-full flex flex-col items-center pt-10 pb-20 overflow-y-auto no-scrollbar">
             <div className="relative transform transition-all duration-700 ease-out scale-[0.75] lg:scale-[0.8] xl:scale-[0.9] 2xl:scale-100 origin-top h-fit mb-4">
                <div className="absolute -inset-20 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                <MockupDevice id="preview-mockup" state={state} visibleCount={visibleCount} />
             </div>

             <div className="flex flex-col items-center gap-2 py-10">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Preview em Tempo Real</p>
               {isRecapping && (
                 <div className={`mt-4 flex items-center gap-2 px-6 py-2 ${isRecording ? 'bg-red-600' : 'bg-emerald-600'} text-white rounded-full animate-pulse font-bold text-xs uppercase tracking-widest`}>
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                   {isRecording ? 'Capturando Frames...' : 'Visualizando Recap...'}
                 </div>
               )}
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
