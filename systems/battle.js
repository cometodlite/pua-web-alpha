import { attributeLabel, attributeMultiplier } from "../data/characters.js";
import { getEnemy } from "../data/enemies.js";
import { getStage } from "../data/stages.js";
import { getBossByStage } from "../data/bosses.js";
import { battlePartyPower, getBattleParty, getPartyBonuses } from "./formation.js";
import { percent, randomBetween } from "./ui.js";

export function createBattle(save, stageId) {
  const stage = getStage(stageId);
  const enemy = getEnemy(stage.enemy);
  const boss = getBossByStage(stageId);
  const units = getBattleParty(save);
  const bonuses = getPartyBonuses(save);
  const powerRatio = Math.max(0.78, Math.min(1.24, battlePartyPower(save) / stage.recommendedPower));
  const enemyMaxHp = Math.round((enemy.hp + stage.recommendedPower * 0.12) * (boss ? 1.28 : 1));
  const partyMaxHp = units.reduce((sum, unit) => sum + unit.stats.hp, 0);

  return {
    stageId,
    enemyHp: enemyMaxHp,
    enemyMaxHp,
    partyHp: partyMaxHp,
    partyMaxHp,
    shield: 0,
    core: 22,
    tick: 0,
    enemyGauge: 0,
    bossGauge: 0,
    partyPower: Math.round(battlePartyPower(save)),
    powerRatio,
    charge: Object.fromEntries(units.map((unit) => [unit.id, 28])),
    buffs: {
      starBoost: bonuses.startStarBoost,
      vulnerability: bonuses.startVulnerability,
      guard: 0,
    },
    statuses: {
      burn: 0,
      shock: 0,
      slow: 0,
    },
    phase: 1,
    log: [boss ? `${boss.name} 보스 등장` : `${enemy.name} 출현`, `권장 전투력 ${stage.recommendedPower}`],
    floats: [],
    flash: false,
    cutin: null,
    bossAura: boss?.aura || "",
  };
}

export function tickBattle(save) {
  const battle = save.battle;
  if (!battle) return { status: "idle" };

  const stage = getStage(battle.stageId);
  const enemy = getEnemy(stage.enemy);
  const boss = getBossByStage(stage.id);
  const units = getBattleParty(save);
  const bonuses = getPartyBonuses(save);
  const speed = Number(save.settings.battleSpeed || 1);

  battle.tick += 1;
  battle.flash = false;
  battle.floats = [];
  battle.cutin = null;
  battle.core = Math.min(100, (battle.core || 0) + 8 + bonuses.chargeBonus);

  applyStatuses(battle);

  const attackers = speed >= 2 ? units : units.slice(0, Math.max(1, Math.ceil(units.length / 2)));
  attackers.forEach((unit) => {
    const result = unitAutoAttack(unit, enemy, battle);
    if (result.evaded) {
      battle.log.push(`${enemy.name} 회피`);
      battle.floats.push({ text: "MISS", type: "evade" });
    } else {
      battle.enemyHp -= result.damage;
      battle.log.push(`${unit.name} ${result.label} ${result.crit ? "치명" : ""} ${result.damage}`);
      battle.floats.push({ text: `${result.weakness} ${result.crit ? "CRIT " : ""}-${result.damage}`, type: result.crit ? "crit" : "damage" });
      if (result.crit) save.stats.critHits += 1;
      if (result.multiplier > 1) save.stats.advantageHits += 1;
    }
    battle.charge[unit.id] = Math.min(100, (battle.charge[unit.id] || 0) + 13 + bonuses.chargeBonus + Math.floor(unit.stats.speed / 2));
  });

  if (battle.enemyHp <= 0) return { status: "victory" };

  if (boss && battle.phase === 1 && battle.enemyHp / battle.enemyMaxHp <= 0.5) {
    battle.phase = 2;
    battle.flash = true;
    battle.log.push("보스 2페이즈 돌입");
    battle.floats.push({ text: "PHASE 2", type: "crit" });
  }

  const aggression = enemy.trait?.id === "aggressive" || enemy.trait?.id?.startsWith("boss") ? 1.18 : 1;
  const slowed = battle.statuses.slow > 0 ? 0.72 : 1;
  battle.enemyGauge += (enemy.speed * speed + 8) * aggression * slowed;
  if (battle.enemyGauge >= 35) {
    battle.enemyGauge = 0;
    if (battle.statuses.shock > 0 && Math.random() < 0.3) {
      battle.statuses.shock -= 1;
      battle.log.push(`${enemy.name} 감전으로 행동 지연`);
      battle.floats.push({ text: "SHOCK", type: "crit" });
    } else {
      const incoming = enemyAttack(enemy, battle);
      battle.partyHp -= incoming.damageToHp;
      battle.shield = incoming.shieldLeft;
      battle.log.push(`${enemy.name} 반격 ${incoming.total}`);
      battle.floats.push({ text: `-${incoming.damageToHp}`, type: "hurt" });
    }
  }

  const bossInterval = battle.phase === 2 ? Math.max(2, boss?.skillEvery - 1) : boss?.skillEvery;
  if (boss && battle.tick % bossInterval === 0) {
    const special = bossAttack(enemy, boss, battle);
    battle.partyHp -= special.damageToHp;
    battle.shield = special.shieldLeft;
    battle.flash = true;
    battle.log.push(`${boss.skillName} ${special.total}`);
    battle.floats.push({ text: `${boss.skillName} -${special.damageToHp}`, type: "hurt" });
  }

  decayBuffs(battle);

  if (battle.partyHp <= 0) return { status: "defeat" };
  trimBattleLog(battle);
  return { status: "running" };
}

