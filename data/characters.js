export const ATTRIBUTES = {
  star: { id: "star", name: "별", sigil: "✦", color: "#f0bd4f" },
  quantum: { id: "quantum", name: "양자", sigil: "◈", color: "#5ec8b7" },
  void: { id: "void", name: "공허", sigil: "●", color: "#a796ff" },
  imaginary: { id: "imaginary", name: "허수", sigil: "◇", color: "#ee6c58" },
};

export const ATTRIBUTE_ADVANTAGE = {
  star: "void",
  void: "imaginary",
  imaginary: "quantum",
  quantum: "star",
};

export const CURRENCIES = [
  { id: "quartz", name: "쿼츠", symbol: "Q", category: "재화" },
  { id: "bling", name: "블링", symbol: "B", category: "재화" },
  { id: "plate", name: "형판", symbol: "P", category: "재화" },
];

export const CHARACTERS = [
  {
    id: "mepi",
    name: "메피",
    grade: "ANTIQUE POWER",
    element: "star",
    role: "서포터",
    icon: "✦",
    passive: {
      id: "penta_blessing",
      name: "펜타 축복",
      description: "편성 시 파티 최대 HP가 증가하고 전투 시작 시 별빛 강화가 짧게 적용됩니다.",
    },
    base: { hp: 188, atk: 27, def: 14, speed: 12, crit: 0.09 },
    growth: { hp: 38, atk: 5, def: 3, speed: 0.5 },
    ex: {
      name: "펜타 리커버",
      type: "heal-buff",
      cost: 100,
      power: 112,
      cutin: "별빛 파동이 파티의 코어를 다시 맞춥니다.",
      effectClass: "ex-heal",
      description: "별빛 파동으로 파티를 회복하고 3턴 동안 별 속성 피해를 올립니다.",
    },
  },
  {
    id: "noark",
    name: "노아크",
    grade: "RARE",
    element: "quantum",
    role: "브레이커",
    icon: "◈",
    passive: {
      id: "quantum_edge",
      name: "양자 예각",
      description: "자신의 치명타 확률이 증가하고 EX가 감전 상태를 부여합니다.",
    },
    base: { hp: 214, atk: 36, def: 12, speed: 9, crit: 0.13 },
    growth: { hp: 42, atk: 7, def: 2, speed: 0.3 },
    ex: {
      name: "양자 절단",
      type: "nuke",
      cost: 100,
      power: 176,
      cutin: "얇은 양자 섬광이 적의 중심선을 가릅니다.",
      effectClass: "ex-slash",
      description: "날카로운 양자 섬광으로 단일 대상에게 높은 피해를 줍니다.",
    },
  },
  {
    id: "rivia",
    name: "리비아",
    grade: "MYSTIC",
    element: "void",
    role: "디버퍼",
    icon: "●",
    passive: {
      id: "void_trace",
      name: "공허 흔적",
      description: "전투 시작 시 적에게 약화를 부여하고 EX가 지속 피해를 남깁니다.",
    },
    base: { hp: 172, atk: 42, def: 10, speed: 13, crit: 0.16 },
    growth: { hp: 34, atk: 8, def: 2, speed: 0.5 },
    ex: {
      name: "공허 감압",
      type: "vulnerability",
      cost: 100,
      power: 132,
      cutin: "공허 압력이 낮아지며 방어막의 틈이 드러납니다.",
      effectClass: "ex-void",
      description: "공허 파동으로 피해를 주고 3턴 동안 적이 받는 피해를 늘립니다.",
    },
  },
  {
    id: "seha",
    name: "세하",
    grade: "RARE",
    element: "imaginary",
    role: "가드",
    icon: "◇",
    passive: {
      id: "imaginary_guard",
      name: "허수 전열",
      description: "방어막 효율이 증가하고 EX가 적의 속도를 낮춥니다.",
    },
    base: { hp: 268, atk: 24, def: 20, speed: 7, crit: 0.06 },
    growth: { hp: 54, atk: 4, def: 5, speed: 0.2 },
    ex: {
      name: "허수 장벽",
      type: "shield",
      cost: 100,
      power: 146,
      cutin: "허수 장벽이 전열 앞에서 다섯 겹으로 펼쳐집니다.",
      effectClass: "ex-shield",
      description: "허수 장벽으로 파티를 보호하고 다음 피해를 줄입니다.",
    },
  },
];

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id);
}

export function attributeMultiplier(attacker, defender) {
  if (ATTRIBUTE_ADVANTAGE[attacker] === defender) return 1.25;
  if (ATTRIBUTE_ADVANTAGE[defender] === attacker) return 0.8;
  return 1;
}

export function attributeLabel(attacker, defender) {
  const multiplier = attributeMultiplier(attacker, defender);
  if (multiplier > 1) return "유리";
  if (multiplier < 1) return "불리";
  return "중립";
}
