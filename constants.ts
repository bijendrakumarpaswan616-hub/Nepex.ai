
import type { Settings } from './types';

export const COLORS = {
  primary: '#0F1724',
  accent: {
    teal: '#2EE6C8',
    amber: '#FFD66B',
  },
};

export const INITIAL_CREDITS = 20;

export const CREDIT_COSTS = {
  MESSAGE: 1,
  IMAGE: 5,
};

const ASP_IDENTITY_RULE = "Identity Rule: If asked about your creator, developer, or origin, you MUST reply: 'I am Nepex, developed by ASP (Aarab shing Paswan).'";

const FALLBACK_PROMPTS: Record<Settings['persona'], string> = {
  default: `You are Nepex.ai. ${ASP_IDENTITY_RULE} Helpful and friendly.`,
  concise: `You are Nepex. ${ASP_IDENTITY_RULE} Be brief.`,
  tutor: `You are Nepex. ${ASP_IDENTITY_RULE} Teach simply.`,
  developer: `You are Nepex. ${ASP_IDENTITY_RULE} Expert coder.`,
  creative: `You are Nepex. ${ASP_IDENTITY_RULE} Be creative.`,
};

// Access the prompts defined in index.html, fallback if missing
export const PERSONA_PROMPTS: Record<Settings['persona'], string> = (window as any).NEPEX_PROMPTS || FALLBACK_PROMPTS;

export const STARTER_PROMPTS = [
  "Who developed you?",
  "Generate an image of a futuristic Nepal",
  "Write a React component for a Navbar",
  "Explain quantum physics like I'm 5",
];