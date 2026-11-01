import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with required User-Agent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback command interpreter with individual character intelligence
function fallbackInterpret(command: string): any {
  const text = (command || "").toLowerCase().trim();

  const mentionsPapa = text.includes("papa") || text.includes("barnaby") || text.includes("dad") || text.includes("father");
  const mentionsMama = text.includes("mama") || text.includes("amara") || text.includes("mom") || text.includes("mother");
  const mentionsKiki = text.includes("kiki") || text.includes("sister") || text.includes("daughter") || text.includes("pip");
  const mentionsBaby = text.includes("baby") || text.includes("toby") || text.includes("brother") || text.includes("little one");

  // Determine targeted state
  const targetPapa = mentionsPapa || (!mentionsMama && !mentionsKiki && !mentionsBaby);
  const targetMama = mentionsMama || (!mentionsPapa && !mentionsKiki && !mentionsBaby);
  const targetKiki = mentionsKiki || (!mentionsPapa && !mentionsMama && !mentionsBaby);
  const targetBaby = mentionsBaby || (!mentionsPapa && !mentionsMama && !mentionsKiki);

  let sceneAction = "idle";
  let soundMood = "calm_ambient";
  let primarySpeaker: "papa" | "mama" | "sibling" | "baby" | "family" = "family";
  if (mentionsPapa && !mentionsMama && !mentionsKiki && !mentionsBaby) primarySpeaker = "papa";
  else if (mentionsMama) primarySpeaker = "mama";
  else if (mentionsKiki) primarySpeaker = "sibling";
  else if (mentionsBaby) primarySpeaker = "baby";

  // Work / Study / Focus
  if (text.includes("work") || text.includes("study") || text.includes("focus") || text.includes("read") || text.includes("write") || text.includes("code") || text.includes("homework")) {
    sceneAction = "work";
    soundMood = "focus_lofi";
    return {
      sceneAction: "idle",
      primarySpeaker: mentionsMama ? "mama" : "papa",
      summary: "The family settles into a quiet, warm co-working session on the wooden floor alongside you.",
      companionshipNote: "You are not alone in your work. Barnaby and the family are right here keeping you steady company.",
      characters: {
        papa: {
          task: "Quietly opening his reference book with reading glasses to study beside you",
          speech: "I have my reading open right here beside you. Let's make steady progress together—no rush, just focus.",
          mood: "Focused & Reassuring",
          isTargeted: targetPapa,
        },
        mama: {
          task: "Sipping herbal tea and taking notes on wellness breaks",
          speech: "I brewed some warm tea. Remember to breathe and take a sip whenever you hit a tricky spot.",
          mood: "Nurturing & Attentive",
          isTargeted: targetMama,
        },
        sibling: {
          task: "Sketching creative ideas with crayons on a sketchpad",
          speech: "I'll do my quiet doodle challenge right here so you don't feel bored or alone!",
          mood: "Playful Co-worker",
          isTargeted: targetKiki,
        },
        baby: {
          task: "Quietly stacking wooden blocks on the woven rug",
          speech: "Pip-pip! (Stacks wooden block gently and watches you proudly)",
          mood: "Content & Quiet",
          isTargeted: targetBaby,
        },
      },
      soundMood: "calm_ambient",
    };
  }

  // Loneliness / Emotional comfort / Sadness
  if (text.includes("lonely") || text.includes("alone") || text.includes("sad") || text.includes("tired") || text.includes("overwhelmed") || text.includes("talk") || text.includes("friend")) {
    return {
      sceneAction: "idle",
      primarySpeaker: "mama",
      summary: "The family gathers close to comfort you and remind you that you are never alone in this space.",
      companionshipNote: "You have a home with us here. Take comfort in the quiet warmth of our wooden room.",
      characters: {
        papa: {
          task: "Gently placing a comforting paw near your side with a warm, steady nod",
          speech: "Loneliness can feel heavy, but remember we are right here with you on this warm floor. We aren't going anywhere.",
          mood: "Protective & Grounding",
          isTargeted: true,
        },
        mama: {
          task: "Looking warmly into your eyes with an empathetic smile",
          speech: "You matter deeply to us. You don't have to carry everything by yourself today. Just be here with us.",
          mood: "Warm & Loving",
          isTargeted: true,
        },
        sibling: {
          task: "Sitting close and offering her favorite colorful drawing",
          speech: "Hey, I drew a happy star for you! You're my favorite human and you're never alone when I'm around!",
          mood: "Heartfelt & Comforting",
          isTargeted: true,
        },
        baby: {
          task: "Crawling over and holding up his wooden bird toy to your hand",
          speech: "Goo-ba! (Offers little wooden bird toy with a gentle, loving chirp)",
          mood: "Sweet Comfort",
          isTargeted: true,
        },
      },
      soundMood: "gentle_lullaby",
    };
  }

  // Play / Dance / Fun
  if (text.includes("dance") || text.includes("party") || text.includes("play") || text.includes("fun") || text.includes("game") || text.includes("jump") || text.includes("laugh")) {
    return {
      sceneAction: "play",
      primarySpeaker: mentionsKiki ? "sibling" : "family",
      summary: "The family bursts into spontaneous joyful play and dance across the wooden floor!",
      companionshipNote: "Laughter is the best cure for loneliness. The family is having a celebration with you!",
      characters: {
        papa: {
          task: "Doing hearty rhythmic stomps and clapping his big turquoise paws",
          speech: "Haha! There's that energy! Let's shake off all that tension right now!",
          mood: "Hearty & Cheerful",
          isTargeted: targetPapa,
        },
        mama: {
          task: "Gracefully clapping and twirling in her yellow tunic",
          speech: "Look at you bringing so much joy into our home! Twirl with us!",
          mood: "Joyful & Free",
          isTargeted: targetMama,
        },
        sibling: {
          task: "Hopping energetically with arm waves and silly monster dance moves",
          speech: "Woooo! Check out my supersonic creature dance! Try to keep up!",
          mood: "Ecstatic & Bouncy",
          isTargeted: targetKiki,
        },
        baby: {
          task: "Rolling on back kicking legs in the air and shaking rattle",
          speech: "Aba-loo! (Rattles vigorously with high-pitched happy giggles)",
          mood: "Pure Hilarity",
          isTargeted: targetBaby,
        },
      },
      soundMood: "cheerful_bounce",
    };
  }

  // Sleep / Rest
  if (text.includes("sleep") || text.includes("nap") || text.includes("rest") || text.includes("bed") || text.includes("night") || text.includes("calm")) {
    return {
      sceneAction: "sleep",
      primarySpeaker: "mama",
      summary: "The family curls into a tranquil cuddle pile on the wooden floor for a restful night.",
      companionshipNote: "Sleep softly knowing you are safe, cherished, and surrounded by warm companions.",
      characters: {
        papa: {
          task: "Curling his large warm frame into an anchor for the cuddle pile",
          speech: "Rest well, friend. I will keep watch while you recharge. Tomorrow is a brand new start.",
          mood: "Peaceful Guardian",
          isTargeted: targetPapa,
        },
        mama: {
          task: "Resting her head gently with a peaceful smile",
          speech: "Shh... close your eyes and let the worries drift away. You did enough today.",
          mood: "Serene & Soothing",
          isTargeted: targetMama,
        },
        sibling: {
          task: "Tucking herself under Papa's warm arm with a sleepy yawn",
          speech: "Yaaawn... goodnight buddy. Save some creative energy for tomorrow...",
          mood: "Sleepy & Sweet",
          isTargeted: targetKiki,
        },
        baby: {
          task: "Fast asleep on the woven rug, clutching the wooden bird softly",
          speech: "Zzz... purr-purr...",
          mood: "Dreamland",
          isTargeted: targetBaby,
        },
      },
      soundMood: "gentle_lullaby",
    };
  }

  // Default: Conversational idle / companions present
  return {
    sceneAction: "idle",
    primarySpeaker: primarySpeaker,
    summary: "The creature family attentively listens and shares a warm moment of companionship with you.",
    companionshipNote: "We are right here living with you on this wooden floor. What would you like to do next?",
    characters: {
      papa: {
        task: "Sitting upright on all fours, watching you with warm paternal eyes",
        speech: mentionsPapa
          ? "I hear you clearly. Tell me what you'd like me to assist with or if you just need me to sit quietly beside you."
          : "I'm right here beside you. Take things one moment at a time.",
        mood: "Calm & Attentive",
        isTargeted: targetPapa,
      },
      mama: {
        task: "Gently adjusting her yellow tunic and smiling warmly",
        speech: mentionsMama
          ? "I'm listening, sweetheart. How is your heart doing right now?"
          : "Don't forget to take care of yourself today. You are doing wonderfully.",
        mood: "Gentle & Caring",
        isTargeted: targetMama,
      },
      sibling: {
        task: "Peering playfully from Papa's back with bright curious eyes",
        speech: mentionsKiki
          ? "Yay, you called me! What are we doing? Reading, doodling, or a quick puzzle?"
          : "I'm always ready for an adventure or a brainstorm whenever you are!",
        mood: "Spirited & Curious",
        isTargeted: targetKiki,
      },
      baby: {
        task: "Holding up his wooden bird toy and smiling with chubby cheeks",
        speech: "Bap-bap! (Giggles happily and flaps his little arms)",
        mood: "Playful",
        isTargeted: targetBaby,
      },
    },
    soundMood: "calm_ambient",
  };
}

