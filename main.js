const STORAGE_KEY = "pua-web-alpha-01";

const CURRENCIES = [
  { id: "quartz", name: "쿼츠", symbol: "Q" },
  { id: "bling", name: "블링", symbol: "B" },
  { id: "plate", name: "형판", symbol: "P" },
];

const ATTRIBUTES = {
  star: { name: "별", sigil: "✦", color: "#f0bd4f" },
  quantum: { name: "양자", sigil: "◈", color: "#5ec8b7" },
  void: { name: "공허", sigil: "●", color: "#a796ff" },
  imaginary: { name: "허수", sigil: "◇", color: "#ee6c58" },
};

const REGIONS = [
  {
    id: "pions",
    name: "피온스",
    sigil: "P",
    colorA: "#5ec8b7",
    colorB: "#f0bd4f",
    line: "펜타 코어의 잔광이 가장 먼저 흔들린 초입 지역.",
  },
  {
    id: "tromansion",
    name: "트로맨션",
    sigil: "T",
    colorA: "#ee6c58",
    colorB: "#8fcf68",
    line: "형판 광맥과 연구 장치가 겹쳐진 고밀도 공업 구역.",
  },
  {
    id: "orosis",
    name: "오로시스",
    sigil: "O",
    colorA: "#a796ff",
    colorB: "#5ec8b7",
    line: "허수 기류가 하늘을 접어 올리는 관측 도시.",
  },
];

const CHARACTERS = [
  {
    id: "mepi",
    name: "메피",
    grade: "ANTIQUE POWER",
    element: "star",
    role: "서포터",
    icon: "✦",
    hp: 180,
    atk: 28,
    speed: 12,
    ex: { name: "펜타 리커버", type: "heal", power: 95 },
  },
  {
    id: "noark",
    name: "노아크",
    grade: "RARE",
    element: "quantum",
    role: "브레이커",
    icon: "◈",
    hp: 210,
    atk: 34,
    speed: 9,
    ex: { name: "양자 절단", type: "damage", power: 132 },
  },
  {
    id: "rivia",
    name: "리비아",
    grade: "MYSTIC",
    element: "void",
    role: "디버퍼",
    icon: "●",
    hp: 165,
    atk: 42,
    speed: 13,
    ex: { name: "공허 감압", type: "damage", power: 150 },
  },
  {
    id: "seha",
    name: "세하",
    grade: "RARE",
    element: "imaginary",
    role: "가드",
    icon: "◇",
    hp: 260,
    atk: 24,
    speed: 7,
    ex: { name: "허수 장벽", type: "shield", power: 120 },
  },
];

const ENEMIES = [
  { id: "fracture-seed", name: "균열 결정체", element: "void", hp: 220, atk: 18, shape: "crystal" },
  { id: "quantum-wisp", name: "양자 부유핵", element: "quantum", hp: 260, atk: 22, shape: "orb" },
  { id: "blank-gear", name: "허수 톱니", element: "imaginary", hp: 310, atk: 25, shape: "gear" },
  { id: "penta-shard", name: "펜타 파편", element: "star", hp: 360, atk: 28, shape: "crystal" },
  { id: "ore-lattice", name: "광맥 격자", element: "quantum", hp: 430, atk: 31, shape: "lattice" },
  { id: "hollow-vane", name: "공허 베인", element: "void", hp: 520, atk: 35, shape: "orb" },
  { id: "fault-engine", name: "붕괴 엔진", element: "imaginary", hp: 620, atk: 40, shape: "gear" },
  { id: "mirror-node", name: "거울 노드", element: "star", hp: 720, atk: 44, shape: "lattice" },
  { id: "deep-signal", name: "심층 신호체", element: "void", hp: 840, atk: 49, shape: "orb" },
  { id: "penta-anomaly", name: "펜타 변칙핵", element: "quantum", hp: 980, atk: 55, shape: "crystal" },
];

