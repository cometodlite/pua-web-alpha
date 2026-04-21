import { STAGES } from "../data/stages.js";
import { clone, todayKey } from "./ui.js";

export const SAVE_KEY = "pua_save";
export const LEGACY_SAVE_KEY = "pua-web-alpha-01";
export const SAVE_VERSION = "0.2.0";

export const defaultSave = {
  version: SAVE_VERSION,
  started: false,
  activeTab: "home",
  selectedRegion: "pions",
  currencies: {
    quartz: 1200,
    bling: 500,
    plate: 0,
  },
  units: {
    mepi: { level: 1, shards: 0, dupes: 0, upgrades: 0 },
    noark: { level: 1, shards: 0, dupes: 0, upgrades: 0 },
  },
  inventory: {
    materials: { core: 0, dust: 0, key: 0 },
    shards: {},
    items: {},
  },
  clearedStages: [],
  unlockedStages: ["pions-01"],
  unlockedRegions: ["pions"],
  gacha: {
    count: 0,
    pity: 0,
    history: [],
  },
  missions: {
    date: todayKey(),
    daily: {},
  },
  settings: {
    bgm: true,
    sfx: true,
    vibration: false,
    battleSpeed: 1,
  },
  stats: {
    wins: 0,
    losses: 0,
    stagePlays: 0,
    pulls: 0,
    earned: 0,
    upgrades: 0,
  },
  recent: [],
  battle: null,
};

export function createDefaultSave() {
  return normalizeSave(clone(defaultSave));
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return normalizeSave(JSON.parse(raw));

    const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
    if (legacyRaw) return migrateLegacySave(JSON.parse(legacyRaw));
  } catch {
    return createDefaultSave();
  }

  return createDefaultSave();
}

export function saveGame(save) {
  try {
    const stableSave = normalizeSave(save);
    localStorage.setItem(SAVE_KEY, JSON.stringify(stableSave));
    return true;
  } catch {
    return false;
  }
}

export function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LEGACY_SAVE_KEY);
  return createDefaultSave();
}

export function normalizeSave(incoming) {
  const base = clone(defaultSave);
  const source = incoming && typeof incoming === "object" ? incoming : {};
  const save = {
    ...base,
    ...source,
    version: SAVE_VERSION,
    currencies: { ...base.currencies, ...(source.currencies || {}) },
    units: { ...base.units, ...(source.units || source.ownedUnits || {}) },
    inventory: {
      materials: { ...base.inventory.materials, ...(source.inventory?.materials || {}) },
      shards: { ...base.inventory.shards, ...(source.inventory?.shards || {}) },
      items: { ...base.inventory.items, ...(source.inventory?.items || {}) },
    },
    gacha: { ...base.gacha, ...(source.gacha || {}) },
    missions: { ...base.missions, ...(source.missions || {}) },
    settings: { ...base.settings, ...(source.settings || {}) },
    stats: { ...base.stats, ...(source.stats || {}) },
  };

  if (source.inventory && !source.inventory.materials) {
    save.inventory.materials = {
      ...save.inventory.materials,
      core: source.inventory.core || 0,
      dust: source.inventory.dust || 0,
      key: source.inventory.key || 0,
    };
  }

  save.clearedStages = Array.isArray(source.clearedStages) ? source.clearedStages : legacyClears(source);
  save.unlockedStages = Array.from(new Set([...(source.unlockedStages || []), "pions-01"]));
  save.unlockedRegions = Array.from(new Set([...(source.unlockedRegions || []), "pions"]));

  save.clearedStages.forEach((stageId) => {
    const stage = STAGES.find((item) => item.id === stageId);
    if (!stage) return;
    stage.unlocks?.stages?.forEach((id) => addUnique(save.unlockedStages, id));
    stage.unlocks?.regions?.forEach((id) => addUnique(save.unlockedRegions, id));
  });

  Object.keys(save.units).forEach((id) => {
    save.units[id] = {
      level: Number(save.units[id]?.level || 1),
      shards: Number(save.units[id]?.shards || 0),
      dupes: Number(save.units[id]?.dupes || 0),
      upgrades: Number(save.units[id]?.upgrades || 0),
    };
    save.inventory.shards[id] = Number(save.inventory.shards[id] || save.units[id].shards || 0);
  });

  if (!save.gacha.history) save.gacha.history = [];
  save.gacha.history = save.gacha.history.slice(0, 20);
  save.recent = Array.isArray(save.recent) ? save.recent.slice(0, 20) : [];
  save.battle = null;

  return save;
}

export function addUnique(list, id) {
  if (!list.includes(id)) list.push(id);
}

export function addRecent(save, text) {
  save.recent = [{ text, at: new Date().toISOString() }, ...(save.recent || [])].slice(0, 12);
}

function migrateLegacySave(legacy) {
  const save = normalizeSave({
    ...legacy,
    units: legacy.ownedUnits || legacy.units,
    clearedStages: legacyClears(legacy),
    unlockedRegions: legacyUnlockedRegions(legacy),
    unlockedStages: legacyUnlockedStages(legacy),
    inventory: {
      materials: {
        core: legacy.inventory?.core || 0,
        dust: legacy.inventory?.dust || 0,
        key: legacy.inventory?.key || 0,
      },
      shards: {},
      items: {},
    },
    gacha: {
      count: legacy.stats?.pulls || 0,
      pity: 0,
      history: legacy.lastResults || [],
    },
  });
  saveGame(save);
  return save;
}

function legacyClears(source) {
  const highest = Number(source.highestStage || 1);
  return STAGES.filter((stage) => stage.order < highest).map((stage) => stage.id);
}

function legacyUnlockedStages(source) {
  const highest = Number(source.highestStage || 1);
  return STAGES.filter((stage) => stage.order <= highest).map((stage) => stage.id);
}

function legacyUnlockedRegions(source) {
  const highest = Number(source.highestStage || 1);
  const regions = ["pions"];
  if (highest > 3) regions.push("tromansion");
  if (highest > 6) regions.push("orosis");
  return regions;
}
