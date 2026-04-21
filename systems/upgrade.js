import { CHARACTERS, getCharacter } from "../data/characters.js";

export function getUnitStats(character, unitState) {
  const level = unitState?.level || 1;
  const bonusTier = Math.floor(level / 5);
  return {
    hp: Math.round(character.base.hp + character.growth.hp * (level - 1) + bonusTier * 24),
    atk: Math.round(character.base.atk + character.growth.atk * (level - 1) + bonusTier * 4),
    def: Math.round(character.base.def + character.growth.def * (level - 1) + bonusTier * 3),
    speed: Number((character.base.speed + character.growth.speed * (level - 1)).toFixed(1)),
    crit: Math.min(0.35, character.base.crit + bonusTier * 0.015),
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
  return {
    quartz: 80 + level * level * 42,
    bling: 60 + level * 55,
    plate: level >= 4 ? Math.floor((level - 2) / 2) : 0,
    shards: level >= 5 ? 10 + (level - 5) * 5 : 0,
  };
}

export function canUpgrade(save, id) {
  const unit = save.units[id];
  if (!unit) return false;
  const cost = upgradeCost(unit);
  return (
    save.currencies.quartz >= cost.quartz &&
    save.currencies.bling >= cost.bling &&
    save.currencies.plate >= cost.plate &&
    (save.inventory.shards[id] || 0) >= cost.shards
  );
}

export function applyUpgrade(save, id) {
  if (!canUpgrade(save, id)) return false;
  const unit = save.units[id];
  const cost = upgradeCost(unit);
  save.currencies.quartz -= cost.quartz;
  save.currencies.bling -= cost.bling;
  save.currencies.plate -= cost.plate;
  save.stats.spent += cost.quartz + cost.bling + cost.plate;
  save.inventory.shards[id] = (save.inventory.shards[id] || 0) - cost.shards;
  unit.shards = save.inventory.shards[id];
  unit.level += 1;
  unit.upgrades += 1;
  save.stats.upgrades += 1;
  return true;
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
