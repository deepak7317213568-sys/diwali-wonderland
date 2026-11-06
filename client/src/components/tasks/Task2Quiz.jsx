import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { generateRandomizedQuiz } from '../../utils/quizData.js';
import { triggerFestiveConfetti } from '../../utils/confetti.js';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';

export const Task2Quiz = ({ onComplete, language = 'en', isAlreadyCompleted = false }) => {
  const [questions, setQuestions] = useState(() => generateRandomizedQuiz(language, 3));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);

  const t = (key) => getTranslation(language, key);

  // Regenerate questions if language changes mid-way and not completed
  useEffect(() => {
    if (!isCompleted) {
      setQuestions(generateRandomizedQuiz(language, 3));
      setCurrentQIndex(0);
      setSelectedOption(null);
      setFeedback(null);
    }
  }, [language, isCompleted]);

  const currentQ = questions[currentQIndex] || questions[0];

  const handleSelectOption = (index) => {
    if (feedback === 'correct') return;

    setSelectedOption(index);

    // Dynamic evaluation: verify against currentQ.correctIndex
    if (index === currentQ.correctIndex) {
      setFeedback('correct');
      audioEngine.playQuizSuccess();

      // Proceed to next question after short delay
      setTimeout(() => {
        if (currentQIndex < questions.length - 1) {
          setCurrentQIndex((prev) => prev + 1);
          setSelectedOption(null);
          setFeedback(null);
        } else {
          setIsCompleted(true);
          triggerFestiveConfetti();
        }
      }, 900);
    } else {
      setFeedback('incorrect');
      audioEngine.playQuizRetry();
    }
  };

  const handleRetryCurrent = () => {
    setSelectedOption(null);
    setFeedback(null);
  };

  const handleFinishTask = () => {
    onComplete({
      id: 2,
      type: 'champion',
      name: t('badge2Name'),
      desc: t('badge2Desc'),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Task Heading */}
      <div className="text-center mb-6">
        <span className="text-xs font-cinzel font-bold text-[#FFD36A] tracking-widest uppercase block mb-1">
          {t('stage2Badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-cinzel-dec font-black gold-gradient-text mb-2">
          {t('stage2Title')}
        </h2>
        <p className="text-sm font-outfit text-[#FFF9ED]/85">
          {t('stage2Desc')}
        </p>
      </div>

      {!isCompleted ? (
        <div className="w-full glass-panel-gold p-6 sm:p-8 rounded-3xl border border-[#FFD36A]/40 shadow-2xl relative">
          {/* Question Progress bar */}
          <div className="flex items-center justify-between text-xs font-cinzel text-[#FFF0C2] mb-3">
            <span>
              {t('questionPrefix')} 0{currentQIndex + 1} {t('ofPrefix')} 0{questions.length}
            </span>
            <span className="text-[#FFD36A] font-bold">
              {Math.round((currentQIndex / questions.length) * 100)}% {t('completeWord')}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#090719] mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8A24] to-[#FFD36A] transition-all duration-500 rounded-full"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-cinzel font-bold text-[#FFF9ED] mb-6 leading-relaxed">
            {currentQ.question}
          </h3>

          {/* 4 Shuffled Options (Correct Answer distributed across A, B, C, D) */}
          <div className="flex flex-col gap-3 mb-6">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let optionStyles =
                'bg-[#21103D]/70 border-[#FFD36A]/30 text-[#FFF9ED] hover:border-[#FFD36A] hover:bg-[#21103D]';

              if (isSelected) {
                if (feedback === 'correct') {
                  optionStyles =
                    'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.4)]';
                } else if (feedback === 'incorrect') {
                  optionStyles =
                    'bg-rose-950/80 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left font-outfit text-sm sm:text-base font-medium flex items-center justify-between transition-all duration-200 ${optionStyles}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#090719]/60 border border-[#FFD36A]/40 flex items-center justify-center text-xs font-cinzel font-bold text-[#FFD36A]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isSelected && feedback === 'correct' && (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Friendly Retry */}
          {feedback === 'incorrect' && (
            <div className="p-3 rounded-xl bg-rose-900/30 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
              <span>{t('retryHint')}</span>
              <button
                onClick={handleRetryCurrent}
                className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 font-medium flex items-center gap-1"
              >
                <RotateCcw size={12} /> {t('retryBtn')}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion Screen */
        <div className="w-full glass-panel-gold p-8 rounded-3xl border-2 border-[#FFD36A] text-center shadow-[0_0_40px_rgba(255,211,106,0.3)] animate-float">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD36A] to-[#FF8A24] flex items-center justify-center text-[#090719] shadow-lg">
            <Sparkles size={28} />
          </div>

          <span className="text-xs font-cinzel text-[#FFD36A] tracking-widest uppercase block mb-1">
            {t('stagePrefix')} 02 {t('completed')}
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF9ED] mb-3">
            {t('stage2Complete')}
          </h3>

          <p className="text-sm font-outfit text-[#FFF0C2]/90 max-w-md mx-auto mb-6 leading-relaxed">
            {t('stage2Earned')}
          </p>

          <button
            onClick={handleFinishTask}
            className="btn-royal-gold text-sm sm:text-base"
          >
            <span>{t('unlockRangoli')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
