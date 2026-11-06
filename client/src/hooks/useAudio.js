import { useState, useEffect } from 'react';
import { audioEngine } from '../utils/audioSystem.js';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);

  useEffect(() => {
    const savedMute = localStorage.getItem('diwali_audio_muted');
    if (savedMute !== null) {
      const muted = savedMute === 'true';
      setIsMuted(muted);
      audioEngine.setMuted(muted);
    }
    const savedVol = localStorage.getItem('diwali_audio_volume');
    if (savedVol !== null) {
      const vol = parseFloat(savedVol);
      if (!isNaN(vol)) {
        setVolume(vol);
        audioEngine.setVolume(vol);
      }
    }
  }, []);

  const toggleMute = () => {
    const newSoundState = audioEngine.toggleMute();
    const muted = !newSoundState;
    setIsMuted(muted);
    localStorage.setItem('diwali_audio_muted', muted.toString());
    setIsPlaying(audioEngine.isPlayingBgm);
  };

  const togglePlayPause = () => {
    const playing = audioEngine.togglePlayPause();
    setIsPlaying(playing);
    setIsMuted(audioEngine.isMuted);
    localStorage.setItem('diwali_audio_muted', audioEngine.isMuted.toString());
  };

  const handleVolumeChange = (newVol) => {
    const val = parseFloat(newVol);
    setVolume(val);
    audioEngine.setVolume(val);
    localStorage.setItem('diwali_audio_volume', val.toString());
    if (isMuted && val > 0) {
      audioEngine.setMuted(false);
      setIsMuted(false);
      localStorage.setItem('diwali_audio_muted', 'false');
    }
  };

  const startMusicOnInteraction = () => {
    if (isMuted) {
      audioEngine.setMuted(false);
      setIsMuted(false);
      localStorage.setItem('diwali_audio_muted', 'false');
    }
    audioEngine.startBgm();
    setIsPlaying(true);
  };

  return {
    isMuted,
    isPlaying,
    volume,
    toggleMute,
    togglePlayPause,
    setVolume: handleVolumeChange,
    startMusicOnInteraction,
    audioEngine,
  };
};
