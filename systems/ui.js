export function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(value || 0);
}

export function todayKey() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export function rewardName(key) {
  const names = {
    quartz: "쿼츠",
    bling: "블링",
    plate: "형판",
    core: "코어 조각",
    dust: "양자 분진",
    key: "공허 키",
    controlCore: "도심 제어 코어",
    tradeSeal: "무역 집행 인장",
    aquaCore: "오염 수핵",
    bossMaterial: "보스 재료",
  };
  return names[key] || key;
}

export function rewardText(reward) {
  return Object.entries(reward)
    .map(([key, value]) => `${rewardName(key)} ${value}`)
    .join(" · ");
}

export function percent(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function mix(hex, base, amount) {
  const a = parseHex(hex);
  const b = parseHex(base);
  const result = a.map((channel, index) => Math.round(channel * amount + b[index] * (1 - amount)));
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

function parseHex(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
}
