import { ATTRIBUTE_TIERS, ATTRIBUTES, getAttribute, rollAttributeFromTemplate, specialChanceForTier, tierLabel } from "../data/attributes.js";

const MAX_TIER = 15;

export function createDefaultAttributeState() {
  return {
    owned: ["star", "quantum"],
    templates: { 1: 3 },
    history: [],
  };
}

export function normalizeAttributeState(source = {}) {
  const base = createDefaultAttributeState();
  const templates = { ...base.templates, ...(source.templates || {}) };
  ATTRIBUTE_TIERS.forEach(({ tier }) => {
    templates[tier] = Math.max(0, Number(templates[tier] || 0));
  });

  return {
    owned: Array.from(new Set([...(source.owned || base.owned)].filter((id) => ATTRIBUTES[id]))),
    templates,
    history: Array.isArray(source.history) ? source.history.slice(0, 12) : [],
  };
}

export function ensureAttributeState(save) {
  save.attributes = normalizeAttributeState(save.attributes);
  return save.attributes;
}

export function templateRewardKey(tier) {
  return `template${Number(tier) || 1}`;
}

export function parseTemplateRewardKey(key) {
  const match = /^template(\d+)$/.exec(key);
  if (!match) return null;
  const tier = Math.max(1, Math.min(MAX_TIER, Number(match[1])));
  return tier;
}

export function templateName(tier) {
  return `${tierLabel(tier)}형 속성 형판`;
}

export function templateChanceText(tier) {
  return `특수 ${Math.round(specialChanceForTier(tier) * 100)}%`;
}

export function canSynthesizeTemplate(save, tier) {
  ensureAttributeState(save);
  const level = Number(tier) || 1;
  return level < MAX_TIER && (save.attributes.templates[level] || 0) >= 3;
}

export function synthesizeTemplate(save, tier) {
  ensureAttributeState(save);
  const level = Number(tier) || 1;
  if (!canSynthesizeTemplate(save, level)) return null;
  save.attributes.templates[level] -= 3;
  save.attributes.templates[level + 1] = (save.attributes.templates[level + 1] || 0) + 1;
  const result = {
    from: level,
    to: level + 1,
    text: `${templateName(level)} 3개를 ${templateName(level + 1)} 1개로 합성`,
  };
  pushHistory(save, result.text);
  return result;
}

export function canOpenTemplate(save, tier) {
  ensureAttributeState(save);
  return (save.attributes.templates[Number(tier) || 1] || 0) > 0;
}

export function openAttributeTemplate(save, tier) {
  ensureAttributeState(save);
  const level = Number(tier) || 1;
  if (!canOpenTemplate(save, level)) return null;

  save.attributes.templates[level] -= 1;
  const attributeId = rollAttributeFromTemplate(level, save.attributes.owned);
  const attribute = getAttribute(attributeId);
  const duplicate = save.attributes.owned.includes(attributeId);

  if (!duplicate) {
    save.attributes.owned.push(attributeId);
  } else {
    save.currencies.plate = (save.currencies.plate || 0) + level;
    save.currencies.bling = (save.currencies.bling || 0) + level * 15;
  }

  const text = duplicate
    ? `${templateName(level)} 개봉 · ${attribute.name} 중복 보정`
    : `${templateName(level)} 개봉 · ${attribute.name} 속성 획득`;
  pushHistory(save, text);
  return { attribute, duplicate, tier: level, text };
}

export function grantTemplate(save, tier, count = 1) {
  ensureAttributeState(save);
  const level = Math.max(1, Math.min(MAX_TIER, Number(tier) || 1));
  save.attributes.templates[level] = (save.attributes.templates[level] || 0) + Number(count || 0);
}

function pushHistory(save, text) {
  save.attributes.history = [{ text, at: new Date().toISOString() }, ...(save.attributes.history || [])].slice(0, 12);
}
