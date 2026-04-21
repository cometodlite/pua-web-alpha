import { ACHIEVEMENT_CATEGORIES } from "./data/achievements.js";
import { getBossByStage } from "./data/bosses.js";
import { ATTRIBUTES, ATTRIBUTE_ADVANTAGE, CHARACTERS, CURRENCIES, attributeLabel, getCharacter } from "./data/characters.js";
import { getEnemy } from "./data/enemies.js";
import { GACHA } from "./data/gacha.js";
import { UPDATE_LOG, getRegionStory, getStageStory } from "./data/story.js";
import { REGIONS, STAGES, getNextStage, getRegion, getStage } from "./data/stages.js";
import { achievementSummary, claimAchievement, ensureAchievements, getAchievementRows, getPlayerLevel, recommendedAttributeFor, triggerHiddenAchievement } from "./systems/achievement.js";
import { playSound } from "./systems/audio.js";
import { battleSummary, createBattle, tickBattle as advanceBattle, useCoreBurst as fireCoreBurst, useSkill as fireSkill } from "./systems/battle.js";
import { battlePartyPower, formationSummary, getBattleParty, toggleFormation } from "./systems/formation.js";
import { DAILY_MISSIONS, WEEKLY_MISSIONS, claimMission, ensureDailyMissions, updateMission } from "./systems/mission.js";
import { SAVE_VERSION, addRecent, addUnique, createDefaultSave, loadSave, resetSave, saveGame } from "./systems/save.js";
import { allUnitCards, applyUpgrade, canUpgrade, upgradeCost } from "./systems/upgrade.js";
import { clone, formatNumber, mix, rewardName, rewardText, todayKey, weightedPick } from "./systems/ui.js";

let save = loadSave();
let toastTimer = 0;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  els.startScreen = document.getElementById("startScreen");
  els.startButton = document.getElementById("startButton");
  els.continueButton = document.getElementById("continueButton");
  els.startCanvas = document.getElementById("startCanvas");
  els.wallet = document.getElementById("wallet");
  els.view = document.getElementById("view");
  els.toast = document.getElementById("toast");
  els.modal = document.getElementById("modal");
  els.modalContent = document.getElementById("modalContent");
  els.modalClose = document.getElementById("modalClose");

  ensureDailyMissions(save);
  ensureAchievements(save);
  wireEvents();
  syncStartScreen();
  render();
  drawStartScene();
  registerServiceWorker();

  window.addEventListener("resize", () => {
    drawStartScene();
    drawActiveScene();
  });

  setInterval(tickBattleLoop, 900);
});

function wireEvents() {
  els.startButton.addEventListener("click", () => {
    save = createDefaultSave();
    save.started = true;
    ensureDailyMissions(save);
    ensureAchievements(save);
    playSound(save, "tap");
    persist("게스트 데이터가 생성되었습니다.");
    syncStartScreen();
    render();
  });

  els.continueButton.addEventListener("click", () => {
    save.started = true;
    ensureAchievements(save);
    playSound(save, "tap");
    persist();
    syncStartScreen();
    render();
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      save.activeTab = button.dataset.tab;
      persist();
      render();
    });
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const { action, id, count } = target.dataset;
    playSound(save, "tap");

    if (action === "select-region") selectRegion(id);
    if (action === "start-stage") startBattle(id);
    if (action === "skill") useSkill(id);
    if (action === "core-burst") useCoreBurst();
    if (action === "retreat") endBattle(false, true);
    if (action === "speed") setBattleSpeed(Number(id));
    if (action === "upgrade") upgradeUnit(id);
    if (action === "toggle-formation") toggleUnitFormation(id);
    if (action === "pull") pullGacha(Number(count));
    if (action === "claim-mission") claimDailyMission(id);
    if (action === "set-inventory-filter") setInventoryFilter(id);
    if (action === "set-achievement-filter") setAchievementFilter(id);
    if (action === "claim-achievement") claimAchievementReward(id);
    if (action === "hidden-trigger") revealHidden(id);
    if (action === "toggle-setting") toggleSetting(id);
    if (action === "save") persist("저장되었습니다.");
    if (action === "load") {
      save = loadSave();
      ensureDailyMissions(save);
      syncStartScreen();
      render();
      toast("불러왔습니다.");
    }
    if (action === "reset") confirmReset();
    if (action === "modal-close") closeModal();
    if (action === "confirm-reset") resetGame();
    if (action === "go") {
      save.activeTab = id;
      persist();
      render();
    }
  });

  els.modalClose.addEventListener("click", closeModal);
  els.modal.addEventListener("close", () => document.body.classList.remove("modal-open"));
}

function persist(message = "") {
  const ok = saveGame(save);
  if (message) toast(ok ? message : "저장 공간을 확인해주세요.");
}

function syncStartScreen() {
  els.startScreen.hidden = save.started;
  els.continueButton.disabled = !localStorage.getItem("pua_save") && !localStorage.getItem("pua-web-alpha-01");
}

function render() {
  renderWallet();
  renderTabs();

  if (!save.started) {
    els.view.innerHTML = "";
    return;
  }

  ensureDailyMissions(save);
  ensureAchievements(save);
  const views = {
    home: renderHome,
    stage: renderStage,
    unit: renderUnit,
    gacha: renderGacha,
    menu: renderMenu,
  };
  els.view.innerHTML = views[save.activeTab]();
  requestAnimationFrame(drawActiveScene);
}

function renderWallet() {
  els.wallet.innerHTML = CURRENCIES.map((currency) => {
    return `
      <div class="wallet-item">
        <span class="wallet-symbol">${currency.symbol}</span>
        <strong>${formatNumber(save.currencies[currency.id])}</strong>
      </div>
    `;
  }).join("");
}

function renderTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === save.activeTab);
  });
}

