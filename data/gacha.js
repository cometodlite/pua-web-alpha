import { getCharacter } from "./characters.js";

export const GACHA_RARITIES = [
  { grade: "EPIC", rate: 50, characters: ["muzi", "sale", "zeog", "camelot"] },
  { grade: "LEGENDARY", rate: 25, characters: ["shogun", "louis", "phillips", "the-lost-king", "snowman", "simian", "ku", "adel"] },
  { grade: "MYTH", rate: 13, characters: ["aroma", "terrible-maker", "saya", "cro"] },
  { grade: "ANCIENT", rate: 4.65, characters: ["libe", "nabu", "plu"] },
  { grade: "SPECIAL", rate: 4, characters: ["kapf", "echo", "andro", "welt", "prim", "rose", "ala", "celine", "render"] },
  { grade: "UNIQUE", rate: 0.9, characters: ["river", "miranda", "roa", "intruder", "glare", "croc", "stella", "snow"] },
  { grade: "ANTIQUE POWER", rate: 0.1, characters: ["rusalka", "aria", "aurora", "mepi"] },
];

export const GACHA = {
  name: "양자 코어 추첨",
  singleCost: 300,
  tenCost: 2700,
  pityTarget: 90,
  duplicateRewards: {
    default: { shards: 10, bling: 60 },
    EPIC: { shards: 10, bling: 60 },
    LEGENDARY: { shards: 12, bling: 70 },
    MYTH: { shards: 14, bling: 85 },
    ANCIENT: { shards: 16, bling: 100, plate: 1 },
    SPECIAL: { shards: 18, bling: 120, plate: 1 },
    UNIQUE: { shards: 20, bling: 150, plate: 2 },
    MYSTIC: { shards: 14, bling: 90 },
    "ANTIQUE POWER": { shards: 25, bling: 220, plate: 3 },
  },
  pool: GACHA_RARITIES.flatMap((rarity) => {
    const weight = rarity.rate / rarity.characters.length;
    return rarity.characters
      .filter((id) => getCharacter(id))
      .map((character) => ({ character, grade: rarity.grade, weight }));
  }),
};

export function gachaRateRows() {
  return GACHA_RARITIES.map((rarity) => ({
    grade: rarity.grade,
    rate: rarity.rate,
    names: rarity.characters.map((id) => getCharacter(id)?.name || id),
  }));
}
