
import React from 'react';
import { AppState, Message } from '../../types';
import { THEME_COLORS } from '../../constants';

interface MockupDeviceProps {
  state: AppState;
  id?: string;
}

const MockupDevice: React.FC<MockupDeviceProps> = ({ state, id }) => {
  const { config, messages, contacts, mainUser } = state;
  const isDark = config.theme === 'dark';
  const isIOS = config.platform === 'ios';
  const colors = isIOS ? THEME_COLORS.ios[config.theme] : THEME_COLORS.android[config.theme];

  const getSender = (senderId: string) => {
    if (senderId === 'system') return { name: 'System', avatar: '', color: '#000' };
    if (senderId === mainUser.id) return mainUser;
    return contacts.find(c => c.id === senderId) || contacts[0];
  };

  const currentChatName = config.isGroup ? config.groupName : (contacts[0]?.name || 'Contato');
  const currentChatAvatar = config.isGroup ? config.groupImage : (contacts[0]?.avatar || '');

  // Ícone de check duplo refinado
  const DoubleCheck = ({ read }: { read: boolean }) => (
    <svg width="15" height="10" viewBox="0 0 16 11" fill="none" className="ml-1 inline-block translate-y-[-1px]">
      <path d="M4.16667 6.33333L6.66667 8.83333L12.5 3" stroke={read ? "#34B7F1" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 6.33333L3.5 8.83333L9.33333 3" stroke={read ? "#34B7F1" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div 
      id={id}
      className={`relative mx-auto w-[375px] h-[812px] rounded-[50px] overflow-hidden border-[12px] border-[#1A1A1A] shadow-2xl flex flex-col font-sans transition-all ${isDark ? 'bg-[#0B141A]' : 'bg-white'}`}
      style={{ color: colors.text }}
    >
      {/* Notch do iPhone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-b-3xl z-[100] flex items-center justify-center">
        <div className="w-10 h-1 bg-[#1A1A1A] rounded-full"></div>
      </div>

      {/* Papel de Parede */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={config.wallpaper} 
          crossOrigin="anonymous" 
          className={`w-full h-full object-cover ${isDark ? 'brightness-[0.4] opacity-50' : 'opacity-80'}`}
          alt=""
        />
      </div>

      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        {/* Barra de Status */}
        <div className={`px-8 pt-10 pb-1 flex justify-between items-center text-[13px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          <span>{config.systemTime}</span>
          <div className="flex gap-1.5 items-center">
             <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                <path d="M12 11h4V1h-4v10zm-5 0h4V4H7v7zm-5 0h4V7H2v4z"/>
             </svg>
             <div className="w-6 h-3 border border-current rounded-[3px] p-[1px] opacity-70 relative">
               <div className="h-full bg-current rounded-[1px]" style={{ width: `${config.batteryLevel}%` }}></div>
             </div>
          </div>
        </div>

        {/* Cabeçalho */}
        <div className={`px-3 py-1 flex items-center justify-between transition-colors border-b ${isDark ? 'bg-[#202C33] border-white/5' : 'bg-white border-black/5'}`}>
          <div className="flex items-center gap-1.5 py-2 overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={isDark ? 'text-white' : 'text-[#666]'}>
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
            </svg>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
              <img src={currentChatAvatar} crossOrigin="anonymous" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex flex-col ml-0.5 truncate">
              <h3 className="font-bold text-[16px] leading-tight truncate">{currentChatName}</h3>
              <p className="text-[11px] font-medium leading-none opacity-60">
                {config.isGroup ? 'online' : (contacts[0]?.statusText || 'online')}
              </p>
            </div>
          </div>
          <div className={`flex gap-4 items-center ${isDark ? 'text-[#8696A0]' : 'text-[#54656F]'}`}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1 no-scrollbar scroll-smooth">
          {messages.map((msg, idx) => {
            const isMine = msg.senderId === mainUser.id;
            const sender = getSender(msg.senderId);
            const showTail = idx === 0 || messages[idx-1].senderId !== msg.senderId;
            const bubbleBg = isMine ? colors.bubbleSent : colors.bubbleReceived;

            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="w-full flex justify-center my-2 px-6">
                  <div className={`px-3 py-1 rounded-md text-[11px] text-center shadow-sm font-medium ${isDark ? 'bg-[#1C1C1E] text-[#8696A0]' : 'bg-[#FFF9C4] text-[#54656F]'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex w-full mb-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[85%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`rounded-[14px] shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] relative ${
                      isMine ? (showTail ? 'rounded-tr-none' : '') : (showTail ? 'rounded-tl-none' : '')
                    } ${msg.type === 'sticker' ? 'bg-transparent shadow-none' : ''}`}
                    style={{ 
                      backgroundColor: msg.type === 'sticker' ? 'transparent' : bubbleBg, 
                      color: colors.text,
                      padding: (msg.type === 'image' || msg.type === 'sticker') ? '2px' : '5px 8px 5px 10px'
                    }}
                  >
                    {showTail && msg.type !== 'sticker' && (
                      <div className={`absolute top-0 ${isMine ? '-right-1.5' : '-left-1.5'}`}>
                        <svg width="12" height="15" viewBox="0 0 10 12" fill="currentColor" style={{ color: bubbleBg }}>
                          <path d={isMine ? "M0 0 L10 0 L0 10 Z" : "M10 0 L0 0 L10 10 Z"} />
                        </svg>
                      </div>
                    )}

                    {config.isGroup && !isMine && (
                      <p className="text-[12px] font-bold px-1 mb-0.5" style={{ color: sender.color || '#00A884' }}>{sender.name}</p>
                    )}

                    {msg.isForwarded && (
                      <div className="flex items-center gap-1 text-[11px] italic opacity-50 px-1 mb-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10,9V5L3,12L10,19V14.9C15,14.9 18.5,16.5 21,20C20,15 17,10 10,9Z" /></svg>
                        Encaminhada
                      </div>
                    )}

                    {msg.content && msg.contentPosition === 'top' && (
                      <p className="leading-tight whitespace-pre-wrap px-1 mb-1" style={{ fontSize: `${config.fontSize}px` }}>{msg.content}</p>
                    )}

                    {msg.type === 'image' && msg.image && (
                      <div className="rounded-[11px] overflow-hidden mb-0.5">
                        <img src={msg.image} crossOrigin="anonymous" className="max-w-full h-auto block" alt="" />
                      </div>
                    )}

                    {msg.type === 'sticker' && msg.image && (
                      <div className="w-32 h-32 overflow-hidden flex items-center justify-center p-2">
                        <img src={msg.image} crossOrigin="anonymous" className="w-full h-full object-contain" alt="" />
                      </div>
                    )}

                    {msg.type === 'audio' && (
                      <div className="flex items-center gap-2 py-1 min-w-[200px]">
                        <div className="relative w-11 h-11 flex-shrink-0">
                          <img src={sender.avatar} crossOrigin="anonymous" className="w-full h-full rounded-full object-cover border border-white/20" alt="" />
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1C1C1E] rounded-full p-0.5 shadow-sm text-green-500">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                           <div className="flex items-center gap-1">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="opacity-60"><path d="M8 5v14l11-7z"/></svg>
                             <div className="flex-1 h-0.5 bg-black/10 dark:bg-white/10 rounded-full"></div>
                           </div>
                           <span className="text-[10px] opacity-60 ml-7">{msg.audioDuration}</span>
                        </div>
                      </div>
                    )}

                    {msg.type === 'contact_card' && msg.contactCard && (
                      <div className={`${isDark ? 'bg-[#202C33]' : 'bg-[#F0F2F5]'} rounded-xl p-3 min-w-[220px] mb-2 border border-black/5`}>
                        <div className="flex items-center gap-3 mb-2">
                           <img src={msg.contactCard.avatar} crossOrigin="anonymous" className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                           <div className="flex flex-col">
                             <span className={`font-bold text-[14px] leading-tight ${isDark ? 'text-white' : 'text-black'}`}>{msg.contactCard.name}</span>
                             <span className="text-[11px] opacity-60">{msg.contactCard.subtext}</span>
                           </div>
                        </div>
                        <div className="border-t border-black/5 dark:border-white/5 pt-2 flex justify-center">
                          <span className={`${isDark ? 'text-[#00A884]' : 'text-[#008069]'} font-bold text-[14px]`}>Conversar</span>
                        </div>
                      </div>
                    )}

                    {msg.content && msg.contentPosition === 'bottom' && (
                      <p className="leading-tight whitespace-pre-wrap px-1" style={{ fontSize: `${config.fontSize}px` }}>{msg.content}</p>
                    )}

                    {msg.type === 'buttons' && msg.buttons && (
                      <div className="mt-2 border-t border-black/5 flex flex-col">
                        {msg.buttons.map((btn, bIdx) => (
                          <div key={bIdx} className={`w-full py-2 text-center text-[13px] font-bold border-b last:border-b-0 border-black/5 active:bg-black/5 ${isDark ? 'text-[#00A884]' : 'text-[#008069]'}`}>
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end items-center gap-1 mt-0.5 px-1">
                      <span className="text-[10px] opacity-50 font-medium">{msg.timestamp}</span>
                      {isMine && <DoubleCheck read={msg.status === 'read'} />}
                    </div>

                    {msg.reaction && (
                      <div className="absolute -bottom-2.5 right-1 bg-white dark:bg-[#1C1C1E] rounded-full px-1.5 py-0.5 text-[12px] shadow-sm border border-black/5 flex items-center justify-center min-w-[22px] h-[22px]">
                        {msg.reaction}
                      </div>
                    )}
                  </div>

                  {msg.type === 'carousel' && msg.carouselItems && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar w-full mt-2 pb-1">
                      {msg.carouselItems.map(item => (
                        <div key={item.id} className={`min-w-[210px] max-w-[210px] rounded-2xl shadow-md overflow-hidden flex flex-col border border-black/5 ${isDark ? 'bg-[#202C33]' : 'bg-white'}`}>
                          <img src={item.image} crossOrigin="anonymous" className="w-full h-32 object-cover" alt="" />
                          <div className="p-3">
                            <h4 className="font-bold text-[14px] mb-0.5 leading-tight">{item.title}</h4>
                            <p className="text-[11px] opacity-60 mb-3 leading-tight h-[28px] overflow-hidden">{item.description}</p>
                            <button className={`w-full py-1.5 rounded-lg text-[12px] font-bold ${isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                              {item.buttonText}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Área de Entrada */}
        <div className={`px-2 py-2 pb-8 flex items-center gap-2 transition-colors ${isDark ? 'bg-[#0B141A]' : 'bg-[#F0F2F5]'}`}>
           <button className={`${isDark ? 'text-[#8696A0]' : 'text-[#54656F]'} p-1`}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
           </button>
           <div className={`flex-1 rounded-[22px] px-4 py-2 text-[15px] border border-black/5 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#2A3942] text-[#8696A0]' : 'bg-white text-[#54656F]'}`}>
            <span>Mensagem</span>
            <div className="flex gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-50"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-50"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </div>
           </div>
           
           {/* Botão de Envio Dinâmico */}
           <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full text-white shadow-md transition-all ${isIOS ? 'bg-[#007AFF]' : (isDark ? 'bg-[#00A884]' : 'bg-[#008069]')}`}>
             {messages.length > 0 ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
             )}
           </div>
        </div>
        <div className={`absolute bottom-1 w-32 h-1 left-1/2 -translate-x-1/2 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/10'}`}></div>
      </div>
    </div>
  );
};

export default MockupDevice;