const STAGES = [
  { id: "pions-01", region: "pions", order: 1, name: "균형의 외곽", enemy: "fracture-seed", reward: { quartz: 80, bling: 70, core: 1 } },
  { id: "pions-02", region: "pions", order: 2, name: "첫 양자 흔적", enemy: "quantum-wisp", reward: { quartz: 90, bling: 82, core: 1 } },
  { id: "pions-03", region: "pions", order: 3, name: "접힌 회랑", enemy: "blank-gear", reward: { quartz: 100, bling: 94, plate: 1 } },
  { id: "pions-04", region: "pions", order: 4, name: "펜타 잔광", enemy: "penta-shard", reward: { quartz: 120, bling: 110, core: 2 } },
  { id: "tromansion-01", region: "tromansion", order: 5, name: "형판 광맥", enemy: "ore-lattice", reward: { quartz: 140, bling: 130, plate: 1 } },
  { id: "tromansion-02", region: "tromansion", order: 6, name: "공허 압력실", enemy: "hollow-vane", reward: { quartz: 150, bling: 150, dust: 1 } },
  { id: "tromansion-03", region: "tromansion", order: 7, name: "붕괴 엔진", enemy: "fault-engine", reward: { quartz: 170, bling: 170, plate: 2 } },
  { id: "orosis-01", region: "orosis", order: 8, name: "오로라 접면", enemy: "mirror-node", reward: { quartz: 190, bling: 190, dust: 1 } },
  { id: "orosis-02", region: "orosis", order: 9, name: "심층 신호", enemy: "deep-signal", reward: { quartz: 220, bling: 220, key: 1 } },
  { id: "orosis-03", region: "orosis", order: 10, name: "양자 변칙핵", enemy: "penta-anomaly", reward: { quartz: 260, bling: 250, key: 1, plate: 2 } },
];

const GACHA_POOL = [
  { character: "mepi", weight: 8, shards: 18 },
  { character: "rivia", weight: 18, shards: 12 },
  { character: "noark", weight: 37, shards: 10 },
  { character: "seha", weight: 37, shards: 10 },
];

const BASE_STATE = {
  version: 1,
  started: false,
  activeTab: "home",
  selectedRegion: "pions",
  highestStage: 1,
  currencies: { quartz: 1200, bling: 500, plate: 0 },
  inventory: { core: 0, dust: 0, key: 0 },
  ownedUnits: {
    mepi: { level: 1, shards: 0 },
    noark: { level: 1, shards: 0 },
  },
  stats: { wins: 0, losses: 0, pulls: 0 },
  lastClaim: "",
  lastResults: [],
  battle: null,
};

let state = loadState();
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

  wireEvents();
  syncStartScreen();
  render();
  drawStartScene();
  registerServiceWorker();

  window.addEventListener("resize", () => {
    drawStartScene();
    drawActiveScene();
  });

  setInterval(tickBattle, 950);
});

function wireEvents() {
  els.startButton.addEventListener("click", () => {
    state = freshState();
    state.started = true;
    saveState();
    syncStartScreen();
    render();
    toast("게스트 데이터가 생성되었습니다.");
  });

  els.continueButton.addEventListener("click", () => {
    state.started = true;
    saveState();
    syncStartScreen();
    render();
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      saveState();
      render();
    });
  });

  els.view.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const { action, id, count } = target.dataset;
    if (action === "select-region") selectRegion(id);
    if (action === "start-stage") startBattle(id);
    if (action === "skill") useSkill(id);
    if (action === "retreat") endBattle(false, true);
    if (action === "claim") claimSupply();
    if (action === "upgrade") upgradeUnit(id);
    if (action === "pull") pullGacha(Number(count));
    if (action === "save") {
      saveState();
      toast("저장되었습니다.");
    }
    if (action === "load") {
      state = loadState(true);
      syncStartScreen();
      render();
      toast("불러왔습니다.");
    }
    if (action === "reset") confirmReset();
    if (action === "go") {
      state.activeTab = id;
      saveState();
      render();
    }
  });

  els.modalClose.addEventListener("click", () => els.modal.close());
}

