import { STAGES } from "../data/stages.js";
import { CURRENCIES } from "../data/economy.js";
import { normalizeAttributeState } from "./attributeTemplate.js";
import { clone, todayKey } from "./ui.js";

export const SAVE_KEY = "pua_save";
export const LEGACY_SAVE_KEY = "pua-web-alpha-01";
export const SAVE_VERSION = "0.5.0";

export const defaultSave = {
  version: SAVE_VERSION,
  started: false,
  activeTab: "home",
  selectedRegion: "pions",
  currencies: {
    quartz: 30000,
    bling: 500,
    blueBling: 0,
    plate: 0,
    pureBling: 0,
    alPoint: 0,
    medal: 0,
    stardust: 0,
    mileage: 0,
    shiningMileage: 0,
    powerGem: 0,
  },
  units: {
    mepi: { level: 1, shards: 0, dupes: 0, upgrades: 0, ext: 0, mind: 0, deepMind: 0, insaneSpecUnlocked: false },
    noark: { level: 1, shards: 0, dupes: 0, upgrades: 0, ext: 0, mind: 0, deepMind: 0, insaneSpecUnlocked: false },
  },
  inventory: {
    materials: { core: 0, dust: 0, key: 0 },
    shards: {},
    items: {},
  },
  attributes: {
    owned: ["star", "quantum"],
    templates: { 1: 3 },
    history: [],
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
    week: "",
    daily: {},
    weekly: {},
  },
  settings: {
    bgm: true,
    sfx: true,
    vibration: false,
    battleSpeed: 1,
    compactLog: false,
    autoSkill: false,
  },
  formation: ["mepi", "noark"],
  stats: {
    accountExp: 0,
    wins: 0,
    losses: 0,
    stagePlays: 0,
    pulls: 0,
    earned: 0,
    upgrades: 0,
    exUses: 0,
    critHits: 0,
    advantageHits: 0,
    bossKills: 0,
    sameDayBossKills: 0,
    purchases: 0,
    expensivePurchases: 0,
    spent: 0,
    attributeTemplatesOpened: 0,
    attributeTemplateSyntheses: 0,
    mindPromotions: 0,
    deepMindPromotions: 0,
  },
  achievements: {
    filter: "all",
    claimed: {},
    hidden: {},
    manual: {},
  },
  story: {
    seenStageStart: [],
  },
  ui: {
    inventoryFilter: "all",
    unitFilter: "all",
    codexFilter: "currency",
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
  const sourceCurrencies = { ...(source.currencies || {}) };
  CURRENCIES.forEach((currency) => {
    if (!(currency.id in sourceCurrencies)) sourceCurrencies[currency.id] = base.currencies[currency.id] || 0;
  });
  const save = {
    ...base,
    ...source,
    version: SAVE_VERSION,
    currencies: { ...base.currencies, ...sourceCurrencies },
    units: { ...base.units, ...(source.units || source.ownedUnits || {}) },
    inventory: {
      materials: { ...base.inventory.materials, ...(source.inventory?.materials || {}) },
      shards: { ...base.inventory.shards, ...(source.inventory?.shards || {}) },
      items: { ...base.inventory.items, ...(source.inventory?.items || {}) },
    },
    gacha: { ...base.gacha, ...(source.gacha || {}) },
    missions: {
      ...base.missions,
      ...(source.missions || {}),
      daily: { ...base.missions.daily, ...(source.missions?.daily || {}) },
      weekly: { ...base.missions.weekly, ...(source.missions?.weekly || {}) },
    },
    settings: { ...base.settings, ...(source.settings || {}) },
    stats: { ...base.stats, ...(source.stats || {}) },
    achievements: {
      filter: source.achievements?.filter || base.achievements.filter,
      claimed: { ...base.achievements.claimed, ...(source.achievements?.claimed || {}) },
      hidden: { ...base.achievements.hidden, ...(source.achievements?.hidden || {}) },
      manual: { ...base.achievements.manual, ...(source.achievements?.manual || {}) },
    },
    story: {
      seenStageStart: Array.isArray(source.story?.seenStageStart) ? source.story.seenStageStart : [],
    },
    ui: { ...base.ui, ...(source.ui || {}) },
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
      ext: Number(save.units[id]?.ext || 0),
      mind: Number(save.units[id]?.mind || 0),
      deepMind: Number(save.units[id]?.deepMind || 0),
      insaneSpecUnlocked: Boolean(save.units[id]?.insaneSpecUnlocked),
    };
    save.inventory.shards[id] = Number(save.inventory.shards[id] || save.units[id].shards || 0);
  });

  save.attributes = normalizeAttributeState(source.attributes || base.attributes);

  const ownedIds = Object.keys(save.units);
  const sourceFormation = Array.isArray(source.formation) ? source.formation : base.formation;
  save.formation = Array.from(new Set(sourceFormation.filter((id) => ownedIds.includes(id)))).slice(0, 4);
  if (!save.formation.length && ownedIds.length) save.formation.push(ownedIds[0]);

  if (!save.gacha.history) save.gacha.history = [];
  save.gacha.history = save.gacha.history.slice(0, 20);
  save.recent = Array.isArray(save.recent) ? save.recent.slice(0, 20) : [];
  if (![1, 1.5, 2].includes(Number(save.settings.battleSpeed))) save.settings.battleSpeed = 2;
  if (!save.stats.accountExp && save.clearedStages.length) {
    save.stats.accountExp = save.clearedStages.length * 120;
  }
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
