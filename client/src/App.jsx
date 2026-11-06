import React, { useState } from 'react';
import { CinematicIntro } from './components/intro/CinematicIntro.jsx';
import { LanguageSelection } from './components/intro/LanguageSelection.jsx';
import { Header } from './components/common/Header.jsx';
import { InvitationBanner } from './components/common/InvitationBanner.jsx';
import { StageMap } from './components/tasks/StageMap.jsx';
import { Task1Diyas } from './components/tasks/Task1Diyas.jsx';
import { Task2Quiz } from './components/tasks/Task2Quiz.jsx';
import { Task3Rangoli } from './components/tasks/Task3Rangoli.jsx';
import { Task4Gift } from './components/tasks/Task4Gift.jsx';
import { Stage5Anar } from './components/tasks/Stage5Anar.jsx';
import { Stage6Chakri } from './components/tasks/Stage6Chakri.jsx';
import { FinalWishesCelebration } from './components/tasks/FinalWishesCelebration.jsx';
import { ReferralScreen } from './components/referral/ReferralScreen.jsx';
import { useAdventureProgress } from './hooks/useAdventureProgress.js';
import { useAudio } from './hooks/useAudio.js';
import { useReferral } from './hooks/useReferral.js';
import { getTranslation } from './utils/translations.js';

export function App() {
  const progress = useAdventureProgress();
  const audio = useAudio();
  const referral = useReferral();

  const [activeTaskView, setActiveTaskView] = useState(() => progress.currentStage || 1);

  const t = (key) => getTranslation(progress.language, key);

  // Synchronize active view when a stage task completes
  const handleCompleteTask = (taskId, badgeData) => {
    progress.completeTask(taskId, badgeData);

    // When final tasks are completed, qualify referral if applicable
    if (taskId >= 4) {
      referral.recordQualification();
    }

    const next = Math.min(7, taskId + 1);
    setActiveTaskView(next);
  };

  const handleSelectStage = (stageId) => {
    setActiveTaskView(stageId);
  };

  const handleProceedToReferrals = () => {
    setActiveTaskView(8); // View referral & share screen
  };

  const handleReset = () => {
    progress.resetAdventure();
    setActiveTaskView(1);
  };

  const handleToggleLanguage = () => {
    progress.setLanguage(progress.language === 'hi' ? 'en' : 'hi');
  };

  // 1. Initial Fullscreen Cinematic Intro Screen
  if (!progress.hasEntered) {
    return (
      <CinematicIntro
        audio={audio}
        language={progress.language}
        onEnter={progress.enterWonderland}
        activeReferrer={referral.activeReferrer}
      />
    );
  }

  // 2. Language Selection Screen (Immediately after Enter)
  if (!progress.hasSelectedLanguage) {
    return (
      <div className="relative min-h-screen bg-[#090719] flex flex-col">
        <InvitationBanner
          activeReferrer={referral.activeReferrer}
          language={progress.language}
        />
        <div className="flex-1 flex items-center justify-center">
          <LanguageSelection
            currentLanguage={progress.language}
            onSelectLanguage={(lang) => {
              progress.selectLanguageAndProceed(lang);
              audio.startMusicOnInteraction();
            }}
          />
        </div>
      </div>
    );
  }

  // 3. Main Adventure Dashboard & Interactive Stages
  return (
    <div className="min-h-screen bg-[#090719] text-[#FFF9ED] flex flex-col justify-between selection:bg-[#FFD36A] selection:text-[#090719] relative overflow-x-hidden">
      {/* Royal Atmospheric Background Gradients & Subtle Watermarks */}
      <div className="fixed inset-0 pointer-events-none z-0 rangoli-watermark">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#4A1028]/25 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#21103D]/40 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFD36A]/5 rounded-full blur-[200px]" />
      </div>

      {/* Main Sticky Header with Controls */}
      <Header
        audio={audio}
        badges={progress.badges}
        onReset={handleReset}
        currentStage={activeTaskView}
        progressPercent={progress.progressPercent}
        language={progress.language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Dynamic Inviter Banner Preserved Across All Stages */}
      <InvitationBanner
        activeReferrer={referral.activeReferrer}
        language={progress.language}
      />

      {/* Main Adventure Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pb-16 pt-2">
        {/* Stage Journey Map Dashboard (Showing 7 Stages) */}
        <StageMap
          currentStage={activeTaskView}
          completedTasks={progress.completedTasks}
          onSelectStage={handleSelectStage}
          progressPercent={progress.progressPercent}
          language={progress.language}
        />

        {/* Dynamic Task Viewport */}
        <div className="w-full mt-2">
          {activeTaskView === 1 && (
            <Task1Diyas
              litDiyas={progress.task1LitDiyas}
              onLightDiya={progress.lightDiya}
              onComplete={(badge) => handleCompleteTask(1, badge)}
              language={progress.language}
              isAlreadyCompleted={progress.completedTasks.includes(1)}
            />
          )}

          {activeTaskView === 2 && (
            <Task2Quiz
              onComplete={(badge) => handleCompleteTask(2, badge)}
              language={progress.language}
              isAlreadyCompleted={progress.completedTasks.includes(2)}
            />
          )}

          {activeTaskView === 3 && (
            <Task3Rangoli
              onComplete={(badge) => handleCompleteTask(3, badge)}
              language={progress.language}
              isAlreadyCompleted={progress.completedTasks.includes(3)}
            />
          )}

          {activeTaskView === 4 && (
            <Task4Gift
              onComplete={(badge) => handleCompleteTask(4, badge)}
              onProceedToAnar={() => setActiveTaskView(5)}
              language={progress.language}
              isAlreadyOpened={progress.completedTasks.includes(4)}
              activeReferrer={referral.activeReferrer}
              userName={referral.userName}
            />
          )}

          {activeTaskView === 5 && (
            <Stage5Anar
              onComplete={(badge) => handleCompleteTask(5, badge)}
              language={progress.language}
              isAlreadyCompleted={progress.completedTasks.includes(5)}
            />
          )}

          {activeTaskView === 6 && (
            <Stage6Chakri
              onComplete={(badge) => handleCompleteTask(6, badge)}
              language={progress.language}
              isAlreadyCompleted={progress.completedTasks.includes(6)}
            />
          )}

          {activeTaskView === 7 && (
            <FinalWishesCelebration
              language={progress.language}
              onReplay={() => {}}
              onProceedToReferrals={handleProceedToReferrals}
              activeReferrer={referral.activeReferrer}
              userName={referral.userName}
              updateUserName={referral.updateUserName}
              getShareUrl={referral.getShareUrl}
              getWhatsAppShareUrl={referral.getWhatsAppShareUrl}
              shareNative={referral.shareNative}
              referralCode={referral.referralCode}
            />
          )}

          {activeTaskView === 8 && (
            <ReferralScreen
              referralState={referral}
              language={progress.language}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 border-t border-[#FFD36A]/20 bg-[#090719]/90 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-outfit text-[#FFF0C2]/70">
          <div className="flex items-center gap-2">
            <span>🪔</span>
            <span className="font-cinzel text-xs font-bold text-[#FFD36A]">
              {t('projectName')}
            </span>
            <span>— {progress.language === 'hi' ? 'शाही 3D दीवाली अनुभव' : 'The Royal 3D Diwali Adventure'}</span>
          </div>

          <div>
            {t('creatorBy')}{' '}
            <strong className="text-[#FFD36A] font-semibold">{t('creatorName')}</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
