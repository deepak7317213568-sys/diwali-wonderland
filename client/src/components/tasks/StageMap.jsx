import React from 'react';
import {
  Lock,
  CheckCircle2,
  Sparkles,
  Flame,
  HelpCircle,
  Palette,
  Gift,
  Share2,
  Heart,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';

export const StageMap = ({
  currentStage,
  completedTasks = [],
  onSelectStage,
  progressPercent = 0,
  language = 'en',
}) => {
  const t = (key) => getTranslation(language, key);

  const STAGES = [
    {
      id: 1,
      title: t('stage1Title'),
      subtitle: t('stage1Subtitle'),
      icon: Flame,
      reward: t('badge1Name'),
    },
    {
      id: 2,
      title: t('stage2Title'),
      subtitle: t('stage2Subtitle'),
      icon: HelpCircle,
      reward: t('badge2Name'),
    },
    {
      id: 3,
      title: t('stage3Title'),
      subtitle: t('stage3Subtitle'),
      icon: Palette,
      reward: t('badge3Name'),
    },
    {
      id: 4,
      title: t('stage4Title'),
      subtitle: t('stage4Subtitle'),
      icon: Gift,
      reward: t('badge4Name'),
    },
    {
      id: 5,
      title: t('stage5Title'),
      subtitle: t('stage5Subtitle'),
      icon: Sparkles,
      reward: t('badge5Name'),
    },
    {
      id: 6,
      title: t('stage6Title'),
      subtitle: t('stage6Subtitle'),
      icon: Flame,
      reward: t('badge6Name'),
    },
    {
      id: 7,
      title: t('stage7Title'),
      subtitle: t('stage7Subtitle'),
      icon: Heart,
      reward: t('happyDiwali'),
    },
  ];

  const maxAccessibleStage = completedTasks.length + 1;

  const handleCardClick = (stageId) => {
    if (stageId <= maxAccessibleStage) {
      audioEngine.playTap();
      onSelectStage(stageId);
    } else {
      audioEngine.playQuizRetry();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {/* Progress Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 glass-panel p-4 sm:p-5">
        <div>
          <span className="text-[11px] font-cinzel text-[#FFD36A] tracking-widest block mb-0.5 uppercase">
            {t('journeyProgress')}
          </span>
          <h2 className="text-base sm:text-xl font-cinzel font-bold text-[#FFF9ED]">
            {t('journeyPath')}
          </h2>
        </div>

        <div className="w-full sm:w-64 flex flex-col items-end">
          <div className="flex items-center justify-between w-full text-xs font-outfit mb-1.5">
            <span className="text-[#FFF0C2]/80">{t('celebrationProgress')}</span>
            <span className="font-bold text-[#FFD36A]">{progressPercent}%</span>
          </div>
          {/* Progress bar track */}
          <div className="w-full h-2.5 rounded-full bg-[#21103D] border border-[#FFD36A]/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8A24] via-[#FFD36A] to-[#FFF0C2] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(255,211,106,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Connected Stage Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
        {STAGES.map((stage) => {
          const isCompleted = completedTasks.includes(stage.id);
          const isCurrent = currentStage === stage.id;
          const isUnlocked = stage.id <= maxAccessibleStage;
          const isLocked = !isUnlocked;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              onClick={() => handleCardClick(stage.id)}
              className={`relative p-3.5 sm:p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between select-none ${
                isCurrent
                  ? 'glass-panel-gold ring-2 ring-[#FFD36A] shadow-[0_0_25px_rgba(255,211,106,0.4)] scale-[1.02]'
                  : isCompleted
                  ? 'glass-panel border-[#FFD36A]/50 bg-[#21103D]/80 hover:scale-[1.01] cursor-pointer'
                  : isUnlocked
                  ? 'glass-panel hover:border-[#FFD36A]/60 hover:scale-[1.01] cursor-pointer'
                  : 'bg-[#090719]/60 border border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Active Task Tag */}
              {isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A24] to-[#FFD36A] text-[#090719] text-[9px] font-cinzel font-black tracking-wider uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Sparkles size={10} /> {t('currentTaskBadge')}
                </div>
              )}

              <div>
                {/* Top Row: Stage Number & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cinzel text-[10px] font-bold text-[#FFD36A] tracking-wider">
                    {t('stagePrefix')} 0{stage.id}
                  </span>

                  <div>
                    {isCompleted ? (
                      <CheckCircle2 size={13} className="text-[#FFD36A]" />
                    ) : isLocked ? (
                      <Lock size={12} className="text-gray-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#FF8A24] animate-ping" />
                    )}
                  </div>
                </div>

                {/* Stage Icon */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl mb-2 flex items-center justify-center transition-all ${
                    isCompleted || isCurrent
                      ? 'bg-gradient-to-br from-[#FFD36A] to-[#FF8A24] text-[#090719] shadow-[0_0_12px_rgba(255,211,106,0.3)]'
                      : isUnlocked
                      ? 'bg-[#4A1028] text-[#FFF0C2] border border-[#FFD36A]/30'
                      : 'bg-[#21103D]/40 text-gray-500'
                  }`}
                >
                  <StageIcon size={18} />
                </div>

                {/* Title */}
                <h3 className="font-cinzel font-bold text-xs text-[#FFF9ED] mb-0.5 leading-snug line-clamp-1">
                  {stage.title}
                </h3>
                <p className="text-[10px] font-outfit text-[#FFF0C2]/70 leading-tight line-clamp-1">
                  {stage.subtitle}
                </p>
              </div>

              {/* Bottom Reward */}
              <div className="pt-2 mt-2 border-t border-[#FFD36A]/15 text-[9px] font-outfit text-[#FFD36A]/90 truncate">
                ✨ {stage.reward}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
