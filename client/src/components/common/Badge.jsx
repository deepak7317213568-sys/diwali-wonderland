import React from 'react';
import { Award, Flame, Sparkles, Gift } from 'lucide-react';

const BADGE_ICONS = {
  diya: Flame,
  champion: Sparkles,
  rangoli: Award,
  gift: Gift,
};

export const Badge = ({ badge, isUnlocked = true, showLabel = true, size = 'md' }) => {
  const IconComponent = (badge && BADGE_ICONS[badge.type]) || Award;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className="flex flex-col items-center text-center gap-1.5 group">
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
          isUnlocked
            ? 'bg-gradient-to-br from-[#FFD36A] via-[#FF8A24] to-[#4A1028] shadow-[0_0_20px_rgba(255,211,106,0.5)] border-2 border-[#FFF0C2] group-hover:scale-110'
            : 'bg-[#21103D]/60 border-2 border-dashed border-[#FFD36A]/30 text-gray-500'
        } ${sizeClasses[size]}`}
      >
        <IconComponent
          size={iconSizes[size]}
          className={isUnlocked ? 'text-[#090719] drop-shadow-sm' : 'text-[#FFD36A]/40'}
        />

        {isUnlocked && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFF0C2] rounded-full animate-ping opacity-75" />
        )}
      </div>

      {showLabel && badge && (
        <div className="flex flex-col">
          <span
            className={`font-cinzel font-bold text-xs tracking-wide ${
              isUnlocked ? 'text-[#FFD36A]' : 'text-gray-400'
            }`}
          >
            {badge.name}
          </span>
          {badge.desc && (
            <span className="text-[10px] text-[#FFF9ED]/70 font-outfit max-w-[120px] leading-tight">
              {badge.desc}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
