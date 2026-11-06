import React, { useState } from 'react';
import { Gift, Sparkles, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { CanvasContainer } from '../3d/CanvasContainer.jsx';
import { GiftBox3D } from '../3d/GiftBox3D.jsx';
import { triggerFestiveConfetti, triggerGoldenShower } from '../../utils/confetti.js';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';

export const Task4Gift = ({
  onComplete,
  onProceedToAnar,
  language = 'en',
  isAlreadyOpened = false,
  activeReferrer,
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(isAlreadyOpened);
  const [isRevealed, setIsRevealed] = useState(isAlreadyOpened);

  const t = (key) => getTranslation(language, key);

  const isInvited = !!(activeReferrer && activeReferrer.isValid && activeReferrer.referrerName);
  const senderName = isInvited ? activeReferrer.referrerName : (userName || 'Deepak Prajapati');

  const handleOpenGift = () => {
    setIsOpen(true);
    triggerFestiveConfetti();
    setTimeout(() => {
      setIsRevealed(true);
      triggerGoldenShower();
      if (onComplete) {
        onComplete({
          id: 4,
          type: 'gift',
          name: t('badge4Name'),
          desc: t('badge4Desc'),
        });
      }
    }, 1200);
  };

  const handleReplay = () => {
    setIsOpen(false);
    setIsRevealed(false);
    audioEngine.playTap();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Stage Header */}
      <div className="text-center mb-4 max-w-xl">
        <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-widest uppercase block mb-1">
          {t('stage4Badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-cinzel-dec font-black gold-gradient-text mb-2">
          {t('stage4Title')}
        </h2>
        <p className="text-sm font-outfit text-[#FFF9ED]/85">
          {!isOpen ? t('stage4DescClosed') : t('stage4DescOpen')}
        </p>
      </div>

      {/* 3D Gift Box Viewport */}
      <div className="relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden glass-panel-gold border border-[#FFD36A]/50 shadow-2xl flex items-center justify-center mb-6">
        <CanvasContainer camera={{ position: [0, 1.8, 5.2], fov: 46 }}>
          <GiftBox3D isOpen={isOpen} onOpened={() => setIsRevealed(true)} />
        </CanvasContainer>

        {/* Closed Overlay CTA */}
        {!isOpen && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD36A] to-[#FF8A24] flex items-center justify-center text-[#090719] shadow-[0_0_30px_rgba(255,211,106,0.6)] mb-4 animate-bounce">
              <Gift size={32} />
            </div>

            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFF9ED] mb-2 drop-shadow">
              {t('giftWaiting')}
            </h3>
            <p className="text-xs sm:text-sm font-outfit text-[#FFF0C2]/90 max-w-sm mb-6 leading-relaxed">
              {t('giftWaitingSub')}
            </p>

            <button
              onClick={handleOpenGift}
              className="btn-royal-gold text-base sm:text-lg px-8 py-3.5 shadow-[0_0_30px_rgba(255,211,106,0.6)]"
              aria-label={t('openYourGift')}
            >
              <Sparkles size={20} />
              <span>{t('openYourGift')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Revealed Greeting Card */}
      {isRevealed && (
        <div className="w-full glass-panel-gold p-6 sm:p-10 rounded-3xl border-2 border-[#FFD36A] shadow-[0_0_50px_rgba(255,211,106,0.35)] relative animate-in fade-in zoom-in-95 duration-700">
          <div className="toran-border-top opacity-70 mb-4" />

          <div className="text-center max-w-2xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A1028] border border-[#FFD36A] mb-5 shadow-lg">
              <Award size={18} className="text-[#FFD36A] animate-pulse" />
              <span className="font-cinzel text-xs font-bold text-[#FFD36A] tracking-wider">
                {t('badge4Name')}
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-cinzel-dec font-black gold-gradient-text tracking-wider mb-6">
              {t('happyDiwali')}
            </h3>

            {language === 'hi' ? (
              <div className="space-y-4 text-base sm:text-lg font-devanagari text-[#FFF9ED] leading-relaxed">
                <p className="text-lg sm:text-xl text-[#FFF0C2] font-semibold">
                  आपके जीवन में सुख, समृद्धि और खुशियों का प्रकाश हमेशा बना रहे।
                </p>
                <p>
                  आपकी मेहनत को सफलता मिले, आपके सपनों को नई उड़ान मिले और आपके अपनों का साथ हमेशा बना रहे।
                </p>
                <div className="pt-6 border-t border-[#FFD36A]/30 flex flex-col items-center">
                  <span className="text-xs font-devanagari text-[#FFD36A]/80 tracking-widest uppercase mb-1">
                    {isInvited ? `${senderName} की ओर से सप्रेम व शुभाशीष सहित,` : 'सप्रेम व शुभाशीष सहित,'}
                  </span>
                  <span className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFD36A] tracking-wide flex items-center justify-center gap-1.5">
                    {senderName} <span className="text-amber-400">💛</span>
                  </span>
                  {isInvited && (
                    <span className="mt-1 text-[11px] font-devanagari text-[#FFF0C2]/70">
                      (यह विशेष दिवाली उपहार आपको {senderName} की ओर से मिला है)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm sm:text-base font-outfit text-[#FFF9ED] leading-relaxed font-light">
                <p className="text-base sm:text-lg font-normal text-[#FFF0C2]">
                  May your life shine brighter than a thousand diyas.
                </p>
                <p>
                  May happiness enter your home, success follow your dreams, and every new beginning bring endless opportunities.
                </p>
                <p>
                  May this festival fill your heart with love, peace, prosperity and unforgettable memories.
                </p>
                <div className="pt-6 border-t border-[#FFD36A]/30 flex flex-col items-center">
                  <span className="text-xs font-cinzel text-[#FFD36A]/80 tracking-widest uppercase mb-1">
                    {isInvited ? `From ${senderName} with warm wishes,` : 'With warm wishes,'}
                  </span>
                  <span className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFD36A] tracking-wide flex items-center justify-center gap-1.5">
                    {senderName} <span className="text-amber-400">💛</span>
                  </span>
                  {isInvited && (
                    <span className="mt-1 text-[11px] font-outfit text-[#FFF0C2]/70">
                      (Shared especially with you by {senderName})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons: Replay & Proceed to Anar */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleReplay}
                className="btn-royal-secondary w-full sm:w-auto"
                aria-label={t('replaySurprise')}
              >
                <RotateCcw size={16} />
                <span>{t('replaySurprise')}</span>
              </button>

              <button
                onClick={onProceedToAnar}
                className="btn-royal-gold w-full sm:w-auto text-sm sm:text-base"
                aria-label={t('proceedToAnar')}
              >
                <span>{t('proceedToAnar')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
