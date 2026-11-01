import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SceneActionType, CreatureId, AICommandResult, FAMILY_MEMBERS } from '../types';
import { sound } from '../utils/audioSynth';
import { voiceManager } from '../utils/speechVoice';

// Hyper-realistic 3D images with warm wooden plank floors
import woodenIdleImage from '../assets/images/family_wooden_idle_1789399785065.jpg';
import woodenPlayImage from '../assets/images/family_play_1789399830853.jpg';
import woodenSleepImage from '../assets/images/family_sleep_1789399846441.jpg';

interface CreatureStageProps {
  sceneAction: SceneActionType;
  lastResponse: AICommandResult | null;
  isProcessing: boolean;
  soundMuted: boolean;
}

interface ActiveSpeech {
  characterId: CreatureId;
  text: string;
  mood?: string;
}

export const CreatureStage: React.FC<CreatureStageProps> = ({
  sceneAction,
  lastResponse,
  isProcessing,
  soundMuted,
}) => {
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const [activeSpeech, setActiveSpeech] = useState<ActiveSpeech | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CreatureId | null>(null);
  const [companionshipMessage, setCompanionshipMessage] = useState<string | null>(
    "Welcome home. Barnaby, Amara, Kiki, and baby Toby are right here to work, relax, and keep you warm company."
  );
  const stageRef = useRef<HTMLDivElement>(null);
  const speechTimerRef = useRef<any>(null);

  // Sync mute state with voice manager
  useEffect(() => {
    voiceManager.isMuted = soundMuted;
  }, [soundMuted]);

  // Image source depending on active state
  const getStageImage = () => {
    switch (sceneAction) {
      case 'play':
        return woodenPlayImage;
      case 'sleep':
        return woodenSleepImage;
      case 'work':
      case 'idle':
      default:
        return woodenIdleImage;
    }
  };

  // When a new command response arrives, trigger character vocalization & speech bubbles
  useEffect(() => {
    if (!lastResponse) return;

    // Show companionship note
    if (lastResponse.companionshipNote) {
      setCompanionshipMessage(lastResponse.companionshipNote);
    }

    // Determine speaker
    const chars = lastResponse.characters;
    let speakerId: CreatureId = 'papa';

    if (lastResponse.primarySpeaker && lastResponse.primarySpeaker !== 'family') {
      speakerId = lastResponse.primarySpeaker;
    } else {
      // Pick first targeted character or papa
      if (chars.papa.isTargeted) speakerId = 'papa';
      else if (chars.mama.isTargeted) speakerId = 'mama';
      else if (chars.sibling.isTargeted) speakerId = 'sibling';
      else if (chars.baby.isTargeted) speakerId = 'baby';
    }

    const speakerData = chars[speakerId];
    if (speakerData && speakerData.speech) {
      setSelectedCharacter(speakerId);
      setActiveSpeech({
        characterId: speakerId,
        text: speakerData.speech,
        mood: speakerData.mood,
      });

      // Vocalize with character's distinct AI voice
      voiceManager.speakCharacter(speakerId, speakerData.speech);

      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => {
        setActiveSpeech(null);
      }, 7000);
    }
  }, [lastResponse]);

  // Pointer tracking for dynamic lighting & parallax across the wooden planks
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPointer({ x, y });
  }, []);

  // Click on an individual character in the family to interact directly
  const handleCharacterClick = useCallback(
    (charId: CreatureId, e: React.MouseEvent) => {
      e.stopPropagation();
      const member = FAMILY_MEMBERS[charId];
      setSelectedCharacter(charId);

      // Pick a personalized greeting from this character's intelligence
      const greetings = member.clickGreeting;
      const text = greetings[Math.floor(Math.random() * greetings.length)];

      setActiveSpeech({
        characterId: charId,
        text,
        mood: member.role,
      });

      setCompanionshipMessage(`${member.name} (${member.role}): "${text}"`);

      // Vocalize in their unique voice
      voiceManager.speakCharacter(charId, text);

      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => {
        setActiveSpeech(null);
      }, 6500);
    },
    []
  );

  // Character speech bubble screen coordinates
  const getBubblePosition = (charId: CreatureId) => {
    switch (charId) {
      case 'sibling':
        return 'top-[16%] left-[24%] sm:left-[27%]';
      case 'papa':
        return 'top-[36%] left-[18%] sm:left-[24%]';
      case 'baby':
        return 'bottom-[24%] left-[50%] sm:left-[54%]';
      case 'mama':
      default:
        return 'top-[28%] right-[16%] sm:right-[22%]';
    }
  };

  return (
    <div
      ref={stageRef}
      id="creature-family-stage"
      onPointerMove={handlePointerMove}
      className="relative w-full h-full overflow-hidden select-none bg-[#17191d]"
    >
      {/* 3D Visual Layer: Hyper-realistic wooden floor and 4 creature family members */}
      <div
        className="absolute inset-0 w-full h-full transform-gpu transition-transform duration-700 ease-out scale-105"
        style={{
          transform: `translate(${(pointer.x - 0.5) * -14}px, ${(pointer.y - 0.5) * -10}px)`,
        }}
      >
        <img
          src={getStageImage()}
          alt="Hyper-realistic creature family on warm wooden plank floor"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Dynamic Warm Ambient Sunlight across the Wooden Planks */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${pointer.x * 100}% ${pointer.y * 100}%, rgba(254, 240, 138, 0.25) 0%, rgba(0, 0, 0, 0.2) 75%)`,
          }}
        />

        {/* Gentle Wood Floor Grain Specular Sheen */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 80%)`,
          }}
        />
      </div>

      {/* Interactive Click Zones for Each Family Member */}
      {/* 1. Barnaby (Papa) */}
      <button
        id="character-btn-papa"
        type="button"
        onClick={(e) => handleCharacterClick('papa', e)}
        title="Barnaby (Father) - Click to talk"
        className="absolute left-[10%] bottom-[12%] w-[38%] h-[56%] rounded-3xl cursor-pointer focus:outline-none group z-10 transition-all"
      >
        <div className="w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-teal-300/40 bg-teal-400/5 backdrop-blur-[1px] flex items-end justify-center pb-3">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-teal-200 border border-teal-400/30 tracking-wide shadow-lg">
            Barnaby (Papa)
          </span>
        </div>
      </button>

      {/* 2. Kiki (Big Sister) on Papa's back */}
      <button
        id="character-btn-sibling"
        type="button"
        onClick={(e) => handleCharacterClick('sibling', e)}
        title="Kiki (Big Sister) - Click to talk"
        className="absolute left-[18%] top-[14%] w-[20%] h-[32%] rounded-full cursor-pointer focus:outline-none group z-20 transition-all"
      >
        <div className="w-full h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-amber-300/40 bg-amber-400/5 backdrop-blur-[1px] flex items-start justify-center pt-2">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-amber-200 border border-amber-400/30 tracking-wide shadow-lg">
            Kiki (Sister)
          </span>
        </div>
      </button>

      {/* 3. Toby (Baby Brother) on the woven rug */}
      <button
        id="character-btn-baby"
        type="button"
        onClick={(e) => handleCharacterClick('baby', e)}
        title="Toby (Baby Brother) - Click to play"
        className="absolute left-[48%] bottom-[10%] w-[24%] h-[34%] rounded-3xl cursor-pointer focus:outline-none group z-10 transition-all"
      >
        <div className="w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-indigo-300/40 bg-indigo-400/5 backdrop-blur-[1px] flex items-end justify-center pb-2">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-indigo-200 border border-indigo-400/30 tracking-wide shadow-lg">
            Toby (Baby)
          </span>
        </div>
      </button>

      {/* 4. Amara (Mama) */}
      <button
        id="character-btn-mama"
        type="button"
        onClick={(e) => handleCharacterClick('mama', e)}
        title="Amara (Mother) - Click to talk"
        className="absolute right-[8%] bottom-[12%] w-[32%] h-[58%] rounded-3xl cursor-pointer focus:outline-none group z-10 transition-all"
      >
        <div className="w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-purple-300/40 bg-purple-400/5 backdrop-blur-[1px] flex items-end justify-center pb-3">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-purple-200 border border-purple-400/30 tracking-wide shadow-lg">
            Amara (Mama)
          </span>
        </div>
      </button>

      {/* Dynamic Floating Liquid Glass Speech Bubble when a character talks */}
      <AnimatePresence>
        {activeSpeech && (
          <motion.div
            key={`speech-${activeSpeech.characterId}-${activeSpeech.text}`}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`absolute z-30 pointer-events-none max-w-[280px] sm:max-w-xs ${getBubblePosition(
              activeSpeech.characterId
            )}`}
          >
            {/* Liquid glass card */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
              <div className="bg-[#121418]/85 backdrop-blur-xl rounded-2xl p-3.5 border border-white/10 shadow-inner">
                {/* Character Name Tag */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-xs text-teal-300 tracking-wide">
                    {FAMILY_MEMBERS[activeSpeech.characterId].name}
                  </span>
                  <span className="text-[10px] text-white/50 font-mono uppercase">
                    {FAMILY_MEMBERS[activeSpeech.characterId].relation}
                  </span>
                </div>

                {/* Spoken text */}
                <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-sans">
                  "{activeSpeech.text}"
                </p>

                {/* Subtitle / ongoing action */}
                {lastResponse?.characters?.[activeSpeech.characterId]?.task && (
                  <p className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-teal-200/70 italic line-clamp-2">
                    {lastResponse.characters[activeSpeech.characterId].task}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing indicator in top-right when AI is thinking */}
      {isProcessing && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>Family is listening...</span>
        </div>
      )}

      {/* Non-intrusive Companionship Subtitle Pill at the bottom center */}
      <AnimatePresence>
        {companionshipMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-30 pointer-events-none"
          >
            <div className="bg-[#101216]/75 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <p className="text-xs text-white/85 leading-normal font-sans">
                {companionshipMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Gentle Dust Motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`mote-${i}`}
            className="absolute rounded-full bg-amber-200/30 blur-[0.5px]"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              left: `${15 + i * 11}%`,
              top: `${20 + (i * 9) % 65}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-6, 6, -6],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: 5 + (i % 4) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};
