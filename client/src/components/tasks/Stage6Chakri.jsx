import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { audioEngine } from '../../utils/audioSystem.js';
import { triggerGoldenShower, triggerFestiveConfetti } from '../../utils/confetti.js';
import { getTranslation } from '../../utils/translations.js';

export const Stage6Chakri = ({ onComplete, language = 'en', isAlreadyCompleted = false }) => {
  const [isSpinning, setIsSpinning] = useState(isAlreadyCompleted);
  const [isFinished, setIsFinished] = useState(isAlreadyCompleted);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    const particles = [];
    let angle = 0;
    let angularSpeed = 0;
    let startTime = isSpinning && !isAlreadyCompleted ? Date.now() : 0;
    const duration = 5000; // 5 seconds spinning cycle

    class SpiralSpark {
      constructor(cx, cy, currentAngle, intensity) {
        // Sparks emit from outer edge of the spinning disc
        const emitRadius = 32;
        this.x = cx + Math.cos(currentAngle) * emitRadius;
        this.y = cy + Math.sin(currentAngle) * emitRadius;

        // Tangential velocity + radial velocity
        const tangentAngle = currentAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        const speed = (7 + Math.random() * 9) * intensity;
        this.vx = Math.cos(tangentAngle) * speed;
        this.vy = Math.sin(tangentAngle) * speed;

        this.alpha = 1;
        this.decay = 0.02 + Math.random() * 0.025;
        this.size = 1.6 + Math.random() * 2.6;
        this.color = ['#FFFFFF', '#FFF0C2', '#FFD36A', '#FF8A24', '#00F5D4'][
          Math.floor(Math.random() * 5)
        ];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.alpha -= this.decay;
        this.size *= 0.97;
      }
      draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowColor = '#FFD36A';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Floor Rangoli Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 211, 106, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Spinning Chakri Body
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Outer Golden Disk
      ctx.fillStyle = '#4A1028';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();

      // Spiral Grooves on Chakri
      ctx.strokeStyle = '#FFD36A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          Math.cos(a + 0.5) * 20,
          Math.sin(a + 0.5) * 20,
          Math.cos(a) * 32,
          Math.sin(a) * 32
        );
      }
      ctx.stroke();

      // Center Brass Hub
      ctx.fillStyle = isSpinning ? '#FFF0C2' : '#FFD36A';
      ctx.shadowColor = isSpinning ? '#FF8A24' : 'transparent';
      ctx.shadowBlur = isSpinning ? 20 : 0;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Emit Spinning Sparks
      if (isSpinning && startTime > 0) {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
          // Accelerate to peak then decelerate
          let intensity = 1;
          if (progress < 0.25) {
            intensity = progress / 0.25;
            angularSpeed = intensity * 0.45;
          } else if (progress > 0.7) {
            intensity = (1 - progress) / 0.3;
            angularSpeed = intensity * 0.45;
          } else {
            angularSpeed = 0.45;
          }

          angle += angularSpeed;

          // Emit sparks along tangential arms
          const sparkCount = Math.floor(18 * intensity);
          for (let i = 0; i < sparkCount; i++) {
            const emitOffset = (i * Math.PI * 2) / sparkCount + angle;
            particles.push(new SpiralSpark(cx, cy, emitOffset, intensity));
          }
        } else if (!isFinished) {
          setIsFinished(true);
          triggerGoldenShower();
          triggerFestiveConfetti();
          if (onComplete) {
            onComplete({
              id: 6,
              type: 'chakri',
              name: t('badge6Name'),
              desc: t('badge6Desc'),
            });
          }
        }
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
  }, [isSpinning, isFinished, isAlreadyCompleted, onComplete]);

  const handleLightChakri = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    audioEngine.playChakriSpin();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-4 max-w-xl">
        <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-widest uppercase block mb-1">
          {t('stage6Badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-cinzel-dec font-black gold-gradient-text mb-2">
          {t('stage6Title')}
        </h2>
        <p className="text-sm font-outfit text-[#FFF9ED]/85 leading-relaxed">
          {t('stage6Desc')}
        </p>
      </div>

      {/* Interactive Chakri Canvas Stage */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl glass-panel-gold border border-[#FFD36A]/50 shadow-2xl overflow-hidden flex flex-col items-center justify-end pb-4">
        {/* Ambient Dark Ground Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#21103D_0%,#090719_75%)] pointer-events-none" />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Action Button */}
        {!isSpinning && (
          <div className="relative z-20 mb-3 flex flex-col items-center">
            <button
              onClick={handleLightChakri}
              className="btn-royal-gold text-base sm:text-lg group shadow-[0_0_25px_rgba(255,138,36,0.5)]"
              aria-label={t('lightChakriBtn')}
            >
              <Flame size={20} className="text-[#090719] animate-bounce" />
              <span>{t('lightChakriBtn')}</span>
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
            {t('stagePrefix')} 06 {t('completed')}
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF9ED] mb-2">
            {t('chakriSuccess')}
          </h3>

          <p className="text-sm font-outfit text-[#FFF0C2]/90 max-w-md mx-auto mb-6 leading-relaxed">
            {t('chakriSuccessSub')}
          </p>

          <button
            onClick={() => onComplete && onComplete({ id: 6, type: 'chakri', name: t('badge6Name'), desc: t('badge6Desc') })}
            className="btn-royal-gold text-sm sm:text-base"
          >
            <span>{t('proceedToFinalWishes')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
