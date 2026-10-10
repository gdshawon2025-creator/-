import React, { useState } from 'react';
import { TAWAF_DUAS, TALBIYAH } from '../data/duas';
import { X, BookOpen, Scroll, CheckCircle, Copy, Check, Radio } from 'lucide-react';

interface DuaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  onStartTalbiyah: () => void;
}

export const DuaGuideModal: React.FC<DuaGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  onStartTalbiyah,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'duas' | 'talbiyah'>('duas');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;
  const isBn = language === 'bn';

  const currentDua = TAWAF_DUAS[selectedRound - 1];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-amber-900/50 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-stone-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-100 font-bengali">
                {isBn ? 'তাওয়াফের সুন্নাহ নিয়ম ও দোয়াসমূহ' : 'Tawaf Rules & Authentic Supplications'}
              </h2>
              <p className="text-xs text-stone-400 font-bengali">
                {isBn ? 'মক্কার পবিত্র কাবার ৭ চক্করের মাসনূন দোয়া ও আমল' : 'Complete 7 Circuits Guide & Sunnah Procedures'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 py-3 border-b border-stone-800">
          <button
            onClick={() => setActiveTab('duas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer font-bengali ${
              activeTab === 'duas'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            {isBn ? '৭ চক্করের দোয়া' : '7 Circuits Duas'}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer font-bengali ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            {isBn ? 'তাওয়াফের নিয়মাবলী' : 'Step-by-Step Rules'}
          </button>
          <button
            onClick={() => setActiveTab('talbiyah')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer font-bengali ${
              activeTab === 'talbiyah'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            {isBn ? 'পবিত্র তালবিয়া' : 'Talbiyah'}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === 'duas' && (
            <div className="space-y-4">
              {/* Round Selector Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedRound(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-bengali ${
                      selectedRound === num
                        ? 'bg-emerald-500 text-stone-950 shadow-md'
                        : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {isBn ? `${num}ম চক্কর` : `Round ${num}`}
                  </button>
                ))}
              </div>

              {/* Selected Round Card */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-amber-300 font-bengali">
                    {isBn ? currentDua.titleBn : currentDua.titleEn}
                  </h3>
                  <button
                    onClick={() => handleCopy(`${currentDua.arabic}\n\n${currentDua.transliterationBn}\n\n${currentDua.meaningBn}`)}
                    className="text-stone-400 hover:text-amber-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি করুন' : 'Copy')}</span>
                  </button>
                </div>

                {/* Arabic */}
                <div className="p-4 bg-stone-900 border border-amber-900/40 rounded-xl text-right">
                  <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-loose">
                    {currentDua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide font-bengali">
                    {isBn ? 'বাংলা উচ্চারণ:' : 'Pronunciation:'}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-bengali">
                    {isBn ? currentDua.transliterationBn : currentDua.transliterationEn}
                  </p>
                </div>

                {/* Meaning */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide font-bengali">
                    {isBn ? 'অর্থ:' : 'Meaning:'}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-bengali">
                    {isBn ? currentDua.meaningBn : currentDua.meaningEn}
                  </p>
                </div>

                {/* Hadith / Note */}
                <div className="p-3 bg-stone-900/60 rounded-xl text-xs text-amber-300/80 italic font-bengali border-l-2 border-amber-500">
                  {currentDua.hadithNoteBn}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3 font-bengali text-xs sm:text-sm text-stone-300">
              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>১. ওজু ও ইজতিবা (প্রস্তুতি)</span>
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed">
                  তাওয়াফের জন্য পূর্ণ পবিত্রতা ও ওজু আবশ্যক। পুরুষরা তাদের চাদরের মধ্যভাগ ডান বগলের নিচ দিয়ে নিয়ে বাম কাঁধের ওপর রাখবেন (ইজতিবা), যাতে ডান কাঁধ খোলা থাকে।
                </p>
              </div>

              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>২. নিয়ত ও ইস্তিলাম (আরম্ভ)</span>
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed">
                  হাজরে আসওয়াদ বরাবর সবুজ লাইনে দাঁড়িয়ে কাবার দিকে মুখ করে তাওয়াফের নিয়ত করুন। উভয় হাত কাঁধ বরাবর তুলে বলুন: <span className="text-amber-200 font-semibold">"বিসমিল্লাহি আল্লাহু আকবার ওয়া লিল্লাহিল হামদ"</span> এবং হাতের তালুতে চুম্বন করুন (ইস্তিলাম)।
                </p>
              </div>

              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>৩. রমল ও ৭টি চক্কর</span>
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed">
                  কাবাকে বাম দিকে রেখে ঘড়ির কাঁটার বিপরীত দিকে প্রদক্ষিণ করুন। পুরুষরা প্রথম ৩ চক্করে একটু দ্রুত ও বীরদর্পে হাঁটবেন (রমল), বাকি ৪ চক্কর স্বাভাবিক গতিতে হাঁটবেন।
                </p>
              </div>

              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>৪. রুকনে ইয়ামানি ও দোয়া</span>
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed">
                  রুকনে ইয়ামানি পার হওয়ার সময় হাত দিয়ে স্পর্শ করুন (সম্ভব না হলে ইশারা নয়)। রুকনে ইয়ামানি থেকে হাজরে আসওয়াদ পর্যন্ত দোয়া পড়ুন: <span className="text-amber-200">"রব্বানা আতিনা ফিদ-দুনিয়া হাসানাতাও..."</span>।
                </p>
              </div>

              <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>৫. সালাত ও জমজমের পানি</span>
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed">
                  ৭টি চক্কর শেষ হলে মাকামে ইব্রাহিমের পেছনে (বা হারামের যেকোনো স্থানে) দুই রাকাত ওয়াজিবুত্তাওয়াফ সালাত আদায় করুন এবং দাঁড়িয়ে পরিতৃপ্ত হয়ে জমজমের পানি পান করুন।
                </p>
              </div>
            </div>
          )}

          {activeTab === 'talbiyah' && (
            <div className="space-y-4">
              <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>হজ ও উমরার মূল স্লোগান</span>
                </div>

                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                  <p className="font-arabic text-2xl sm:text-3xl text-amber-300 leading-loose">
                    {TALBIYAH.arabic}
                  </p>
                </div>

                <div className="space-y-2 text-left font-bengali text-xs sm:text-sm">
                  <div>
                    <span className="text-amber-400 font-bold">বাংলা উচ্চারণ: </span>
                    <span className="text-stone-200">{TALBIYAH.transliterationBn}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold">অর্থ: </span>
                    <span className="text-stone-300">{TALBIYAH.meaningBn}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onStartTalbiyah}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 font-bengali"
                  >
                    <Radio className="w-4 h-4" />
                    <span>তালবিয়ার সুর বাজান</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
