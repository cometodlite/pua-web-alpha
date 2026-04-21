import { ATTRIBUTE_ADVANTAGE, ATTRIBUTES, attributeLabel, attributeMultiplier } from "./attributes.js";
import { CURRENCIES } from "./economy.js";

export { ATTRIBUTE_ADVANTAGE, ATTRIBUTES, CURRENCIES, attributeLabel, attributeMultiplier };

const CORE_CHARACTERS = [
  {
    id: "mepi",
    name: "메피",
    grade: "ANTIQUE POWER",
    element: "star",
    role: "서포터",
    icon: "✦",
    insaneSpec: true,
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

const GENERATED_CHARACTER_SPECS = [
  { id: "muzi", name: "뮤지", grade: "EPIC", element: "music", role: "서포터" },
  { id: "sale", name: "살레", grade: "EPIC", element: "water", role: "가드" },
  { id: "zeog", name: "저그", grade: "EPIC", element: "physical", role: "브레이커" },
  { id: "camelot", name: "카멜롯", grade: "EPIC", element: "light", role: "광역" },
  { id: "shogun", name: "쇼군", grade: "LEGENDARY", element: "fire", role: "브레이커" },
  { id: "louis", name: "루이", grade: "LEGENDARY", element: "lightning", role: "광역" },
  { id: "phillips", name: "필립스", grade: "LEGENDARY", element: "ice", role: "가드" },
  { id: "the-lost-king", name: "THE LOST KING", grade: "LEGENDARY", element: "dark", role: "디버퍼" },
  { id: "snowman", name: "스노우맨", grade: "LEGENDARY", element: "ice", role: "가드" },
  { id: "simian", name: "시미안", grade: "LEGENDARY", element: "wind", role: "브레이커" },
  { id: "ku", name: "쿠", grade: "LEGENDARY", element: "smoke", role: "디버퍼" },
  { id: "adel", name: "아델", grade: "LEGENDARY", element: "light", role: "서포터" },
  { id: "aroma", name: "아로마", grade: "MYTH", element: "poison", role: "디버퍼" },
  { id: "terrible-maker", name: "TERRIBLE MAKER.", grade: "MYTH", element: "void", role: "광역" },
  { id: "saya", name: "사야", grade: "MYTH", element: "imaginary", role: "브레이커" },
  { id: "cro", name: "크로", grade: "MYTH", element: "dark", role: "브레이커" },
  { id: "libe", name: "리베", grade: "ANCIENT", element: "star", role: "서포터" },
  { id: "nabu", name: "나부", grade: "ANCIENT", element: "quantum", role: "디버퍼" },
  { id: "plu", name: "플루", grade: "ANCIENT", element: "oblivion", role: "광역" },
  { id: "kapf", name: "카프", grade: "SPECIAL", element: "fire", role: "브레이커" },
  { id: "echo", name: "에코", grade: "SPECIAL", element: "music", role: "서포터" },
  { id: "andro", name: "안드로", grade: "SPECIAL", element: "physical", role: "가드" },
  { id: "welt", name: "웰트", grade: "SPECIAL", element: "void", role: "디버퍼" },
  { id: "prim", name: "프림", grade: "SPECIAL", element: "wind", role: "광역" },
  { id: "rose", name: "로제", grade: "SPECIAL", element: "poison", role: "디버퍼" },
  { id: "ala", name: "알라", grade: "SPECIAL", element: "lightning", role: "브레이커" },
  { id: "celine", name: "셀린", grade: "SPECIAL", element: "water", role: "서포터" },
  { id: "render", name: "렌더", grade: "SPECIAL", element: "smoke", role: "광역" },
  { id: "river", name: "리버", grade: "UNIQUE", element: "water", role: "서포터" },
  { id: "miranda", name: "미란다", grade: "UNIQUE", element: "light", role: "디버퍼" },
  { id: "roa", name: "로아", grade: "UNIQUE", element: "quantum", role: "브레이커" },
  { id: "intruder", name: "인트루더", grade: "UNIQUE", element: "oblivion", role: "브레이커" },
  { id: "glare", name: "글러", grade: "UNIQUE", element: "fire", role: "광역" },
  { id: "croc", name: "크로크", grade: "UNIQUE", element: "physical", role: "가드" },
  { id: "stella", name: "스텔라", grade: "UNIQUE", element: "star", role: "서포터" },
  { id: "snow", name: "스노우", grade: "UNIQUE", element: "ice", role: "디버퍼" },
  { id: "rusalka", name: "루살카", grade: "ANTIQUE POWER", element: "water", role: "서포터", insaneSpec: true },
  { id: "aria", name: "아리아", grade: "ANTIQUE POWER", element: "music", role: "광역", insaneSpec: true },
  { id: "aurora", name: "오로라", grade: "ANTIQUE POWER", element: "light", role: "가드", insaneSpec: true },
];

const GRADE_POWER = {
  RARE: 0.92,
  MYSTIC: 1.08,
  EPIC: 1,
  LEGENDARY: 1.08,
  MYTH: 1.18,
  ANCIENT: 1.28,
  SPECIAL: 1.36,
  UNIQUE: 1.48,
  "ANTIQUE POWER": 1.62,
};

const ROLE_BLUEPRINT = {
  서포터: {
    base: { hp: 202, atk: 30, def: 13, speed: 11, crit: 0.08 },
    growth: { hp: 40, atk: 5, def: 3, speed: 0.38 },
    ex: { type: "heal-buff", effectClass: "ex-heal", prefix: "공명 지원", description: "파티를 회복하고 속성 공명 효율을 올립니다." },
  },
  브레이커: {
    base: { hp: 216, atk: 39, def: 12, speed: 10, crit: 0.13 },
    growth: { hp: 42, atk: 7, def: 2, speed: 0.35 },
    ex: { type: "nuke", effectClass: "ex-slash", prefix: "집중 타격", description: "단일 대상에게 높은 피해를 줍니다." },
  },
  디버퍼: {
    base: { hp: 186, atk: 37, def: 11, speed: 12, crit: 0.14 },
    growth: { hp: 36, atk: 7, def: 2, speed: 0.42 },
    ex: { type: "vulnerability", effectClass: "ex-void", prefix: "흐름 교란", description: "피해를 주고 적이 받는 피해를 늘립니다." },
  },
  가드: {
    base: { hp: 270, atk: 25, def: 21, speed: 7, crit: 0.06 },
    growth: { hp: 54, atk: 4, def: 5, speed: 0.22 },
    ex: { type: "shield", effectClass: "ex-shield", prefix: "방벽 전개", description: "파티에 장벽을 만들고 적의 속도를 늦춥니다." },
  },
  광역: {
    base: { hp: 198, atk: 35, def: 12, speed: 11, crit: 0.11 },
    growth: { hp: 39, atk: 6, def: 3, speed: 0.38 },
    ex: { type: "vulnerability", effectClass: "ex-core", prefix: "파동 확산", description: "파동 피해와 약화를 동시에 남깁니다." },
  },
};

function buildGeneratedCharacter(spec, index) {
  const attribute = ATTRIBUTES[spec.element];
  const role = ROLE_BLUEPRINT[spec.role] || ROLE_BLUEPRINT["브레이커"];
  const gradePower = GRADE_POWER[spec.grade] || 1;
  const drift = 1 + (index % 5) * 0.025;
  return {
    ...spec,
    icon: attribute.sigil,
    passive: {
      id: `${spec.id}_signature`,
      name: `${attribute.name} 서명`,
      description: `${attribute.name} 속성의 흐름을 안정화해 ${spec.role} 역할 효율을 높입니다.`,
    },
    base: scaleStats(role.base, gradePower * drift),
    growth: scaleGrowth(role.growth, gradePower),
    ex: {
      name: `${attribute.name} ${role.ex.prefix}`,
      type: role.ex.type,
      cost: 100,
      power: Math.round(118 * gradePower + index * 2),
      cutin: `${attribute.name} 문양이 펼쳐지며 ${spec.name}의 코어가 반응합니다.`,
      effectClass: role.ex.effectClass,
      description: role.ex.description,
    },
  };
}

function scaleStats(stats, scale) {
  return {
    hp: Math.round(stats.hp * scale),
    atk: Math.round(stats.atk * scale),
    def: Math.round(stats.def * scale),
    speed: Number((stats.speed + (scale - 1) * 2).toFixed(1)),
    crit: Math.min(0.22, Number((stats.crit + (scale - 1) * 0.04).toFixed(3))),
  };
}

function scaleGrowth(growth, scale) {
  return {
    hp: Math.round(growth.hp * scale),
    atk: Math.round(growth.atk * scale),
    def: Math.round(growth.def * scale),
    speed: Number(growth.speed.toFixed(2)),
  };
}

export const CHARACTERS = [
  ...CORE_CHARACTERS,
  ...GENERATED_CHARACTER_SPECS.map((spec, index) => buildGeneratedCharacter(spec, index)),
];

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id);
}
