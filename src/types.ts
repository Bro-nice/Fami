export type SceneActionType = 'idle' | 'work' | 'play' | 'sleep';

export type CreatureId = 'papa' | 'mama' | 'sibling' | 'baby';

export interface CharacterInfo {
  id: CreatureId;
  name: string;
  relation: string;
  role: string;
  furColor: string;
  clothing: string;
  traits: string;
  specialty: string;
  voicePitch: number;
  voiceRate: number;
  clickGreeting: string[];
}

export interface CharacterActivity {
  task: string;
  speech: string;
  mood: string;
  isTargeted: boolean;
}

export interface AICommandResult {
  sceneAction: SceneActionType;
  primarySpeaker: CreatureId | 'family';
  summary: string;
  companionshipNote: string;
  characters: {
    papa: CharacterActivity;
    mama: CharacterActivity;
    sibling: CharacterActivity;
    baby: CharacterActivity;
  };
  soundMood: 'calm_ambient' | 'cheerful_bounce' | 'gentle_lullaby' | 'playful_chirps' | 'focus_lofi';
}

export const FAMILY_MEMBERS: Record<CreatureId, CharacterInfo> = {
  papa: {
    id: 'papa',
    name: 'Barnaby',
    relation: 'Father',
    role: 'Deep-Focus Anchor & Warm Craftsman',
    furColor: 'Soft turquoise textured fur with curved horns',
    clothing: 'Green and warm orange striped knitted sweater',
    traits: 'Calm, patient, deeply loyal, steady breathing, loves reading and co-working',
    specialty: 'Co-working partner, deep focus companion, anxiety grounding',
    voicePitch: 0.65,
    voiceRate: 0.9,
    clickGreeting: [
      "I'm right here beside you. Take a steady breath—we'll get through this task together.",
      "You're not alone in this room. Focus on one small step at a time.",
      "Good to see you taking a moment. I'll stay right here while you work.",
    ],
  },
  mama: {
    id: 'mama',
    name: 'Amara',
    relation: 'Mother',
    role: 'Mindful Life Coach & Empathetic Nurturer',
    furColor: 'Gentle lavender-purple fluffy fur with horns',
    clothing: 'Yellow patterned folk tunic with blue geometric embroidery',
    traits: 'Intuitive, caring, celebrates small wins, reminds you to hydrate and take breaks',
    specialty: 'Emotional support, gentle accountability, wellness check-ins',
    voicePitch: 1.05,
    voiceRate: 0.95,
    clickGreeting: [
      "Hello, dear! Have you had some water recently? I'm so proud of the effort you're giving.",
      "Remember: progress is quiet and steady. You are doing so much better than you think.",
      "Whenever you need a mindful pause, I'm right here to breathe with you.",
    ],
  },
  sibling: {
    id: 'sibling',
    name: 'Kiki',
    relation: 'Big Sister',
    role: 'Creative Spark & Playful Cheerleader',
    furColor: 'Turquoise fuzzy fur with little horns',
    clothing: 'Colorful floral summer dress',
    traits: 'High energy, witty, imaginative, draws doodles, breaks through brain fog',
    specialty: 'Creative brainstorming, playful breaks, banishing boredom & loneliness',
    voicePitch: 1.45,
    voiceRate: 1.15,
    clickGreeting: [
      "Hey! Need an idea spark or a 2-minute stretch? I've got your back!",
      "Wooo! You're making progress! Want me to doodle something silly for your desk?",
      "No giving up allowed today! We're in this co-working squad together!",
    ],
  },
  baby: {
    id: 'baby',
    name: 'Toby',
    relation: 'Baby Brother',
    role: 'Pure Joy & Stress-Relief Mascot',
    furColor: 'Plump baby-purple fluffy fur with tiny soft horns',
    clothing: 'Cozy blue vest and warm striped trousers',
    traits: 'Innocent giggles, shakes wooden rattle, plays with toy bird on the woven rug',
    specialty: 'Instant smile generator, lighthearted comic relief',
    voicePitch: 1.85,
    voiceRate: 1.3,
    clickGreeting: [
      "Giggle-goo! (Shakes wooden rattle happily at you!)",
      "Pip-pip! (Holds out tiny wooden bird toy to share with you)",
      "Aba-boo! (Rolls joyfully on the woven rug and giggles)",
    ],
  },
};

