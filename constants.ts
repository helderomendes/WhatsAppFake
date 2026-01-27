
import { AppState } from './types';

// Avatar padrão do WhatsApp (Silhueta cinza)
export const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiNDRUQzRDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

// Imagem de fundo padrão (Padrão de doodles limpo)
export const WHATSAPP_DEFAULT_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEVMaXH///////////////////////////+966YRAAAACHRSTlMAMv////8vP6mY9mMAAAA6SURBVDjLY2AYBaNgFIyCUUAbwMBgA8S0ARiYpAEYmGQBGBgkARiYZAEIGMoCEDDMBiBgmA1AwDAbAADonwL97v90dgAAAABJRU5ErkJggg==";

export const INITIAL_STATE: AppState = {
  mainUser: {
    id: 'user-me',
    name: 'Eu',
    avatar: DEFAULT_AVATAR,
  },
  contacts: [
    { 
      id: 'contact-1', 
      name: 'Nome 1', 
      avatar: DEFAULT_AVATAR, 
      statusText: 'online',
      color: '#008069'
    },
    { 
      id: 'contact-2', 
      name: 'Nome 2', 
      avatar: DEFAULT_AVATAR, 
      statusText: 'online',
      color: '#F44336'
    }
  ],
  messages: [
    {
      id: 'msg-sys-1',
      senderId: 'system',
      content: 'As mensagens são protegidas com a criptografia de ponta a ponta.',
      type: 'system',
      contentPosition: 'bottom',
      timestamp: '12:30',
      status: 'read'
    }
  ],
  config: {
    platform: 'android',
    theme: 'light',
    iosVersion: '26',
    androidVersion: '15',
    isGroup: false,
    groupName: 'Grupo Novo',
    groupImage: DEFAULT_AVATAR,
    batteryLevel: 95,
    network: '5G',
    systemTime: '10:00',
    fontSize: 15,
    messageSpacing: 2,
    showContactNames: true,
    wallpaperType: 'image',
    backgroundColor: '#e5ddd5',
    wallpaper: WHATSAPP_DEFAULT_IMAGE,
    accentColor: '#00A884'
  }
};

export const COMMON_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍', '🔥', '🎉'];

export const THEME_COLORS = {
  ios: {
    light: {
      bg: '#F2F2F7',
      header: '#FFFFFF',
      bubbleSent: '#DCF8C6',
      bubbleReceived: '#FFFFFF',
      text: '#000000',
      subtext: '#8E8E93',
      input: '#FFFFFF',
      accent: '#007AFF'
    },
    dark: {
      bg: '#000000',
      header: '#1C1C1E',
      bubbleSent: '#215C54',
      bubbleReceived: '#262D31',
      text: '#FFFFFF',
      subtext: '#8E8E93',
      input: '#1C1C1E',
      accent: '#0A84FF'
    }
  },
  android: {
    light: {
      bg: '#E5DDD5', 
      header: '#FFFFFF',
      bubbleSent: '#E7FFDB',
      bubbleReceived: '#FFFFFF',
      text: '#111B21',
      subtext: '#667781',
      input: '#FFFFFF',
      accent: '#008069'
    },
    dark: {
      bg: '#0B141A',
      header: '#202C33',
      bubbleSent: '#005C4B',
      bubbleReceived: '#202C33',
      text: '#E9EDEF',
      subtext: '#8696A0',
      input: '#2A3942',
      accent: '#00A884'
    }
  }
};
