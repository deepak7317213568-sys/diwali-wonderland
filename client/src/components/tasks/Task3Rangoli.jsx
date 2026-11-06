import React, { useState } from 'react';
import { Sparkles, Palette, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { triggerFestiveConfetti, triggerGoldenShower } from '../../utils/confetti.js';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';

export const Task3Rangoli = ({ onComplete, language = 'en', isAlreadyCompleted = false }) => {
  const [placedSlots, setPlacedSlots] = useState(() => (isAlreadyCompleted ? [0, 1, 2, 3, 4] : []));
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);

  const t = (key) => getTranslation(language, key);

  const RANGOLI_ELEMENTS = [
    {
      id: 'kalash',
      name: language === 'hi' ? 'स्वर्ण कलश' : 'Golden Kalash',
      symbol: '🏺',
      color: '#FFD36A',
      slotIndex: 0,
      x: 50,
      y: 15,
    },
    {
      id: 'peacock',
      name: language === 'hi' ? 'मयूर पंख' : 'Peacock Motif',
      symbol: '🦚',
      color: '#00F5D4',
      slotIndex: 1,
      x: 82,
      y: 38,
    },
    {
      id: 'crimson',
      name: language === 'hi' ? 'कमल पुष्प' : 'Crimson Bloom',
      symbol: '🌺',
      color: '#FF4D6D',
      slotIndex: 2,
      x: 70,
      y: 82,
    },
    {
      id: 'marigold',
      name: language === 'hi' ? 'गेंदा पुष्प' : 'Marigold Garland',
      symbol: '🌼',
      color: '#FF8A24',
      slotIndex: 3,
      x: 30,
      y: 82,
    },
    {
      id: 'diya_sacred',
      name: language === 'hi' ? 'शाही दीपक' : 'Royal Diya',
      symbol: '🪔',
      color: '#FFF0C2',
      slotIndex: 4,
      x: 18,
      y: 38,
    },
  ];

  const handleSelectElement = (elementId) => {
    const el = RANGOLI_ELEMENTS.find((e) => e.id === elementId);
    if (!el) return;

    if (placedSlots.includes(el.slotIndex)) {
      return;
    }

    setSelectedElementId(elementId);
    audioEngine.playTap();
  };

  const handlePlaceInSlot = (slotIndex) => {
    const el = RANGOLI_ELEMENTS.find((e) => e.slotIndex === slotIndex);
    if (!el) return;

    if (selectedElementId === el.id || !selectedElementId) {
      audioEngine.playSnap();
      const updated = placedSlots.includes(slotIndex) ? placedSlots : [...placedSlots, slotIndex];
      setPlacedSlots(updated);
      setSelectedElementId(null);

      if (updated.length === 5) {
        setIsCompleted(true);
        triggerGoldenShower();
        triggerFestiveConfetti();
        audioEngine.playRangoliComplete();
      }
    } else {
      audioEngine.playQuizRetry();
    }
  };

  const handleFinishStage = () => {
    onComplete({
      id: 3,
      type: 'rangoli',
      name: t('badge3Name'),
      desc: t('badge3Desc'),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Heading */}
      <div className="text-center mb-4 max-w-xl">
        <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-widest uppercase block mb-1">
          {t('stage3Badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-cinzel-dec font-black gold-gradient-text mb-2">
          {t('stage3Title')}
        </h2>
        <p className="text-sm font-outfit text-[#FFF9ED]/85">
          {t('stage3Desc')}
        </p>
      </div>

      {/* Progress pill */}
      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#21103D]/90 border border-[#FFD36A]/40 mb-4 shadow-lg">
        <Palette size={16} className="text-[#FFD36A]" />
        <span className="text-xs font-cinzel text-[#FFF0C2]">{t('elementsPlaced')}</span>
        <span className="text-sm font-bold text-[#FFD36A]">{placedSlots.length} / 5</span>
      </div>

      {/* Rangoli Interactive Board */}
      <div className="relative w-full max-w-md aspect-square rounded-3xl glass-panel-gold border border-[#FFD36A]/50 p-4 sm:p-6 shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Background Mandala SVG & Light Wave */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
          <svg viewBox="0 0 200 200" className={`w-full h-full ${isCompleted ? 'animate-spin' : ''}`} style={{ animationDuration: '40s' }}>
            <circle cx="100" cy="100" r="92" fill="none" stroke="#FFD36A" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="#FF8A24" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#FFF0C2" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx="100" cy="100" r="42" fill="#4A1028" fillOpacity="0.4" stroke="#FFD36A" strokeWidth="1.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <path
                key={i}
                d={`M 100 100 Q ${100 + 40 * Math.cos((angle * Math.PI) / 180)} ${100 + 40 * Math.sin((angle * Math.PI) / 180)} ${100 + 70 * Math.cos(((angle + 22.5) * Math.PI) / 180)} ${100 + 70 * Math.sin(((angle + 22.5) * Math.PI) / 180)}`}
                fill="none"
                stroke="#FFD36A"
                strokeWidth="0.8"
                strokeOpacity="0.6"
              />
            ))}
          </svg>
        </div>

        {/* Central Royal Lotus & Diya */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#4A1028] via-[#21103D] to-[#090719] border-2 border-[#FFD36A] flex flex-col items-center justify-center shadow-[0_0_25px_rgba(255,211,106,0.5)]">
          <span className="text-3xl animate-float">🪔</span>
          <span className="text-[9px] font-cinzel font-bold text-[#FFD36A] tracking-wider mt-0.5">
            SHUBH
          </span>
        </div>

        {/* 5 Radial Placement Slots */}
        {RANGOLI_ELEMENTS.map((el) => {
          const isPlaced = placedSlots.includes(el.slotIndex);
          const isTargeted = selectedElementId === el.id;

          return (
            <div
              key={el.id}
              onClick={() => handlePlaceInSlot(el.slotIndex)}
              style={{ left: `${el.x}%`, top: `${el.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-12 sm:w-14 h-12 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                isPlaced
                  ? 'bg-[#21103D] border-2 border-[#FFD36A] shadow-[0_0_20px_rgba(255,211,106,0.6)] scale-105'
                  : isTargeted
                  ? 'bg-[#FF8A24]/30 border-2 border-dashed border-[#FF8A24] animate-pulse scale-110 shadow-[0_0_15px_rgba(255,138,36,0.5)]'
                  : 'bg-[#090719]/80 border-2 border-dashed border-[#FFF0C2]/40 hover:border-[#FFD36A]'
              }`}
            >
              {isPlaced ? (
                <span className="text-2xl animate-in zoom-in-75 duration-300">
                  {el.symbol}
                </span>
              ) : (
                <span className="text-[10px] font-cinzel text-[#FFF0C2]/70 font-semibold text-center px-1">
                  {language === 'hi' ? `स्थान 0${el.slotIndex + 1}` : `Slot 0${el.slotIndex + 1}`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Palette Tray of Elements */}
      {!isCompleted && (
        <div className="w-full mt-6 p-4 rounded-2xl glass-panel border border-[#FFD36A]/30">
          <span className="text-xs font-cinzel text-[#FFF0C2]/80 block text-center mb-3">
            {t('paletteInstruction')}
          </span>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {RANGOLI_ELEMENTS.map((el) => {
              const isPlaced = placedSlots.includes(el.slotIndex);
              const isSelected = selectedElementId === el.id;

              return (
                <button
                  key={el.id}
                  disabled={isPlaced}
                  onClick={() => handleSelectElement(el.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-outfit font-medium flex items-center gap-2 transition-all ${
                    isPlaced
                      ? 'bg-white/5 border-white/10 text-gray-500 opacity-40 cursor-default line-through'
                      : isSelected
                      ? 'bg-[#FFD36A] text-[#090719] border-[#FFF0C2] font-bold shadow-[0_0_15px_rgba(255,211,106,0.6)] scale-105'
                      : 'bg-[#21103D]/80 border-[#FFD36A]/30 text-[#FFF9ED] hover:border-[#FFD36A]'
                  }`}
                >
                  <span className="text-lg">{el.symbol}</span>
                  <span>{el.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isCompleted && (
        <div className="w-full mt-6 p-6 sm:p-8 rounded-3xl glass-panel-gold border-2 border-[#FFD36A] text-center shadow-[0_0_40px_rgba(255,211,106,0.35)] animate-float">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FFD36A] to-[#FF8A24] flex items-center justify-center text-[#090719] shadow-lg">
            <Sparkles size={28} />
          </div>

          <span className="text-xs font-cinzel text-[#FFD36A] tracking-widest uppercase block mb-1">
            {t('stagePrefix')} 03 {t('completed')}
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF9ED] mb-2">
            {t('stage3Complete')}
          </h3>

          <p className="text-sm font-outfit text-[#FFF0C2]/90 max-w-md mx-auto mb-6 leading-relaxed">
            {t('stage3Earned')}
          </p>

          <button
            onClick={handleFinishStage}
            className="btn-royal-gold text-sm sm:text-base"
          >
            <span>{t('unlockGrandGift')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
