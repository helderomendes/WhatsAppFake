
import React, { useState } from 'react';
import { AppState, Message, MessageType, SavedTemplate, CarouselItem } from '../../types';
import { DEFAULT_AVATAR, COMMON_EMOJIS, INITIAL_STATE } from '../../constants';
import { generateConversation } from '../../services/geminiService';

interface EditorPanelProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onStartRecap: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ state, setState, onStartRecap }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'design' | 'templates'>('messages');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [templateName, setTemplateName] = useState('');
  
  // ESTADO ÚNICO DE TEMPLATES (Em memória, sem localStorage)
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);

  // --- FUNÇÕES SIMPLIFICADAS DE TEMPLATES ---

  // 1. Criar Template a partir da conversa atual
  const createTemplateFromCurrentConversation = (name: string) => {
    if (!name.trim()) {
      alert("Digite um nome para o modelo.");
      return;
    }

    const newTemplate: SavedTemplate = {
      id: `tpl-${Date.now()}`,
      name: name.trim(),
      createdAt: Date.now(),
      // Snapshot exato do estado atual
      state: JSON.parse(JSON.stringify(state))
    };

    setSavedTemplates(prev => [...prev, newTemplate]);
    setTemplateName('');
    alert("Modelo adicionado à lista!");
  };

  // 2. Aplicar Template (Carregar)
  const applyTemplateToConversation = (id: string) => {
    const tpl = savedTemplates.find(t => t.id === id);
    if (!tpl) return;

    if (confirm(`Carregar modelo "${tpl.name}"?`)) {
      // Substituição direta do estado global
      setState(JSON.parse(JSON.stringify(tpl.state)));
    }
  };

  // 3. Deletar Template
  const deleteTemplate = (id: string) => {
    if (confirm("Excluir este modelo?")) {
      setSavedTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // Funções extras para manter compatibilidade com botões existentes no layout
  const updateTemplate = (id: string) => {
     if(confirm("Atualizar este modelo com a tela atual?")) {
        setSavedTemplates(prev => prev.map(t => 
           t.id === id ? { ...t, state: JSON.parse(JSON.stringify(state)) } : t
        ));
     }
  };

  const cloneTemplate = (id: string) => {
     const tpl = savedTemplates.find(t => t.id === id);
     if(tpl) {
        const cloned = { ...tpl, id: `tpl-${Date.now()}`, name: `${tpl.name} (Cópia)` };
        setSavedTemplates(prev => [...prev, cloned]);
     }
  };

  // --- EDITOR HELPERS (Mantidos originais) ---

  const updateConfig = (key: string, value: any) => {
    setState(p => ({ ...p, config: { ...p.config, [key]: value } }));
  };

  const updateMessage = (idx: number, updates: Partial<Message>) => {
    const newMessages = [...state.messages];
    newMessages[idx] = { ...newMessages[idx], ...updates };
    setState(p => ({ ...p, messages: newMessages }));
  };

  const applyFormatting = (idx: number, symbol: string) => {
    const msg = state.messages[idx];
    const textarea = document.getElementById(`textarea-${msg.id}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = msg.content;
    const selected = text.substring(start, end);
    
    let newText;
    if (symbol === '<u>') {
      newText = text.substring(0, start) + `<u>${selected}</u>` + text.substring(end);
    } else {
      newText = text.substring(0, start) + `${symbol}${selected}${symbol}` + text.substring(end);
    }
    
    updateMessage(idx, { content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, end + symbol.length);
    }, 10);
  };

  const insertEmoji = (idx: number, emoji: string) => {
    const msg = state.messages[idx];
    updateMessage(idx, { content: msg.content + emoji });
    setActiveEmojiPicker(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    const newMessages = [...state.messages];
    const item = newMessages.splice(draggedIndex, 1)[0];
    newMessages.splice(idx, 0, item);
    setState(p => ({ ...p, messages: newMessages }));
    setDraggedIndex(idx);
  };

  const addMessage = (type: MessageType = 'text') => {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: state.mainUser.id,
      content: type === 'text' ? 'Nova mensagem' : (type === 'system' ? 'Mensagem do sistema...' : (type === 'buttons' ? 'Selecione uma opção:' : '')),
      contentPosition: 'bottom',
      type,
      timestamp: state.config.systemTime,
      status: 'read',
      image: (type === 'image' || type === 'sticker') ? 'https://picsum.photos/400/300' : undefined,
      audioDuration: type === 'audio' ? '0:15' : undefined,
      carouselItems: type === 'carousel' ? [{ id: `c-${Date.now()}`, title: 'Produto Exemplo', description: 'Descrição curta do produto.', image: 'https://picsum.photos/400/300', buttonText: 'Comprar' }] : undefined,
      buttons: type === 'buttons' ? [{ text: 'Ver Mais' }, { text: 'Cancelar' }] : undefined
    };
    setState(p => ({ ...p, messages: [...p.messages, msg] }));
  };

  const duplicateMessage = (idx: number) => {
    const newMessages = [...state.messages];
    const original = JSON.parse(JSON.stringify(newMessages[idx]));
    original.id = `msg-clone-${Date.now()}`;
    newMessages.splice(idx + 1, 0, original);
    setState(p => ({ ...p, messages: newMessages }));
  };

  const moveMessage = (idx: number, direction: 'up' | 'down') => {
    const newMessages = [...state.messages];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newMessages.length) return;
    const temp = newMessages[idx];
    newMessages[idx] = newMessages[targetIdx];
    newMessages[targetIdx] = temp;
    setState(p => ({ ...p, messages: newMessages }));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateConversation(aiPrompt, state.contacts);
      const newMessages: Message[] = data.messages.map((m: any, idx: number) => {
        const sender = m.senderName === 'Eu' ? state.mainUser : (state.contacts.find(c => c.name === m.senderName) || state.contacts[0]);
        return {
          id: `msg-ai-${Date.now()}-${idx}`,
          senderId: sender.id,
          content: m.content,
          type: m.type as MessageType,
          timestamp: m.timestamp,
          status: 'read',
          contentPosition: 'bottom',
          audioDuration: m.audioDuration,
          buttons: m.buttons,
          image: (m.type === 'image' || m.type === 'sticker') ? 'https://picsum.photos/400/300' : undefined
        };
      });
      setState(p => ({ ...p, messages: [...p.messages, ...newMessages] }));
      setAiPrompt('');
    } catch (err) {
      alert("Falha ao gerar conversa com IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const getParticipantName = (id: string) => {
    if (id === 'system') return 'Sistema';
    if (id === state.mainUser.id) return state.mainUser.name;
    return state.contacts.find(c => c.id === id)?.name || 'Desconhecido';
  };

  const updateCarouselItem = (msgIdx: number, itemIdx: number, updates: Partial<CarouselItem>) => {
    const newMessages = [...state.messages];
    const msg = newMessages[msgIdx];
    if (msg.carouselItems && msg.carouselItems[itemIdx]) {
      msg.carouselItems[itemIdx] = { ...msg.carouselItems[itemIdx], ...updates };
      setState(p => ({ ...p, messages: newMessages }));
    }
  };

  const addCarouselItem = (msgIdx: number) => {
    const newMessages = [...state.messages];
    const msg = newMessages[msgIdx];
    if (msg.type === 'carousel' && msg.carouselItems) {
      msg.carouselItems.push({
        id: `ci-${Date.now()}`,
        title: 'Novo Item',
        description: 'Descrição do item.',
        image: 'https://picsum.photos/400/300',
        buttonText: 'Comprar'
      });
      setState(p => ({ ...p, messages: newMessages }));
    }
  };

  return (
    <div id="editor-panel-container" className="h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden shadow-2xl font-sans">
      {/* Tabs */}
      <div className="flex bg-slate-50 p-2 gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {(['users', 'messages', 'design', 'templates'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`flex-none px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'users' ? 'Participantes' : tab === 'messages' ? 'Chat' : tab === 'design' ? 'Estilo' : 'Modelos'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white">
        {/* PARTICIPANTES TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in slide-in-from-left-2">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Geral</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-slate-700">Conversa em Grupo</span>
                <button onClick={() => updateConfig('isGroup', !state.config.isGroup)} className={`w-12 h-6 rounded-full transition-all relative ${state.config.isGroup ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.config.isGroup ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              {state.config.isGroup && (
                <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border shadow-sm">
                      <img src={state.config.groupImage} className="w-full h-full object-cover" />
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => updateConfig('groupImage', b))} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Nome do Grupo</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:bg-white" value={state.config.groupName} onChange={e => updateConfig('groupName', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </section>
            
            <section className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Seu Perfil (Eu)</h3>
               <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border shadow-sm">
                      <img src={state.mainUser.avatar} className="w-full h-full object-cover" />
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => setState(p => ({...p, mainUser: {...p.mainUser, avatar: b}})))} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Seu Nome</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:bg-white" value={state.mainUser.name} onChange={e => setState(p => ({...p, mainUser: {...p.mainUser, name: e.target.value}}))} />
                    </div>
                  </div>
                </div>
            </section>

            <section className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Outros Contatos</h3>
               <div className="space-y-3">
                 {state.contacts.map((contact, idx) => (
                   <div key={contact.id} className="p-4 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm group">
                     <div className="flex items-center gap-4">
                       <div className="relative w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border shadow-sm">
                         <img src={contact.avatar} className="w-full h-full object-cover" />
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => {
                           const newC = [...state.contacts]; newC[idx].avatar = b; setState(p => ({...p, contacts: newC}));
                         })} />
                       </div>
                       <div className="flex-1">
                         <input type="text" className="w-full text-sm font-bold outline-none" value={contact.name} onChange={e => {
                           const newC = [...state.contacts]; newC[idx].name = e.target.value; setState(p => ({...p, contacts: newC}));
                         }} />
                       </div>
                       <button onClick={() => setState(p => ({...p, contacts: p.contacts.filter(c => c.id !== contact.id)}))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                       </button>
                     </div>
                   </div>
                 ))}
                 <button onClick={() => {
                   const n = state.contacts.length + 1;
                   setState(p => ({...p, contacts: [...p.contacts, { id: `c-${Date.now()}`, name: `Contato ${n}`, avatar: DEFAULT_AVATAR, color: '#' + Math.floor(Math.random()*16777215).toString(16) }]}));
                 }} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 hover:border-emerald-300 transition-all">+ Adicionar Contato</button>
               </div>
            </section>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in">
            {/* AI Generation section */}
            <section className="p-5 bg-emerald-50 rounded-[32px] border border-emerald-100 space-y-4 shadow-inner">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" /></svg></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Gerar com IA</h3>
               </div>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-white border border-emerald-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-emerald-500/20" 
                    placeholder="Assunto da conversa..." 
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
                  />
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex-shrink-0"
                  >
                    {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>}
                  </button>
               </div>
            </section>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={onStartRecap} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg> Ver Recap
              </button>
              <button onClick={() => { if(confirm("Apagar toda a conversa?")) setState(p => ({...p, messages: []})); }} className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg> Limpar Chat
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
               {(['text', 'image', 'audio', 'carousel', 'buttons', 'sticker'] as const).map(type => (
                 <button key={type} onClick={() => addMessage(type)} className="py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all shadow-sm">
                   +{type === 'carousel' ? 'Cards' : (type === 'buttons' ? 'Botões' : type)}
                 </button>
               ))}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Arraste para reordenar</p>
              {state.messages.map((m, idx) => (
                <div 
                  key={m.id} 
                  draggable 
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  className={`p-5 bg-slate-50 border border-slate-200 rounded-[28px] space-y-4 relative shadow-sm hover:border-emerald-300 transition-all cursor-grab active:cursor-grabbing ${draggedIndex === idx ? 'opacity-40 grayscale border-emerald-500 border-2' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <select className="text-[10px] font-black uppercase text-emerald-600 bg-white border rounded px-2 py-1 outline-none" value={m.senderId} onChange={e => updateMessage(idx, { senderId: e.target.value })}>
                        <option value="system">Sistema</option>
                        <option value={state.mainUser.id}>Eu</option>
                        {state.contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <div className="flex gap-1">
                         <button onClick={() => moveMessage(idx, 'up')} className="p-1 text-slate-300 hover:text-emerald-500"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M7,14L12,9L17,14H7Z" /></svg></button>
                         <button onClick={() => moveMessage(idx, 'down')} className="p-1 text-slate-300 hover:text-emerald-500"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M7,10L12,15L17,10H7Z" /></svg></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="time" className="bg-white border rounded p-1 text-[10px] font-bold" value={m.timestamp} onChange={e => updateMessage(idx, { timestamp: e.target.value })} />
                      <button onClick={() => duplicateMessage(idx)} className="p-1 text-slate-400 hover:text-emerald-500" title="Duplicar"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg></button>
                      <button onClick={() => setState(p => ({...p, messages: p.messages.filter(msg => msg.id !== m.id)}))} className="p-1 text-red-300 hover:text-red-500"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {m.type !== 'system' && (
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Responder à:</label>
                         <select className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none" value={m.replyToId || ''} onChange={e => updateMessage(idx, { replyToId: e.target.value || undefined })}>
                            <option value="">(Nenhuma)</option>
                            {state.messages.filter((_, i) => i < idx && state.messages[i].type !== 'system').map(other => (
                              <option key={other.id} value={other.id}>{getParticipantName(other.senderId)}: {other.content.substring(0, 30)}...</option>
                            ))}
                         </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                         <label className="text-[9px] font-bold text-slate-400 uppercase">Texto da Mensagem</label>
                         <div className="flex gap-1.5">
                            <button onClick={() => applyFormatting(idx, '*')} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs font-bold hover:border-emerald-400 shadow-sm" title="Negrito">B</button>
                            <button onClick={() => applyFormatting(idx, '_')} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs italic hover:border-emerald-400 shadow-sm" title="Itálico">I</button>
                            <button onClick={() => applyFormatting(idx, '~')} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs line-through hover:border-emerald-400 shadow-sm" title="Tachado">S</button>
                            <button onClick={() => applyFormatting(idx, '<u>')} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs underline hover:border-emerald-400 shadow-sm" title="Sublinhado">U</button>
                            <div className="relative">
                               <button onClick={() => setActiveEmojiPicker(activeEmojiPicker === m.id ? null : m.id)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-center hover:border-emerald-400 shadow-sm">😊</button>
                               {activeEmojiPicker === m.id && (
                                 <div className="absolute right-0 bottom-10 z-[100] bg-white border border-slate-200 p-2 rounded-2xl shadow-2xl grid grid-cols-4 gap-1 w-32 border border-slate-100">
                                    {COMMON_EMOJIS.map(emoji => (
                                      <button key={emoji} onClick={() => insertEmoji(idx, emoji)} className="hover:bg-slate-100 p-1.5 rounded-lg transition-all text-lg">{emoji}</button>
                                    ))}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                      <textarea id={`textarea-${m.id}`} className="w-full text-sm bg-white border border-slate-200 rounded-2xl p-4 outline-none resize-none focus:border-emerald-300 transition-all font-roboto" value={m.content} rows={2} onChange={e => updateMessage(idx, { content: e.target.value })} />
                    </div>

                    {m.type === 'carousel' && (
                       <div className="space-y-3 p-3 bg-white rounded-2xl border border-slate-100">
                         <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-400">Cards do Carrossel</span><button onClick={() => addCarouselItem(idx)} className="text-[10px] font-bold text-emerald-600 hover:underline">+ Add Card</button></div>
                         {m.carouselItems?.map((ci, cidx) => (
                           <div key={ci.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 relative group/card">
                             <div className="relative h-24 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center group/img">
                                <img src={ci.image} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                  <span className="text-white text-[10px] font-bold">TROCAR IMAGEM</span>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => updateCarouselItem(idx, cidx, { image: b }))} />
                             </div>
                             <input type="text" className="w-full text-xs font-bold bg-white border border-slate-200 p-2 rounded-lg" placeholder="Título do Card" value={ci.title} onChange={e => updateCarouselItem(idx, cidx, { title: e.target.value })} />
                             <input type="text" className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg" placeholder="Texto do Botão" value={ci.buttonText} onChange={e => updateCarouselItem(idx, cidx, { buttonText: e.target.value })} />
                             <button onClick={() => {
                               const newItems = (m.carouselItems || []).filter((_, i) => i !== cidx);
                               updateMessage(idx, { carouselItems: newItems });
                             }} className="absolute top-1 right-1 p-1 text-red-300 hover:text-red-500 bg-white rounded-full shadow-sm"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
                           </div>
                         ))}
                       </div>
                    )}

                    {(m.type === 'image' || m.type === 'sticker') && (
                      <div className="relative h-24 bg-white border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center group/media">
                         <img src={m.image} className="h-full object-contain" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                            <span className="text-white text-[10px] font-bold">TROCAR MEDIA</span>
                         </div>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => updateMessage(idx, { image: b }))} />
                      </div>
                    )}

                    {m.type === 'buttons' && (
                       <div className="space-y-2 p-3 bg-white rounded-2xl border border-slate-100">
                         <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-400">Botões de Resposta</span><button onClick={() => {
                           const nb = [...(m.buttons || [])]; nb.push({ text: 'Nova Opção' }); updateMessage(idx, { buttons: nb });
                         }} className="text-[10px] font-bold text-emerald-600 hover:underline">+ Add Botão</button></div>
                         {m.buttons?.map((b, bidx) => (
                           <div key={bidx} className="flex gap-2">
                             <input type="text" className="flex-1 text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg" value={b.text} onChange={e => {
                               const nb = [...(m.buttons || [])]; nb[bidx].text = e.target.value; updateMessage(idx, { buttons: nb });
                             }} />
                             <button onClick={() => {
                               const nb = (m.buttons || []).filter((_, i) => i !== bidx); updateMessage(idx, { buttons: nb });
                             }} className="text-red-300 hover:text-red-500"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg></button>
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => addMessage('text')} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[28px] text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 hover:border-emerald-300 transition-all">+ Nova Mensagem</button>
            </div>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-8 animate-in slide-in-from-right-2">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Plataforma e Tema</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => updateConfig('platform', 'ios')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${state.config.platform === 'ios' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05,20.28c-1.12,1.26-2.29,2.44-3.76,2.44-1.42,0-1.88-0.85-3.5-0.85c-1.63,0-2.13,0.85-3.51,0.85s-2.52-1.1-3.64-2.44c-2.3-3.32-4.04-9.37-1.66-13.31c1.19-1.95,3.23-3.2,5.43-3.2c1.68,0,3.26,1.17,4.28,1.17c1.03,0,2.94-1.39,4.98-1.18c0.85,0.04,3.25,0.35,4.79,2.6c-0.12,0.08-2.86,1.66-2.86,4.94c0,3.94,3.44,5.25,3.48,5.27C21.06,16.51,19.23,19.27,17.05,20.28z M13.78,2.77c0.91-1.1,1.52-2.63,1.36-4.16c-1.32,0.05-2.91,0.88-3.86,2c-0.85,1-1.6,2.56-1.4,4.04C11.3,4.64,12.88,3.87,13.78,2.77z" /></svg>
                  <span className="text-[10px] font-black uppercase">iOS</span>
                </button>
                <button onClick={() => updateConfig('platform', 'android')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${state.config.platform === 'android' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M15,5H14V4H10V5H9C7.34,5 6,6.34 6,8V18C6,19.66 7.34,21 9,21H15C16.66,21 18,19.66 18,18V8C18,6.34 16.66,5 15,5M16,18C16,18.55 15.55,19 15,19H9C8.45,19 8,18.55 8,18V8C8,7.45 8.45,7 9,7H10V6H14V7H15C15.55,7 16,7.45 16,8V18Z" /></svg>
                  <span className="text-[10px] font-black uppercase">Android</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => updateConfig('theme', 'light')} className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${state.config.theme === 'light' ? 'border-emerald-500 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="w-3 h-3 rounded-full bg-slate-200" /> <span className="text-[10px] font-bold uppercase">Claro</span>
                </button>
                <button onClick={() => updateConfig('theme', 'dark')} className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${state.config.theme === 'dark' ? 'border-emerald-500 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="w-3 h-3 rounded-full bg-slate-700" /> <span className="text-[10px] font-bold uppercase">Escuro</span>
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Status do Dispositivo</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Bateria %</label>
                    <input type="number" className="w-full bg-slate-50 p-2 rounded-xl text-xs font-bold" value={state.config.batteryLevel} onChange={e => updateConfig('batteryLevel', Number(e.target.value))} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Hora Sistema</label>
                    <input type="time" className="w-full bg-slate-50 p-2 rounded-xl text-xs font-bold" value={state.config.systemTime} onChange={e => updateConfig('systemTime', e.target.value)} />
                 </div>
              </div>
            </section>
          </div>
        )}

        {/* MODELOS TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-in zoom-in-95">
            <section className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Salvar Conversa Atual</h3>
              <div className="flex gap-2">
                 <input 
                  type="text" 
                  className="flex-1 bg-slate-50 p-3 rounded-xl text-sm border-none outline-none focus:ring-2 ring-emerald-500/20" 
                  placeholder="Nome do seu modelo..." 
                  value={templateName} 
                  onChange={e => setTemplateName(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && createTemplateFromCurrentConversation(templateName)}
                />
                 <button onClick={() => createTemplateFromCurrentConversation(templateName)} className="px-5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-colors">Salvar conversa atual como modelo</button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Seus Modelos Salvos</h3>
              <div className="space-y-3">
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nenhum modelo salvo ainda</p>
                    <p className="text-[9px] text-slate-300 mt-2">Salve sua conversa atual para reutilizá-la depois.</p>
                  </div>
                ) : (
                  savedTemplates.map(tpl => (
                    <div key={tpl.id} className="p-4 bg-white border border-slate-200 rounded-[28px] flex items-center group shadow-sm hover:border-emerald-400 transition-all">
                      <div className="flex-1 cursor-pointer" onClick={() => applyTemplateToConversation(tpl.id)}>
                         <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{tpl.name}</h4>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(tpl.createdAt).toLocaleDateString()} - {tpl.state.messages.length} msg</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); applyTemplateToConversation(tpl.id); }} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-100" title="Carregar este modelo">
                            Carregar
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); updateTemplate(tpl.id); }} className="p-2 text-slate-400 hover:text-emerald-500" title="Atualizar com atual">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" /></svg>
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); cloneTemplate(tpl.id); }} className="p-2 text-slate-400 hover:text-emerald-500" title="Clonar">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg>
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id); }} className="p-2 text-red-300 hover:text-red-500" title="Excluir">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
