import React, { useState, useCallback } from 'react';
import { SceneActionType, AICommandResult } from './types';
import { CompactLiquidBar } from './components/CompactLiquidBar';
import { CreatureStage } from './components/CreatureStage';
import { sound } from './utils/audioSynth';
import { voiceManager } from './utils/speechVoice';

export default function App() {
  const [sceneAction, setSceneAction] = useState<SceneActionType>('idle');
  const [lastResponse, setLastResponse] = useState<AICommandResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Send command to backend Gemini API or fallback
  const handleSendCommand = useCallback(
    async (commandText: string) => {
      if (!commandText.trim()) return;

      setIsProcessing(true);

      try {
        const response = await fetch('/api/command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: commandText,
            currentAction: sceneAction,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data: AICommandResult = await response.json();

        setSceneAction(data.sceneAction || 'idle');
        setLastResponse(data);
      } catch (err) {
        console.warn('Backend command error, using client-side fallback:', err);
        // Direct client fallback
        const lower = commandText.toLowerCase();
        let action: SceneActionType = 'idle';
        if (lower.includes('work') || lower.includes('study') || lower.includes('focus')) action = 'work';
        else if (lower.includes('dance') || lower.includes('play') || lower.includes('fun')) action = 'play';
        else if (lower.includes('sleep') || lower.includes('rest') || lower.includes('nap')) action = 'sleep';

        const fallbackResult: AICommandResult = {
          sceneAction: action,
          primarySpeaker: lower.includes('mama') ? 'mama' : lower.includes('kiki') ? 'sibling' : lower.includes('baby') ? 'baby' : 'papa',
          summary: 'The family stays right by your side in the cozy sunlit room.',
          companionshipNote: "We're here with you on this warm wooden floor. Let's do this together.",
          characters: {
            papa: {
              task: 'Reading quietly and anchoring your workspace',
              speech: "I'm right here with you. Let's make steady progress together.",
              mood: 'Calm & Reassuring',
              isTargeted: true,
            },
            mama: {
              task: 'Sipping tea and ensuring you stay hydrated',
              speech: 'Remember to drink water, dear. I believe in you.',
              mood: 'Warm & Nurturing',
              isTargeted: lower.includes('mama'),
            },
            sibling: {
              task: 'Sketching colorful fun doodles',
              speech: "You've got this! Tell me when you need a 2-minute stretch break!",
              mood: 'Energetic Cheerleader',
              isTargeted: lower.includes('kiki') || lower.includes('sister'),
            },
            baby: {
              task: 'Playing happily with his wooden bird toy on the woven rug',
              speech: 'Pip-pip! (Giggles joyfully)',
              mood: 'Sweet Comfort',
              isTargeted: lower.includes('baby') || lower.includes('toby'),
            },
          },
          soundMood: 'calm_ambient',
        };

        setSceneAction(action);
        setLastResponse(fallbackResult);
      } finally {
        setIsProcessing(false);
      }
    },
    [sceneAction]
  );

  const handleToggleSound = useCallback(() => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    sound.isMuted = nextMuted;
    voiceManager.isMuted = nextMuted;
    if (!nextMuted) {
      sound.playClick(640);
    } else {
      voiceManager.stopSpeaking();
    }
  }, [soundMuted]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#17191d] text-white select-none">
      {/* Sleek, Non-Congested Liquid Glass Command Box at Top-Left */}
      <CompactLiquidBar
        sceneAction={sceneAction}
        isProcessing={isProcessing}
        onSendCommand={handleSendCommand}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Full-Screen Hyper-Realistic 3D Stage with Wooden Floor & 4 Live Companions */}
      <CreatureStage
        sceneAction={sceneAction}
        lastResponse={lastResponse}
        isProcessing={isProcessing}
        soundMuted={soundMuted}
      />
    </div>
  );
}
