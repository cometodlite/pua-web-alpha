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

export const WEEKLY_MISSIONS = [
  {
    id: "weekly_stage10",
    label: "스테이지 10회 클리어",
    type: "stageClear",
    target: 10,
    reward: { quartz: 520, bling: 320, plate: 2 },
  },
  {
    id: "weekly_boss3",
    label: "보스 3회 제압",
    type: "bossClear",
    target: 3,
    reward: { quartz: 680, plate: 3, bossMaterial: 1 },
  },
  {
    id: "weekly_ex20",
    label: "EX 20회 사용",
    type: "exUse",
    target: 20,
    reward: { bling: 620, dust: 2 },
  },
  {
    id: "weekly_gacha10",
    label: "추첨 10회 진행",
    type: "gacha",
    target: 10,
    reward: { quartz: 360, core: 3 },
  },
];

export function ensureDailyMissions(save) {
  ensureMissions(save);
}

export function ensureMissions(save) {
  const today = todayKey();
  if (save.missions.date !== today) {
    save.missions.date = today;
    save.missions.daily = {};
  }

  const week = weekKey();
  if (save.missions.week !== week) {
    save.missions.week = week;
    save.missions.weekly = {};
  }

  save.missions.daily = save.missions.daily || {};
  save.missions.weekly = save.missions.weekly || {};

  DAILY_MISSIONS.forEach((mission) => {
    if (!save.missions.daily[mission.id]) {
      save.missions.daily[mission.id] = { progress: 0, claimed: false };
    }
  });

  WEEKLY_MISSIONS.forEach((mission) => {
    if (!save.missions.weekly[mission.id]) {
      save.missions.weekly[mission.id] = { progress: 0, claimed: false };
    }
  });
}

export function updateMission(save, type, amount = 1) {
  ensureMissions(save);
  DAILY_MISSIONS.forEach((mission) => {
    if (mission.type !== type) return;
    const entry = save.missions.daily[mission.id];
    entry.progress = Math.min(mission.target, entry.progress + amount);
  });

  WEEKLY_MISSIONS.forEach((mission) => {
    if (mission.type !== type) return;
    const entry = save.missions.weekly[mission.id];
    entry.progress = Math.min(mission.target, entry.progress + amount);
  });
}

export function claimMission(save, id) {
  ensureMissions(save);
  const daily = DAILY_MISSIONS.find((item) => item.id === id);
  const weekly = WEEKLY_MISSIONS.find((item) => item.id === id);
  const mission = daily || weekly;
  const entry = daily ? save.missions.daily[id] : save.missions.weekly[id];
  if (!mission || !entry || entry.claimed || entry.progress < mission.target) return null;
  Object.entries(mission.reward).forEach(([key, value]) => {
    if (key in save.currencies) save.currencies[key] = (save.currencies[key] || 0) + value;
    else save.inventory.materials[key] = (save.inventory.materials[key] || 0) + value;
  });
  entry.claimed = true;
  return mission.reward;
}

export function weekKey() {
  const now = new Date();
  const utc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const day = now.getDay() || 7;
  const monday = new Date(utc - (day - 1) * 86400000);
  return monday.toISOString().slice(0, 10);
}
