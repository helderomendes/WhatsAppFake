
export type Platform = 'ios' | 'android';
export type Theme = 'light' | 'dark';
export type iOSVersion = '25' | '26';
export type AndroidVersion = '13' | '14' | '15';
export type NetworkType = '3G' | '4G' | '5G' | 'WiFi';
export type MessageType = 'text' | 'image' | 'carousel' | 'buttons' | 'audio' | 'sticker' | 'system' | 'contact_card';

export interface MessageButton {
  text: string;
  url?: string;
  isLink?: boolean;
}

export interface CarouselItem {
  id: string;
  image: string;
  title: string;
  description: string;
  buttonText: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  color?: string;
  statusText?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  contentPosition: 'top' | 'bottom';
  type: MessageType;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  image?: string;
  reaction?: string;
  isForwarded?: boolean;
  buttons?: MessageButton[];
  carouselItems?: CarouselItem[];
  audioDuration?: string;
  isPlayed?: boolean;
  contactCard?: {
    name: string;
    avatar: string;
    subtext: string;
  };
}

export interface ChatConfig {
  platform: Platform;
  theme: Theme;
  iosVersion: iOSVersion;
  androidVersion: AndroidVersion;
  isGroup: boolean;
  groupName: string;
  groupImage: string;
  batteryLevel: number;
  network: NetworkType;
  systemTime: string;
  fontSize: number;
  messageSpacing: number;
  showContactNames: boolean;
  wallpaper?: string;
  wallpaperType: 'color' | 'image';
  backgroundColor: string;
  accentColor?: string;
}

export interface AppState {
  mainUser: Contact;
  contacts: Contact[];
  messages: Message[];
  config: ChatConfig;
}