export function useSkill(save, unitId) {
  const battle = save.battle;
  if (!battle || (battle.charge[unitId] || 0) < 100) return { ok: false };

  const unit = getBattleParty(save).find((item) => item.id === unitId);
  const stage = getStage(battle.stageId);
  const enemy = getEnemy(stage.enemy);
  const bonuses = getPartyBonuses(save);
  battle.charge[unitId] = 0;
  battle.flash = true;
  battle.floats = [];
  save.stats.exUses += 1;
  battle.cutin = {
    unitId,
    name: unit.ex.name,
    text: unit.ex.cutin,
    className: unit.ex.effectClass || "ex-default",
  };

  if (unit.ex.type === "heal-buff") {
    const heal = Math.round(unit.ex.power + unit.stats.atk * 1.7);
    battle.partyHp = Math.min(battle.partyMaxHp, battle.partyHp + heal);
    battle.buffs.starBoost = 3;
    battle.log.push(`${unit.name} EX 회복 ${heal} · 별 강화`);
    battle.floats.push({ text: `+${heal}`, type: "heal" });
  }

  if (unit.ex.type === "shield") {
    const shield = Math.round((unit.ex.power + unit.stats.def * 3.4) * bonuses.shieldMultiplier);
    battle.shield += shield;
    battle.statuses.slow = Math.max(battle.statuses.slow, 2);
    battle.buffs.guard = 2;
    battle.log.push(`${unit.name} EX 장벽 ${shield}`);
    battle.floats.push({ text: `SHIELD ${shield}`, type: "heal" });
  }

  if (unit.ex.type === "vulnerability") {
    const damage = skillDamage(unit, enemy, battle, 1.15);
    battle.enemyHp -= damage;
    battle.buffs.vulnerability = 3;
    battle.statuses.burn = Math.max(battle.statuses.burn, 3);
    battle.log.push(`${unit.name} EX ${damage} · 약화`);
    battle.floats.push({ text: `WEAK -${damage}`, type: "damage" });
  }

  if (unit.ex.type === "nuke") {
    const damage = skillDamage(unit, enemy, battle, 1.55);
    battle.enemyHp -= damage;
    battle.statuses.shock = Math.max(battle.statuses.shock, 2);
    battle.log.push(`${unit.name} EX ${damage}`);
    battle.floats.push({ text: `EX -${damage}`, type: "damage" });
  }

  trimBattleLog(battle);
  if (battle.enemyHp <= 0) return { ok: true, status: "victory" };
  return { ok: true, status: "running" };
}

export function useCoreBurst(save) {
  const battle = save.battle;
  if (!battle || (battle.core || 0) < 100) return { ok: false };
  const power = Math.round(battle.partyPower * 0.08 + 140);
  battle.core = 0;
  battle.enemyHp -= power;
  battle.statuses.burn = Math.max(battle.statuses.burn, 2);
  battle.statuses.slow = Math.max(battle.statuses.slow, 1);
  battle.flash = true;
  battle.cutin = {
    unitId: "core",
    name: "코어 버스트",
    text: "편성된 코어가 한 번에 공명해 적의 흐름을 끊습니다.",
    className: "ex-core",
  };
  battle.log.push(`코어 버스트 ${power}`);
  battle.floats = [{ text: `CORE -${power}`, type: "crit" }];
  trimBattleLog(battle);
  if (battle.enemyHp <= 0) return { ok: true, status: "victory" };
  return { ok: true, status: "running" };
}

