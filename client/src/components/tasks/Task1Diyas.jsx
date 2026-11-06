import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import { CanvasContainer } from '../3d/CanvasContainer.jsx';
import { DiyaModel } from '../3d/DiyaModel.jsx';
import { triggerFestiveConfetti } from '../../utils/confetti.js';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';

export const Task1Diyas = ({
  litDiyas = [],
  onLightDiya,
  onComplete,
  language = 'en',
  isAlreadyCompleted = false,
}) => {
  const [showCelebration, setShowCelebration] = useState(isAlreadyCompleted);

  const t = (key) => getTranslation(language, key);

  const isAllLit = litDiyas.length >= 5;

  useEffect(() => {
    if (isAllLit && !showCelebration) {
      setShowCelebration(true);
      triggerFestiveConfetti();
      audioEngine.playQuizSuccess();
    }
  }, [isAllLit, showCelebration]);

  const handleLight = (index) => {
    if (!litDiyas.includes(index)) {
      onLightDiya(index);
    }
  };

  const handleUnlockNext = () => {
    onComplete({
      id: 1,
      type: 'diya',
      name: t('badge1Name'),
      desc: t('badge1Desc'),
    });
  };

  const diyaCoordinates = [
    [-3.2, 0.2, 0.4],
    [-1.6, -0.1, 0.9],
    [0.0, -0.3, 1.2],
    [1.6, -0.1, 0.9],
    [3.2, 0.2, 0.4],
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Header Info */}
      <div className="text-center mb-4 max-w-xl">
        <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-widest uppercase inline-block mb-1">
          {t('stage1Badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-cinzel-dec font-black gold-gradient-text mb-2">
          {t('stage1Title')}
        </h2>
        <p className="text-sm font-outfit text-[#FFF9ED]/85 leading-relaxed">
          {t('stage1Desc')}
        </p>
      </div>

      {/* Progress Counter Pill */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#21103D]/90 border border-[#FFD36A]/40 mb-4 shadow-lg">
        <Flame size={18} className="text-[#FF8A24] animate-pulse" />
        <span className="text-xs font-cinzel font-semibold text-[#FFF0C2]">
          {t('diyasIlluminated')}
        </span>
        <span className="text-sm font-bold text-[#FFD36A]">
          {litDiyas.length} / 5
        </span>
      </div>

      {/* 3D Scene Viewport */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden glass-panel-gold border border-[#FFD36A]/40 shadow-2xl">
        <CanvasContainer camera={{ position: [0, 2.2, 6.2], fov: 45 }}>
          <ambientLight intensity={0.4} color="#21103D" />
          <directionalLight position={[0, 6, 4]} intensity={0.8} color="#FFF0C2" />

          {/* Palace Courtyard Floor */}
          <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[18, 12]} />
            <meshStandardMaterial color="#1a0b2e" roughness={0.6} metalness={0.4} />
          </mesh>

          {/* 5 Sacred Diyas */}
          {diyaCoordinates.map((coords, i) => (
            <DiyaModel
              key={i}
              index={i}
              position={coords}
              scale={1.05}
              isLit={litDiyas.includes(i)}
              onLight={handleLight}
            />
          ))}
        </CanvasContainer>

        {/* Hint overlay on canvas */}
        {!isAllLit && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3.5 py-1 rounded-full bg-[#090719]/80 border border-[#FFD36A]/20 text-[11px] font-outfit text-[#FFF0C2]/80 backdrop-blur-sm">
            {t('tapDiyaHint')}
          </div>
        )}
      </div>

      {/* Mobile/Accessibility Diya Selector Buttons */}
      <div className="w-full mt-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {[0, 1, 2, 3, 4].map((i) => {
          const isLit = litDiyas.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleLight(i)}
              className={`px-3 py-2 rounded-xl text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all ${
                isLit
                  ? 'bg-gradient-to-r from-[#FFD36A] to-[#FF8A24] text-[#090719] shadow-[0_0_15px_rgba(255,211,106,0.4)]'
                  : 'bg-[#21103D]/80 border border-[#FFD36A]/30 text-[#FFF0C2]/80 hover:border-[#FFD36A]'
              }`}
            >
              <Flame size={14} className={isLit ? 'text-[#090719]' : 'text-[#FF8A24]'} />
              <span>
                {language === 'hi' ? `दीपक 0${i + 1}` : `Diya 0${i + 1}`}
              </span>
              {isLit && <CheckCircle size={13} className="text-[#090719]" />}
            </button>
          );
        })}
      </div>

      {/* Success Celebration Banner */}
      {showCelebration && (
        <div className="w-full mt-6 p-6 rounded-2xl glass-panel-gold border-2 border-[#FFD36A] text-center shadow-[0_0_40px_rgba(255,211,106,0.3)] animate-float">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FFD36A] to-[#FF8A24] flex items-center justify-center text-[#090719] shadow-md">
            <Sparkles size={24} />
          </div>

          <span className="text-xs font-cinzel text-[#FFD36A] tracking-widest block mb-1">
            {t('stagePrefix')} 01 {t('completed')}
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF9ED] mb-2">
            {t('stage1Complete')}
          </h3>

          <p className="text-sm font-outfit text-[#FFF0C2]/90 max-w-md mx-auto mb-5">
            {t('stage1Earned')}
          </p>

          <button
            onClick={handleUnlockNext}
            className="btn-royal-gold text-sm sm:text-base"
          >
            <span>{t('unlockNextChallenge')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
