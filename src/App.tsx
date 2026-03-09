import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  History, 
  Home, 
  Menu, 
  Play, 
  Share2, 
  Trash2, 
  Link as LinkIcon,
  Facebook,
  Instagram,
  Youtube,
  Loader2,
  ArrowDown,
  X,
  Info,
  ShieldCheck,
  FileText,
  Star,
  LogOut,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { Screen, DownloadItem } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [history, setHistory] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [quality, setQuality] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 KB/s');
  const [selectedVideo, setSelectedVideo] = useState<DownloadItem | null>(null);
  const [smartLink, setSmartLink] = useState<string | null>(null);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Smart Link Detection
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        // Check if permission is granted first if possible, or just try-catch
        const text = await navigator.clipboard.readText();
        if (text && text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|facebook\.com|instagram\.com|tiktok\.com|twitter\.com|x\.com|vimeo\.com)/)) {
          setSmartLink(text);
        } else {
          setSmartLink(null);
        }
      } catch (e) {
        // Silently handle clipboard block (common in iframes)
        setSmartLink(null);
      }
    };
    
    // Only attempt automatic check if document is focused to avoid some permission errors
    const handleFocus = () => checkClipboard();
    window.addEventListener('focus', handleFocus);
    
    const interval = setInterval(() => {
      if (document.hasFocus()) checkClipboard();
    }, 5000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => setScreen('home'), 3000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === 'history') {
      fetchHistory();
    }
  }, [screen]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const simulateDownload = async (targetUrl: string) => {
    setDownloading(true);
    setDownloadProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const speed = (Math.random() * 5 + 1).toFixed(1);
        setDownloadSpeed(`${speed} MB/s`);
        return prev + Math.random() * 5;
      });
    }, 200);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, quality })
      });
      
      if (res.ok) {
        setTimeout(() => {
          clearInterval(interval);
          setDownloadProgress(100);
          setDownloading(false);
          setScreen('history');
        }, 4000);
      } else {
        clearInterval(interval);
        setDownloading(false);
        alert('Download failed');
      }
    } catch (err) {
      clearInterval(interval);
      setDownloading(false);
    }
  };

  const handlePasteAndDownload = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        simulateDownload(text);
      } else {
        alert('Clipboard is empty. Please copy a video link first.');
      }
    } catch (err) {
      console.warn('Clipboard access blocked:', err);
      alert('Clipboard access is blocked by your browser. Please ensure you have copied a link and allowed permissions.');
    }
  };

  const deleteHistory = async (id: number) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VidPast',
          text: 'Check out VidPast - The ultimate video downloader!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing not supported on this browser. Copy the URL to share!');
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit?')) {
      window.close();
      // Fallback if window.close doesn't work (common in browsers)
      setScreen('splash');
    }
  };

  const MenuLink = ({ icon: Icon, label, onClick, active = false }: { icon: any, label: string, onClick: () => void, active?: boolean }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        active ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      <ChevronLeft className="w-5 h-5 ml-auto rotate-180 opacity-50" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-white selection:bg-neon-purple/30 overflow-x-hidden pb-24">
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut"
              }}
              className="relative"
            >
              <div className="w-40 h-40 rounded-full bg-linear-to-br from-neon-purple via-neon-blue to-neon-pink p-1 neon-glow animate-pulse">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Play Triangle */}
                    <Play className="w-20 h-20 text-neon-purple fill-neon-purple/10 ml-2" />
                    {/* Download Arrow inside Triangle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ArrowDown className="w-8 h-8 text-white mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-20 text-center"
            >
              <p className="text-gray-400 text-xl font-medium tracking-wide">
                Smart & Secure Video Saver
              </p>
              <div className="mt-4 flex justify-center">
                <Loader2 className="w-6 h-6 text-neon-blue animate-spin opacity-50" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col min-h-[calc(100vh-80px)] p-6 max-w-md mx-auto"
          >
            <div className="flex-1 flex flex-col items-center justify-center pt-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePasteAndDownload}
                disabled={downloading}
                className="relative w-64 h-64 rounded-full p-1 animate-neon-rotate mb-12 flex items-center justify-center disabled:opacity-50 group"
              >
                <div className="w-full h-full rounded-full overflow-hidden flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm border-4 border-neon-blue/20">
                  <div className="relative">
                    <Download className="w-24 h-24 text-neon-blue group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute -inset-4 bg-neon-blue/20 blur-2xl rounded-full -z-10 group-hover:bg-neon-blue/40 transition-colors" />
                  </div>
                  <span className="mt-4 text-neon-blue font-bold tracking-widest uppercase text-sm">Paste & Save</span>
                </div>
              </motion.button>
              
              <div className="w-full space-y-4">
                {downloading && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neon-blue">{downloadSpeed}</span>
                      <span className="text-neon-pink">{Math.round(downloadProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        className="h-full bg-linear-to-r from-neon-purple to-neon-blue"
                      />
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setScreen('history')}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-semibold text-gray-300 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <History className="w-5 h-5 text-neon-pink" />
                  Downloaded Videos
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 max-w-md mx-auto"
          >
            <header className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setScreen('home')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-neon-blue" />
              </button>
              <h1 className="text-2xl font-bold">Downloads</h1>
            </header>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No downloads yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden neon-border"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{item.file_size} • {new Date(item.timestamp).toLocaleDateString()}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedVideo(item)}
                            className="p-2 bg-neon-blue/10 rounded-lg hover:bg-neon-blue/20 transition-colors"
                          >
                            <Play className="w-4 h-4 text-neon-blue fill-neon-blue" />
                          </button>
                          <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <Share2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => deleteHistory(item.id)}
                            className="p-2 bg-neon-pink/10 rounded-lg hover:bg-neon-pink/20 transition-colors ml-auto"
                          >
                            <Trash2 className="w-4 h-4 text-neon-pink" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {screen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col min-h-[calc(100vh-80px)] p-6 max-w-md mx-auto"
          >
            <header className="flex items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            </header>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-2">Preferences</p>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-neon-blue" />
                    <span className="font-medium">Theme</span>
                  </div>
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-12 h-6 bg-white/10 rounded-full relative transition-colors"
                  >
                    <motion.div 
                      animate={{ x: theme === 'dark' ? 26 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-neon-blue rounded-full"
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-neon-pink" />
                    <span className="font-medium">Quality</span>
                  </div>
                  <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="bg-transparent text-sm text-neon-pink focus:outline-hidden font-medium"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Menu className="w-5 h-5 text-neon-blue" />
                    <span className="font-medium">Storage</span>
                  </div>
                  <span className="text-xs text-gray-500">/Internal/VidPast</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-2">Information</p>
                <MenuLink icon={Info} label="About" onClick={() => setScreen('about')} active={screen === 'about'} />
                <MenuLink icon={ShieldCheck} label="Privacy Policy" onClick={() => setScreen('privacy')} active={screen === 'privacy'} />
                <MenuLink icon={FileText} label="Terms of Service" onClick={() => setScreen('terms')} active={screen === 'terms'} />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 px-2">More</p>
                <MenuLink icon={Star} label="Rate Now" onClick={() => alert('Thanks for your interest! Rating system coming soon.')} />
                <MenuLink icon={Share2} label="Share App" onClick={handleShare} />
              </div>

              <button 
                onClick={handleExit}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-neon-pink bg-neon-pink/10 hover:bg-neon-pink/20 transition-all mt-8"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Exit App</span>
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 max-w-md mx-auto"
          >
            <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setScreen('home')} className="p-2 hover:bg-white/5 rounded-lg">
                <ChevronLeft className="w-6 h-6 text-neon-blue" />
              </button>
              <h1 className="text-2xl font-bold">About VidPast</h1>
            </header>
            <div className="space-y-6 text-gray-400 leading-relaxed">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg neon-glow">
                  <Play className="w-12 h-12 text-white fill-white" />
                </div>
              </div>
              <p>
                VidPast is a premium video downloader designed for speed and simplicity. 
                Our mission is to provide the fastest one-tap download experience for your favorite social media content.
              </p>
              <p>
                With a focus on high-quality MP4 downloads and a beautiful dark neon interface, 
                VidPast makes saving memories easier than ever.
              </p>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-sm text-center">Version 1.0.0 (Stable)</p>
                <p className="text-xs text-center text-gray-600 mt-1">Crafted with ❤️ for creators</p>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 max-w-md mx-auto"
          >
            <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setScreen('home')} className="p-2 hover:bg-white/5 rounded-lg">
                <ChevronLeft className="w-6 h-6 text-neon-blue" />
              </button>
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
            </header>
            <div className="space-y-6 text-gray-400 text-sm leading-relaxed overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              <section>
                <h2 className="text-white font-semibold mb-2">1. Data Collection</h2>
                <p>We do not collect any personal information. Your download history is stored locally on your device.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold mb-2">2. Usage of Links</h2>
                <p>URLs you paste are processed solely to extract video content. We do not store these links on our servers permanently.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold mb-2">3. Third-Party Services</h2>
                <p>VidPast interacts with third-party social media platforms. Please refer to their respective privacy policies.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold mb-2">4. Security</h2>
                <p>We implement industry-standard security measures to protect the integrity of the app.</p>
              </section>
            </div>
          </motion.div>
        )}

        {screen === 'terms' && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 max-w-md mx-auto"
          >
            <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setScreen('home')} className="p-2 hover:bg-white/5 rounded-lg">
                <ChevronLeft className="w-6 h-6 text-neon-blue" />
              </button>
              <h1 className="text-2xl font-bold">Terms of Service</h1>
            </header>
            <div className="space-y-6 text-gray-400 text-sm leading-relaxed overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              <section>
                <h2 className="text-white font-semibold mb-2">1. Acceptance</h2>
                <p>By using VidPast, you agree to these terms. If you do not agree, please do not use the app.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold mb-2">2. Personal Use Only</h2>
                <p>VidPast is intended for personal, non-commercial use. You are responsible for respecting copyright laws.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold mb-2">3. Prohibited Content</h2>
                <p>Do not use this app to download copyrighted material without permission from the owner.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold mb-2">4. Limitation of Liability</h2>
                <p>VidPast is provided "as is" without any warranties. We are not liable for any damages resulting from app usage.</p>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold truncate pr-4">{selectedVideo.title}</h2>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-2 bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 bg-black rounded-3xl overflow-hidden relative flex items-center justify-center border border-white/10">
              <img 
                src={selectedVideo.thumbnail} 
                alt="Video Preview" 
                className="w-full h-full object-contain opacity-50 blur-sm"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue animate-pulse">
                  <Play className="w-10 h-10 text-neon-blue fill-neon-blue" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-neon-blue" />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                  <span>01:24</span>
                  <span>04:12</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button className="flex-1 py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <Share2 className="w-5 h-5 text-neon-blue" />
                <span>Share</span>
              </button>
              <button className="flex-1 py-4 bg-neon-pink/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-neon-pink/20 transition-all text-neon-pink">
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bottom Navigation Bar */}
      {screen !== 'splash' && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-around p-4">
            <button 
              onClick={() => setScreen('home')}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${screen === 'home' ? 'text-neon-blue' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button 
              onClick={() => setScreen('history')}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${screen === 'history' ? 'text-neon-pink' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <History className="w-6 h-6" />
              <span className="text-[10px] font-medium">Downloads</span>
            </button>
            <button 
              onClick={() => setScreen('settings')}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${screen === 'settings' ? 'text-neon-purple' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-[10px] font-medium">Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
