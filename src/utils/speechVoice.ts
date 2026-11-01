import { CreatureId, FAMILY_MEMBERS } from '../types';
import { sound } from './audioSynth';

class VoiceManager {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  public isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
    }
  }

  public speakCharacter(
    characterId: CreatureId,
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (this.isMuted || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // First, play a cute procedural creature vocalization chime
    const member = FAMILY_MEMBERS[characterId];
    if (characterId === 'baby') {
      sound.playCreatureChirp('playful_chirps');
    } else if (characterId === 'papa') {
      sound.playClick(220);
    } else if (characterId === 'mama') {
      sound.playCreatureChirp('curious_warble');
    } else {
      sound.playCreatureChirp('cheerful_bounce');
    }

    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();

      // Strip stage directions like (giggles) or (shakes rattle) for clean speech
      const cleanedSpeech = text.replace(/\([^)]*\)/g, '').trim();
      if (!cleanedSpeech) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedSpeech);

      // Distinct voice attributes per character
      utterance.pitch = member.voicePitch;
      utterance.rate = member.voiceRate;
      utterance.volume = 0.95;

      // Select matching voice gender/tone if available
      if (this.voices.length > 0) {
        if (characterId === 'papa') {
          const maleVoice = this.voices.find(
            (v) =>
              (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Guy')) &&
              v.lang.startsWith('en')
          );
          if (maleVoice) utterance.voice = maleVoice;
        } else if (characterId === 'mama') {
          const femaleVoice = this.voices.find(
            (v) =>
              (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google US English')) &&
              v.lang.startsWith('en')
          );
          if (femaleVoice) utterance.voice = femaleVoice;
        } else if (characterId === 'sibling') {
          const youngVoice = this.voices.find(
            (v) =>
              (v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Junior') || v.name.includes('en-US')) &&
              v.lang.startsWith('en')
          );
          if (youngVoice) utterance.voice = youngVoice;
        }
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (onEnd) onEnd();
    }
  }
}

export const voiceManager = new VoiceManager();
