import { todayKey } from "./ui.js";

export const DAILY_MISSIONS = [
  {
    id: "clear3",
    label: "스테이지 3회 클리어",
    type: "stageClear",
    target: 3,
    reward: { quartz: 180, bling: 80 },
  },
  {
    id: "gacha1",
    label: "추첨 1회 진행",
    type: "gacha",
    target: 1,
    reward: { quartz: 90, bling: 60 },
  },
  {
    id: "upgrade1",
    label: "캐릭터 1회 강화",
    type: "upgrade",
    target: 1,
    reward: { quartz: 120, plate: 1 },
  },
  {
    id: "earn500",
    label: "재화 500 획득",
    type: "earnCurrency",
    target: 500,
    reward: { quartz: 150, bling: 120 },
  },
];

export function ensureDailyMissions(save) {
  const today = todayKey();
  if (save.missions.date !== today) {
    save.missions = { date: today, daily: {} };
  }

  DAILY_MISSIONS.forEach((mission) => {
    if (!save.missions.daily[mission.id]) {
      save.missions.daily[mission.id] = { progress: 0, claimed: false };
    }
  });
}

export function updateMission(save, type, amount = 1) {
  ensureDailyMissions(save);
  DAILY_MISSIONS.forEach((mission) => {
    if (mission.type !== type) return;
    const entry = save.missions.daily[mission.id];
    entry.progress = Math.min(mission.target, entry.progress + amount);
  });
}

export function claimMission(save, id) {
  ensureDailyMissions(save);
  const mission = DAILY_MISSIONS.find((item) => item.id === id);
  const entry = save.missions.daily[id];
  if (!mission || !entry || entry.claimed || entry.progress < mission.target) return null;
  Object.entries(mission.reward).forEach(([key, value]) => {
    save.currencies[key] = (save.currencies[key] || 0) + value;
  });
  entry.claimed = true;
  return mission.reward;
}
