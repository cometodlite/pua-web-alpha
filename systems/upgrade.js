import { CHARACTERS, getCharacter } from "../data/characters.js";

export function getUnitStats(character, unitState) {
  const level = unitState?.level || 1;
  const ext = Number(unitState?.ext || 0);
  const mind = Number(unitState?.mind || 0);
  const deepMind = Number(unitState?.deepMind || 0);
  const bonusTier = Math.floor(level / 5);
  const mindMultiplier = 1 + mind * 0.025 + deepMind * 0.06;
  return {
    hp: Math.round((character.base.hp + character.growth.hp * (level - 1) + bonusTier * 24 + ext * 8) * mindMultiplier),
    atk: Math.round((character.base.atk + character.growth.atk * (level - 1) + bonusTier * 4 + ext * 2) * mindMultiplier),
    def: Math.round((character.base.def + character.growth.def * (level - 1) + bonusTier * 3 + Math.floor(ext / 2)) * mindMultiplier),
    speed: Number((character.base.speed + character.growth.speed * (level - 1) + Math.floor(ext / 5) * 0.2).toFixed(1)),
    crit: Math.min(0.42, character.base.crit + bonusTier * 0.015 + Math.floor(ext / 5) * 0.005 + deepMind * 0.01),
  };
}

export function getOwnedCharacters(save) {
  return Object.keys(save.units)
    .map((id) => {
      const character = getCharacter(id);
      if (!character) return null;
      return { ...character, state: save.units[id], stats: getUnitStats(character, save.units[id]) };
    })
    .filter(Boolean);
}

export function partyPower(save) {
  return getOwnedCharacters(save).reduce((sum, unit) => {
    return sum + unit.stats.hp * 0.9 + unit.stats.atk * 12 + unit.stats.def * 8 + unit.stats.speed * 10;
  }, 0);
}

export function upgradeCost(unitState) {
  const level = unitState?.level || 1;
  const cost = {
    quartz: 80 + level * level * 42,
    bling: 60 + level * 55,
    plate: level >= 4 ? Math.floor((level - 2) / 2) : 0,
    shards: level >= 5 ? 10 + (level - 5) * 5 : 0,
  };
  if (level >= 7) cost.controlCore = 1;
  if (level >= 9) cost.tradeSeal = 1;
  if (level >= 11) cost.aquaCore = 1;
  return cost;
}

export function extCost(unitState, character) {
  const ext = Number(unitState?.ext || 0);
  const next = ext + 1;
  if (next > 20) return null;
  const quartz = next <= 5 ? 20000 : next <= 10 ? 40000 : next <= 15 ? 70000 : 100000;
  const needsLiberation = Boolean(character?.insaneSpec && next >= 11 && !unitState?.insaneSpecUnlocked);
  return {
    next,
    quartz,
    bling: needsLiberation ? 50 : 0,
    needsLiberation,
  };
}

export function canUpgrade(save, id) {
  const unit = save.units[id];
  if (!unit) return false;
  const cost = upgradeCost(unit);
  return Object.entries(cost).every(([key, value]) => {
    if (!value) return true;
    if (key === "shards") return (save.inventory.shards[id] || 0) >= value;
    if (key in save.currencies) return (save.currencies[key] || 0) >= value;
    return (save.inventory.materials[key] || 0) >= value;
  });
}

export function canUpgradeExt(save, id) {
  const unit = save.units[id];
  const character = getCharacter(id);
  if (!unit || !character) return false;
  const cost = extCost(unit, character);
  if (!cost) return false;
  return (save.currencies.quartz || 0) >= cost.quartz && (save.currencies.bling || 0) >= (cost.bling || 0);
}

export function applyUpgrade(save, id) {
  if (!canUpgrade(save, id)) return false;
  const unit = save.units[id];
  const cost = upgradeCost(unit);
  Object.entries(cost).forEach(([key, value]) => {
    if (!value) return;
    if (key === "shards") save.inventory.shards[id] = (save.inventory.shards[id] || 0) - value;
    else if (key in save.currencies) save.currencies[key] -= value;
    else save.inventory.materials[key] = (save.inventory.materials[key] || 0) - value;
  });
  save.stats.spent += (cost.quartz || 0) + (cost.bling || 0) + (cost.plate || 0);
  unit.shards = save.inventory.shards[id];
  unit.level += 1;
  unit.upgrades += 1;
  save.stats.upgrades += 1;
  return true;
}

export function applyExtUpgrade(save, id) {
  if (!canUpgradeExt(save, id)) return false;
  const unit = save.units[id];
  const character = getCharacter(id);
  const cost = extCost(unit, character);
  save.currencies.quartz -= cost.quartz;
  if (cost.bling) {
    save.currencies.bling -= cost.bling;
    unit.insaneSpecUnlocked = true;
  }
  unit.ext = cost.next;
  save.stats.spent += cost.quartz + (cost.bling || 0);
  return true;
}

export function canPromoteMind(save, id) {
  const unit = save.units[id];
  if (!unit) return false;
  return Number(unit.ext || 0) >= 20 && Number(unit.mind || 0) < 5;
}

export function promoteMind(save, id) {
  if (!canPromoteMind(save, id)) return false;
  const unit = save.units[id];
  unit.mind = Number(unit.mind || 0) + 1;
  unit.ext = 0;
  unit.insaneSpecUnlocked = false;
  save.stats.mindPromotions = (save.stats.mindPromotions || 0) + 1;
  return true;
}

export function canPromoteDeepMind(save, id) {
  const unit = save.units[id];
  if (!unit) return false;
  return Number(unit.mind || 0) >= 5 && Number(unit.deepMind || 0) < 3;
}

export function promoteDeepMind(save, id) {
  if (!canPromoteDeepMind(save, id)) return false;
  const unit = save.units[id];
  unit.deepMind = Number(unit.deepMind || 0) + 1;
  unit.mind = 0;
  unit.ext = 0;
  unit.insaneSpecUnlocked = false;
  save.stats.deepMindPromotions = (save.stats.deepMindPromotions || 0) + 1;
  return true;
}

export function mindLabel(value, maxLabel = "") {
  const labels = ["0", "I", "II", "III", "IV", "V"];
  return `${labels[Number(value) || 0] || "0"}${maxLabel}`;
}

export function allUnitCards(save) {
  return CHARACTERS.map((character) => {
    const state = save.units[character.id];
    return {
      ...character,
      owned: Boolean(state),
      state,
      stats: state ? getUnitStats(character, state) : getUnitStats(character, { level: 1 }),
      nextStats: state ? getUnitStats(character, { level: state.level + 1 }) : null,
    };
  });
}
