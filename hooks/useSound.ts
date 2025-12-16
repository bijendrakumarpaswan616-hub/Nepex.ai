import { useCallback, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

type SoundName = 'send' | 'receive' | 'error';

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
};

export const useSound = () => {
  const { settings } = useSettings();

  useEffect(() => {
    getAudioContext();
  }, []);

  const playSound = useCallback(async (soundName: SoundName) => {
    if (!settings.soundEffects) return;
    
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch (e) { console.error(e); }
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (soundName === 'send') {
      // "Pop" Sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (soundName === 'receive') {
      // "Ding" Sound (Two tones)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1046.50, t); // C6
      gain2.gain.setValueAtTime(0.03, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc2.start(t);
      osc2.stop(t + 0.5);
    } else if (soundName === 'error') {
      // "Buzz" Sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.2);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }, [settings.soundEffects]);

  return playSound;
};