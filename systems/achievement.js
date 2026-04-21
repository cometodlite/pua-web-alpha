import { ACHIEVEMENTS } from "../data/achievements.js";
import { CHARACTERS } from "../data/characters.js";
import { recommendedAttributeFor as recommendedByRelation } from "../data/attributes.js";
import { STAGES } from "../data/stages.js";
import { getBossByStage } from "../data/bosses.js";
import { battlePartyPower } from "./formation.js";

export function ensureAchievements(save) {
  if (!save.achievements) save.achievements = {};
  save.achievements.claimed = save.achievements.claimed || {};
  save.achievements.hidden = save.achievements.hidden || {};
  save.achievements.filter = save.achievements.filter || "all";
}

export function getPlayerLevel(save) {
  const exp = Number(save.stats?.accountExp || 0);
  return 1 + Math.floor(Math.sqrt(exp / 80));
}

export function getAchievementRows(save, filter = "all") {
  ensureAchievements(save);
  return ACHIEVEMENTS.filter((achievement) => filter === "all" || achievement.category === filter).map((achievement) => {
    const progress = getAchievementProgress(save, achievement);
    const claimed = Boolean(save.achievements.claimed[achievement.id]);
    const complete = !achievement.disabled && progress.current >= progress.target;
    const hiddenComplete = achievement.hidden && complete;
    return {
      ...achievement,
      displayName: achievement.hidden && !hiddenComplete && !claimed ? "???" : achievement.name,
      displayDescription:
        achievement.hidden && !hiddenComplete && !claimed
          ? achievement.description
          : achievement.revealedDescription || achievement.description,
      progress,
      claimed,
      complete,
    };
  });
}

export function claimAchievement(save, id) {
  ensureAchievements(save);
  const row = getAchievementRows(save, "all").find((achievement) => achievement.id === id);
  if (!row || row.disabled || !row.complete || row.claimed) return null;
  grantAchievementReward(save, row.reward);
  save.achievements.claimed[id] = true;
  return row.reward;
}

export function triggerHiddenAchievement(save, key) {
  ensureAchievements(save);
  save.achievements.hidden[key] = (save.achievements.hidden[key] || 0) + 1;
}

export function achievementSummary(save) {
  const rows = getAchievementRows(save, "all").filter((row) => !row.disabled);
  const claimed = rows.filter((row) => row.claimed).length;
  const ready = rows.filter((row) => row.complete && !row.claimed).length;
  return { claimed, ready, total: rows.length };
}

function getAchievementProgress(save, achievement) {
  const condition = achievement.condition;
  const current = currentValue(save, condition);
  return {
    current,
    target: condition.value,
  };
}

function currentValue(save, condition) {
  const stats = save.stats || {};
  if (condition.type === "player_level") return getPlayerLevel(save);
  if (condition.type === "unlocked_regions") return save.unlockedRegions.length;
  if (condition.type === "all_stages_clear") return save.clearedStages.length >= STAGES.length ? 1 : 0;
  if (condition.type === "purchase_count") return stats.purchases || 0;
  if (condition.type === "expensive_purchase") return stats.expensivePurchases || 0;
  if (condition.type === "spent_currency") return stats.spent || 0;
  if (condition.type === "upgrade_count") return stats.upgrades || 0;
  if (condition.type === "unit_element_owned") {
    return CHARACTERS.some((character) => character.element === condition.element && save.units[character.id]) ? 1 : 0;
  }
  if (condition.type === "party_power") return Math.round(battlePartyPower(save));
  if (condition.type === "owned_units") return Object.keys(save.units || {}).length;
  if (condition.type === "claimed_achievements") return Object.keys(save.achievements?.claimed || {}).length;
  if (condition.type === "multiplayer") return 0;
  if (condition.type === "event_clear") return stats.eventClears || 0;
  if (condition.type === "event_choice") return stats.eventChoices || 0;
  if (condition.type === "cleared_stage") return save.clearedStages.includes(condition.stageId) ? 1 : 0;
  if (condition.type === "hidden_trigger") return save.achievements?.hidden?.[condition.key] || 0;
  if (condition.type === "boss_kills") return stats.bossKills || 0;
  if (condition.type === "same_day_boss") return stats.sameDayBossKills || 0;
  if (condition.type === "ex_uses") return stats.exUses || 0;
  if (condition.type === "advantage_hits") return stats.advantageHits || 0;
  if (condition.type === "manual_badge") return save.achievements?.manual?.[condition.key] || 0;
  return 0;
}

function grantAchievementReward(save, reward) {
  Object.entries(reward || {}).forEach(([key, value]) => {
    if (key in save.currencies) {
      save.currencies[key] += value;
      return;
    }
    save.inventory.materials[key] = (save.inventory.materials[key] || 0) + value;
  });
}

export function recommendedAttributeFor(enemyElement) {
  return recommendedByRelation(enemyElement);
}

export function bossClearCount(save) {
  return save.clearedStages.filter((stageId) => getBossByStage(stageId)).length;
}
