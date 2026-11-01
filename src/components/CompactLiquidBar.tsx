import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { SceneActionType } from '../types';

interface CompactLiquidBarProps {
  sceneAction: SceneActionType;
  isProcessing: boolean;
  onSendCommand: (cmd: string) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const CompactLiquidBar: React.FC<CompactLiquidBarProps> = ({
  sceneAction,
  isProcessing,
  onSendCommand,
  soundMuted,
  onToggleSound,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const barRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Dynamic light reflection effect across the liquid glass
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    sound.playClick(560);
    onSendCommand(inputVal.trim());
    setInputVal('');
    setIsExpanded(false);
  };

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(transcript);
          onSendCommand(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onSendCommand]);

  const toggleVoice = () => {
    sound.playClick(500);
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const getStatusDot = () => {
    switch (sceneAction) {
      case 'work':
        return { label: 'Co-working', dotClass: 'bg-emerald-400' };
      case 'play':
        return { label: 'Playing', dotClass: 'bg-amber-400' };
      case 'sleep':
        return { label: 'Resting', dotClass: 'bg-indigo-400' };
      case 'idle':
      default:
        return { label: 'Here with you', dotClass: 'bg-teal-400' };
    }
  };

  const status = getStatusDot();

  return (
    <div
      id="compact-liquid-container"
      className="fixed top-4 left-4 z-40 pointer-events-auto transition-all duration-300"
    >
      {/* Sleek Liquid Glass Box at Top-Left */}
      <div
        ref={barRef}
        onMouseMove={handleMouseMove}
        id="compact-liquid-box"
        className={`relative rounded-2xl p-[1px] transition-all duration-300 backdrop-blur-2xl ${
          isExpanded ? 'w-80 sm:w-96 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'w-72 sm:w-80 shadow-[0_15px_35px_rgba(0,0,0,0.4)]'
        }`}
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(94, 234, 212, 0.45) 0%, rgba(255, 255, 255, 0.18) 35%, rgba(255, 255, 255, 0.05) 100%)`,
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.4), 0 0 20px rgba(45, 212, 191, 0.12)',
        }}
      >
        <div className="relative w-full bg-[#181a1f]/75 backdrop-blur-2xl rounded-2xl px-3 py-2 sm:py-2.5 flex flex-col gap-1.5 border border-white/10">
          {/* Subtle Top Metadata Header: Status & Sound Toggle */}
          <div className="flex items-center justify-between text-[11px] px-1 text-white/70">
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass} animate-pulse shadow-[0_0_6px_currentColor]`}></span>
              <span className="text-white/80 font-mono tracking-wide text-[10px] uppercase">
                {status.label}
              </span>
            </div>

            <button
              id="compact-sound-btn"
              onClick={onToggleSound}
              title={soundMuted ? 'Unmute family voice' : 'Mute family voice'}
              className="p-1 rounded text-white/50 hover:text-white transition-colors"
            >
              {soundMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-teal-300" />}
            </button>
          </div>

          {/* Liquid Glass Input Row */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5">
            <input
              id="liquid-command-input"
              type="text"
              value={inputVal}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => !inputVal && setIsExpanded(false)}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Talk or command (e.g. 'Barnaby, let's study')"
              className="w-full bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.14] border border-white/10 focus:border-teal-400/60 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none transition-all shadow-inner"
              disabled={isProcessing}
            />

            {/* Mic button */}
            <button
              id="compact-voice-btn"
              type="button"
              onClick={toggleVoice}
              title={isListening ? 'Listening...' : 'Voice command'}
              className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500/30 border-rose-400 text-rose-300 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-300" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {/* Send button */}
            <button
              id="compact-send-btn"
              type="submit"
              disabled={isProcessing || !inputVal.trim()}
              className="p-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#12181a] font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0 shadow-[0_0_12px_rgba(45,212,191,0.3)]"
            >
              {isProcessing ? (
                <span className="w-3.5 h-3.5 border-2 border-[#12181a] border-t-transparent rounded-full animate-spin block"></span>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>

          {/* Liquid Sheen Accent */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
        </div>
      </div>
    </div>
  );
};
