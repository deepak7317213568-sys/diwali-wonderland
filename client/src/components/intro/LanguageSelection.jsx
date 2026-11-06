import React from 'react';
import { Sparkles, ArrowRight, Globe } from 'lucide-react';
import { audioEngine } from '../../utils/audioSystem.js';

export const LanguageSelection = ({ onSelectLanguage, currentLanguage = 'en' }) => {
  const handleSelect = (lang) => {
    audioEngine.playDiyaIgnite();
    onSelectLanguage(lang);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#090719]">
      {/* Decorative Night Atmosphere & Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#4A1028]/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#21103D]/45 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#090719_90%)]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center">
        {/* Sacred Festival Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#21103D]/80 border border-[#FFD36A]/40 mb-5 shadow-[0_0_20px_rgba(255,211,106,0.2)] animate-pulse">
          <Globe size={15} className="text-[#FFD36A]" />
          <span className="text-xs font-cinzel font-semibold tracking-widest text-[#FFF0C2] uppercase">
            CHOOSE YOUR LANGUAGE • भाषा चयन
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-cinzel-dec font-black gold-gradient-text tracking-wide mb-3 drop-shadow">
          ENTER THE PALACE OF LIGHTS
        </h2>
        <p className="text-xs sm:text-sm font-outfit text-[#FFF9ED]/85 max-w-md mx-auto mb-10 leading-relaxed font-light">
          शाही दीवाली के इस पावन उत्सव का आनंद अपनी भाषा में लें
        </p>

        {/* Two Large Premium Interactive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
          {/* Hindi Option Card */}
          <button
            onClick={() => handleSelect('hi')}
            className="group relative p-6 sm:p-8 rounded-3xl glass-panel-gold border-2 border-[#FFD36A]/40 hover:border-[#FFD36A] hover:scale-[1.03] transition-all duration-300 text-left flex flex-col justify-between shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(255,211,106,0.4)] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl animate-float">🪔</span>
              <span className="text-xs font-cinzel font-bold text-[#FFD36A] px-2.5 py-1 rounded-full bg-[#4A1028] border border-[#FFD36A]/40">
                हिंदी
              </span>
            </div>

            <div>
              <h3 className="font-devanagari text-2xl sm:text-3xl font-bold text-[#FFF9ED] group-hover:text-[#FFD36A] transition-colors mb-1.5">
                हिंदी
              </h3>
              <p className="font-devanagari text-sm text-[#FFF0C2]/85 leading-relaxed">
                हिंदी में आगे बढ़ें
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#FFD36A]/20 flex items-center justify-between text-xs font-devanagari text-[#FFD36A]">
              <span>प्रवेश करें</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* English Option Card */}
          <button
            onClick={() => handleSelect('en')}
            className="group relative p-6 sm:p-8 rounded-3xl glass-panel-gold border-2 border-[#FFD36A]/40 hover:border-[#FFD36A] hover:scale-[1.03] transition-all duration-300 text-left flex flex-col justify-between shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(255,211,106,0.4)] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl animate-float">✨</span>
              <span className="text-xs font-cinzel font-bold text-[#FFD36A] px-2.5 py-1 rounded-full bg-[#4A1028] border border-[#FFD36A]/40">
                ENGLISH
              </span>
            </div>

            <div>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFF9ED] group-hover:text-[#FFD36A] transition-colors mb-1.5">
                ENGLISH
              </h3>
              <p className="font-outfit text-sm text-[#FFF0C2]/85 leading-relaxed">
                Continue in English
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#FFD36A]/20 flex items-center justify-between text-xs font-outfit text-[#FFD36A]">
              <span>Enter Wonderland</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {/* Footer Credit */}
        <p className="mt-12 text-xs font-outfit text-[#FFF0C2]/70 tracking-wide">
          Created & presented with festive joy by{' '}
          <span className="text-[#FFD36A] font-semibold">Deepak Prajapati</span>
        </p>
      </div>
    </div>
  );
};
