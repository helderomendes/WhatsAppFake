
import { AppState } from './types';

// Avatar padrão do WhatsApp (Silhueta cinza)
export const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiNDRUQzRDYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

// Imagem de fundo padrão (Doodles) - Base64 limpa e testada
export const WHATSAPP_DEFAULT_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEVMaXG9vL3///+9vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL29vL3XWclhAAAAGnRSTlMAGD7v798vL7+/37/vL+/f39+f7y8vL9/fny8/O8fUAAAAeElEQVR42mNgGAWjYBSMAlBAA00oZpBhgBqEEnSgGEE7oQRdKEZQA0uCSY6Y5IhJjpiUhEmOmOQYmBJMcowuOWKSm5gSTHKMLjlikpuYEkxyjC45YpIbiSkhS/K8pIDkBZ8S0pS6DCl00UpIE5pQYvS6DClK6EIUoxfFKBgFpAAAWzYIdW0Yp3MAAAAASUVORK5CYII=";

export const INITIAL_STATE: AppState = {
  mainUser: {
    id: 'user-me',
    name: 'Você',
    avatar: DEFAULT_AVATAR,
  },
  contacts: [
    { 
      id: 'contact-1', 
      name: 'Lillian Evaro', 
      avatar: DEFAULT_AVATAR, 
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
    theme: 'light', // Modo claro como padrão
    iosVersion: '26',
    androidVersion: '15',
    isGroup: false,
    groupName: 'Bola S2',
    groupImage: DEFAULT_AVATAR,
    batteryLevel: 57,
    network: '5G',
    systemTime: '15:35',
    fontSize: 15,
    messageSpacing: 2,
    showContactNames: true,
    wallpaperType: 'image',
    backgroundColor: '#e5ddd5', // Cor padrão do modo claro
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