function freshState() {
  return clone(BASE_STATE);
}

function loadState(forceStorage = false) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return freshState();

  try {
    const parsed = JSON.parse(raw);
    return mergeState(freshState(), parsed);
  } catch {
    return forceStorage ? freshState() : clone(BASE_STATE);
  }
}

function mergeState(base, incoming) {
  const merged = { ...base, ...incoming };
  merged.currencies = { ...base.currencies, ...(incoming.currencies || {}) };
  merged.inventory = { ...base.inventory, ...(incoming.inventory || {}) };
  merged.ownedUnits = { ...base.ownedUnits, ...(incoming.ownedUnits || {}) };
  merged.stats = { ...base.stats, ...(incoming.stats || {}) };
  return merged;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function syncStartScreen() {
  els.startScreen.hidden = state.started;
  els.continueButton.disabled = !localStorage.getItem(STORAGE_KEY);
}

function render() {
  renderWallet();
  renderTabs();

  if (!state.started) {
    els.view.innerHTML = "";
    return;
  }

  const views = {
    home: renderHome,
    stage: renderStage,
    unit: renderUnit,
    gacha: renderGacha,
    menu: renderMenu,
  };

  els.view.innerHTML = views[state.activeTab]();
  requestAnimationFrame(drawActiveScene);
}

function renderWallet() {
  els.wallet.innerHTML = CURRENCIES.map((currency) => {
    return `
      <div class="wallet-item">
        <span class="wallet-symbol">${currency.symbol}</span>
        <strong>${formatNumber(state.currencies[currency.id] || 0)}</strong>
      </div>
    `;
  }).join("");
}

function renderTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.activeTab);
  });
}

function renderHome() {
  const cleared = Math.max(0, state.highestStage - 1);
  const owned = Object.keys(state.ownedUnits).length;
  const todayClaimed = state.lastClaim === todayKey();
  const currentRegion = getRegion(state.selectedRegion);

  return `
    <section class="hero-band">
      <div class="hero-copy">
        <p class="eyebrow">CURRENT SIGNAL</p>
        <h2>펜타 코어가 흔들리고 있습니다.</h2>
        <p>${currentRegion.line}</p>
        <div class="quick-grid">
          ${metricTile("클리어", `${cleared}/${STAGES.length}`)}
          ${metricTile("보유 유닛", `${owned}/${CHARACTERS.length}`)}
          ${metricTile("승리", state.stats.wins)}
          ${metricTile("추첨", state.stats.pulls)}
        </div>
        <div class="actions" style="margin-top: 14px">
          <button class="primary-button" data-action="go" data-id="stage" type="button">탐색</button>
          <button class="ghost-button" data-action="claim" type="button" ${todayClaimed ? "disabled" : ""}>
            오늘 보급
          </button>
        </div>
      </div>
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="home" aria-label="펜타 코어"></canvas>
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">OPENING</p>
          <h3>양자 신호 기록</h3>
        </div>
      </div>
      <p class="stage-note">
        펜타티온의 도시들은 같은 균열을 서로 다르게 해석한다. 피온스는 균형을,
        트로맨션은 형판 데이터를, 오로시스는 하늘에 접힌 허수 좌표를 추적한다.
      </p>
    </section>
  `;
}

function renderStage() {
  const region = getRegion(state.selectedRegion);
  const stages = STAGES.filter((stage) => stage.region === region.id);
  const battle = state.battle;

  return `
    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">REGION</p>
          <h3>지역 선택</h3>
        </div>
      </div>
      <div class="region-grid">
        ${REGIONS.map((item) => regionButton(item)).join("")}
      </div>
    </section>

    <section class="battle-band">
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="stage" aria-label="${region.name} 지역"></canvas>
      </div>
      <div class="battle-card">
        ${battle ? renderBattlePanel(battle) : renderRegionPanel(region)}
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">STAGES</p>
          <h3>${region.name}</h3>
        </div>
      </div>
      <div class="stage-grid">
        ${stages.map((stage) => stageTile(stage)).join("")}
      </div>
    </section>
  `;
}

