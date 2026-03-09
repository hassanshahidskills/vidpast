export interface DownloadItem {
  id: number;
  url: string;
  title: string;
  thumbnail: string;
  file_size: string;
  quality: string;
  timestamp: string;
}

export type Screen = 'splash' | 'home' | 'history' | 'settings' | 'about' | 'privacy' | 'terms';
