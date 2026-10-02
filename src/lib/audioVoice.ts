// Web Audio API Synthesizer & SpeechSynthesis Core Voice Engine with Child Sound Voice-Overs & Background Music Generator

export type BgMusicTrack = 'playroom' | 'stars' | 'sunny';

interface NoteEvent {
  note: number; // Frequency in Hz
  duration: number; // in seconds
  instrument?: 'musicbox' | 'glockenspiel' | 'kalimba' | 'bass' | 'sparkle';
  volume?: number;
}

// Frequencies (Hz) for standard notes
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

class AudioVoiceEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Background Music state
  private isBgMusicPlaying: boolean = false;
  private bgMasterGain: GainNode | null = null;
  private bgMusicInterval: any = null;
  private currentTrack: BgMusicTrack = 'playroom';
  private bgVolume: number = 0.16; // Gentle ambient level
  private isDucked: boolean = false;
  private onBgStateChangeListeners: ((isPlaying: boolean, track: BgMusicTrack, volume: number) => void)[] = [];

  constructor() {
    // Lazy initialize on user interaction
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isBgMusicPlaying) {
      this.pauseBackgroundMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  // 1. Success Chime (ascending harmonic chord)
  public playSuccessChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
    });
  }

  // 2. Laser Shoot
  public playLaserShoot() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.16);
  }

  // 3. Coin / Star Reward Sparkle
  public playCoinReward() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.36);
  }

  // 4. Error / Try Again soft thud
  public playErrorBuzz() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.23);
  }

  // 5. Victory Fanfare
  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.55);
    });
  }

  // 6. Child Pop Bubble
  public playBubblePop() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // 7. Playful Child Giggle / Sparkle FX
  public playChildGiggleSparkle() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Series of soft high-frequency notes simulating child delight
    const freqs = [784, 880, 1046, 1174, 1318, 1567];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + (Math.random() * 20 - 10), ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.22);
    });
  }

  // --- CHILDREN'S BACKGROUND SOUND GENERATOR ---

  private ensureBgGainNode(ctx: AudioContext): GainNode {
    if (!this.bgMasterGain) {
      this.bgMasterGain = ctx.createGain();
      this.bgMasterGain.gain.setValueAtTime(this.bgVolume, ctx.currentTime);
      this.bgMasterGain.connect(ctx.destination);
    }
    return this.bgMasterGain;
  }

  // Play an individual synthesized instrument tone
  private playSynthesizedNote(
    ctx: AudioContext,
    destination: GainNode,
    freq: number,
    startTime: number,
    duration: number,
    instrument: 'musicbox' | 'glockenspiel' | 'kalimba' | 'bass' | 'sparkle' = 'musicbox',
    volumeMultiplier: number = 1.0
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (instrument === 'glockenspiel') {
      osc.type = 'sine';
      // Add subtle overtone oscillator
      const overtone = ctx.createOscillator();
      const overGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.76, startTime);
      overGain.gain.setValueAtTime(0.08 * volumeMultiplier, startTime);
      overGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.4);
      overtone.connect(overGain);
      overGain.connect(destination);
      overtone.start(startTime);
      overtone.stop(startTime + duration * 0.45);
    } else if (instrument === 'kalimba') {
      osc.type = 'triangle';
    } else if (instrument === 'bass') {
      osc.type = 'sine';
    } else if (instrument === 'sparkle') {
      osc.type = 'sine';
    } else {
      // musicbox
      osc.type = 'sine';
    }

    osc.frequency.setValueAtTime(freq, startTime);

    const baseVol = instrument === 'bass' ? 0.35 : 0.22;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(baseVol * volumeMultiplier, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // Start Playing Children's Background Music
  public startBackgroundMusic(track: BgMusicTrack = 'playroom') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.currentTrack = track;
    this.isBgMusicPlaying = true;
    this.notifyBgStateListeners();

    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
    }

    const masterGain = this.ensureBgGainNode(ctx);
    masterGain.gain.setValueAtTime(this.isDucked ? this.bgVolume * 0.25 : this.bgVolume, ctx.currentTime);

    // Schedule music phrases based on selected track
    const playPhrase = () => {
      if (!this.isBgMusicPlaying || this.isMuted) return;
      const now = ctx.currentTime + 0.05;

      if (this.currentTrack === 'playroom') {
        // Joyful Playroom Nursery Arpeggio (C Major / F Major progression, 105 BPM)
        const tempo = 0.28; // seconds per eighth note
        const melody = [
          // Bar 1: C Major
          { note: N.C5, dur: 0.4, ins: 'glockenspiel', vol: 1.0, time: 0 },
          { note: N.E5, dur: 0.4, ins: 'glockenspiel', vol: 0.9, time: 1 },
          { note: N.G5, dur: 0.5, ins: 'glockenspiel', vol: 1.1, time: 2 },
          { note: N.E5, dur: 0.4, ins: 'musicbox', vol: 0.8, time: 3 },
          { note: N.C4, dur: 1.1, ins: 'bass', vol: 0.8, time: 0 },

          // Bar 2: G Major
          { note: N.D5, dur: 0.4, ins: 'glockenspiel', vol: 0.9, time: 4 },
          { note: N.G5, dur: 0.4, ins: 'glockenspiel', vol: 1.0, time: 5 },
          { note: N.B5, dur: 0.5, ins: 'glockenspiel', vol: 1.1, time: 6 },
          { note: N.G5, dur: 0.4, ins: 'musicbox', vol: 0.8, time: 7 },
          { note: N.G3, dur: 1.1, ins: 'bass', vol: 0.8, time: 4 },

          // Bar 3: A Minor
          { note: N.C5, dur: 0.4, ins: 'glockenspiel', vol: 1.0, time: 8 },
          { note: N.E5, dur: 0.4, ins: 'glockenspiel', vol: 1.0, time: 9 },
          { note: N.A5, dur: 0.6, ins: 'glockenspiel', vol: 1.2, time: 10 },
          { note: N.C6, dur: 0.5, ins: 'sparkle', vol: 0.9, time: 11 },
          { note: N.A3, dur: 1.1, ins: 'bass', vol: 0.8, time: 8 },

          // Bar 4: F Major to C Resolve
          { note: N.F5, dur: 0.4, ins: 'glockenspiel', vol: 1.0, time: 12 },
          { note: N.A5, dur: 0.4, ins: 'glockenspiel', vol: 0.9, time: 13 },
          { note: N.G5, dur: 0.5, ins: 'glockenspiel', vol: 1.1, time: 14 },
          { note: N.C5, dur: 0.8, ins: 'musicbox', vol: 1.2, time: 15 },
          { note: N.F3, dur: 1.1, ins: 'bass', vol: 0.8, time: 12 },
        ];

        melody.forEach((m) => {
          this.playSynthesizedNote(
            ctx,
            masterGain,
            m.note,
            now + m.time * tempo,
            m.dur,
            m.ins as any,
            m.vol
          );
        });
      } else if (this.currentTrack === 'stars') {
        // Magical Star Lullaby (Gentle music box & glockenspiel)
        const tempo = 0.42;
        const melody = [
          { note: N.C5, dur: 0.8, ins: 'musicbox', vol: 1.0, time: 0 },
          { note: N.G5, dur: 0.8, ins: 'musicbox', vol: 1.0, time: 1 },
          { note: N.A5, dur: 0.8, ins: 'glockenspiel', vol: 1.1, time: 2 },
          { note: N.G5, dur: 1.2, ins: 'musicbox', vol: 1.0, time: 3 },
          { note: N.F5, dur: 0.8, ins: 'musicbox', vol: 0.9, time: 4 },
          { note: N.E5, dur: 0.8, ins: 'musicbox', vol: 0.9, time: 5 },
          { note: N.D5, dur: 0.8, ins: 'glockenspiel', vol: 0.9, time: 6 },
          { note: N.C5, dur: 1.4, ins: 'musicbox', vol: 1.2, time: 7 },
          // Soft warm chords
          { note: N.C4, dur: 1.6, ins: 'bass', vol: 0.7, time: 0 },
          { note: N.F3, dur: 1.6, ins: 'bass', vol: 0.7, time: 4 },
        ];

        melody.forEach((m) => {
          this.playSynthesizedNote(
            ctx,
            masterGain,
            m.note,
            now + m.time * tempo,
            m.dur,
            m.ins as any,
            m.vol
          );
        });
      } else {
        // Sunny Adventure (Kalimba & Bouncy Rhythms)
        const tempo = 0.24;
        const melody = [
          { note: N.G4, dur: 0.35, ins: 'kalimba', vol: 1.0, time: 0 },
          { note: N.C5, dur: 0.35, ins: 'kalimba', vol: 1.1, time: 1 },
          { note: N.D5, dur: 0.35, ins: 'kalimba', vol: 1.0, time: 2 },
          { note: N.E5, dur: 0.5, ins: 'kalimba', vol: 1.2, time: 3 },
          { note: N.G5, dur: 0.5, ins: 'sparkle', vol: 1.0, time: 4 },
          { note: N.E5, dur: 0.35, ins: 'kalimba', vol: 0.9, time: 5 },
          { note: N.D5, dur: 0.35, ins: 'kalimba', vol: 0.9, time: 6 },
          { note: N.C5, dur: 0.7, ins: 'kalimba', vol: 1.2, time: 7 },
          { note: N.C3, dur: 1.0, ins: 'bass', vol: 0.8, time: 0 },
          { note: N.G3, dur: 1.0, ins: 'bass', vol: 0.8, time: 4 },
        ];

        melody.forEach((m) => {
          this.playSynthesizedNote(
            ctx,
            masterGain,
            m.note,
            now + m.time * tempo,
            m.dur,
            m.ins as any,
            m.vol
          );
        });
      }
    };

    // Run first phrase immediately, then loop
    playPhrase();
    const intervalMs = this.currentTrack === 'stars' ? 3800 : this.currentTrack === 'sunny' ? 2200 : 4600;
    this.bgMusicInterval = setInterval(playPhrase, intervalMs);
  }

  public pauseBackgroundMusic() {
    this.isBgMusicPlaying = false;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.notifyBgStateListeners();
  }

  public toggleBackgroundMusic(track?: BgMusicTrack) {
    if (this.isBgMusicPlaying) {
      this.pauseBackgroundMusic();
    } else {
      this.startBackgroundMusic(track || this.currentTrack);
    }
  }

  public setBackgroundVolume(volume: number) {
    this.bgVolume = Math.max(0, Math.min(1, volume));
    const ctx = this.getAudioContext();
    if (ctx && this.bgMasterGain) {
      const target = this.isDucked ? this.bgVolume * 0.25 : this.bgVolume;
      this.bgMasterGain.gain.setValueAtTime(target, ctx.currentTime);
    }
    this.notifyBgStateListeners();
  }

  public getBgVolume(): number {
    return this.bgVolume;
  }

  public getIsBgMusicPlaying(): boolean {
    return this.isBgMusicPlaying;
  }

  public getCurrentTrack(): BgMusicTrack {
    return this.currentTrack;
  }

  public subscribeBgState(listener: (isPlaying: boolean, track: BgMusicTrack, volume: number) => void) {
    this.onBgStateChangeListeners.push(listener);
    return () => {
      this.onBgStateChangeListeners = this.onBgStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notifyBgStateListeners() {
    this.onBgStateChangeListeners.forEach((l) => l(this.isBgMusicPlaying, this.currentTrack, this.bgVolume));
  }

  // Automatically duck background music when voice starts speaking
  private duckBackgroundMusic(duck: boolean) {
    this.isDucked = duck;
    const ctx = this.getAudioContext();
    if (ctx && this.bgMasterGain && this.isBgMusicPlaying) {
      const target = duck ? this.bgVolume * 0.2 : this.bgVolume;
      this.bgMasterGain.gain.setValueAtTime(this.bgMasterGain.gain.value, ctx.currentTime);
      this.bgMasterGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.15);
    }
  }

  // --- CORE VOICE-OVER SYNTHESIS ---
  public speak(
    text: string,
    options?: {
      pitch?: number;
      rate?: number;
      lang?: string;
      onEnd?: () => void;
    }
  ) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    this.duckBackgroundMusic(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = options?.pitch ?? 1.15;
    utterance.rate = options?.rate ?? 0.95;
    utterance.lang = options?.lang ?? 'en-GB';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Fiona') ||
          v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    const handleEnd = () => {
      this.duckBackgroundMusic(false);
      if (options?.onEnd) options.onEnd();
    };

    utterance.onend = handleEnd;
    utterance.onerror = handleEnd;

    window.speechSynthesis.speak(utterance);
  }

  // --- CHILD VOICE SYNTHESIS MODE ---
  public speakChildVoice(
    text: string,
    onEnd?: () => void
  ) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.duckBackgroundMusic(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.48;
    utterance.rate = 0.95;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const childVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Junior') ||
          v.name.includes('Child') ||
          v.name.includes('Victoria') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google US English'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (childVoice) {
      utterance.voice = childVoice;
    }

    const handleEnd = () => {
      this.duckBackgroundMusic(false);
      if (onEnd) onEnd();
    };

    utterance.onend = handleEnd;
    utterance.onerror = handleEnd;

    window.speechSynthesis.speak(utterance);
  }

  public speakChildPhonics(
    sound: string,
    word: string,
    onEnd?: () => void
  ) {
    const text = `${sound}! Like in ${word}! Can you find ${sound}?`;
    this.speakChildVoice(text, onEnd);
  }

  public speakChildCheer(
    message: string = 'Yay! You got it right! Awesome job!',
    onEnd?: () => void
  ) {
    this.playSuccessChime();
    this.speakChildVoice(message, onEnd);
  }

  // --- TEACHER NGOZI SPECIALIZED EDUCATOR VOICE ---
  public speakTeacherNgozi(
    text: string,
    onEnd?: () => void
  ) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.duckBackgroundMusic(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.18; // warm, encouraging educator pitch
    utterance.rate = 0.92; // gentle, reassuring pace for children
    utterance.lang = 'en-GB';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en-GB') || v.lang.startsWith('en')) &&
        (v.name.includes('Natural') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Serena') ||
          v.name.includes('Fiona') ||
          v.name.includes('Samantha') ||
          v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    const handleEnd = () => {
      this.duckBackgroundMusic(false);
      if (onEnd) onEnd();
    };

    utterance.onend = handleEnd;
    utterance.onerror = handleEnd;

    window.speechSynthesis.speak(utterance);
  }

  public speakTeacherCheer(
    message: string = 'Wonderful work, my superstar reader! You got it right!',
    onEnd?: () => void
  ) {
    this.playSuccessChime();
    this.speakTeacherNgozi(message, onEnd);
  }

  public stopSpeaking() {
    this.duckBackgroundMusic(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioVoice = new AudioVoiceEngine();
