export const BASE_ATTRIBUTE_IDS = [
  "water",
  "fire",
  "ice",
  "lightning",
  "wind",
  "light",
  "dark",
  "poison",
  "smoke",
];

export const SPECIAL_ATTRIBUTE_IDS = [
  "physical",
  "void",
  "quantum",
  "imaginary",
  "star",
  "music",
  "oblivion",
];

export const ATTRIBUTES = {
  water: { id: "water", name: "물", sigil: "W", color: "#60b6ff", type: "basic" },
  fire: { id: "fire", name: "화염", sigil: "F", color: "#ee6c58", type: "basic" },
  ice: { id: "ice", name: "얼음", sigil: "I", color: "#b5e7ff", type: "basic" },
  lightning: { id: "lightning", name: "번개", sigil: "L", color: "#f0bd4f", type: "basic" },
  wind: { id: "wind", name: "바람", sigil: "A", color: "#8fcf68", type: "basic" },
  light: { id: "light", name: "빛", sigil: "H", color: "#f5efe1", type: "basic" },
  dark: { id: "dark", name: "암", sigil: "D", color: "#786e92", type: "basic" },
  poison: { id: "poison", name: "독", sigil: "P", color: "#a1d45f", type: "basic" },
  smoke: { id: "smoke", name: "연기", sigil: "S", color: "#a8ada6", type: "basic" },
  physical: { id: "physical", name: "물리", sigil: "M", color: "#c8a57a", type: "special" },
  void: { id: "void", name: "공허", sigil: "●", color: "#a796ff", type: "special" },
  quantum: { id: "quantum", name: "양자", sigil: "◈", color: "#5ec8b7", type: "special" },
  imaginary: { id: "imaginary", name: "허수", sigil: "◇", color: "#ee6c58", type: "special" },
  star: { id: "star", name: "별", sigil: "✦", color: "#f0bd4f", type: "special" },
  music: { id: "music", name: "음악", sigil: "♪", color: "#d5a6ff", type: "special" },
  oblivion: { id: "oblivion", name: "망각", sigil: "Ø", color: "#d7d2c4", type: "special" },
};

export const ATTRIBUTE_RELATIONS = {
  water: {
    strong: ["fire", "smoke", "lightning"],
    weak: ["ice", "poison", "oblivion"],
  },
  fire: {
    strong: ["ice", "wind", "smoke", "poison"],
    weak: ["water", "lightning", "ice", "oblivion"],
  },
  ice: {
    strong: ["fire", "poison", "water"],
    weak: ["wind", "lightning", "smoke"],
  },
  lightning: {
    strong: ["wind", "fire", "smoke"],
    weak: ["water", "quantum", "oblivion"],
  },
  wind: {
    strong: ["ice", "smoke"],
    weak: ["fire", "poison", "water"],
  },
  light: {
    strong: ["dark", "oblivion"],
    weak: ["dark", "smoke"],
  },
  dark: {
    strong: ["light"],
    weak: ["light", "oblivion", "poison"],
  },
  poison: {
    strong: ["physical", "wind", "dark"],
    weak: ["fire", "ice", "water"],
  },
  smoke: {
    strong: ["ice", "oblivion"],
    weak: ["water", "lightning", "fire"],
  },
  physical: {
    strong: ["ice", "smoke", "music"],
    weak: ["fire", "poison", "oblivion"],
  },
  void: {
    strong: ["imaginary", "music", "star"],
    weak: ["imaginary", "oblivion"],
  },
  quantum: {
    strong: ["physical", "lightning", "ice"],
    weak: ["imaginary", "oblivion"],
  },
  imaginary: {
    strong: ["quantum", "void"],
    weak: ["oblivion"],
  },
  star: {
    strong: ["fire", "lightning", "imaginary", "void"],
    weak: ["ice", "oblivion"],
  },
  music: {
    strong: ["quantum", "imaginary", "oblivion"],
    weak: ["void", "physical"],
  },
  oblivion: {
    strong: ["void", "imaginary", "star", "dark"],
    weak: ["light", "water"],
  },
};

export const ATTRIBUTE_TIERS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
].map((label, index) => ({ tier: index + 1, label }));

export const ATTRIBUTE_ADVANTAGE = Object.fromEntries(
  Object.entries(ATTRIBUTE_RELATIONS).map(([id, relation]) => [id, relation.strong[0]])
);

export function getAttribute(id) {
  return ATTRIBUTES[id] || ATTRIBUTES.star;
}

export function attributeMultiplier(attacker, defender) {
  const relation = ATTRIBUTE_RELATIONS[attacker];
  if (!relation) return 1;
  if (relation.strong.includes(defender)) return 1.25;
  if (relation.weak.includes(defender)) return 0.8;
  return 1;
}

export function attributeLabel(attacker, defender) {
  const multiplier = attributeMultiplier(attacker, defender);
  if (multiplier > 1) return "유리";
  if (multiplier < 1) return "불리";
  return "중립";
}

export function recommendedAttributeFor(enemyElement) {
  const match = Object.entries(ATTRIBUTE_RELATIONS).find(([, relation]) => {
    return relation.strong.includes(enemyElement);
  });
  return match?.[0] || "star";
}

export function tierLabel(tier) {
  return ATTRIBUTE_TIERS.find((entry) => entry.tier === Number(tier))?.label || "I";
}

export function specialChanceForTier(tier) {
  const level = Math.max(1, Math.min(15, Number(tier) || 1));
  return Math.min(0.55, 0.04 + (level - 1) * 0.035);
}

export function rollAttributeFromTemplate(tier, owned = [], random = Math.random) {
  const ownedSet = new Set(owned);
  const specialChance = specialChanceForTier(tier);
  const preferredPool = random() < specialChance ? SPECIAL_ATTRIBUTE_IDS : BASE_ATTRIBUTE_IDS;
  const fallbackPool = preferredPool === SPECIAL_ATTRIBUTE_IDS ? BASE_ATTRIBUTE_IDS : SPECIAL_ATTRIBUTE_IDS;
  const openCandidates = preferredPool.filter((id) => !ownedSet.has(id));
  const fallbackCandidates = fallbackPool.filter((id) => !ownedSet.has(id));
  const candidates = openCandidates.length ? openCandidates : fallbackCandidates.length ? fallbackCandidates : Object.keys(ATTRIBUTES);
  return candidates[Math.floor(random() * candidates.length)];
}