function renderRegionPanel(region) {
  const nextStage = STAGES.find((stage) => stage.order === state.highestStage) || STAGES[STAGES.length - 1];
  return `
    <div>
      <p class="eyebrow">SELECTED</p>
      <h3>${region.name}</h3>
      <p>${region.line}</p>
    </div>
    <div class="actions">
      <button class="primary-button" data-action="start-stage" data-id="${nextStage.id}" type="button">
        다음 스테이지
      </button>
    </div>
  `;
}

function renderBattlePanel(battle) {
  const stage = getStage(battle.stageId);
  const enemy = getEnemy(stage.enemy);
  const enemyPercent = percent(battle.enemyHp, battle.enemyMaxHp);
  const partyPercent = percent(battle.partyHp, battle.partyMaxHp);
  const units = getOwnedCharacters();

  return `
    <div>
      <p class="eyebrow">BATTLE</p>
      <div class="battle-topline">
        <h3>${stage.name}</h3>
        <span class="pill">${enemy.name}</span>
      </div>
    </div>
    <div>
      <div class="battle-topline">
        <span>적 HP</span>
        <strong>${Math.max(0, Math.ceil(battle.enemyHp))}/${battle.enemyMaxHp}</strong>
      </div>
      <div class="bar"><div class="bar-fill enemy" style="width: ${enemyPercent}%"></div></div>
    </div>
    <div>
      <div class="battle-topline">
        <span>파티 HP</span>
        <strong>${Math.max(0, Math.ceil(battle.partyHp))}/${battle.partyMaxHp}</strong>
      </div>
      <div class="bar"><div class="bar-fill" style="width: ${partyPercent}%"></div></div>
    </div>
    <div class="skill-row">
      ${units.map((unit) => skillButton(unit, battle)).join("")}
    </div>
    <div class="battle-log">${battle.log.slice(-3).join("<br>") || "전투 대기 중"}</div>
    <div class="actions">
      <button class="ghost-button" data-action="retreat" type="button">철수</button>
    </div>
  `;
}

function renderUnit() {
  return `
    <section class="split-band">
      <div class="split-copy">
        <p class="eyebrow">UNIT</p>
        <h2>코어 각성자</h2>
        <p>각성 기록은 코어 문양, 속성 반응, 전투 동기율로 갱신됩니다.</p>
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
      </div>
      <div class="unit-grid">
        ${CHARACTERS.map((character) => unitTile(character)).join("")}
      </div>
    </section>
  `;
}