export function battleSummary(save) {
  if (!save.battle) return null;
  return {
    enemyPercent: percent(save.battle.enemyHp, save.battle.enemyMaxHp),
    partyPercent: percent(save.battle.partyHp, save.battle.partyMaxHp),
  };
}

function unitAutoAttack(unit, enemy, battle) {
  const multiplier = attributeMultiplier(unit.element, enemy.element);
  const evasion = enemy.trait?.id === "evasive" ? 0.14 : 0;
  if (Math.random() < evasion) {
    return {
      damage: 0,
      crit: false,
      evaded: true,
      multiplier,
      weakness: attributeLabel(unit.element, enemy.element),
      label: "회피됨",
    };
  }
  const starBoost = battle.buffs.starBoost > 0 && unit.element === "star" ? 1.18 : 1;
  const vulnerable = battle.buffs.vulnerability > 0 ? 1.15 : 1;
  const armor = enemy.trait?.id === "armored" ? 0.88 : 1;
  const elemental = enemy.trait?.id === "elemental" && multiplier > 1 ? 1.12 : 1;
  const crit = Math.random() < unit.stats.crit;
  const critBonus = crit ? 1.55 : 1;
  const raw =
    (unit.stats.atk * randomBetween(0.72, 1.04) - enemy.def * 0.26) *
    multiplier *
    starBoost *
    vulnerable *
    critBonus *
    armor *
    elemental;
  const damage = Math.max(8, Math.round(raw));
  return {
    damage,
    crit,
    evaded: false,
    multiplier,
    weakness: attributeLabel(unit.element, enemy.element),
    label: attributeLabel(unit.element, enemy.element),
  };
}

function skillDamage(unit, enemy, battle, skillScale) {
  const multiplier = attributeMultiplier(unit.element, enemy.element);
  const vulnerable = battle.buffs.vulnerability > 0 ? 1.15 : 1;
  const armor = enemy.trait?.id === "armored" ? 0.9 : 1;
  const elemental = enemy.trait?.id === "elemental" && multiplier > 1 ? 1.14 : 1;
  const crit = Math.random() < unit.stats.crit + 0.08;
  const critBonus = crit ? 1.5 : 1;
  return Math.max(30, Math.round((unit.ex.power + unit.stats.atk * skillScale) * multiplier * vulnerable * critBonus * armor * elemental));
}

function applyStatuses(battle) {
  if (!battle.statuses) battle.statuses = { burn: 0, shock: 0, slow: 0 };
  if (battle.statuses.burn > 0) {
    const damage = Math.max(14, Math.round(battle.enemyMaxHp * 0.018));
    battle.enemyHp -= damage;
    battle.statuses.burn -= 1;
    battle.log.push(`지속 피해 ${damage}`);
    battle.floats.push({ text: `BURN -${damage}`, type: "damage" });
  }
  if (battle.statuses.slow > 0 && battle.tick % 2 === 0) battle.statuses.slow -= 1;
  if (battle.statuses.shock > 0 && battle.tick % 3 === 0) battle.statuses.shock -= 1;
}

function enemyAttack(enemy, battle) {
  const guard = battle.buffs.guard > 0 ? 0.75 : 1;
  const traitPower = enemy.trait?.id === "aggressive" || enemy.trait?.id === "elemental" ? 1.12 : 1;
  const total = Math.max(8, Math.round((enemy.atk * randomBetween(0.78, 1.15) - 4) * guard * traitPower));
  const shieldUsed = Math.min(battle.shield, total);
  return {
    total,
    damageToHp: total - shieldUsed,
    shieldLeft: battle.shield - shieldUsed,
  };
}

function bossAttack(enemy, boss, battle) {
  const guard = battle.buffs.guard > 0 ? 0.72 : 1;
  const phasePower = battle.phase === 2 ? 1.14 : 1;
  const total = Math.max(16, Math.round(enemy.atk * boss.skillPower * phasePower * randomBetween(0.92, 1.16) * guard));
  const shieldUsed = Math.min(battle.shield, total);
  return {
    total,
    damageToHp: total - shieldUsed,
    shieldLeft: battle.shield - shieldUsed,
  };
}

function decayBuffs(battle) {
  if (battle.tick % 2 !== 0) return;
  Object.keys(battle.buffs).forEach((key) => {
    battle.buffs[key] = Math.max(0, battle.buffs[key] - 1);
  });
}

function trimBattleLog(battle) {
  battle.log = battle.log.slice(-8);
}