function renderHome() {
  const formation = formationSummary(save);
  const power = formation.power;
  const nextStage = getNextStage(save);
  const region = getRegion(nextStage.region);
  const story = getRegionStory(region.id);
  const achievements = achievementSummary(save);
  const owned = Object.keys(save.units).length;

  return `
    <section class="hero-band">
      <div class="hero-copy">
        <p class="eyebrow">PUA WEB ALPHA ${SAVE_VERSION}</p>
        <h2>${region.name} 신호가 열렸습니다.</h2>
        <p>${story?.intro || region.line}</p>
        <div class="quick-grid">
          ${metricTile("Lv", getPlayerLevel(save))}
          ${metricTile("전투력", formatNumber(power))}
          ${metricTile("진행", `${save.clearedStages.length}/${STAGES.length}`)}
          ${metricTile("업적", `${achievements.claimed}/${achievements.total}`)}
        </div>
        <div class="actions" style="margin-top: 14px">
          <button class="primary-button" data-action="start-stage" data-id="${nextStage.id}" type="button">다음 탐색</button>
          <button class="ghost-button" data-action="go" data-id="unit" type="button">강화</button>
        </div>
      </div>
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="home" aria-label="펜타 코어"></canvas>
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">GUIDE</p>
          <h3>오늘 해야 할 것</h3>
        </div>
        <span class="pill">${formation.elements || "편성"}</span>
      </div>
      ${renderProgressGuide(nextStage, story)}
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">DAILY</p>
          <h3>오늘 미션</h3>
        </div>
      </div>
      <div class="mission-list">${DAILY_MISSIONS.map(missionRow).join("")}</div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">WEEKLY</p>
          <h3>주간 목표</h3>
        </div>
      </div>
      <div class="mission-list">${WEEKLY_MISSIONS.map((mission) => missionRow(mission, "weekly")).join("")}</div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">RECENT</p>
          <h3>최근 기록</h3>
        </div>
      </div>
      ${renderRecent()}
    </section>
  `;
}

function renderStage() {
  const region = getRegion(save.selectedRegion);
  const story = getRegionStory(region.id);
  const stages = STAGES.filter((stage) => stage.region === region.id);

  return `
    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">REGION</p>
          <h3>지역 선택</h3>
        </div>
      </div>
      <p class="stage-note">${story?.title || region.line} · ${story?.guide || region.focus}</p>
      <div class="region-grid">${REGIONS.map(regionButton).join("")}</div>
    </section>

    <section class="battle-band ${save.battle?.flash ? "is-flash" : ""} ${save.battle?.bossAura || ""}">
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="stage" aria-label="${region.name} 지역"></canvas>
        ${renderFloaters()}
      </div>
      <div class="battle-card">
        ${save.battle ? renderBattlePanel() : renderRegionPanel(region)}
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">STAGES</p>
          <h3>${region.name}</h3>
        </div>
      </div>
      <div class="stage-grid">${stages.map(stageTile).join("")}</div>
    </section>
  `;
}

function renderRegionPanel(region) {
  const nextStage = getNextStage(save);
  const selectedNext = nextStage.region === region.id ? nextStage : STAGES.find((stage) => stage.region === region.id && isStageOpen(stage.id));
  const locked = !save.unlockedRegions.includes(region.id);
  const story = getRegionStory(region.id);
  return `
    <div>
      <p class="eyebrow">SELECTED</p>
      <h3>${region.name}</h3>
      <p>${locked ? "이전 지역의 핵심 스테이지를 클리어하면 열립니다." : story?.intro || region.line}</p>
    </div>
    <div class="metric-row compact">
      <span class="pill">주요 보상 ${region.focus}</span>
      <span class="pill">전투속도 x${save.settings.battleSpeed}</span>
    </div>
    <div class="actions">
      <button class="primary-button" data-action="start-stage" data-id="${selectedNext?.id || ""}" type="button" ${locked || !selectedNext ? "disabled" : ""}>진입</button>
    </div>
  `;
}

function renderBattlePanel() {
  const battle = save.battle;
  const stage = getStage(battle.stageId);
  const enemy = getEnemy(stage.enemy);
  const boss = getBossByStage(stage.id);
  const enemyElement = ATTRIBUTES[enemy.element];
  const summary = battleSummary(save);
  const units = getBattleParty(save);
  const logLines = save.settings.compactLog ? 3 : 6;

  return `
    ${battle.cutin ? `<div class="ex-cutin ${battle.cutin.className}"><strong>${battle.cutin.name}</strong><span>${battle.cutin.text}</span></div>` : ""}
    <div>
      <p class="eyebrow">${boss ? boss.title : "BATTLE"}</p>
      <div class="battle-topline">
        <h3>${boss ? boss.name : stage.name}</h3>
        <span class="pill">${enemyElement.sigil} ${enemyElement.name}</span>
      </div>
      <p>${boss ? boss.description : enemy.trait?.description || enemy.archetype}</p>
    </div>
    <div>
      <div class="battle-topline">
        <span>적 HP</span>
        <strong>${Math.max(0, Math.ceil(battle.enemyHp))}/${battle.enemyMaxHp}</strong>
      </div>
      <div class="bar"><div class="bar-fill enemy" style="width: ${summary.enemyPercent}%"></div></div>
    </div>
    <div>
      <div class="battle-topline">
        <span>파티 HP · 장벽 ${Math.round(battle.shield)}</span>
        <strong>${Math.max(0, Math.ceil(battle.partyHp))}/${battle.partyMaxHp}</strong>
      </div>
      <div class="bar"><div class="bar-fill" style="width: ${summary.partyPercent}%"></div></div>
    </div>
    <div class="speed-row">
      ${[1, 1.5, 2].map((speed) => `<button class="speed-button ${save.settings.battleSpeed === speed ? "is-active" : ""}" data-action="speed" data-id="${speed}" type="button">x${speed}</button>`).join("")}
    </div>
    <button class="skill-button ${battle.core >= 100 ? "is-ready" : ""}" data-action="core-burst" type="button" ${battle.core >= 100 ? "" : "disabled"}>
      <span>코어 버스트 · 화염/빙결</span>
      <strong>${Math.floor(battle.core || 0)}%</strong>
    </button>
    <div class="skill-row">
      ${units.map((unit) => skillButton(unit, battle, enemy)).join("")}
    </div>
    <div class="battle-log">${battle.log.slice(-logLines).join("<br>")}</div>
    <div class="actions">
      <button class="ghost-button" data-action="retreat" type="button">철수</button>
    </div>
  `;
}

