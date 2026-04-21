export const GACHA = {
  name: "양자 코어 추첨",
  singleCost: 300,
  tenCost: 2700,
  pityTarget: 30,
  duplicateRewards: {
    default: { shards: 10, bling: 60 },
    "MYSTIC": { shards: 14, bling: 90 },
    "ANTIQUE POWER": { shards: 20, bling: 140, plate: 1 },
  },
  pool: [
    { character: "mepi", weight: 8 },
    { character: "rivia", weight: 18 },
    { character: "noark", weight: 37 },
    { character: "seha", weight: 37 },
  ],
};