function renderGacha() {
  const lastResults = state.lastResults || [];
  return `
    <section class="gacha-band">
      <div class="gacha-copy">
        <p class="eyebrow">GACHA</p>
        <h2>양자 코어 추첨</h2>
        <p>펜타 코어의 잔향을 스캔해 유닛 또는 조각을 획득합니다.</p>
        <div class="gacha-actions">
          <button class="primary-button" data-action="pull" data-count="1" type="button" ${state.currencies.quartz < 300 ? "disabled" : ""}>
            1회 Q300
          </button>
          <button class="ghost-button" data-action="pull" data-count="10" type="button" ${state.currencies.quartz < 2700 ? "disabled" : ""}>
            10회 Q2700
          </button>
        </div>
        <div class="gacha-rate">
          <span>ANTIQUE POWER 8%</span>
          <span>MYSTIC 18%</span>
          <span>RARE 74%</span>
        </div>
      </div>
      <div class="scene-wrap">
        <canvas class="scene-canvas" data-scene="gacha" aria-label="추첨 장치"></canvas>
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">RESULT</p>
          <h3>최근 추첨</h3>
        </div>
      </div>
      ${
        lastResults.length
          ? `<div class="result-grid">${lastResults.map(resultTile).join("")}</div>`
          : `<p class="empty-copy">아직 기록된 추첨 결과가 없습니다.</p>`
      }
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
      <div class="inventory-grid">
        ${inventoryTile("코어 조각", state.inventory.core)}
        ${inventoryTile("양자 분진", state.inventory.dust)}
        ${inventoryTile("공허 키", state.inventory.key)}
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">RECORD</p>
          <h3>업적</h3>
        </div>
      </div>
      <div class="achievement-grid">
        ${achievementTile("첫 균열 수습", state.stats.wins >= 1)}
        ${achievementTile("피온스 통과", state.highestStage > 4)}
        ${achievementTile("오로시스 접속", state.highestStage > 8)}
      </div>
    </section>

    <section class="full-band">
      <div class="section-head">
        <div>
          <p class="eyebrow">DATA</p>
          <h3>저장</h3>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <strong>로컬 저장</strong>
          <small>현재 브라우저에 게스트 데이터가 보관됩니다.</small>
        </div>
        <button class="small-button primary-button" data-action="save" type="button">저장</button>
      </div>
      <div class="setting-row">
        <div>
          <strong>불러오기</strong>
          <small>마지막 저장 데이터를 다시 읽습니다.</small>
        </div>
        <button class="small-button ghost-button" data-action="load" type="button">불러오기</button>
      </div>
      <div class="setting-row">
        <div>
          <strong>초기화</strong>
          <small>알파 진행 데이터를 새로 시작합니다.</small>
        </div>
        <button class="small-button danger-button" data-action="reset" type="button">초기화</button>
      </div>
    </section>
  `;
}

function metricTile(label, value) {
  return `<div class="metric-tile"><strong>${value}</strong><span>${label}</span></div>`;
}

function regionButton(region) {
  return `
    <button class="region-tab ${region.id === state.selectedRegion ? "is-active" : ""}" data-action="select-region" data-id="${region.id}" type="button">
      <span class="region-sigil" style="color: ${region.colorA}">${region.sigil}</span>
      <span>
        <strong>${region.name}</strong>
        <span class="stage-meta">${region.line}</span>
      </span>
    </button>
  `;
}

function stageTile(stage) {
  const enemy = getEnemy(stage.enemy);
  const locked = stage.order > state.highestStage;
  const cleared = stage.order < state.highestStage;
  const element = ATTRIBUTES[enemy.element];
  return `
    <article class="stage-tile">
      <div class="stage-title">
        <div>
          <strong>${stage.order}. ${stage.name}</strong>
          <span class="stage-meta">${enemy.name} · ${element.name}</span>
        </div>
        <span class="pill">${cleared ? "CLEAR" : locked ? "LOCK" : "OPEN"}</span>
      </div>
      <div class="stage-meta">보상 ${rewardText(stage.reward)}</div>
      <button class="${locked ? "ghost-button" : "primary-button"}" data-action="start-stage" data-id="${stage.id}" type="button" ${locked ? "disabled" : ""}>
        진입
      </button>
    </article>
  `;
}

function skillButton(unit, battle) {
  const progress = Math.min(100, Math.floor(battle.charge[unit.id] || 0));
  const ready = progress >= 100;
  return `
    <button class="skill-button ${ready ? "is-ready" : ""}" data-action="skill" data-id="${unit.id}" type="button" ${ready ? "" : "disabled"}>
      <span>${unit.name} · ${unit.ex.name}</span>
      <strong>${progress}%</strong>
    </button>
  `;
}

function unitTile(character) {
  const owned = state.ownedUnits[character.id];
  const element = ATTRIBUTES[character.element];
  const level = owned?.level || 0;
  const cost = upgradeCost(character.id);
  return `
    <article class="unit-tile ${owned ? "" : "is-locked"}">
      <div class="unit-title">
        <div class="unit-title">
          <span class="unit-sigil" style="color: ${element.color}">${character.icon}</span>
          <div class="unit-main">
            <strong>${character.name}</strong>
            <span class="unit-meta">${character.grade} · ${element.name} · ${character.role}</span>
          </div>
        </div>
        <span class="pill">${owned ? `Lv.${level}` : "LOCK"}</span>
      </div>
      <div class="unit-meta">EX ${character.ex.name} · 조각 ${owned?.shards || 0}</div>
      <button class="small-button ${owned ? "primary-button" : "ghost-button"}" data-action="upgrade" data-id="${character.id}" type="button" ${canUpgrade(character.id) ? "" : "disabled"}>
        강화 ${owned ? `B${cost.bling}` : ""}
      </button>
    </article>
  `;
}