function renderUnit() {
  const formation = formationSummary(save);
  return `
    <section class="split-band">
      <div class="split-copy">
        <p class="eyebrow">UNIT</p>
        <h2>코어 각성자</h2>
        <p>0.4부터 실제 전투는 편성된 파티와 패시브 조합을 기준으로 계산됩니다.</p>
      </div>
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="unit" aria-label="속성 문양"></canvas>
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">ROSTER</p>
          <h3>캐릭터 목록</h3>
        </div>
        <span class="pill">편성 전투력 ${formatNumber(formation.power)}</span>
      </div>
      <div class="guide-card">
        <strong>현재 편성 · ${formatNumber(formation.power)}</strong>
        <span>${formation.units.map((unit) => unit.name).join(" / ") || "편성 없음"}</span>
        <div class="metric-row compact">
          ${formation.labels.map((label) => `<span class="pill">${label}</span>`).join("")}
        </div>
      </div>
      <div class="unit-grid">${allUnitCards(save).map(unitTile).join("")}</div>
    </section>
  `;
}

function renderGacha() {
  const remainingPity = Math.max(0, GACHA.pityTarget - save.gacha.pity);
  return `
    <section class="gacha-band">
      <div class="gacha-copy">
        <p class="eyebrow">GACHA</p>
        <h2>${GACHA.name}</h2>
        <p>현재 픽업 없음. 이미 보유한 유닛은 조각과 재화로 변환됩니다.</p>
        <div class="gacha-actions">
          <button class="primary-button" data-action="pull" data-count="1" type="button" ${save.currencies.quartz < GACHA.singleCost ? "disabled" : ""}>1회 Q${GACHA.singleCost}</button>
          <button class="ghost-button" data-action="pull" data-count="10" type="button" ${save.currencies.quartz < GACHA.tenCost ? "disabled" : ""}>10회 Q${GACHA.tenCost}</button>
        </div>
        <div class="gacha-rate">
          <span>ANTIQUE POWER 8% · MYSTIC 18% · RARE 74%</span>
          <span>${remainingPity <= 5 ? "천장 임박" : "천장까지"} ${remainingPity}회 · 중복은 자동 변환</span>
        </div>
      </div>
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="gacha" aria-label="추첨 장치"></canvas>
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">POOL</p>
          <h3>획득 가능 목록</h3>
        </div>
      </div>
      <div class="unit-grid">${CHARACTERS.map(poolTile).join("")}</div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">RESULT</p>
          <h3>최근 추첨</h3>
        </div>
      </div>
      ${save.gacha.history.length ? `<div class="result-grid">${save.gacha.history.slice(0, 10).map(resultTile).join("")}</div>` : `<p class="empty-copy">아직 기록된 추첨 결과가 없습니다.</p>`}
    </section>
  `;
}

function renderMenu() {
  return `
    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">INVENTORY</p>
          <h3>인벤토리</h3>
        </div>
      </div>
      ${renderInventoryFilters()}
      ${renderFilteredInventory()}
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">ACHIEVEMENT</p>
          <h3>업적</h3>
        </div>
        <span class="pill">${achievementSummary(save).ready} 수령 가능</span>
      </div>
      ${renderAchievementFilters()}
      <div class="achievement-list">${getAchievementRows(save, save.achievements.filter).map(achievementCard).join("")}</div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">SETTINGS</p>
          <h3>설정</h3>
        </div>
      </div>
      ${settingRow("bgm", "BGM", save.settings.bgm)}
      ${settingRow("sfx", "효과음", save.settings.sfx)}
      ${settingRow("vibration", "진동", save.settings.vibration)}
      ${settingRow("compactLog", "로그 간소화", save.settings.compactLog)}
      ${settingRow("autoSkill", "자동 EX", save.settings.autoSkill)}
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">UPDATE</p>
          <h3>업데이트 내역</h3>
        </div>
      </div>
      <div class="recent-list">
        ${UPDATE_LOG.map((line, index) => `<button class="recent-row log-row" ${index === UPDATE_LOG.length - 1 ? 'data-action="hidden-trigger" data-id="missing_record"' : ""} type="button">${line}</button>`).join("")}
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">DATA</p>
          <h3>저장</h3>
        </div>
        <span class="pill">v${SAVE_VERSION}</span>
      </div>
      <div class="setting-row">
        <div>
          <strong>로컬 저장</strong>
          <small>세이브 버전, 진행, 지역 해금, 천장, 설정이 함께 저장됩니다.</small>
        </div>
        <button class="small-button primary-button" data-action="save" type="button">저장</button>
      </div>
      <div class="setting-row">
        <div>
          <strong>불러오기</strong>
          <small>누락 필드는 자동 보정됩니다.</small>
        </div>
        <button class="small-button ghost-button" data-action="load" type="button">불러오기</button>
      </div>
      <div class="setting-row">
        <div>
          <strong>초기화</strong>
          <small>현재 브라우저의 진행 데이터를 새로 시작합니다.</small>
        </div>
        <button class="small-button danger-button" data-action="reset" type="button">초기화</button>
      </div>
    </section>
  `;
}

function metricTile(label, value) {
  return `<div class="metric-tile"><strong>${value}</strong><span>${label}</span></div>`;
}

