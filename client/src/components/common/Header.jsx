import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Award,
  Sparkles,
  ChevronDown,
  Globe,
  Music,
} from 'lucide-react';
import { ResetModal } from './ResetModal.jsx';
import { Badge } from './Badge.jsx';
import { getTranslation } from '../../utils/translations.js';

export const Header = ({
  audio,
  badges = [],
  onReset,
  currentStage,
  progressPercent = 0,
  language = 'en',
  onToggleLanguage,
}) => {
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [showBadgesMenu, setShowBadgesMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const t = (key) => getTranslation(language, key);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090719]/85 border-b border-[#FFD36A]/20 transition-all">
        {/* Decorative Top Toran Pattern */}
        <div className="toran-border-top opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Creator Presentation */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl animate-float">🪔</span>
              <h1 className="text-sm sm:text-lg md:text-xl font-cinzel font-bold tracking-wider gold-gradient-text drop-shadow-sm">
                {t('projectName')}
              </h1>
            </div>
            <span className="text-[10px] sm:text-xs text-[#FFF0C2]/80 font-outfit tracking-wide flex items-center gap-1">
              {t('creatorBy')}{' '}
              <span className="text-[#FFD36A] font-semibold">{t('creatorName')}</span>
            </span>
          </div>

          {/* Right Controls: Language Switcher, Music Controls, Badges, Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Switcher Pill */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#4A1028]/80 hover:bg-[#5f1533] border border-[#FFD36A]/40 text-[#FFF0C2] text-xs font-cinzel font-bold transition-all shadow-sm"
              title="Toggle Language / भाषा बदलें"
            >
              <Globe size={13} className="text-[#FFD36A]" />
              <span>{language === 'hi' ? 'EN' : 'हिंदी'}</span>
            </button>

            {/* Badges preview button */}
            <div className="relative">
              <button
                onClick={() => setShowBadgesMenu(!showBadgesMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#21103D]/80 border border-[#FFD36A]/30 hover:border-[#FFD36A] text-[#FFF0C2] text-xs font-outfit transition-all shadow-sm"
                title="View Earned Badges"
              >
                <Award size={14} className="text-[#FFD36A]" />
                <span className="font-bold text-[#FFD36A]">{badges.length}/6</span>
                <ChevronDown size={12} className="text-[#FFF0C2]/70" />
              </button>

              {/* Badges Dropdown */}
              {showBadgesMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 p-4 rounded-2xl glass-panel-gold border border-[#FFD36A]/50 z-50 shadow-2xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#FFD36A]/20">
                    <span className="font-cinzel text-xs font-bold text-[#FFD36A] tracking-wider uppercase">
                      {t('honors')}
                    </span>
                    <span className="text-[11px] text-[#FFF0C2]/70">
                      {badges.length} {t('unlockedOf')} 6 {t('unlockedSuffix')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Badge
                      badge={{ id: 1, type: 'diya', name: t('badge1Name'), desc: t('badge1Desc') }}
                      isUnlocked={badges.some((b) => b.id === 1)}
                      size="sm"
                    />
                    <Badge
                      badge={{ id: 2, type: 'champion', name: t('badge2Name'), desc: t('badge2Desc') }}
                      isUnlocked={badges.some((b) => b.id === 2)}
                      size="sm"
                    />
                    <Badge
                      badge={{ id: 3, type: 'rangoli', name: t('badge3Name'), desc: t('badge3Desc') }}
                      isUnlocked={badges.some((b) => b.id === 3)}
                      size="sm"
                    />
                    <Badge
                      badge={{ id: 4, type: 'gift', name: t('badge4Name'), desc: t('badge4Desc') }}
                      isUnlocked={badges.some((b) => b.id === 4)}
                      size="sm"
                    />
                    <Badge
                      badge={{ id: 5, type: 'anar', name: t('badge5Name'), desc: t('badge5Desc') }}
                      isUnlocked={badges.some((b) => b.id === 5)}
                      size="sm"
                    />
                    <Badge
                      badge={{ id: 6, type: 'chakri', name: t('badge6Name'), desc: t('badge6Desc') }}
                      isUnlocked={badges.some((b) => b.id === 6)}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background Music Play/Pause Toggle */}
            <button
              onClick={audio.togglePlayPause}
              className={`p-2 rounded-full border transition-all ${
                audio.isPlaying && !audio.isMuted
                  ? 'bg-[#FFD36A]/20 border-[#FFD36A] text-[#FFD36A] shadow-[0_0_15px_rgba(255,211,106,0.3)] animate-pulse'
                  : 'bg-[#21103D]/60 border-[#FFD36A]/30 text-[#FFF0C2]/60 hover:text-white'
              }`}
              title={audio.isPlaying ? t('pauseBgm') : t('playBgm')}
              aria-label={audio.isPlaying ? t('pauseBgm') : t('playBgm')}
            >
              {audio.isPlaying && !audio.isMuted ? <Pause size={15} /> : <Play size={15} />}
            </button>

            {/* Audio Mute & Volume Slider */}
            <div className="relative flex items-center">
              <button
                onClick={audio.toggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className={`p-2 rounded-full border transition-all ${
                  !audio.isMuted
                    ? 'bg-[#FFD36A]/20 border-[#FFD36A] text-[#FFD36A] shadow-[0_0_15px_rgba(255,211,106,0.3)]'
                    : 'bg-[#21103D]/60 border-[#FFD36A]/30 text-[#FFF0C2]/60 hover:text-white'
                }`}
                title={audio.isMuted ? 'Unmute' : 'Mute'}
                aria-label={audio.isMuted ? 'Unmute' : 'Mute'}
              >
                {audio.isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Volume Slider Popover */}
              {showVolumeSlider && (
                <div
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="absolute right-0 top-11 p-3 rounded-xl bg-[#21103D]/95 border border-[#FFD36A]/40 shadow-xl flex items-center gap-2 z-50"
                >
                  <span className="text-[10px] text-[#FFD36A] font-cinzel">{t('vol')}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audio.volume}
                    onChange={(e) => audio.setVolume(e.target.value)}
                    className="w-24 accent-[#FFD36A] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#FFF0C2] w-6 text-right">
                    {Math.round(audio.volume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Reset Adventure Button */}
            <button
              onClick={() => setIsResetOpen(true)}
              className="p-2 rounded-full bg-[#21103D]/60 border border-[#FFD36A]/30 hover:border-[#FF8A24] text-[#FFF0C2]/70 hover:text-[#FF8A24] transition-all"
              title={t('resetAdventure')}
              aria-label={t('resetAdventure')}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Confirmation Dialog */}
      <ResetModal
        isOpen={isResetOpen}
        language={language}
        onClose={() => setIsResetOpen(false)}
        onConfirm={onReset}
      />
    </>
  );
};
