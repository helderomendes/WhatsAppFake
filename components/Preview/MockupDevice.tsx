
import React, { useEffect, useRef } from 'react';
import { AppState, Message } from '../../types';
import { THEME_COLORS, WHATSAPP_DEFAULT_IMAGE, DEFAULT_AVATAR } from '../../constants';

interface MockupDeviceProps {
  state: AppState;
  id?: string;
  visibleCount?: number; 
}

const MockupDevice: React.FC<MockupDeviceProps> = ({ state, id, visibleCount = 999 }) => {
  const { config, messages, contacts, mainUser } = state;
  const isDark = config.theme === 'dark';
  const isIOS = config.platform === 'ios';
  const colors = isIOS ? THEME_COLORS.ios[config.theme] : THEME_COLORS.android[config.theme];
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.slice(0, visibleCount);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [filteredMessages.length]);

  const getSender = (senderId: string) => {
    if (senderId === 'system') return { name: 'Sistema', avatar: '', color: '#8696A0' };
    if (senderId === mainUser.id) return mainUser;
    return contacts.find(c => c.id === senderId) || contacts[0];
  };

  const getMessageById = (msgId: string) => {
    return messages.find(m => m.id === msgId);
  };

  const currentChatName = config.isGroup ? config.groupName : (contacts[0]?.name || 'Nome 1');
  const currentChatAvatar = config.isGroup ? config.groupImage : (contacts[0]?.avatar || DEFAULT_AVATAR);

  const DoubleCheck = ({ read }: { read: boolean }) => (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" className="ml-1 -mb-0.5 inline-block">
      <path d="M1.5 8.5L4.5 11.5L10 5.5" stroke={read ? "#34B7F1" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 8.5L8.5 11.5L14 5.5" stroke={read ? "#34B7F1" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const Waveform = () => {
    const bars = [10, 15, 8, 12, 18, 14, 10, 22, 16, 12, 18, 14, 20, 15, 12, 18, 24, 16, 14, 10, 15, 20, 18, 12, 10];
    return (
      <div className="flex items-center gap-[2px] h-6 px-1">
        {bars.map((h, i) => (
          <div key={i} className={`w-[2.5px] rounded-full ${isDark ? 'bg-[#8696A0]' : 'bg-[#94a3b8]'}`} style={{ height: `${h}px`, opacity: i < 10 ? 1 : 0.4 }} />
        ))}
      </div>
    );
  };

  // WhatsApp-style rich text formatting
  const formatText = (text: string) => {
    if (!text) return '';
    
    // First escape HTML to prevent XSS (minimal)
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Re-allow our specific tags after escaping
    escaped = escaped
      .replace(/&lt;u&gt;/g, '<u>')
      .replace(/&lt;\/u&gt;/g, '</u>');

    // Bold: *text*
    let formatted = escaped.replace(/\*(.*?)\*/g, '<b>$1</b>');
    // Italic: _text_
    formatted = formatted.replace(/_(.*?)_/g, '<i>$1</i>');
    // Strike: ~text~
    formatted = formatted.replace(/~(.*?)~/g, '<s>$1</s>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div 
      id={id}
      className={`relative mx-auto w-[375px] h-[812px] rounded-[50px] overflow-hidden border-[12px] border-[#1A1A1A] shadow-2xl flex flex-col font-sans transition-all`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-b-3xl z-[100] flex items-center justify-center">
        <div className="w-10 h-1 bg-[#1A1A1A] rounded-full"></div>
      </div>

      <div className="absolute inset-0 z-0 transition-all" style={config.wallpaperType === 'image' ? { backgroundImage: `url(${config.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: config.backgroundColor }} />
      {config.wallpaperType === 'color' && <div className={`absolute inset-0 z-0 opacity-[0.06] pointer-events-none ${isDark ? 'invert brightness-[0.2]' : ''}`} style={{ backgroundImage: `url(${WHATSAPP_DEFAULT_IMAGE})`, backgroundSize: '120px' }} />}

      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Status Bar */}
        <div className={`px-8 pt-10 pb-1 flex justify-between items-center text-[13px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          <span>{config.systemTime}</span>
          <div className="flex gap-1.5 items-center">
             <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M12 11h4V1h-4v10zm-5 0h4V4H7v7zm-5 0h4V7H2v4z"/></svg>
             <div className="w-6 h-3 border border-current rounded-[3px] p-[1px] opacity-70 relative">
               <div className="h-full bg-current rounded-[1px]" style={{ width: `${config.batteryLevel}%` }}></div>
             </div>
          </div>
        </div>

        {/* Header */}
        <div className={`px-3 py-1 flex items-center justify-between border-b ${isDark ? 'bg-[#202C33] border-white/5' : 'bg-white border-black/5'}`}>
          <div className="flex items-center gap-1.5 py-2 overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={isDark ? 'text-white' : 'text-[#666]'}><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#CED3D6] shadow-sm"><img src={currentChatAvatar} crossOrigin="anonymous" className="w-full h-full object-cover" alt="" /></div>
            <div className="flex flex-col ml-0.5 truncate max-w-[180px]">
              <h3 className="font-bold text-[16px] leading-tight truncate">{currentChatName}</h3>
              <p className="text-[11px] font-medium leading-none opacity-60 truncate">
                {config.isGroup ? `${contacts.map(c => c.name).join(', ')}` : 'online'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center opacity-60">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          </div>
        </div>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1 no-scrollbar scroll-smooth">
          {filteredMessages.map((msg, idx) => {
            const isMine = msg.senderId === mainUser.id;
            const sender = getSender(msg.senderId);
            const showTail = idx === 0 || filteredMessages[idx-1].senderId !== msg.senderId;
            const bubbleBg = isMine ? colors.bubbleSent : colors.bubbleReceived;
            
            const repliedMsg = msg.replyToId ? getMessageById(msg.replyToId) : null;
            const repliedSender = repliedMsg ? getSender(repliedMsg.senderId) : null;

            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="w-full flex justify-center my-2 px-6">
                  <div className={`px-4 py-1.5 rounded-lg text-[11px] text-center shadow-sm font-medium ${isDark ? 'bg-[#1C1C1E] text-[#8696A0]' : 'bg-[#FFF9C4] text-[#54656F]'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex w-full mb-1 animate-in slide-in-from-bottom-2 duration-300 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[90%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  
                  {config.isGroup && !isMine && showTail && (
                    <span className="text-[11px] font-bold ml-2 mb-0.5 opacity-80" style={{ color: sender.color || '#F44336' }}>{sender.name}</span>
                  )}

                  <div 
                    className={`rounded-[14px] shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] relative overflow-hidden transition-all ${isMine ? (showTail ? 'rounded-tr-none' : '') : (showTail ? 'rounded-tl-none' : '')} ${msg.type === 'sticker' ? 'bg-transparent shadow-none' : ''}`}
                    style={{ backgroundColor: msg.type === 'sticker' ? 'transparent' : bubbleBg, padding: msg.type === 'audio' ? '6px 12px 6px 10px' : (msg.type === 'image' || msg.type === 'sticker' ? '4px' : '6px 8px 6px 10px') }}
                  >
                    {showTail && msg.type !== 'sticker' && (
                      <div className={`absolute top-0 ${isMine ? '-right-1.5' : '-left-1.5'}`}>
                        <svg width="12" height="15" viewBox="0 0 10 12" fill="currentColor" style={{ color: bubbleBg }}><path d={isMine ? "M0 0 L10 0 L0 10 Z" : "M10 0 L0 0 L10 10 Z"} /></svg>
                      </div>
                    )}

                    {repliedMsg && repliedSender && (
                      <div className={`mb-1.5 rounded-[8px] overflow-hidden flex bg-black/[0.06] border-l-[4px] min-w-[120px] max-w-full`} style={{ borderLeftColor: repliedSender.color || '#34B7F1' }}>
                         <div className="flex-1 p-1.5 flex flex-col overflow-hidden">
                            <span className="text-[11.5px] font-bold truncate" style={{ color: repliedSender.color || '#34B7F1' }}>{repliedSender.name}</span>
                            <span className="text-[12px] opacity-60 leading-tight truncate whitespace-nowrap">{repliedMsg.content}</span>
                         </div>
                         {repliedMsg.type === 'image' && (
                           <div className="w-10 h-10 bg-black/10 flex-shrink-0"><img src={repliedMsg.image} className="w-full h-full object-cover" /></div>
                         )}
                      </div>
                    )}
                    
                    {msg.type === 'image' && msg.image && <div className="rounded-[11px] overflow-hidden mb-1"><img src={msg.image} className="max-w-full h-auto block" alt="" /></div>}
                    {msg.type === 'sticker' && msg.image && <div className="w-32 h-32 p-2"><img src={msg.image} className="w-full h-full object-contain" alt="" /></div>}
                    
                    {msg.type === 'audio' && (
                      <div className="flex flex-col min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <div className={`flex-shrink-0 ${isDark ? 'text-[#8696A0]' : 'text-[#667781]'}`}><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
                          <div className="flex-1 flex items-center relative gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#34B7F1] absolute -left-1"></div><Waveform /></div>
                          <div className="relative flex-shrink-0 ml-1">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-black/5 shadow-sm"><img src={sender.avatar || DEFAULT_AVATAR} className="w-full h-full object-cover" alt="" /></div>
                            <div className="absolute -bottom-1 -left-1 text-[#34B7F1]"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center px-1 mt-1">
                           <span className={`text-[11px] font-medium ${isDark ? 'text-[#8696A0]' : 'text-[#667781]'}`}>{msg.audioDuration || '0:00'}</span>
                           <div className="flex items-center gap-1"><span className={`text-[10px] opacity-50 font-medium ${isDark ? 'text-[#8696A0]' : 'text-[#667781]'}`}>{msg.timestamp}</span>{isMine && <DoubleCheck read={msg.status === 'read'} />}</div>
                        </div>
                      </div>
                    )}

                    {msg.content && msg.type !== 'audio' && (
                      <p className={`leading-tight whitespace-pre-wrap px-1 font-roboto ${msg.type === 'buttons' ? 'font-bold mb-1' : ''}`} style={{ fontSize: `${config.fontSize}px` }}>
                        {formatText(msg.content)}
                      </p>
                    )}

                    {msg.type !== 'audio' && (
                      <div className="flex justify-end items-center gap-1 mt-0.5 px-1"><span className="text-[10px] opacity-50 font-medium">{msg.timestamp}</span>{isMine && <DoubleCheck read={msg.status === 'read'} />}</div>
                    )}
                  </div>

                  {/* Respostas Rápidas (Quick Replies) */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className={`mt-2 grid grid-cols-2 gap-2 w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {msg.buttons.map((btn, bIdx) => (
                        <div key={bIdx} className={`px-4 py-3 rounded-[12px] bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-center transition-active active:bg-slate-50 min-h-[44px]`}>
                          <span className="text-[14px] text-[#007AFF] font-bold text-center leading-tight">{btn.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.type === 'carousel' && msg.carouselItems && (
                    <div className="w-full mt-2 overflow-x-auto no-scrollbar scroll-smooth">
                      <div className="flex gap-2 pb-2 pr-10">
                        {msg.carouselItems.map((item) => (
                          <div key={item.id} className={`min-w-[210px] max-w-[210px] rounded-2xl shadow-md overflow-hidden ${isDark ? 'bg-[#202C33]' : 'bg-white'} border border-black/5 flex flex-col`}>
                            <div className="w-full h-32 overflow-hidden">
                               <img src={item.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="px-3 py-2.5 flex-1 bg-white">
                              <h4 className="font-bold text-[14px] text-slate-800 leading-tight h-[34px] overflow-hidden">{item.title}</h4>
                            </div>
                            <div className="border-t border-slate-100 bg-white">
                               <button className="w-full py-2.5 px-4 flex items-center justify-center gap-2 transition-active active:bg-slate-50">
                                  <div className="w-4 h-4 rounded border border-emerald-600 flex items-center justify-center">
                                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="7" y1="17" x2="17" y2="7"></line>
                                        <polyline points="7 7 17 7 17 17"></polyline>
                                     </svg>
                                  </div>
                                  <span className="text-[12px] font-bold text-emerald-600 truncate">{item.buttonText}</span>
                               </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Input */}
        <div className={`px-2 py-2 pb-8 flex items-center gap-2 ${isDark ? 'bg-[#0B141A]' : 'bg-[#F0F2F5]'}`}>
           <button className={`${isDark ? 'text-[#8696A0]' : 'text-[#54656F]'} p-1`}><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg></button>
           <div className={`flex-1 rounded-[22px] px-4 py-2 text-[15px] border border-black/5 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#2A3942] text-[#8696A0]' : 'bg-white text-[#54656F]'}`}>
            <span>Mensagem</span>
            <div className="flex gap-3 opacity-50"><svg width="20" height="20" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/></svg><svg width="20" height="20" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>
           </div>
           <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-white ${isIOS ? 'bg-[#007AFF]' : (isDark ? 'bg-[#00A884]' : 'bg-[#008069]')}`}>
             <svg width="24" height="24" fill="currentColor" className="ml-1"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MockupDevice;