function renderProgressGuide(nextStage, story) {
  const nextRegion = getRegion(nextStage.region);
  const boss = getBossByStage(nextStage.id);
  const power = Math.round(battlePartyPower(save));
  const target = power >= nextStage.recommendedPower ? "탐색 가능" : `강화 필요 ${formatNumber(nextStage.recommendedPower - power)}`;
  const nextUnlock = nextStage.unlocks?.regions?.[0] ? `${getRegion(nextStage.unlocks.regions[0]).name} 해금` : boss ? "보스 제압" : "다음 스테이지 해금";
  return `
    <div class="guide-card">
      <strong>${boss ? boss.name : `${nextRegion.name} · ${nextStage.name}`}</strong>
      <span>${story?.guide || nextRegion.line}</span>
      <div class="metric-row compact">
        <span class="pill">${target}</span>
        <span class="pill">${nextUnlock}</span>
      </div>
    </div>
  `;
}

function missionRow(mission, scope = "daily") {
  const entry = scope === "weekly" ? save.missions.weekly[mission.id] : save.missions.daily[mission.id];
  const progress = Math.min(mission.target, entry.progress);
  const ready = progress >= mission.target && !entry.claimed;
  return `
    <article class="mission-row">
      <div>
        <strong>${mission.label}</strong>
        <span>${progress}/${mission.target} · ${rewardText(mission.reward)}</span>
      </div>
      <button class="small-button ${ready ? "primary-button" : "ghost-button"}" data-action="claim-mission" data-id="${mission.id}" type="button" ${ready ? "" : "disabled"}>${entry.claimed ? "완료" : "수령"}</button>
    </article>
  `;
}

function renderRecent() {
  if (!save.recent.length) return `<p class="empty-copy">아직 기록이 없습니다.</p>`;
  return `<div class="recent-list">${save.recent.slice(0, 6).map((item) => `<div class="recent-row">${item.text}</div>`).join("")}</div>`;
}

function regionButton(region) {
  const locked = !save.unlockedRegions.includes(region.id);
  return `
    <button class="region-tab ${region.id === save.selectedRegion ? "is-active" : ""}" data-action="select-region" data-id="${region.id}" type="button" ${locked ? "disabled" : ""}>
      <span class="region-sigil" style="color: ${region.colorA}">${region.sigil}</span>
      <span>
        <strong>${region.name}</strong>
        <span class="stage-meta">${locked ? "잠김" : `${region.focus} 중심 · ${region.line}`}</span>
      </span>
    </button>
  `;
}

function stageTile(stage) {
  const enemy = getEnemy(stage.enemy);
  const boss = getBossByStage(stage.id);
  const enemyElement = ATTRIBUTES[enemy.element];
  const recommended = ATTRIBUTES[recommendedAttributeFor(enemy.element)];
  const locked = !isStageOpen(stage.id) || !save.unlockedRegions.includes(stage.region);
  const cleared = save.clearedStages.includes(stage.id);
  const power = Math.round(battlePartyPower(save));
  const reward = cleared ? stage.repeatReward : stage.firstReward;
  const state = cleared ? "CLEAR" : locked ? "LOCK" : power >= stage.recommendedPower ? "OPEN" : "HARD";

  return `
    <article class="stage-tile ${locked ? "is-locked" : ""} ${boss ? "is-boss" : ""}">
      <div class="stage-title">
        <div>
          <strong>${stage.order}. ${boss ? boss.name : stage.name}</strong>
          <span class="stage-meta">${boss ? "BOSS · " : ""}${enemy.name} · ${enemyElement.sigil} ${enemyElement.name}</span>
        </div>
        <span class="pill">${state}</span>
      </div>
      <div class="stage-meta">권장 전투력 ${formatNumber(stage.recommendedPower)} · 추천 속성 ${recommended.sigil} ${recommended.name}</div>
      <div class="stage-meta">파밍 목적 ${stage.farmGoal || getRegion(stage.region).focus}</div>
      <div class="stage-meta">${enemy.trait?.label || enemy.archetype}: ${enemy.trait?.description || ""}</div>
      <div class="stage-meta">최초 ${rewardText(stage.firstReward)}</div>
      <div class="stage-meta">반복 ${rewardText(stage.repeatReward)}</div>
      <button class="${locked ? "ghost-button" : "primary-button"}" data-action="start-stage" data-id="${stage.id}" type="button" ${locked ? "disabled" : ""}>진입</button>
    </article>
  `;
}

function skillButton(unit, battle, enemy) {
  const progress = Math.min(100, Math.floor(battle.charge[unit.id] || 0));
  const ready = progress >= 100;
  const element = ATTRIBUTES[unit.element];
  return `
    <button class="skill-button ${ready ? "is-ready" : ""}" data-action="skill" data-id="${unit.id}" type="button" ${ready ? "" : "disabled"}>
      <span>${element.sigil} ${unit.name} · ${attributeLabel(unit.element, enemy.element)}</span>
      <strong>${progress}%</strong>
    </button>
  `;
}

function unitTile(unit) {
  const element = ATTRIBUTES[unit.element];
  const cost = unit.owned ? upgradeCost(unit.state) : null;
  const inFormation = save.formation.includes(unit.id);
  return `
    <article class="unit-tile ${unit.owned ? "" : "is-locked"}">
      <div class="unit-title">
        <div class="unit-title">
          <span class="unit-sigil" style="color: ${element.color}">${unit.icon}</span>
          <div class="unit-main">
            <strong>${unit.name}</strong>
            <span class="unit-meta">${unit.grade} · ${element.name} · ${unit.role}</span>
          </div>
        </div>
        <span class="pill">${unit.owned ? `Lv.${unit.state.level}` : "LOCK"}</span>
      </div>
      <div class="stat-grid">
        ${statChip("HP", unit.stats.hp)}
        ${statChip("ATK", unit.stats.atk)}
        ${statChip("DEF", unit.stats.def)}
        ${statChip("SPD", unit.stats.speed)}
      </div>
      <p class="unit-meta">EX ${unit.ex.name}: ${unit.ex.description}</p>
      <p class="unit-meta">PASSIVE ${unit.passive?.name}: ${unit.passive?.description}</p>
      ${unit.owned ? `<div class="unit-meta">다음 ${unit.nextStats.hp}/${unit.nextStats.atk}/${unit.nextStats.def} · 비용 ${costText(cost)}</div>` : ""}
      <div class="actions">
        <button class="small-button ${inFormation ? "primary-button" : "ghost-button"}" data-action="toggle-formation" data-id="${unit.id}" type="button" ${unit.owned ? "" : "disabled"}>${inFormation ? "편성중" : "편성"}</button>
        <button class="small-button ${unit.owned ? "primary-button" : "ghost-button"}" data-action="upgrade" data-id="${unit.id}" type="button" ${canUpgrade(save, unit.id) ? "" : "disabled"}>강화</button>
      </div>
    </article>
  `;
}

