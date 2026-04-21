import { ATTRIBUTES } from "../data/characters.js";
import { getOwnedCharacters } from "./upgrade.js";

export const PARTY_LIMIT = 4;

export function normalizeFormation(save) {
  const ownedIds = Object.keys(save.units || {});
  save.formation = Array.isArray(save.formation) ? save.formation : [];
  save.formation = Array.from(new Set(save.formation.filter((id) => ownedIds.includes(id)))).slice(0, PARTY_LIMIT);
  if (!save.formation.length && ownedIds.length) save.formation.push(ownedIds[0]);
}

export function toggleFormation(save, id) {
  normalizeFormation(save);
  if (!save.units[id]) return false;
  if (save.formation.includes(id)) {
    if (save.formation.length <= 1) return false;
    save.formation = save.formation.filter((unitId) => unitId !== id);
    return true;
  }
  if (save.formation.length >= PARTY_LIMIT) return false;
  save.formation.push(id);
  return true;
}

export function getFormationIds(save) {
  normalizeFormation(save);
  return save.formation.slice(0, PARTY_LIMIT);
}

export function getPartyBonuses(save) {
  const units = basePartyUnits(save);
  const elements = new Set(units.map((unit) => unit.element));
  const roles = new Set(units.map((unit) => unit.role));
  const passives = new Set(units.map((unit) => unit.passive?.id).filter(Boolean));
  const bonuses = {
    hpMultiplier: 1,
    atkMultiplier: 1,
    defMultiplier: 1,
    speedBonus: 0,
    critBonus: 0,
    chargeBonus: 0,
    shieldMultiplier: 1,
    startStarBoost: 0,
    startVulnerability: 0,
    labels: [],
  };

  if (elements.size >= 3) {
    bonuses.hpMultiplier += 0.05;
    bonuses.atkMultiplier += 0.05;
    bonuses.labels.push("속성 균형 +HP/ATK");
  }

  if (roles.has("서포터") && roles.has("가드") && roles.has("브레이커")) {
    bonuses.defMultiplier += 0.06;
    bonuses.critBonus += 0.02;
    bonuses.labels.push("역할 삼각 +DEF/CRIT");
  }

  if (units.length >= PARTY_LIMIT) {
    bonuses.speedBonus += 0.8;
    bonuses.chargeBonus += 6;
    bonuses.labels.push("4인 편성 +SPD/게이지");
  }

  if (passives.has("penta_blessing")) {
    bonuses.hpMultiplier += 0.04;
    bonuses.startStarBoost = Math.max(bonuses.startStarBoost, 2);
    bonuses.labels.push("펜타 축복");
  }

  if (passives.has("imaginary_guard")) {
    bonuses.shieldMultiplier += 0.15;
    bonuses.labels.push("허수 전열");
  }

  if (passives.has("void_trace")) {
    bonuses.startVulnerability = Math.max(bonuses.startVulnerability, 1);
    bonuses.labels.push("공허 흔적");
  }

  return bonuses;
}

export function getBattleParty(save) {
  const bonuses = getPartyBonuses(save);
  return basePartyUnits(save).map((unit) => {
    const selfCrit = unit.passive?.id === "quantum_edge" ? 0.05 : 0;
    return {
      ...unit,
      stats: {
        ...unit.stats,
        hp: Math.round(unit.stats.hp * bonuses.hpMultiplier),
        atk: Math.round(unit.stats.atk * bonuses.atkMultiplier),
        def: Math.round(unit.stats.def * bonuses.defMultiplier),
        speed: Number((unit.stats.speed + bonuses.speedBonus).toFixed(1)),
        crit: Math.min(0.42, unit.stats.crit + bonuses.critBonus + selfCrit),
      },
    };
  });
}

export function battlePartyPower(save) {
  return getBattleParty(save).reduce((sum, unit) => {
    return sum + unit.stats.hp * 0.9 + unit.stats.atk * 12 + unit.stats.def * 8 + unit.stats.speed * 10;
  }, 0);
}

export function formationSummary(save) {
  const units = getBattleParty(save);
  const bonuses = getPartyBonuses(save);
  return {
    units,
    bonuses,
    power: Math.round(battlePartyPower(save)),
    labels: bonuses.labels.length ? bonuses.labels : ["기본 편성"],
    elements: units.map((unit) => ATTRIBUTES[unit.element]?.sigil || unit.element).join(" "),
  };
}

function basePartyUnits(save) {
  const formation = getFormationIds(save);
  const owned = getOwnedCharacters(save);
  return formation
    .map((id) => owned.find((unit) => unit.id === id))
    .filter(Boolean);
}
