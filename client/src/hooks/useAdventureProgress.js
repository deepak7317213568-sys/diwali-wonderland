import { useState, useEffect } from 'react';

const STORAGE_KEY = 'diwali_wonderland_state_v2';
const LANG_STORAGE_KEY = 'diwali_user_language_v1';

const INITIAL_STATE = {
  currentStage: 1, // 1 to 7 stages
  completedTasks: [],
  badges: [],
  task1LitDiyas: [],
  hasEntered: false,
  hasSelectedLanguage: false,
};

export const useAdventureProgress = () => {
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'hi' || savedLang === 'en') return savedLang;
    } catch (e) {
      // fallback
    }
    return 'en';
  });

  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  }, [state]);

  const setLanguage = (lang) => {
    const cleanLang = lang === 'hi' ? 'hi' : 'en';
    setLanguageState(cleanLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, cleanLang);
    } catch (e) {
      // ignore
    }
  };

  const enterWonderland = () => {
    setState((prev) => ({
      ...prev,
      hasEntered: true,
    }));
  };

  const selectLanguageAndProceed = (lang) => {
    setLanguage(lang);
    setState((prev) => ({
      ...prev,
      hasSelectedLanguage: true,
    }));
  };

  const completeTask = (taskId, badgeData) => {
    setState((prev) => {
      const newCompleted = prev.completedTasks.includes(taskId)
        ? prev.completedTasks
        : [...prev.completedTasks, taskId];

      const newBadges = badgeData && !prev.badges.some((b) => b.id === badgeData.id)
        ? [...prev.badges, badgeData]
        : prev.badges;

      // Determine next stage (up to 7)
      const nextStage = Math.max(prev.currentStage, taskId + 1);

      return {
        ...prev,
        completedTasks: newCompleted,
        badges: newBadges,
        currentStage: nextStage,
      };
    });
  };

  const setStage = (stageNumber) => {
    setState((prev) => {
      const maxEligibleStage = prev.completedTasks.length + 1;
      if (stageNumber <= maxEligibleStage) {
        return { ...prev, currentStage: stageNumber };
      }
      return prev;
    });
  };

  const lightDiya = (diyaIndex) => {
    setState((prev) => {
      if (prev.task1LitDiyas.includes(diyaIndex)) return prev;
      return {
        ...prev,
        task1LitDiyas: [...prev.task1LitDiyas, diyaIndex],
      };
    });
  };

  const resetAdventure = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setState(INITIAL_STATE);
  };

  // 6 core tasks (1 to 6) unlock Stage 7 (Final Celebration)
  const progressPercent = Math.min(100, Math.round((state.completedTasks.length / 6) * 100));

  return {
    state,
    language,
    currentStage: state.currentStage,
    completedTasks: state.completedTasks,
    badges: state.badges,
    task1LitDiyas: state.task1LitDiyas,
    hasEntered: state.hasEntered,
    hasSelectedLanguage: state.hasSelectedLanguage,
    progressPercent,
    setLanguage,
    enterWonderland,
    selectLanguageAndProceed,
    completeTask,
    setStage,
    lightDiya,
    resetAdventure,
  };
};
