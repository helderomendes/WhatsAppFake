
import React, { useState } from 'react';
import { AppState, Contact, Message, MessageType } from '../../types';
import { COMMON_EMOJIS, INITIAL_STATE, WHATSAPP_DEFAULT_IMAGE, DEFAULT_AVATAR } from '../../constants';
import { generateConversation } from '../../services/geminiService';

interface EditorPanelProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ state, setState }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'design'>('messages');
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const updateConfig = (key: string, value: any) => {
    setState(p => {
      let newConfig = { ...p.config, [key]: value };
      
      // Ao mudar o tema, atualiza automaticamente a cor de fundo padrão se o usuário estiver usando cores sólidas
      if (key === 'theme') {
        if (value === 'dark') {
          newConfig.backgroundColor = '#0b141a';
        } else {
          newConfig.backgroundColor = '#e5ddd5';
        }
      }
      
      return { ...p, config: newConfig };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const result = await generateConversation(aiPrompt, state.contacts);
      const newMessages: Message[] = result.messages.map((m: any, idx: number) => {
        let senderId = state.mainUser.id;
        const senderName = m.senderName?.toLowerCase() || '';
        if (senderName !== 'eu' && senderName !== 'você' && senderName !== 'me') {
           const found = state.contacts.find(c => c.name.toLowerCase().includes(senderName));
           if (found) senderId = found.id;
           else senderId = state.contacts[0]?.id || state.mainUser.id;
        }

        return {
          id: `ai-${Date.now()}-${idx}`,
          senderId,
          content: m.content || '',
          contentPosition: 'bottom',
          type: m.type || 'text',
          timestamp: m.timestamp || '12:00',
          status: 'read',
          audioDuration: m.audioDuration,
          buttons: m.buttons,
          image: m.type === 'image' || m.type === 'sticker' ? 'https://picsum.photos/400/300' : undefined
        };
      });
      setState(p => ({ ...p, messages: [...p.messages, ...newMessages] }));
      setAiPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addMessage = (type: MessageType = 'text') => {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: state.mainUser.id,
      content: type === 'text' ? 'Olá!' : (type === 'system' ? 'Criptografia ativa.' : ''),
      contentPosition: 'bottom',
      type,
      timestamp: state.config.systemTime,
      status: 'read',
      image: (type === 'image' || type === 'sticker') ? 'https://picsum.photos/400/300' : undefined,
      audioDuration: type === 'audio' ? '0:12' : undefined,
      carouselItems: type === 'carousel' ? [{ id: `c-${Date.now()}`, title: 'Título do Card', description: 'Descrição curta aqui', image: 'https://picsum.photos/400/300', buttonText: 'Saiba Mais' }] : undefined,
      buttons: type === 'buttons' ? [{ text: 'Botão 1' }] : undefined,
      contactCard: type === 'contact_card' ? { name: 'João Silva', avatar: 'https://ui-avatars.com/api/?name=Joao+Silva', subtext: 'Disponível' } : undefined
    };
    setState(p => ({ ...p, messages: [...p.messages, msg] }));
  };

  const updateMessage = (idx: number, updates: Partial<Message>) => {
    const newMessages = [...state.messages];
    newMessages[idx] = { ...newMessages[idx], ...updates };
    setState(p => ({ ...p, messages: newMessages }));
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden shadow-2xl font-sans">
      <div className="flex bg-slate-50 p-2 gap-1 border-b border-slate-200">
        {(['users', 'messages', 'design'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === tab ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'users' ? 'Participantes' : tab === 'messages' ? 'Mensagens' : 'Estilo'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar bg-white">
        {activeTab === 'users' && (
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Seu Perfil</h3>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="relative w-16 h-16 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 cursor-pointer shadow-sm">
                  <img src={state.mainUser.avatar} className="w-full h-full object-cover" />
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => setState(p => ({...p, mainUser: {...p.mainUser, avatar: b}})))} />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Seu Nome</label>
                  <input className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none" value={state.mainUser.name} onChange={e => setState(p => ({...p, mainUser: {...p.mainUser, name: e.target.value}}))} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Destinatários</h3>
              <div className="space-y-4">
                {state.contacts.map((c, idx) => (
                  <div key={c.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm space-y-4 group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 cursor-pointer shadow-sm">
                        <img src={c.avatar} className="w-full h-full object-cover" />
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => {
                          const newC = [...state.contacts];
                          newC[idx].avatar = b;
                          setState(p => ({...p, contacts: newC}));
                        })} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <input className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 outline-none" value={c.name} onChange={e => {
                          const newC = [...state.contacts];
                          newC[idx].name = e.target.value;
                          setState(p => ({...p, contacts: newC}));
                        }} />
                        <input className="w-full bg-transparent text-[11px] font-medium text-slate-400 outline-none px-1" placeholder="Status..." value={c.statusText} onChange={e => {
                          const newC = [...state.contacts];
                          newC[idx].statusText = e.target.value;
                          setState(p => ({...p, contacts: newC}));
                        }} />
                      </div>
                      <button onClick={() => setState(p => ({...p, contacts: p.contacts.filter(contact => contact.id !== c.id)}))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                   const id = `c-${Date.now()}`;
                   setState(p => ({...p, contacts: [...p.contacts, {id, name: 'Novo Contato', avatar: DEFAULT_AVATAR, statusText: 'online'}]}))
                }} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-[11px] font-black uppercase text-slate-400 bg-slate-50/50">+ Adicionar Participante</button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="p-6 bg-emerald-600 rounded-3xl shadow-xl text-white">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">🤖 IA Inteligente</h3>
              <textarea 
                className="w-full bg-white border border-emerald-400 rounded-2xl p-4 text-sm placeholder:text-slate-400 outline-none h-24 text-slate-800 font-medium"
                placeholder="Ex: Uma conversa comercial..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt}
                className="mt-4 w-full py-3 bg-white text-emerald-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-50 shadow-lg disabled:opacity-50"
              >
                {isGenerating ? 'Criando Diálogo...' : 'Gerar Mensagens Criativas'}
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Recursos de Mensagem</label>
              <div className="grid grid-cols-2 gap-3">
                {(['text', 'image', 'audio', 'carousel', 'buttons', 'system', 'sticker', 'contact_card'] as const).map(type => (
                  <button 
                    key={type}
                    onClick={() => addMessage(type)} 
                    className="py-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-sm hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    {type === 'text' ? 'Texto' : type === 'image' ? 'Imagem' : type === 'audio' ? 'Áudio' : type === 'carousel' ? 'Carrossel' : type === 'buttons' ? 'Botões' : type === 'system' ? 'Sistema' : type === 'sticker' ? 'Figurinha' : 'Contato'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Fluxo da Conversa ({state.messages.length})</label>
              {state.messages.map((m, idx) => (
                <div key={m.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] shadow-sm relative group space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                       <select 
                        className="text-[10px] font-black uppercase text-emerald-600 bg-white px-3 py-1.5 rounded-xl border-none ring-1 ring-emerald-100 outline-none"
                        value={m.senderId}
                        onChange={e => updateMessage(idx, { senderId: e.target.value })}
                      >
                        <option value="system">Sistema</option>
                        <option value={state.mainUser.id}>Eu (Remetente)</option>
                        {state.contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input type="time" className="text-[11px] font-bold text-slate-500 bg-white border border-slate-100 rounded-lg p-1 outline-none" value={m.timestamp} onChange={e => updateMessage(idx, { timestamp: e.target.value })} />
                      <button onClick={() => setState(p => ({...p, messages: p.messages.filter(msg => msg.id !== m.id)}))} className="text-red-300 hover:text-red-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                      </button>
                    </div>
                  </div>

                  {m.type !== 'system' && (
                    <div className="space-y-1">
                       <div className="flex justify-between items-center px-1">
                         <label className="text-[9px] font-black uppercase text-slate-400">Texto da Mensagem</label>
                         <select 
                            className="text-[9px] font-bold uppercase text-slate-400 bg-transparent outline-none border-none cursor-pointer"
                            value={m.contentPosition}
                            onChange={e => updateMessage(idx, { contentPosition: e.target.value as any })}
                          >
                            <option value="top">Texto Acima</option>
                            <option value="bottom">Texto Abaixo</option>
                          </select>
                       </div>
                       <textarea 
                        className="w-full text-sm font-bold bg-white border border-slate-100 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed text-slate-800"
                        value={m.content}
                        rows={2}
                        placeholder="Digite o texto da mensagem..."
                        onChange={e => updateMessage(idx, { content: e.target.value })}
                      />
                    </div>
                  )}

                  {m.type === 'system' && (
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-1">Mensagem de Sistema</label>
                       <textarea 
                        className="w-full text-sm font-bold bg-white border border-slate-100 rounded-2xl p-3 outline-none resize-none text-slate-800"
                        value={m.content}
                        rows={1}
                        onChange={e => updateMessage(idx, { content: e.target.value })}
                      />
                    </div>
                  )}

                  {m.type === 'audio' && (
                    <div className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-slate-100">
                       <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400">Duração</label>
                          <input className="w-full bg-white border border-slate-100 p-2 rounded-xl text-xs font-bold" value={m.audioDuration} onChange={e => updateMessage(idx, { audioDuration: e.target.value })} />
                       </div>
                    </div>
                  )}

                  {(m.type === 'image' || m.type === 'sticker') && (
                    <div className="space-y-3">
                      <img src={m.image} className="w-full h-32 object-contain rounded-2xl border border-slate-100 bg-white p-2" />
                      <div className="relative">
                        <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500">Alterar Mídia</button>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => updateMessage(idx, { image: b }))} />
                      </div>
                    </div>
                  )}

                  {m.type === 'carousel' && (
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase text-slate-400">Cards do Carrossel ({m.carouselItems?.length || 0})</label>
                       <div className="space-y-4">
                         {m.carouselItems?.map((item, cIdx) => (
                           <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-emerald-600">CARD #{cIdx + 1}</span>
                                <button onClick={() => {
                                  const items = m.carouselItems?.filter((_, i) => i !== cIdx);
                                  updateMessage(idx, { carouselItems: items });
                                }} className="text-red-400 text-xs">Remover</button>
                              </div>
                              <input className="w-full bg-slate-50 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" placeholder="Título do Card" value={item.title} onChange={e => {
                                const items = [...(m.carouselItems || [])];
                                items[cIdx] = { ...items[cIdx], title: e.target.value };
                                updateMessage(idx, { carouselItems: items });
                              }} />
                              <textarea className="w-full bg-slate-50 rounded-lg px-3 py-1.5 text-xs outline-none h-12" placeholder="Descrição" value={item.description} onChange={e => {
                                const items = [...(m.carouselItems || [])];
                                items[cIdx] = { ...items[cIdx], description: e.target.value };
                                updateMessage(idx, { carouselItems: items });
                              }} />
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <button className="w-full py-2 bg-slate-100 rounded-lg text-[9px] font-bold">Trocar Foto</button>
                                  <input type="file" className="absolute inset-0 opacity-0" onChange={e => handleFileUpload(e, b => {
                                    const items = [...(m.carouselItems || [])];
                                    items[cIdx] = { ...items[cIdx], image: b };
                                    updateMessage(idx, { carouselItems: items });
                                  })} />
                                </div>
                                <input className="w-full bg-slate-100 rounded-lg px-2 py-1.5 text-[10px] font-bold text-center" placeholder="Texto Botão" value={item.buttonText} onChange={e => {
                                  const items = [...(m.carouselItems || [])];
                                  items[cIdx] = { ...items[cIdx], buttonText: e.target.value };
                                  updateMessage(idx, { carouselItems: items });
                                }} />
                              </div>
                           </div>
                         ))}
                       </div>
                       <button onClick={() => {
                          const newItem = { id: `c-${Date.now()}`, title: 'Novo Card', description: 'Descrição...', image: 'https://picsum.photos/400/300', buttonText: 'Clique' };
                          const items = [...(m.carouselItems || []), newItem];
                          updateMessage(idx, { carouselItems: items });
                       }} className="w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">+ ADICIONAR CARD</button>
                    </div>
                  )}

                  {m.type === 'buttons' && (
                    <div className="space-y-3">
                       <label className="text-[9px] font-black uppercase text-slate-400">Botões de Link ({m.buttons?.length || 0})</label>
                       <div className="space-y-2">
                         {m.buttons?.map((btn, bIdx) => (
                           <div key={bIdx} className="flex gap-2 items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <input className="flex-1 bg-transparent text-xs font-bold outline-none" placeholder="Texto do Botão" value={btn.text} onChange={e => {
                                 const btns = [...(m.buttons || [])];
                                 btns[bIdx] = { ...btns[bIdx], text: e.target.value };
                                 updateMessage(idx, { buttons: btns });
                              }} />
                              <button onClick={() => {
                                 const btns = m.buttons?.filter((_, i) => i !== bIdx);
                                 updateMessage(idx, { buttons: btns });
                              }} className="text-red-300 font-bold hover:text-red-500">×</button>
                           </div>
                         ))}
                       </div>
                       <button onClick={() => {
                         const btns = [...(m.buttons || []), { text: 'Novo Botão' }];
                         updateMessage(idx, { buttons: btns });
                       }} className="w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50">+ ADICIONAR BOTÃO</button>
                    </div>
                  )}

                  <div className="flex gap-4 items-center pt-4 mt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === m.id ? null : m.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all text-sm shadow-sm"
                    >
                      <span className="text-[10px] font-black uppercase text-slate-400">Reação</span>
                      <span className="text-base">{m.reaction || '+'}</span>
                    </button>
                    {showEmojiPickerFor === m.id && (
                      <div className="absolute bottom-full mb-3 left-0 bg-white shadow-2xl rounded-3xl p-3 z-[200] flex gap-3 border border-slate-200 animate-in zoom-in-50 duration-200">
                        {COMMON_EMOJIS.map(e => (
                          <button key={e} onClick={() => {
                            updateMessage(idx, { reaction: e });
                            setShowEmojiPickerFor(null);
                          }} className="text-2xl hover:scale-150 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer ml-auto group">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${m.isForwarded ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                         {m.isForwarded && <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 7L9 19L3.5 13.5L4.91 12.09L9 16.17L19.59 5.59L21 7Z"/></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={m.isForwarded} onChange={e => updateMessage(idx, { isForwarded: e.target.checked })} />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Encaminhada</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-8 animate-in slide-in-from-left-2 duration-300">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Sistema Base</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => updateConfig('platform', 'ios')} className={`py-4 rounded-3xl text-[11px] font-black uppercase border-2 transition-all ${state.config.platform === 'ios' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg' : 'border-slate-100 text-slate-400'}`}>Apple iOS</button>
                <button onClick={() => updateConfig('platform', 'android')} className={`py-4 rounded-3xl text-[11px] font-black uppercase border-2 transition-all ${state.config.platform === 'android' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' : 'border-slate-100 text-slate-400'}`}>Android</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => updateConfig('theme', 'light')} className={`py-4 rounded-3xl text-[11px] font-black uppercase border-2 transition-all ${state.config.theme === 'light' ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}>Modo Claro</button>
                <button onClick={() => updateConfig('theme', 'dark')} className={`py-4 rounded-3xl text-[11px] font-black uppercase border-2 transition-all ${state.config.theme === 'dark' ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}>Modo Escuro</button>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Papel de Parede (Wallpaper)</h3>
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                <button 
                  onClick={() => updateConfig('wallpaperType', 'color')}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${state.config.wallpaperType === 'color' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                >
                  Cor Sólida
                </button>
                <button 
                  onClick={() => updateConfig('wallpaperType', 'image')}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${state.config.wallpaperType === 'image' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                >
                  Imagem / Foto
                </button>
              </div>

              {state.config.wallpaperType === 'color' ? (
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 block">Cor de Fundo</label>
                   <div className="flex gap-4 items-center">
                     <input 
                      type="color" 
                      className="w-14 h-14 rounded-xl border-none p-0 cursor-pointer shadow-lg overflow-hidden" 
                      value={state.config.backgroundColor} 
                      onChange={e => updateConfig('backgroundColor', e.target.value)} 
                     />
                     <input 
                      type="text" 
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono font-bold"
                      value={state.config.backgroundColor}
                      onChange={e => updateConfig('backgroundColor', e.target.value)}
                     />
                   </div>
                   <button 
                    onClick={() => updateConfig('backgroundColor', state.config.theme === 'dark' ? '#0b141a' : '#e5ddd5')}
                    className="w-full py-2 bg-slate-100 text-[9px] font-black uppercase text-slate-500 rounded-xl mt-2"
                   >
                     Resetar para Cor Padrão Tema
                   </button>
                </div>
              ) : (
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="w-full h-40 rounded-2xl border-2 border-white shadow-lg bg-white overflow-hidden">
                      <img src={state.config.wallpaper} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 block">Personalizar Fundo</label>
                       <div className="relative">
                        <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 shadow-sm">Upload Foto</button>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, b => updateConfig('wallpaper', b))} />
                       </div>
                       <button 
                        onClick={() => updateConfig('wallpaper', WHATSAPP_DEFAULT_IMAGE)}
                        className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase"
                       >
                         Usar Doodles (Padrão)
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
