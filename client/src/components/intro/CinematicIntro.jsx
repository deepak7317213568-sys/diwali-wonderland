import React, { useState } from 'react';
import { Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { CanvasContainer } from '../3d/CanvasContainer.jsx';
import { PalaceScene } from '../3d/PalaceScene.jsx';
import { InvitationBanner } from '../common/InvitationBanner.jsx';
import { getTranslation } from '../../utils/translations.js';

export const CinematicIntro = ({ onEnter, audio, language = 'en', activeReferrer }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const t = (key) => getTranslation(language, key);

  const handleEnterClick = () => {
    audio.startMusicOnInteraction();
    setIsTransitioning(true);
  };

  const handleSkipIntro = () => {
    audio.startMusicOnInteraction();
    onEnter();
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between overflow-hidden bg-[#090719]">
      {/* 3D Royal Palace Canvas Background */}
      <div className="absolute inset-0 z-0">
        <CanvasContainer camera={{ position: [0, 2.5, 9], fov: 48 }}>
          <PalaceScene
            isEntering={isTransitioning}
            onEntryComplete={onEnter}
          />
        </CanvasContainer>
      </div>

      {/* Atmospheric Vignette & Color Gradients */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#090719] via-transparent to-[#090719]/80 z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#090719_90%)] z-10" />

      {/* Dynamic Inviter Banner at Very Top */}
      <div className="w-full relative z-30">
        <InvitationBanner activeReferrer={activeReferrer} language={language} />
      </div>

      {/* Navigation Top Bar with Skip Intro */}
      <div className="relative z-20 w-full max-w-7xl mx-auto p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🪔</span>
          <span className="font-cinzel text-sm sm:text-base font-bold tracking-widest text-[#FFD36A] drop-shadow-sm">
            {t('projectName')}
          </span>
        </div>

        <button
          onClick={handleSkipIntro}
          className="text-xs sm:text-sm font-outfit text-[#FFF0C2]/70 hover:text-[#FFD36A] px-3.5 py-1.5 rounded-full border border-[#FFF0C2]/20 hover:border-[#FFD36A]/60 backdrop-blur-sm transition-all"
        >
          {t('skipIntro')}
        </button>
      </div>

      {/* Hero Content Section */}
      <div
        className={`relative z-20 max-w-3xl mx-auto px-4 text-center my-auto transition-all duration-700 ${
          isTransitioning ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* Sacred Festival Sub-tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#21103D]/80 border border-[#FFD36A]/40 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,211,106,0.2)]">
          <Sparkles size={14} className="text-[#FFD36A] animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs sm:text-sm font-cinzel font-semibold tracking-widest text-[#FFF0C2]">
            {t('palaceTag')}
          </span>
          <Sparkles size={14} className="text-[#FFD36A] animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-cinzel-dec font-black tracking-wide leading-tight mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          <span className="gold-gradient-text block">{t('heroTitleLine1')}</span>
          <span className="text-[#FFF9ED] block mt-1">{t('heroTitleLine2')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg font-outfit text-[#FFF9ED]/90 max-w-xl mx-auto mb-8 leading-relaxed font-light drop-shadow">
          {t('heroSubtitle')}
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleEnterClick}
            className="btn-royal-gold text-base sm:text-lg group"
            aria-label={t('enterWonderland')}
          >
            <span>{t('enterWonderland')}</span>
            <ArrowRight
              size={20}
              className="text-[#090719] transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>

          {/* Audio hint */}
          {audio.isMuted && (
            <span className="text-[11px] text-[#FFF0C2]/60 font-outfit flex items-center gap-1.5">
              <Volume2 size={12} /> {t('soundHint')}
            </span>
          )}
        </div>
      </div>

      {/* Footer Creator Badge */}
      <div className="relative z-20 pb-6 text-center">
        <p className="text-xs sm:text-sm font-outfit text-[#FFF0C2]/80 tracking-wider">
          {t('creatorBy')}{' '}
          <span className="text-[#FFD36A] font-semibold border-b border-[#FFD36A]/40 pb-0.5">
            {t('creatorName')}
          </span>
        </p>
      </div>
    </div>
  );
};
