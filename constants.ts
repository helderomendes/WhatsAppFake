
import { AppState } from './types';

// Papel de parede padrão do WhatsApp em Base64 (cor sólida leve com padrão sutil)
const DEFAULT_WALLPAPER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

export const INITIAL_STATE: AppState = {
  mainUser: {
    id: 'user-me',
    name: 'Você',
    avatar: 'https://ui-avatars.com/api/?name=Eu&background=25D366&color=fff',
  },
  contacts: [
    { 
      id: 'contact-1', 
      name: 'Lillian Evaro', 
      avatar: 'https://ui-avatars.com/api/?name=Lillian+Evaro&background=random', 
      statusText: 'online',
      color: '#008069'
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
    theme: 'dark',
    iosVersion: '26',
    androidVersion: '15',
    isGroup: false,
    groupName: 'Bola S2',
    groupImage: 'https://ui-avatars.com/api/?name=Grupo&background=008069&color=fff',
    batteryLevel: 57,
    network: '5G',
    systemTime: '15:35',
    fontSize: 15,
    messageSpacing: 2,
    showContactNames: true,
    wallpaper: DEFAULT_WALLPAPER,
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
      bg: '#FFFFFF',
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
