import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { getTranslation } from '../../utils/translations.js';

export const ResetModal = ({ isOpen, onClose, onConfirm, language = 'en' }) => {
  if (!isOpen) return null;

  const t = (key) => getTranslation(language, key);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
    >
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-[#21103D] to-[#090719] border border-[#FFD36A]/40 shadow-[0_0_50px_rgba(255,138,36,0.3)] text-center animate-float">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#FFF0C2]/70 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#4A1028] border border-[#FF8A24] flex items-center justify-center text-[#FFD36A] shadow-[0_0_20px_rgba(255,138,36,0.4)]">
          <AlertTriangle size={28} />
        </div>

        <h3 id="reset-title" className="text-xl font-cinzel font-bold text-[#FFD36A] mb-2">
          {t('resetAdventure')}
        </h3>

        <p className="text-sm font-outfit text-[#FFF9ED]/80 mb-6 leading-relaxed">
          {t('resetPrompt')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#FFF0C2]/30 text-[#FFF0C2] hover:bg-[#FFF0C2]/10 font-outfit text-sm transition-all"
          >
            {t('keepProgress')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF8A24] to-[#4A1028] text-white border border-[#FFD36A]/50 hover:shadow-[0_0_20px_rgba(255,138,36,0.6)] font-cinzel font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            {t('yesReset')}
          </button>
        </div>
      </div>
    </div>
  );
};