function statChip(label, value) {
  return `<span class="stat-chip"><b>${label}</b>${value}</span>`;
}

function costText(cost) {
  return Object.entries(cost)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${rewardName(key)} ${value}`)
    .join(" · ");
}

function poolTile(character) {
  const element = ATTRIBUTES[character.element];
  const duplicate = GACHA.duplicateRewards[character.grade] || GACHA.duplicateRewards.default;
  return `
    <article class="unit-tile">
      <div class="unit-title">
        <div class="unit-title">
          <span class="unit-sigil" style="color: ${element.color}">${character.icon}</span>
          <div class="unit-main">
            <strong>${character.name}</strong>
            <span class="unit-meta">${character.grade} · ${element.name}</span>
          </div>
        </div>
      </div>
      <p class="unit-meta">중복 변환: 조각 ${duplicate.shards} · 블링 ${duplicate.bling}${duplicate.plate ? ` · 형판 ${duplicate.plate}` : ""}</p>
    </article>
  `;
}

function resultTile(result) {
  return `
    <div class="gacha-result ${result.gradeClass || ""}">
      <span class="result-chip">${result.grade}${result.duplicate ? " · 중복" : ""}</span>
      <strong>${result.name}</strong>
      <span>${result.detail}</span>
    </div>
  `;
}

function renderInventoryFilters() {
  const filters = [
    ["all", "전체"],
    ["currency", "재화"],
    ["material", "재료"],
    ["plate", "형판"],
    ["shard", "조각"],
    ["etc", "기타"],
  ];
  return `<div class="filter-row">${filters.map(([id, label]) => `<button class="filter-button ${save.ui.inventoryFilter === id ? "is-active" : ""}" data-action="set-inventory-filter" data-id="${id}" type="button">${label}</button>`).join("")}</div>`;
}

function renderFilteredInventory() {
  const filter = save.ui.inventoryFilter;
  const sections = [];
  if (filter === "all" || filter === "currency") {
    sections.push(inventorySection("재화", CURRENCIES.map((item) => ({ label: item.name, value: save.currencies[item.id], note: "기본 재화" }))));
  }
  if (filter === "all" || filter === "material") {
    sections.push(inventorySection("강화 재료", [
      { label: "코어 조각", value: save.inventory.materials.core, note: "피온스 주요 드롭" },
      { label: "양자 분진", value: save.inventory.materials.dust, note: "트로맨션/오로시스 드롭" },
      { label: "공허 키", value: save.inventory.materials.key, note: "오로시스 후반 드롭" },
      { label: "보스 재료", value: save.inventory.materials.bossMaterial || 0, note: "주간 보스 목표 보상" },
    ]));
  }
  if (filter === "all" || filter === "plate") {
    sections.push(inventorySection("속성 형판", [
      { label: "형판", value: save.currencies.plate, note: "보스와 후반 스테이지" },
      { label: "도심 제어 코어", value: save.inventory.materials.controlCore || 0, note: "피온스 보스 반복 보상" },
      { label: "무역 집행 인장", value: save.inventory.materials.tradeSeal || 0, note: "트로맨션 보스 반복 보상" },
      { label: "오염 수핵", value: save.inventory.materials.aquaCore || 0, note: "오로시스 보스 반복 보상" },
    ]));
  }
  if (filter === "all" || filter === "shard") {
    sections.push(inventorySection("캐릭터 조각", CHARACTERS.map((unit) => ({ label: unit.name, value: save.inventory.shards[unit.id] || 0, note: "가챠 중복 변환" }))));
  }
  if (filter === "all" || filter === "etc") {
    sections.push(inventorySection("기타", [{ label: "숨겨진 기록", value: save.achievements.hidden?.penta_mark || 0, note: "특별 업적 단서" }]));
  }
  return sections.join("");
}

function inventorySection(title, items) {
  return `
    <div class="inventory-section">
      <h4>${title}</h4>
      <div class="inventory-grid">${items.map((item) => `<div class="inventory-tile"><strong>${formatNumber(item.value)}</strong><span>${item.label}</span><small>${item.note || ""}</small></div>`).join("")}</div>
    </div>
  `;
}

function renderAchievementFilters() {
  return `<div class="filter-row achievement-filter">${ACHIEVEMENT_CATEGORIES.map((category) => `<button class="filter-button ${save.achievements.filter === category.id ? "is-active" : ""}" data-action="set-achievement-filter" data-id="${category.id}" type="button">${category.label}</button>`).join("")}</div>`;
}

function achievementCard(achievement) {
  const pct = Math.min(100, Math.round((achievement.progress.current / achievement.progress.target) * 100));
  const disabled = achievement.disabled;
  return `
    <article class="achievement-card ${achievement.complete ? "is-complete" : ""} ${achievement.claimed ? "is-claimed" : ""} ${disabled ? "is-disabled" : ""}">
      <div>
        <span class="result-chip">${categoryName(achievement.category)}</span>
        <strong>${achievement.displayName}</strong>
        <p>${disabled ? "온라인/이벤트 버전 예정" : achievement.displayDescription}</p>
      </div>
      <div class="bar"><div class="bar-fill" style="width: ${pct}%"></div></div>
      <div class="battle-topline">
        <span>${formatNumber(achievement.progress.current)} / ${formatNumber(achievement.progress.target)}</span>
        <span>${rewardText(achievement.reward || {})}</span>
      </div>
      <button class="small-button ${achievement.complete && !achievement.claimed ? "primary-button" : "ghost-button"}" data-action="claim-achievement" data-id="${achievement.id}" type="button" ${achievement.complete && !achievement.claimed ? "" : "disabled"}>${achievement.claimed ? "수령 완료" : "보상 수령"}</button>
    </article>
  `;
}

function categoryName(id) {
  return ACHIEVEMENT_CATEGORIES.find((category) => category.id === id)?.label || id;
}

function settingRow(id, label, value) {
  return `
    <div class="setting-row">
      <div>
        <strong>${label}</strong>
        <small>${value ? "켜짐" : "꺼짐"}</small>
      </div>
      <button class="small-button ${value ? "primary-button" : "ghost-button"}" data-action="toggle-setting" data-id="${id}" type="button">${value ? "ON" : "OFF"}</button>
    </div>
  `;
}

function renderFloaters() {
  const floats = save.battle?.floats || [];
  return floats.map((float, index) => `<span class="combat-float ${float.type}" style="--i:${index}">${float.text}</span>`).join("");
}

function selectRegion(id) {
  if (!save.unlockedRegions.includes(id)) return;
  save.selectedRegion = id;
  persist();
  render();
}

function startBattle(stageId) {
  const stage = getStage(stageId);
  if (!stage || !isStageOpen(stage.id) || !save.unlockedRegions.includes(stage.region)) return;
  const boss = getBossByStage(stage.id);
  save.selectedRegion = stage.region;
  save.activeTab = "stage";
  save.stats.stagePlays += 1;
  save.battle = createBattle(save, stageId);
  save.story.seenStageStart = save.story.seenStageStart || [];
  const firstEntry = !save.story.seenStageStart.includes(stage.id);
  if (firstEntry) addUnique(save.story.seenStageStart, stage.id);
  persist();
  playSound(save, boss ? "boss" : "tap");
  vibrate(18);
  render();
  if (firstEntry || boss) {
    const story = getStageStory(stage.id);
    showModal(boss ? "보스 접근" : "진입 기록", `<p>${boss ? story.boss || boss.description : story.start || stage.name}</p>`);
  }
}

function tickBattleLoop() {
  if (!save.started || !save.battle) return;
  if (els.modal?.open) return;
  if (save.settings.autoSkill) {
    const readyUnit = getBattleParty(save).find((unit) => (save.battle.charge[unit.id] || 0) >= 100);
    if (readyUnit) {
      const fired = fireSkill(save, readyUnit.id);
      if (fired.ok) {
        updateMission(save, "exUse", 1);
        if (fired.status === "victory") {
          endBattle(true);
          return;
        }
      }
    }
  }
  const result = advanceBattle(save);
  if (result.status === "victory") {
    endBattle(true);
    return;
  }
  if (result.status === "defeat") {
    endBattle(false);
    return;
  }
  persist();
  playSound(save, "hit");
  if (save.activeTab === "stage") render();
}

function useSkill(unitId) {
  const result = fireSkill(save, unitId);
  if (!result.ok) return;
  updateMission(save, "exUse", 1);
  playSound(save, "ex");
  vibrate(24);
  if (result.status === "victory") {
    endBattle(true);
    return;
  }
  persist();
  render();
}

function useCoreBurst() {
  const result = fireCoreBurst(save);
  if (!result.ok) return;
  playSound(save, "ex");
  vibrate(28);
  if (result.status === "victory") {
    endBattle(true);
    return;
  }
  persist();
  render();
}

function setBattleSpeed(speed) {
  save.settings.battleSpeed = speed;
  persist();
  render();
}

function endBattle(victory, retreated = false) {
  const battle = save.battle;
  if (!battle) return;
  const stage = getStage(battle.stageId);
  const boss = getBossByStage(stage.id);
  save.battle = null;

  if (victory) {
    const firstClear = !save.clearedStages.includes(stage.id);
    const reward = clone(firstClear ? stage.firstReward : stage.repeatReward);
    grantReward(reward);
    save.stats.accountExp += stage.order * 85 + (boss ? 240 : 0);
    save.stats.wins += 1;
    if (boss) {
      save.stats.bossKills += 1;
      save.stats.lastBossDate = todayKey();
      save.stats.sameDayBossKills += 1;
      updateMission(save, "bossClear", 1);
    }
    updateMission(save, "stageClear", 1);

    if (firstClear) {
      addUnique(save.clearedStages, stage.id);
      stage.unlocks?.stages?.forEach((id) => addUnique(save.unlockedStages, id));
      stage.unlocks?.regions?.forEach((id) => addUnique(save.unlockedRegions, id));
    }

    addRecent(save, `${stage.name} ${firstClear ? "최초" : "반복"} 클리어`);
    persist();
    render();
    showRewardModal(stage, reward, firstClear);
    playSound(save, "victory");
    toast(`${stage.name} 클리어`);
    return;
  }

  save.stats.losses += retreated ? 0 : 1;
  addRecent(save, retreated ? `${stage.name} 철수` : `${stage.name} 실패`);
  persist();
  render();
  toast(retreated ? "철수했습니다." : "전투 실패");
}

function grantReward(reward) {
  let earnedCurrency = 0;
  Object.entries(reward).forEach(([key, value]) => {
    if (key in save.currencies) {
      save.currencies[key] += value;
      earnedCurrency += value;
      return;
    }
    save.inventory.materials[key] = (save.inventory.materials[key] || 0) + value;
  });
  save.stats.earned += earnedCurrency;
  if (earnedCurrency) updateMission(save, "earnCurrency", earnedCurrency);
}

function showRewardModal(stage, reward, firstClear) {
  const boss = getBossByStage(stage.id);
  const story = getStageStory(stage.id);
  showModal(
    boss ? "보스 제압" : firstClear ? "최초 클리어" : "탐색 완료",
    `
      <p>${story.clear || `${stage.name} 보상이 지급되었습니다.`}</p>
      ${boss ? `<p class="stage-note">${boss.rewardText}</p>` : ""}
      <div class="result-grid">
        ${Object.entries(reward).map(([key, value]) => `<div class="gacha-result"><strong>${value}</strong><span>${rewardName(key)}</span></div>`).join("")}
      </div>
    `
  );
}

function upgradeUnit(id) {
  if (!applyUpgrade(save, id)) return;
  const unit = getCharacter(id);
  updateMission(save, "upgrade", 1);
  addRecent(save, `${unit.name} Lv.${save.units[id].level} 강화`);
  persist(`${unit.name} 강화 완료`);
  playSound(save, "upgrade");
  vibrate(18);
  render();
}

function toggleUnitFormation(id) {
  if (!toggleFormation(save, id)) {
    toast("편성은 최소 1명, 최대 4명입니다.");
    return;
  }
  persist("편성 변경");
  render();
}

function pullGacha(count) {
  const cost = count === 10 ? GACHA.tenCost : GACHA.singleCost;
  if (save.currencies.quartz < cost) return;
  save.currencies.quartz -= cost;

  const results = [];
  for (let index = 0; index < count; index += 1) {
    const picked = pickGachaCharacter();
    const character = getCharacter(picked.character);
    const owned = save.units[character.id];
    const duplicateReward = GACHA.duplicateRewards[character.grade] || GACHA.duplicateRewards.default;
    const isAntique = character.grade === "ANTIQUE POWER";

    save.gacha.count += 1;
    save.gacha.pity = isAntique ? 0 : save.gacha.pity + 1;

    if (owned) {
      owned.dupes += 1;
      owned.shards += duplicateReward.shards;
      save.inventory.shards[character.id] = (save.inventory.shards[character.id] || 0) + duplicateReward.shards;
      save.currencies.bling += duplicateReward.bling || 0;
      save.currencies.plate += duplicateReward.plate || 0;
      results.push({
        name: character.name,
        grade: character.grade,
        gradeClass: gradeClass(character.grade),
        duplicate: true,
        detail: `중복 변환 · 조각 +${duplicateReward.shards}`,
      });
    } else {
      save.units[character.id] = { level: 1, shards: 0, dupes: 0, upgrades: 0 };
      save.inventory.shards[character.id] = save.inventory.shards[character.id] || 0;
      results.push({
        name: character.name,
        grade: character.grade,
        gradeClass: gradeClass(character.grade),
        duplicate: false,
        detail: "신규 획득",
      });
    }
  }

  save.stats.pulls += count;
  updateMission(save, "gacha", count);
  save.gacha.history = results.concat(save.gacha.history).slice(0, 20);
  addRecent(save, `${count}회 추첨 완료`);
  persist();
  render();
  playSound(save, "gacha");
  vibrate(26);
  showModal(results.some((result) => result.grade === "ANTIQUE POWER") ? "고대 신호 감지" : "추첨 결과", `<div class="result-grid">${results.map(resultTile).join("")}</div>`);
}

function gradeClass(grade) {
  if (grade === "ANTIQUE POWER") return "grade-antique";
  if (grade === "MYSTIC") return "grade-mystic";
  return "grade-rare";
}

function pickGachaCharacter() {
  if (save.gacha.pity >= GACHA.pityTarget - 1) {
    return GACHA.pool.find((item) => getCharacter(item.character).grade === "ANTIQUE POWER") || GACHA.pool[0];
  }
  return weightedPick(GACHA.pool);
}

function claimDailyMission(id) {
  const reward = claimMission(save, id);
  if (!reward) return;
  addRecent(save, `미션 보상 수령 · ${rewardText(reward)}`);
  persist("미션 보상 수령");
  render();
}

function setInventoryFilter(id) {
  save.ui.inventoryFilter = id;
  persist();
  render();
}

function setAchievementFilter(id) {
  save.achievements.filter = id;
  persist();
  render();
}

function claimAchievementReward(id) {
  const reward = claimAchievement(save, id);
  if (!reward) return;
  addRecent(save, `업적 보상 수령 · ${rewardText(reward)}`);
  persist("업적 보상 수령");
  playSound(save, "upgrade");
  render();
}

function revealHidden(id) {
  triggerHiddenAchievement(save, id);
  addRecent(save, "숨겨진 기록 발견");
  persist("숨겨진 기록 발견");
  render();
}

function toggleSetting(id) {
  save.settings[id] = !save.settings[id];
  persist();
  render();
}

function confirmReset() {
  showModal(
    "초기화",
    `
      <p>현재 브라우저의 Alpha ${SAVE_VERSION} 진행 데이터를 새로 시작합니다.</p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" data-action="modal-close">취소</button>
        <button class="danger-button" data-action="confirm-reset" type="button">초기화</button>
      </div>
    `
  );
  document.querySelector('[data-action="modal-close"]')?.addEventListener("click", closeModal, { once: true });
}

function resetGame() {
  save = resetSave();
  save.started = true;
  ensureDailyMissions(save);
  persist();
  closeModal();
  syncStartScreen();
  render();
  toast("새 데이터로 시작합니다.");
}

function isStageOpen(id) {
  return save.unlockedStages.includes(id);
}

function showModal(title, html) {
  els.modalContent.innerHTML = `<h3>${title}</h3>${html}`;
  document.body.classList.add("modal-open");
  els.modal.showModal();
}

function closeModal() {
  if (els.modal.open) els.modal.close();
  document.body.classList.remove("modal-open");
}

function toast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 1900);
}

function vibrate(ms) {
  if (save.settings.vibration && "vibrate" in navigator) navigator.vibrate(ms);
}

function drawStartScene() {
  const canvas = els.startCanvas;
  if (!canvas) return;
  const ctx = fitCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();

  ctx.fillStyle = "#0d1010";
  ctx.fillRect(0, 0, width, height);
  drawStarfield(ctx, width, height, 64);
  drawCore(ctx, width / 2, height * 0.46, Math.min(width, height) * 0.18, "#f0bd4f", "#5ec8b7");
  drawCityLine(ctx, width, height, "#1a2422");
}

function drawActiveScene() {
  document.querySelectorAll(".scene-canvas").forEach((canvas) => {
    const scene = canvas.dataset.scene;
    const ctx = fitCanvas(canvas);
    const { width, height } = canvas.getBoundingClientRect();
    const region = getRegion(save.selectedRegion);

    drawBackdrop(ctx, width, height, region);

    if (scene === "home") {
      drawCore(ctx, width * 0.52, height * 0.44, Math.min(width, height) * 0.18, region.colorB, region.colorA);
      drawCityLine(ctx, width, height, "#182321");
    }

    if (scene === "stage") {
      const battle = save.battle;
      const stage = battle ? getStage(battle.stageId) : getNextStage(save);
      const enemy = stage ? getEnemy(stage.enemy) : getEnemy("fracture-seed");
      drawStageObject(ctx, width, height, region);
      drawEnemy(ctx, width * 0.52, height * 0.48, Math.min(width, height) * 0.22, enemy);
    }

    if (scene === "unit") drawAttributeWheel(ctx, width, height);
    if (scene === "gacha") drawGachaGate(ctx, width, height);
  });
}

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawBackdrop(ctx, width, height, region) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#101414");
  gradient.addColorStop(0.42, mix(region.colorA, "#101414", 0.3));
  gradient.addColorStop(1, "#23211a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawStarfield(ctx, width, height, 24);
  ctx.strokeStyle = "rgba(245,239,225,0.09)";
  ctx.lineWidth = 1;
  for (let x = -height; x < width; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x + height, 0);
    ctx.stroke();
  }
}

function drawStarfield(ctx, width, height, count) {
  for (let index = 0; index < count; index += 1) {
    const x = (index * 97) % width;
    const y = (index * 53) % height;
    const size = 1 + (index % 3) * 0.6;
    ctx.fillStyle = index % 4 === 0 ? "rgba(94,200,183,0.55)" : "rgba(245,239,225,0.38)";
    ctx.fillRect(x, y, size, size);
  }
}

function drawCore(ctx, x, y, radius, colorA, colorB) {
  ctx.save();
  ctx.translate(x, y);
  for (let ring = 4; ring > 0; ring -= 1) {
    ctx.strokeStyle = ring % 2 ? colorA : colorB;
    ctx.globalAlpha = 0.16 + ring * 0.08;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let side = 0; side < 5; side += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * side) / 5;
      const px = Math.cos(angle) * radius * ring * 0.34;
      const py = Math.sin(angle) * radius * ring * 0.34;
      if (side === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = colorA;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(22, radius * 0.22), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111414";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(9, radius * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCityLine(ctx, width, height, color) {
  ctx.fillStyle = color;
  const base = height * 0.82;
  for (let index = 0; index < 18; index += 1) {
    const w = 24 + (index % 5) * 13;
    const h = 42 + (index % 6) * 18;
    const x = index * (width / 16) - 20;
    ctx.fillRect(x, base - h, w, h);
    ctx.fillRect(x + w * 0.36, base - h - 18, w * 0.28, 18);
  }
  ctx.fillRect(0, base, width, height - base);
}

function drawStageObject(ctx, width, height, region) {
  ctx.save();
  ctx.strokeStyle = region.colorB;
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.15, height * 0.76);
  ctx.lineTo(width * 0.32, height * 0.34);
  ctx.lineTo(width * 0.48, height * 0.76);
  ctx.lineTo(width * 0.66, height * 0.28);
  ctx.lineTo(width * 0.84, height * 0.76);
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(ctx, x, y, radius, enemy) {
  const color = ATTRIBUTES[enemy.element].color;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(245,239,225,0.65)";
  ctx.lineWidth = 2;

  if (enemy.shape === "orb") {
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (enemy.shape === "crystal") {
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.62, -radius * 0.12);
    ctx.lineTo(radius * 0.34, radius * 0.9);
    ctx.lineTo(-radius * 0.52, radius * 0.52);
    ctx.lineTo(-radius * 0.64, -radius * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (enemy.shape === "gear") {
    for (let i = 0; i < 10; i += 1) {
      ctx.rotate(Math.PI / 5);
      ctx.fillRect(radius * 0.42, -radius * 0.08, radius * 0.36, radius * 0.16);
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111414";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  if (enemy.shape === "lattice") {
    for (let i = 0; i < 5; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const px = Math.cos(angle) * radius * 0.82;
      const py = Math.sin(angle) * radius * 0.82;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawAttributeWheel(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;
  const items = Object.values(ATTRIBUTES);
  drawCore(ctx, centerX, centerY, radius * 0.82, "#f0bd4f", "#5ec8b7");

  items.forEach((item, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / items.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111414";
    ctx.font = "900 20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.sigil, x, y + 1);
  });
}

function drawGachaGate(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  for (let index = 0; index < 7; index += 1) {
    const radius = Math.min(width, height) * (0.12 + index * 0.045);
    ctx.strokeStyle = index % 2 ? "rgba(94,200,183,0.78)" : "rgba(240,189,79,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.4, radius * 0.58, index * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawCore(ctx, cx, cy, Math.min(width, height) * 0.16, "#a796ff", "#f0bd4f");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
