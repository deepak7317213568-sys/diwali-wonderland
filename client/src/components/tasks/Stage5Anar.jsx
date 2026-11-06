import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { audioEngine } from '../../utils/audioSystem.js';
import { triggerFestiveConfetti } from '../../utils/confetti.js';
import { getTranslation } from '../../utils/translations.js';

export const Stage5Anar = ({ onComplete, language = 'en', isAlreadyCompleted = false }) => {
  const [isIgnited, setIsIgnited] = useState(isAlreadyCompleted);
  const [isFinished, setIsFinished] = useState(isAlreadyCompleted);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  // Realistic Canvas 2D Particle System for High-Performance Realistic Fountain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const smokeParticles = [];
    let startTime = isIgnited && !isAlreadyCompleted ? Date.now() : 0;
    const duration = 4800; // 4.8 seconds realistic fountain cycle

    class Spark {
      constructor(x, y, intensity) {
        this.x = x;
        this.y = y;
        // Shoot upward with spread
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.75;
        const speed = (6 + Math.random() * 11) * intensity;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.22;
        this.alpha = 1;
        this.decay = 0.015 + Math.random() * 0.02;
        this.size = 1.5 + Math.random() * 2.8;
        this.color = ['#FFF0C2', '#FFD36A', '#FF9A24', '#FF4D6D', '#FFFFFF'][
          Math.floor(Math.random() * 5)
        ];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
        this.size *= 0.98;
      }
      draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowColor = '#FFD36A';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Smoke {
      constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -0.8 - Math.random() * 1.2;
        this.alpha = 0.35;
        this.size = 8 + Math.random() * 12;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += 0.4;
        this.alpha -= 0.005;
      }
      draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = 'rgba(255, 240, 194, 0.12)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const anarX = width / 2;
      const anarY = height - 70;

      // Draw Anar Base (Conical clay firework with golden wrapper)
      ctx.save();
      ctx.shadowColor = isIgnited ? '#FF9A24' : 'transparent';
      ctx.shadowBlur = isIgnited ? 25 : 0;

      // Anar Body
      ctx.fillStyle = '#4A1028';
      ctx.beginPath();
      ctx.moveTo(anarX, anarY - 45); // top tip
      ctx.lineTo(anarX - 28, anarY + 25); // bottom left
      ctx.lineTo(anarX + 28, anarY + 25); // bottom right
      ctx.closePath();
      ctx.fill();

      // Golden foil wrapper bands
      ctx.fillStyle = '#FFD36A';
      ctx.beginPath();
      ctx.moveTo(anarX, anarY - 45);
      ctx.lineTo(anarX - 12, anarY - 20);
      ctx.lineTo(anarX + 12, anarY - 20);
      ctx.closePath();
      ctx.fill();

      // Ornate floral trim on base
      ctx.strokeStyle = '#FFD36A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(anarX, anarY + 25, 30, 0, Math.PI, false);
      ctx.stroke();

      // Tip / Fuse
      ctx.fillStyle = isIgnited ? '#FFF0C2' : '#8A3319';
      ctx.beginPath();
      ctx.arc(anarX, anarY - 45, isIgnited ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Emit Fountain Particles
      if (isIgnited && startTime > 0) {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          // Intensity curve: rises, peaks around 0.4 - 0.7, then gracefully tapers
          let intensity = 1;
          if (progress < 0.2) intensity = progress / 0.2;
          else if (progress > 0.7) intensity = (1 - progress) / 0.3;

          const spawnCount = Math.floor(16 * intensity);
          for (let i = 0; i < spawnCount; i++) {
            particles.push(new Spark(anarX, anarY - 45, intensity));
          }
          if (Math.random() < 0.3) {
            smokeParticles.push(new Smoke(anarX, anarY - 45));
          }
        } else if (!isFinished) {
          setIsFinished(true);
          triggerFestiveConfetti();
          if (onComplete) {
            onComplete({
              id: 5,
              type: 'anar',
              name: t('badge5Name'),
              desc: t('badge5Desc'),
            });
          }
        }
      }

      // Update & Draw Smoke
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const smk = smokeParticles[i];
        smk.update();
        smk.draw(ctx);
        if (smk.alpha <= 0) smokeParticles.splice(i, 1);
      }

      // Update & Draw Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isIgnited, isFinished, isAlreadyCompleted, onComplete]);

  const handleLightAnar = () => {
    if (isIgnited) return;
    setIsIgnited(true);
    audioEngine.playAnarFountain();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-4 max-w-xl">
        <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-widest uppercase block mb-1">
          {t('stage5Badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-cinzel-dec font-black gold-gradient-text mb-2">
          {t('stage5Title')}
        </h2>
        <p className="text-sm font-outfit text-[#FFF9ED]/85 leading-relaxed">
          {t('stage5Desc')}
        </p>
      </div>

      {/* Interactive Fountain Canvas Stage */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl glass-panel-gold border border-[#FFD36A]/50 shadow-2xl overflow-hidden flex flex-col items-center justify-end pb-4">
        {/* Sky Background & Rangoli Floor */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090719] via-[#21103D]/60 to-transparent pointer-events-none" />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Action Button */}
        {!isIgnited && (
          <div className="relative z-20 mb-3 flex flex-col items-center">
            <button
              onClick={handleLightAnar}
              className="btn-royal-gold text-base sm:text-lg group shadow-[0_0_25px_rgba(255,138,36,0.5)]"
              aria-label={t('lightAnarBtn')}
            >
              <Flame size={20} className="text-[#090719] animate-bounce" />
              <span>{t('lightAnarBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="w-full mt-6 p-6 sm:p-8 rounded-3xl glass-panel-gold border-2 border-[#FFD36A] text-center shadow-[0_0_40px_rgba(255,211,106,0.35)] animate-float">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FFD36A] to-[#FF8A24] flex items-center justify-center text-[#090719] shadow-lg">
            <Sparkles size={28} />
          </div>

          <span className="text-xs font-cinzel text-[#FFD36A] tracking-widest uppercase block mb-1">
            {t('stagePrefix')} 05 {t('completed')}
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF9ED] mb-2">
            {t('anarSuccess')}
          </h3>

          <p className="text-sm font-outfit text-[#FFF0C2]/90 max-w-md mx-auto mb-6 leading-relaxed">
            {t('anarSuccessSub')}
          </p>

          <button
            onClick={() => onComplete && onComplete({ id: 5, type: 'anar', name: t('badge5Name'), desc: t('badge5Desc') })}
            className="btn-royal-gold text-sm sm:text-base"
          >
            <span>{t('proceedToChakri')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
