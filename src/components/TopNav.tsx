import React from 'react';
import { CameraMode, TimeOfDay, AppSettings } from '../types/kaaba';
import {
  Compass,
  Footprints,
  RotateCw,
  Eye,
  Sun,
  Sunrise,
  Moon,
  Sunset,
  Volume2,
  VolumeX,
  BookOpen,
  Sliders,
  Globe,
  Radio,
  Sparkles
} from 'lucide-react';

interface TopNavProps {
  cameraMode: CameraMode;
  onChangeCameraMode: (mode: CameraMode) => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenDuaGuide: () => void;
  onOpenSettings: () => void;
  onStartTalbiyah: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  cameraMode,
  onChangeCameraMode,
  timeOfDay,
  onChangeTimeOfDay,
  settings,
  onUpdateSettings,
  onOpenDuaGuide,
  onOpenSettings,
  onStartTalbiyah,
}) => {
  const isBn = settings.language === 'bn';

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title & Brand Card */}
        <div className="pointer-events-auto bg-stone-900/85 backdrop-blur-md border border-amber-900/40 rounded-xl px-4 py-2.5 shadow-2xl flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <span className="font-arabic font-bold text-lg">🕋</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-amber-100 tracking-wide font-bengali">
                  {isBn ? 'পবিত্র কাবা শরীফ ও তাওয়াফ ৩ডি' : 'Holy Kaaba 3D & Tawaf'}
                </h1>
                <span className="text-amber-500/80 text-xs hidden sm:inline">·</span>
                <span className="text-xs font-arabic text-amber-400/90 hidden sm:inline">الكعبة المشرفة</span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 font-bengali">
                <span>{isBn ? 'মক্কার পবিত্র মসজিদুল হারাম' : 'Masjid al-Haram, Makkah'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">
                  {isBn ? 'জীবন্ত তাওয়াফ চলমান' : 'Live Tawaf Simulation'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Talbiyah Button */}
          <button
            onClick={onStartTalbiyah}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              settings.talbiyahPlaying
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 animate-pulse'
                : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-amber-500/30'
            }`}
            title={isBn ? 'তালবিয়া পাঠ শুরু বা বন্ধ করুন' : 'Toggle Talbiyah Chant'}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="font-bengali">
              {settings.talbiyahPlaying
                ? (isBn ? 'তালবিয়া চলছে' : 'Chanting Talbiyah')
                : (isBn ? 'তালবিয়া শুনুন' : 'Play Talbiyah')}
            </span>
          </button>
        </div>

        {/* Central Controls: Camera Mode & Time of Day */}
        <div className="pointer-events-auto flex items-center flex-wrap justify-center gap-2 bg-stone-900/85 backdrop-blur-md border border-stone-800 rounded-xl p-1.5 shadow-2xl">
          {/* Camera Modes Segmented Bar */}
          <div className="flex items-center gap-1 p-0.5 bg-stone-950/70 rounded-lg">
            <button
              onClick={() => onChangeCameraMode('orbit')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraMode === 'orbit'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'চারপাশ ৩৬০° ঘুরে দেখুন' : '360° Orbit Camera'}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bengali">
                {isBn ? 'ঘুরে দেখুন' : 'Orbit'}
              </span>
            </button>

            <button
              onClick={() => onChangeCameraMode('walk')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraMode === 'walk'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'নিজে পায়ে হেঁটে দেখুন (WASD / কীবোর্ড)' : 'First-Person Pilgrim Walk'}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bengali">
                {isBn ? 'হেঁটে দেখুন' : 'Walk'}
              </span>
            </button>

            <button
              onClick={() => onChangeCameraMode('tawaf')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraMode === 'tawaf'
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-stone-800/60'
              }`}
              title={isBn ? 'হাজীদের সাথে তাওয়াফে যুক্ত হোন' : 'Join Tawaf Circle'}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="font-bengali">
                {isBn ? 'তাওয়াফে যোগ দিন' : 'Join Tawaf'}
              </span>
            </button>

            <button
              onClick={() => onChangeCameraMode('drone')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraMode === 'drone'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'আকাশ থেকে ড্রোন ভিউ' : 'Aerial Drone View'}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bengali">
                {isBn ? 'ড্রোন ভিউ' : 'Drone'}
              </span>
            </button>
          </div>

          <div className="w-[1px] h-6 bg-stone-800 hidden sm:block" />

          {/* Time of Day Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-stone-950/70 rounded-lg">
            <button
              onClick={() => onChangeTimeOfDay('tahajjud')}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                timeOfDay === 'tahajjud'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'তাহাজ্জুদ (তারাময় রাত)' : 'Tahajjud (Night)'}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTimeOfDay('fajr')}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                timeOfDay === 'fajr'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'ফজর (ঊষাকাল)' : 'Fajr (Dawn)'}
            >
              <Sunrise className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTimeOfDay('dhuhr')}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                timeOfDay === 'dhuhr'
                  ? 'bg-amber-400 text-stone-950 shadow-sm font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'যোহর (স্বর্ণালি দুপুর)' : 'Dhuhr (Midday)'}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTimeOfDay('maghrib')}
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                timeOfDay === 'maghrib'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
              title={isBn ? 'মাগরিব (সূর্যাস্ত)' : 'Maghrib (Sunset)'}
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Tools: Audio, Dua Guide, Settings, Language */}
        <div className="pointer-events-auto flex items-center gap-2 bg-stone-900/85 backdrop-blur-md border border-stone-800 rounded-xl px-2.5 py-1.5 shadow-2xl">
          {/* Audio Mute/Unmute */}
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              settings.soundEnabled
                ? 'text-amber-400 hover:bg-stone-800'
                : 'text-stone-500 hover:bg-stone-800'
            }`}
            title={settings.soundEnabled ? (isBn ? 'শব্দ বন্ধ করুন' : 'Mute Sound') : (isBn ? 'শব্দ চালু করুন' : 'Unmute Sound')}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dua Guide Button */}
          <button
            onClick={onOpenDuaGuide}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-200 hover:text-white hover:bg-stone-800 flex items-center gap-1.5 transition-all cursor-pointer border border-amber-900/40"
            title={isBn ? 'তাওয়াফের ৭ চক্করের দোয়া ও নিয়ম' : '7 Circuits Dua & Rules Guide'}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bengali">
              {isBn ? 'দোয়া গাইড' : 'Dua Guide'}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
            title={isBn ? 'সেটিংস ও ভিড় নিয়ন্ত্রণ' : 'Settings & Crowd Controls'}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => onUpdateSettings({ language: isBn ? 'en' : 'bn' })}
            className="px-2 py-1 rounded-md text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer flex items-center gap-1"
            title={isBn ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span>{isBn ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
