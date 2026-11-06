import React from 'react';
import { Sparkles, Gift, Heart } from 'lucide-react';

export const InvitationBanner = ({ activeReferrer, language = 'en' }) => {
  const hasValidReferrer = activeReferrer && activeReferrer.isValid && activeReferrer.referrerName;
  const isHindi = language === 'hi';

  return (
    <div className="w-full bg-gradient-to-r from-[#21103D]/95 via-[#4A1028]/95 to-[#21103D]/95 border-b border-[#FFD36A]/30 py-2 px-4 shadow-[0_2px_15px_rgba(0,0,0,0.5)] backdrop-blur-md relative z-30 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-outfit">
        <Sparkles size={14} className="text-[#FFD36A] animate-spin shrink-0" style={{ animationDuration: '8s' }} />

        {hasValidReferrer ? (
          <span className="text-[#FFF0C2] leading-snug">
            {isHindi ? (
              <>
                आपको यह खूबसूरत दिवाली की सौगात{' '}
                <span className="text-[#FFD36A] font-cinzel font-bold border-b border-[#FFD36A]/50 px-1">
                  {activeReferrer.referrerName}
                </span>{' '}
                की तरफ से मिली है!
              </>
            ) : (
              <>
                This beautiful Diwali experience has been shared with you by{' '}
                <span className="text-[#FFD36A] font-cinzel font-bold border-b border-[#FFD36A]/50 px-1">
                  {activeReferrer.referrerName}
                </span>
                !
              </>
            )}
          </span>
        ) : (
          <span className="text-[#FFF0C2]/90 leading-snug">
            {isHindi ? (
              <>
                दीवाली वंडरलैंड — रोशनी के पावन महापर्व में आपका हार्दिक स्वागत है!
              </>
            ) : (
              <>
                Welcome to Diwali Wonderland — The Royal Festival of Lights!
              </>
            )}
          </span>
        )}

        <Sparkles size={14} className="text-[#FFD36A] animate-spin shrink-0" style={{ animationDuration: '8s' }} />
      </div>
    </div>
  );
};
