const affirmations = [
  "I'm here with you, and it's completely okay to feel exactly how you feel right now.",
  "Thank you for trusting me with this. Your feelings are valid and they matter.",
  "You don't have to go through this alone—I'm right here alongside you.",
  "It's brave to share what's on your mind. Taking this step shows real strength.",
];

const groundingSuggestions = [
  "Take a slow breath in for a count of four, hold for two, and gently breathe out for six.",
  "Try naming five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste.",
  "Relax your shoulders, unclench your jaw, and let your hands rest softly in your lap.",
  "Place one hand on your heart and one on your belly, and feel the rise and fall as you breathe.",
];

const gentlePrompts = [
  "What do you wish someone would say to you right now?",
  "Is there a small comfort you can offer yourself in this moment?",
  "Would you like to reflect on a time you felt supported and what helped then?",
  "If your best friend felt the way you do, what kindness would you offer them?",
];

const gratitudeTouches = [
  "It's a gift to share this space with you.",
  "Thank you for letting me know what's on your heart.",
  "Sharing this moment means a lot to me.",
  "Your voice matters here, today and every day.",
];

const crisisKeywords = [
  "suicide",
  "kill myself",
  "end it all",
  "self harm",
  "hurt myself",
  "can't go on",
];

function detectCrisis(message: string) {
  const lower = message.toLowerCase();
  return crisisKeywords.some((keyword) => lower.includes(keyword));
}

function describeMood(message: string) {
  const lower = message.toLowerCase();
  if (/\b(lonely|alone|isolated|disconnected)\b/.test(lower)) return "loneliness";
  if (/\b(anxious|nervous|worried|panicking|panic)\b/.test(lower)) return "anxiety";
  if (/\b(sad|down|depressed|empty|tired|exhausted)\b/.test(lower)) return "low mood";
  if (/\b(angry|frustrated|upset|irritated)\b/.test(lower)) return "frustration";
  if (/\b(overwhelmed|burned out|burnt out|stressed)\b/.test(lower)) return "overwhelm";
  return "mixed emotions";
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export type CompanionResponse = {
  message: string;
  prompts: string[];
  tone: string;
  crisis: boolean;
};

export async function generateCompanionResponse(
  userMessage: string,
): Promise<CompanionResponse> {
  const crisis = detectCrisis(userMessage);
  if (crisis) {
    return {
      crisis: true,
      tone: "crisis support",
      message:
        "I'm really concerned about your safety. You deserve immediate, compassionate care. Please contact your local emergency number or reach out to your closest crisis hotline right now. In the United States you can dial or text 988 for the Suicide & Crisis Lifeline. If you can, let someone nearby know you need support urgently.",
      prompts: [
        "Call a trusted friend, family member, or your therapist right away.",
        "If you're in the United States, reach out to 988 (call or text) or use online chat at 988lifeline.org.",
        "If you're elsewhere, visit https://www.opencounseling.com/suicide-hotlines for a list of international crisis lines.",
      ],
    };
  }

  const tone = describeMood(userMessage);
  const core = pick(affirmations);
  const gratitude = pick(gratitudeTouches);
  const grounding = pick(groundingSuggestions);
  const prompt = pick(gentlePrompts);

  const message = [
    core,
    `It sounds like you're experiencing ${tone}. Would it feel okay if we take a gentle step together?`,
    grounding,
    gratitude,
  ].join(" ");

  return {
    crisis: false,
    tone,
    message,
    prompts: [
      prompt,
      "Would a tiny act of self-care, like sipping water or stretching, feel supportive right now?",
      "Is there someone in your life you could text or call, even just to say hello?",
    ],
  };
}