function inventoryTile(label, value) {
  return `<div class="inventory-tile"><strong>${value}</strong><span>${label}</span></div>`;
}

function achievementTile(label, done) {
  return `<div class="achievement-tile"><strong>${done ? "완료" : "진행"}</strong><span>${label}</span></div>`;
}

function resultTile(result) {
  return `
    <div class="gacha-result">
      <span class="result-chip">${result.grade}</span>
      <strong>${result.name}</strong>
      <span>${result.detail}</span>
    </div>
  `;
}

function selectRegion(id) {
  state.selectedRegion = id;
  saveState();
  render();
}

function startBattle(stageId) {
  const stage = getStage(stageId);
  if (!stage || stage.order > state.highestStage) return;

  const enemy = getEnemy(stage.enemy);
  const units = getOwnedCharacters();
  const partyMaxHp = units.reduce((sum, unit) => sum + unit.hp + unit.level * 38, 0);
  const enemyMaxHp = enemy.hp + stage.order * 26;

  state.battle = {
    stageId,
    enemyHp: enemyMaxHp,
    enemyMaxHp,
    partyHp: partyMaxHp,
    partyMaxHp,
    charge: Object.fromEntries(units.map((unit) => [unit.id, 18])),
    enemyTurn: 2,
    log: [`${enemy.name} 출현`],
  };
  state.activeTab = "stage";
  saveState();
  render();
}

function tickBattle() {
  if (!state.started || !state.battle) return;

  const battle = state.battle;
  const stage = getStage(battle.stageId);
  const enemy = getEnemy(stage.enemy);
  const units = getOwnedCharacters();
  if (!units.length) return;

  const autoDamage = units.reduce((sum, unit) => {
    const elementBonus = unit.element === enemy.element ? 0.92 : 1;
    return sum + (unit.atk + unit.level * 5) * elementBonus;
  }, 0);
  const damage = Math.max(12, Math.round(autoDamage * randomBetween(0.32, 0.48)));
  battle.enemyHp -= damage;
  battle.log.push(`자동 공격 ${damage}`);

  units.forEach((unit) => {
    battle.charge[unit.id] = Math.min(100, (battle.charge[unit.id] || 0) + 16 + Math.floor(unit.speed / 3));
  });

  battle.enemyTurn -= 1;
  if (battle.enemyTurn <= 0 && battle.enemyHp > 0) {
    const incoming = Math.max(10, Math.round((enemy.atk + stage.order * 3) * randomBetween(0.72, 1.08)));
    battle.partyHp -= incoming;
    battle.enemyTurn = 2;
    battle.log.push(`${enemy.name} 반격 ${incoming}`);
  }

  if (battle.enemyHp <= 0) {
    endBattle(true);
    return;
  }

  if (battle.partyHp <= 0) {
    endBattle(false);
    return;
  }

  saveState();
  if (state.activeTab === "stage") render();
}

