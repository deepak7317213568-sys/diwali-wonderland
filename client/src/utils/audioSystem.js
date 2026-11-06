/**
 * Enhanced Audio Engine for Diwali Wonderland.
 * Integrates the user's provided background music file (/audio/diwali-music.mp3)
 * with dedicated Web Audio API sound synthesis for fireworks, ignition, and chimes.
 */

class FestiveAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isPlayingBgm = false;
    this.masterVolume = 0.55;
    this.bgmAudio = null;
    this.masterGain = null;
    this.sfxGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    // Initialize user's actual background music track
    if (!this.bgmAudio) {
      try {
        this.bgmAudio = new Audio('/audio/diwali-music.mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume;
        this.bgmAudio.preload = 'auto';

        // Error fallback to mpeg if mp3 fails
        this.bgmAudio.addEventListener('error', () => {
          console.warn('Retrying audio with alternate format...');
          this.bgmAudio.src = '/audio/diwali-music.mpeg';
        });
      } catch (e) {
        console.warn('Audio element initialization notice:', e);
      }
    }
  }

  ensureContext() {
    if (!this.ctx || !this.bgmAudio) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      if (!this.isMuted) {
        this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
      }
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume;
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }

    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume;
      if (!this.isMuted && !this.isPlayingBgm) {
        this.startBgm();
      }
    }

    return !this.isMuted;
  }

  setMuted(muted) {
    this.ensureContext();
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume;
      if (!this.isMuted && !this.isPlayingBgm) {
        this.startBgm();
      }
    }
  }

  // User's provided background music playback
  startBgm() {
    this.ensureContext();
    if (!this.bgmAudio) return;

    this.isPlayingBgm = true;
    this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume;

    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log('Autoplay restriction waiting for user touch:', err.message);
      });
    }
  }

  pauseBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.isPlayingBgm = false;
  }

  togglePlayPause() {
    if (this.isPlayingBgm) {
      this.pauseBgm();
      return false;
    } else {
      if (this.isMuted) {
        this.setMuted(false);
      }
      this.startBgm();
      return true;
    }
  }

  // SFX Synth tone generator
  playTone(freq, type = 'sine', duration = 1.0, gainVal = 0.3) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Safe audio
    }
  }

  // SFX: Light a Diya (spark + warm chime)
  playDiyaIgnite() {
    this.ensureContext();
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 1.2, 0.25), idx * 60);
    });
    setTimeout(() => this.playTone(1318.5, 'triangle', 0.9, 0.15), 250);
  }

  // SFX: Quiz Success
  playQuizSuccess() {
    this.ensureContext();
    if (!this.ctx) return;
    const ragaNotes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    ragaNotes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.8, 0.28), i * 90);
    });
  }

  // SFX: Quiz Retry
  playQuizRetry() {
    this.ensureContext();
    if (!this.ctx) return;
    this.playTone(392.0, 'sine', 0.4, 0.2);
    setTimeout(() => this.playTone(329.63, 'sine', 0.5, 0.18), 120);
  }

  // SFX: Rangoli piece snap
  playSnap() {
    this.ensureContext();
    if (!this.ctx) return;
    this.playTone(880, 'sine', 0.25, 0.35);
    this.playTone(1108.73, 'triangle', 0.3, 0.2);
  }

  // SFX: Rangoli complete fanfare
  playRangoliComplete() {
    this.ensureContext();
    if (!this.ctx) return;
    const fanfare = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51];
    fanfare.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 1.4, 0.3), i * 110);
    });
  }

  // SFX: Gift box open
  playGiftOpen() {
    this.ensureContext();
    if (!this.ctx) return;
    this.playTone(220, 'sine', 3.0, 0.4);
    this.playTone(329.63, 'sine', 2.8, 0.3);
    const cascade = [523, 659, 784, 987, 1174, 1318, 1567, 1760, 2093];
    cascade.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 1.5, 0.2), 300 + idx * 80);
    });
  }

  // SFX: Firework pop
  playFirework() {
    this.ensureContext();
    if (!this.ctx) return;
    this.playTone(130, 'triangle', 0.5, 0.4);
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const randFreq = 600 + Math.random() * 1200;
        this.playTone(randFreq, 'sine', 0.2, 0.15);
      }, 100 + i * 50);
    }
  }

  // SFX: Anar Fountain (Continuous rising crackle & golden hiss)
  playAnarFountain() {
    this.ensureContext();
    if (!this.ctx) return;
    // Initial ignition hiss
    this.playTone(180, 'sine', 0.4, 0.3);
    // Burst of crackles
    for (let t = 0; t < 18; t++) {
      setTimeout(() => {
        const f = 900 + Math.random() * 1800;
        this.playTone(f, 'triangle', 0.15, 0.12);
      }, t * 90);
    }
    // High shimmer
    setTimeout(() => {
      for (let s = 0; s < 12; s++) {
        setTimeout(() => {
          this.playTone(1400 + Math.random() * 1600, 'sine', 0.2, 0.1);
        }, s * 100);
      }
    }, 800);
  }

  // SFX: Chakri Spin (Accelerating whirling whistle & spark loops)
  playChakriSpin() {
    this.ensureContext();
    if (!this.ctx) return;
    // Whirling whoosh tones ascending in frequency
    const freqs = [220, 280, 350, 440, 560, 700, 880, 1050, 880, 600, 400];
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.35, 0.08);
        this.playTone(f * 1.5, 'sine', 0.25, 0.1);
      }, idx * 160);
    });
  }

  playTap() {
    this.ensureContext();
    if (!this.ctx) return;
    this.playTone(700, 'sine', 0.08, 0.15);
  }
}

export const audioEngine = new FestiveAudioEngine();