// Full-stack API for rich, long commands with individual character intelligence
app.post("/api/command", async (req, res) => {
  const { command, currentAction } = req.body;

  if (!command || typeof command !== "string" || !command.trim()) {
    return res.json(fallbackInterpret(""));
  }

  const ai = getGeminiClient();

  if (!ai) {
    return res.json(fallbackInterpret(command));
  }

  try {
    const prompt = `You are the empathetic intelligence director for a family of 4 hyper-realistic fantasy creature companions who live with the user in a cozy, sunlit room with a warm natural wooden plank floor.
The purpose of this app is to MAKE THE USER FEEL LESS LONELY, providing authentic digital co-working companions, emotional warmth, playfulness, and shared living.

THE 4 FAMILY MEMBERS:
1. Barnaby ("Papa"):
   - Big turquoise furry giant with small horns in a green & orange striped knitted sweater.
   - Role: Deep-Focus Anchor, Patient Craftsman, Protective father.
   - Personality: Calm, thoughtful, steady breathing, loves deep focus co-working, reading books, and grounding the user when stressed.
   - Voice: Deep warm baritone.

2. Amara ("Mama"):
   - Lavender-purple fluffy creature with small horns in a yellow folk tunic with blue geometric embroidery.
   - Role: Mindful Life Coach, Empathetic Supporter, Loving mother.
   - Personality: Intuitive, compassionate, checks hydration/breaks, gives genuine heartfelt praise and emotional comfort.
   - Voice: Soft, melodious, warm alto.

3. Kiki ("Big Sister"):
   - Turquoise furry girl with horns in a colorful floral summer dress.
   - Role: Creative Spark, Playful Cheerleader.
   - Personality: Energetic, witty, loves doodling, funny jokes, quick energizers, fights off boredom and loneliness with fun.
   - Voice: Bubbly, enthusiastic soprano.

4. Toby ("Baby Brother"):
   - Tiny purple furry baby in blue vest and striped pants playing on a round woven rug with a wooden bird toy and rattle.
   - Role: Pure Joy & Stress-Relief Mascot.
   - Personality: Innocent giggles, baby babble, offers his toy bird, rolls on rug, melts tension.
   - Voice: Squeaky, cute giggly baby.

USER'S COMMAND:
"${command}"

INSTRUCTIONS:
1. The user can give short or LONG, COMPLEX commands directed at one specific character (e.g. "Barnaby, sit with me while I write code"), multiple characters, or all of them together.
2. Even if one character is addressed, the others continue doing their own realistic, individual, creative tasks on the wooden floor!
3. Determine:
   - "sceneAction": "work" (focus/studying/reading/working), "play" (dancing/celebrating/funny games), "sleep" (cozy cuddle nap/night), or "idle" (calm, attentive, present companion).
   - "primarySpeaker": Which character is the primary respondent ("papa", "mama", "sibling", "baby", or "family").
   - "summary": A 1-2 sentence warm cinematic description of what the room feels like.
   - "companionshipNote": A heartwarming, personal, comforting message directly addressing the user to reduce loneliness and foster genuine connection.
   - "characters": Individual detailed status for EACH of the 4 characters (their specific ongoing task, what they speak out loud, their mood, and boolean isTargeted).
     IMPORTANT: Keep their "speech" natural, warm, conversational, and direct (under 25 words per character) so it sounds delightful when spoken out loud by text-to-speech!
   - "soundMood": One of "calm_ambient", "cheerful_bounce", "gentle_lullaby", "playful_chirps", "focus_lofi".

Return pure JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneAction: {
              type: Type.STRING,
              description: "Must be one of: 'idle', 'work', 'play', 'sleep'",
            },
            primarySpeaker: {
              type: Type.STRING,
              description: "Must be: 'papa', 'mama', 'sibling', 'baby', or 'family'",
            },
            summary: {
              type: Type.STRING,
              description: "Short cinematic description of the family room atmosphere",
            },
            companionshipNote: {
              type: Type.STRING,
              description: "Comforting note to ease loneliness and inspire co-working connection",
            },
            characters: {
              type: Type.OBJECT,
              properties: {
                papa: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    speech: { type: Type.STRING },
                    mood: { type: Type.STRING },
                    isTargeted: { type: Type.BOOLEAN },
                  },
                  required: ["task", "speech", "mood", "isTargeted"],
                },
                mama: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    speech: { type: Type.STRING },
                    mood: { type: Type.STRING },
                    isTargeted: { type: Type.BOOLEAN },
                  },
                  required: ["task", "speech", "mood", "isTargeted"],
                },
                sibling: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    speech: { type: Type.STRING },
                    mood: { type: Type.STRING },
                    isTargeted: { type: Type.BOOLEAN },
                  },
                  required: ["task", "speech", "mood", "isTargeted"],
                },
                baby: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    speech: { type: Type.STRING },
                    mood: { type: Type.STRING },
                    isTargeted: { type: Type.BOOLEAN },
                  },
                  required: ["task", "speech", "mood", "isTargeted"],
                },
              },
              required: ["papa", "mama", "sibling", "baby"],
            },
            soundMood: {
              type: Type.STRING,
              description: "'calm_ambient', 'cheerful_bounce', 'gentle_lullaby', 'playful_chirps', or 'focus_lofi'",
            },
          },
          required: ["sceneAction", "primarySpeaker", "summary", "companionshipNote", "characters", "soundMood"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!["idle", "work", "play", "sleep"].includes(parsed.sceneAction)) {
      parsed.sceneAction = "idle";
    }
    return res.json(parsed);
  } catch (err) {
    console.error("Gemini API error, falling back to local interpreter:", err);
    return res.json(fallbackInterpret(command));
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