function useSkill(unitId) {
  const battle = state.battle;
  if (!battle || (battle.charge[unitId] || 0) < 100) return;

  const unit = getCharacter(unitId);
  const stage = getStage(battle.stageId);
  const enemy = getEnemy(stage.enemy);
  const level = state.ownedUnits[unitId]?.level || 1;
  battle.charge[unitId] = 0;

  if (unit.ex.type === "heal") {
    const heal = unit.ex.power + level * 14;
    battle.partyHp = Math.min(battle.partyMaxHp, battle.partyHp + heal);
    battle.log.push(`${unit.name} 회복 ${heal}`);
  }

  if (unit.ex.type === "shield") {
    const shield = unit.ex.power + level * 10;
    battle.partyHp = Math.min(battle.partyMaxHp + 120, battle.partyHp + shield);
    battle.log.push(`${unit.name} 장벽 ${shield}`);
  }

  if (unit.ex.type === "damage") {
    const bonus = unit.element === enemy.element ? 0.9 : 1.08;
    const damage = Math.round((unit.ex.power + level * 18) * bonus);
    battle.enemyHp -= damage;
    battle.log.push(`${unit.name} EX ${damage}`);
  }

  if (battle.enemyHp <= 0) {
    endBattle(true);
    return;
  }

  saveState();
  render();
}

function endBattle(victory, retreated = false) {
  const battle = state.battle;
  if (!battle) return;

  const stage = getStage(battle.stageId);
  state.battle = null;

  if (victory) {
    grantReward(stage.reward);
    state.highestStage = Math.max(state.highestStage, Math.min(STAGES.length + 1, stage.order + 1));
    state.stats.wins += 1;
    state.selectedRegion = stage.region;
    toast(`${stage.name} 클리어`);
    showBattleReward(stage);
  } else {
    state.stats.losses += retreated ? 0 : 1;
    toast(retreated ? "철수했습니다." : "전투 실패");
  }

  saveState();
  render();
}

function grantReward(reward) {
  state.currencies.quartz += reward.quartz || 0;
  state.currencies.bling += reward.bling || 0;
  state.currencies.plate += reward.plate || 0;
  state.inventory.core += reward.core || 0;
  state.inventory.dust += reward.dust || 0;
  state.inventory.key += reward.key || 0;
}

function showBattleReward(stage) {
  showModal(
    "탐색 완료",
    `
      <p>${stage.name} 보상이 지급되었습니다.</p>
      <div class="result-grid">
        ${Object.entries(stage.reward)
          .map(([key, value]) => `<div class="gacha-result"><strong>${value}</strong><span>${rewardName(key)}</span></div>`)
          .join("")}
      </div>
    `
  );
}

function claimSupply() {
  const today = todayKey();
  if (state.lastClaim === today) return;

  state.lastClaim = today;
  state.currencies.quartz += 300;
  state.currencies.bling += 150;
  saveState();
  render();
  toast("오늘 보급 수령");
}

function pullGacha(count) {
  const cost = count === 10 ? 2700 : 300;
  if (state.currencies.quartz < cost) return;

  const results = [];
  state.currencies.quartz -= cost;

  for (let index = 0; index < count; index += 1) {
    const item = weightedPick(GACHA_POOL);
    const character = getCharacter(item.character);
    const owned = state.ownedUnits[character.id];

    if (owned) {
      owned.shards += item.shards;
      results.push({
        name: character.name,
        grade: character.grade,
        detail: `조각 +${item.shards}`,
      });
    } else {
      state.ownedUnits[character.id] = { level: 1, shards: 0 };
      results.push({
        name: character.name,
        grade: character.grade,
        detail: "신규 획득",
      });
    }
  }

  state.stats.pulls += count;
  state.lastResults = results.concat(state.lastResults || []).slice(0, 10);
  saveState();
  render();

  showModal(
    "추첨 결과",
    `<div class="result-grid">${results.map(resultTile).join("")}</div>`
  );
}

function upgradeUnit(id) {
  const owned = state.ownedUnits[id];
  if (!owned || !canUpgrade(id)) return;

  const cost = upgradeCost(id);
  state.currencies.bling -= cost.bling;
  state.currencies.plate -= cost.plate;
  owned.level += 1;

  saveState();
  render();
  toast(`${getCharacter(id).name} 강화 완료`);
}

function canUpgrade(id) {
  const owned = state.ownedUnits[id];
  if (!owned) return false;
  const cost = upgradeCost(id);
  return state.currencies.bling >= cost.bling && state.currencies.plate >= cost.plate;
}

