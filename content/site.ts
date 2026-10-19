// Everything a teammate might want to edit without touching layout code lives here.

export const MARKERS = {
  black: "#1b1c20",
  blue: "#1f5fd6",
  red: "#e23b2e",
  green: "#13945a",
  orange: "#f0861a",
  purple: "#7b4fd8",
  navy: "#0b2a5b",
} as const;

export type MarkerName = keyof typeof MARKERS;

export const site = {
  name: "The One-Line Wall",
  shortName: "One-Line Wall",
  school: "Washington and Lee",
  tagline: "Add one line. See what we make.",
  description:
    "Whiteboards where people walk by. One rule: you get one line. Connect it to someone else's or start something new. Made by W&L students, for W&L students.",
  course: "BUS 3340: Design Thinking",
  professor: "Prof. Gavin Fox",
  term: "Fall 2026",
  booth: {
    place: "the Commons",
    date: "Oct 19, 2026",
  },
};

// The prompt shown in the announcement bar until someone sets one from /admin.
export const DEFAULT_PROMPT = {
  title: "One line. Anywhere.",
  detail: "Connect it to someone else's, or start something new.",
  format: "one-line" as FormatId,
};

export type TeamMember = {
  name: string;
  color: MarkerName;
  // Optional fields render only when filled in.
  role?: string;
  year?: string;
  major?: string;
  line?: string; // their "one line": a sentence about why they care
  photo?: string; // e.g. "/team/drake.jpg" in /public/team
};

export const team: TeamMember[] = [
  { name: "Drake", color: "blue" },
  { name: "Julianna", color: "red" },
  { name: "Elliott", color: "green" },
  { name: "Jake", color: "orange" },
  { name: "Jackson", color: "purple" },
];

export type FormatId = "one-line" | "one-word" | "ask-answer" | "worst-idea" | "favorites" | "other";

export const formats: {
  id: FormatId;
  name: string;
  color: MarkerName;
  pitch: string;
  how: string;
  example: string;
}[] = [
  {
    id: "one-line",
    name: "One-Line Wall",
    color: "blue",
    pitch: "One stroke each. Connect it or start fresh.",
    how: "Grab a marker, add a single line, walk away. Come back tomorrow and see what it turned into.",
    example: "Where it started: our booth in the Commons.",
  },
  {
    id: "one-word",
    name: "One-Word Wall",
    color: "red",
    pitch: "One word per person, all week.",
    how: "Every person adds exactly one word. By Friday the board is a poem nobody wrote alone.",
    example: "Monday: “the”. Friday: a stanza.",
  },
  {
    id: "ask-answer",
    name: "Freshmen Ask, Seniors Answer",
    color: "green",
    pitch: "Questions from first-years. Answers from people who've been here.",
    how: "Scan the QR to drop a question. Upperclassmen answer on the board, in public, where it's seen and kept kind.",
    example: "“Where do people actually study during finals?”",
  },
  {
    id: "worst-idea",
    name: "Worst Idea → Flip It",
    color: "orange",
    pitch: "Name a problem. Pitch the worst fix. Then flip it.",
    how: "Someone writes a problem. The next person writes the worst possible solution. The next one flips it into a good one.",
    example: "Problem: the dining hall line. Worst fix: close at noon. Flip: …",
  },
  {
    id: "favorites",
    name: "Favorites Wall",
    color: "purple",
    pitch: "Your picks, out in the open.",
    how: "One category a week. Find your people, steal their recommendations, get out of the same-playlist loop.",
    example: "“Favorite place to eat in Lexington.”",
  },
];

export const cadences = [
  { name: "Always on", detail: "One permanent spot that's always the wall." },
  { name: "One-day takeover", detail: "A board shows up somewhere new for a day." },
  { name: "Weekly theme", detail: "Same board, new prompt every Monday." },
];

// Chips that prefill the pitch form. Straight from our brainstorm.
export const promptStarters: { text: string; format: FormatId }[] = [
  { text: "Favorite movie", format: "favorites" },
  { text: "Favorite show, and where you stream it", format: "favorites" },
  { text: "Favorite book", format: "favorites" },
  { text: "Favorite cologne or perfume", format: "favorites" },
  { text: "Favorite teacher", format: "favorites" },
  { text: "Favorite study spot", format: "favorites" },
  { text: "Favorite food", format: "favorites" },
  { text: "Favorite place to eat in town", format: "favorites" },
  { text: "Favorite superhero", format: "favorites" },
  { text: "Biggest fear", format: "favorites" },
  { text: "One word for this week", format: "one-word" },
  { text: "Worst possible way to fix parking", format: "worst-idea" },
];

export const formatLabel = (id: string) =>
  id === "other" ? "Something new" : (formats.find((f) => f.id === id)?.name ?? "Something new");

// The questions that stop people before they start.
export const hesitations = [
  "Where am I even allowed to write?",
  "What if it's embarrassing?",
  "Who's going to see it?",
  "I don't have time for this.",
  "I don't have a study group.",
  "Where's actually good to eat around here?",
  "Same playlist. Same shows. Again.",
  "Is this even for me?",
];

// What we heard in empathy interviews, grouped the way we grouped it on the board.
export const findings = [
  {
    word: "Place",
    color: "blue" as MarkerName,
    text: "Rooms are booked for silent study. Almost nowhere feels like it's for making something.",
  },
  {
    word: "People",
    color: "red" as MarkerName,
    text: "Ideas need someone to bounce off. A lot of us don't have that group.",
  },
  {
    word: "Pressure",
    color: "green" as MarkerName,
    text: "Full calendars and too many rules. There's no time to branch out.",
  },
  {
    word: "Access",
    color: "orange" as MarkerName,
    text: "Not enough resources, and not enough permission to just try.",
  },
];

export const quotes = [
  "I don't have time to take art classes.",
  "I am inspired by my surroundings.",
  "A big stopper of creativity is not feeling comfortable with the basics.",
];

export const classYears = ["'27", "'28", "'29", "'30", "Law", "Faculty/Staff"];