function upgradeCost(id) {
  const owned = state.ownedUnits[id];
  const level = owned?.level || 1;
  return {
    bling: 120 + level * 80,
    plate: level >= 4 ? 1 : 0,
  };
}

function confirmReset() {
  showModal(
    "초기화",
    `
      <p>현재 브라우저의 알파 진행 데이터를 새로 시작합니다.</p>
      <div class="modal-actions">
        <button class="ghost-button" onclick="document.getElementById('modal').close()" type="button">취소</button>
        <button class="danger-button" onclick="resetGame()" type="button">초기화</button>
      </div>
    `
  );
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  state = freshState();
  state.started = true;
  saveState();
  els.modal.close();
  syncStartScreen();
  render();
  toast("새 데이터로 시작합니다.");
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
    const region = getRegion(state.selectedRegion);

    drawBackdrop(ctx, width, height, region);

    if (scene === "home") {
      drawCore(ctx, width * 0.52, height * 0.44, Math.min(width, height) * 0.18, region.colorB, region.colorA);
      drawCityLine(ctx, width, height, "#182321");
    }

    if (scene === "stage") {
      const battle = state.battle;
      const stage = battle ? getStage(battle.stageId) : STAGES.find((item) => item.order === state.highestStage);
      const enemy = stage ? getEnemy(stage.enemy) : ENEMIES[0];
      drawStageObject(ctx, width, height, region);
      drawEnemy(ctx, width * 0.52, height * 0.48, Math.min(width, height) * 0.22, enemy);
    }

    if (scene === "unit") {
      drawAttributeWheel(ctx, width, height);
    }

    if (scene === "gacha") {
      drawGachaGate(ctx, width, height);
    }
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
  ctx.save();
  for (let index = 0; index < count; index += 1) {
    const x = (index * 97) % width;
    const y = (index * 53) % height;
    const size = 1 + (index % 3) * 0.6;
    ctx.fillStyle = index % 4 === 0 ? "rgba(94,200,183,0.55)" : "rgba(245,239,225,0.38)";
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
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
  ctx.save();
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
  ctx.restore();
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
  ctx.save();
  for (let index = 0; index < 7; index += 1) {
    const radius = Math.min(width, height) * (0.12 + index * 0.045);
    ctx.strokeStyle = index % 2 ? "rgba(94,200,183,0.78)" : "rgba(240,189,79,0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 1.4, radius * 0.58, index * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawCore(ctx, cx, cy, Math.min(width, height) * 0.16, "#a796ff", "#f0bd4f");
  ctx.restore();
}

function showModal(title, html) {
  els.modalContent.innerHTML = `<h3>${title}</h3>${html}`;
  els.modal.showModal();
}

function toast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 1900);
}

function getRegion(id) {
  return REGIONS.find((region) => region.id === id) || REGIONS[0];
}

function getStage(id) {
  return STAGES.find((stage) => stage.id === id);
}

function getEnemy(id) {
  return ENEMIES.find((enemy) => enemy.id === id) || ENEMIES[0];
}

function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id);
}

function getOwnedCharacters() {
  return Object.keys(state.ownedUnits)
    .map((id) => ({ ...getCharacter(id), ...state.ownedUnits[id] }))
    .filter(Boolean);
}

function rewardText(reward) {
  return Object.entries(reward)
    .map(([key, value]) => `${rewardName(key)} ${value}`)
    .join(" · ");
}

function rewardName(key) {
  const names = {
    quartz: "쿼츠",
    bling: "블링",
    plate: "형판",
    core: "코어 조각",
    dust: "양자 분진",
    key: "공허 키",
  };
  return names[key] || key;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function percent(value, max) {
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function todayKey() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

function mix(hex, base, amount) {
  const a = parseHex(hex);
  const b = parseHex(base);
  const result = a.map((channel, index) => Math.round(channel * amount + b[index] * (1 - amount)));
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

function parseHex(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // The game still runs normally when opened from a local file.
    });
  });
}
