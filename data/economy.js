export const CODEX_FILTERS = [
  { id: "currency", label: "재화" },
  { id: "mineral", label: "광물" },
  { id: "gem", label: "보석" },
  { id: "item", label: "아이템" },
];

export const CURRENCIES = [
  {
    id: "quartz",
    name: "쿼츠",
    symbol: "Q",
    category: "재화",
    wallet: true,
    description: "캐릭터 성장, NPC 거래, 무기 업그레이드에 쓰이는 가장 기본 재화.",
  },
  {
    id: "bling",
    name: "레드블링",
    symbol: "R",
    category: "재화",
    wallet: true,
    description: "기본 플레이로 사용하는 블링. Alpha에서는 기존 블링 세이브와 호환됩니다.",
  },
  {
    id: "blueBling",
    name: "블루블링",
    symbol: "B",
    category: "재화",
    wallet: false,
    description: "유료 재화로 분류되며 추첨과 상점 아이템 구매에 쓰이는 재화.",
  },
  {
    id: "plate",
    name: "형판 조각",
    symbol: "P",
    category: "재화",
    wallet: true,
    description: "속성 형판 제작과 보스 파밍 보상에 연결되는 조각형 재화.",
  },
  { id: "pureBling", name: "퓨어 블링", symbol: "PB", category: "재화", description: "같은 블링 1,000개를 합성했을 때 얻는 상위 블링." },
  { id: "alPoint", name: "AL 포인트", symbol: "AL", category: "재화", description: "베이스 어빌리티와 CLASS 성장에 쓰입니다." },
  { id: "medal", name: "메달", symbol: "M", category: "재화", description: "캐릭터 인연도 상승으로 획득하는 전용 재화." },
  { id: "stardust", name: "스타 더스트", symbol: "SD", category: "재화", description: "패스 티어와 상점 구매에 쓰이는 재화." },
  { id: "mileage", name: "마일리지", symbol: "MI", category: "재화", description: "던전 소탕에서 랜덤으로 얻고 마일리지 샵에서 소모합니다." },
  { id: "shiningMileage", name: "샤이닝 마일리지", symbol: "SM", category: "재화", description: "마일리지 100개를 강화해 얻는 상위 마일리지." },
  { id: "powerGem", name: "파워젬", symbol: "PG", category: "재화", description: "무기 강화에 쓰이며 I, III, V, X 등급으로 나뉩니다." },
];

export const MINERALS = [
  {
    id: "copper",
    name: "구리",
    max: 1000,
    basePrice: 500000,
    uses: "코일, 케이블, 동전, 동관, 청동, 황동, 백동, 양은",
    recipes: [
      "원시 구리 4 => 청동 1",
      "청동 5 => 백동 1 (90%)",
      "백동 3 + 청동 5 => 황동 1 (70%)",
    ],
  },
  {
    id: "iron",
    name: "철",
    max: 700,
    basePrice: 1000000,
    uses: "캔, 철골, 철근 콘크리트",
    recipes: [
      "원시 철 3 => 순철 1",
      "순철 5 => 연철 1 (80%)",
      "순철 4 + 연철 5 => 강철 1 (60%)",
      "강철 5 => 주철 1 (40%)",
    ],
  },
  {
    id: "gold",
    name: "금",
    max: 500,
    basePrice: 3000000,
    uses: "플레이어 발견 필요",
    recipes: [
      "원시 금 5 => 14K 금 1",
      "14K 금 3 => 18K 금 1 (90%)",
      "18K 금 3 => 24K 순금 1 (75%)",
      "24K 금 4 => 34K 순금 조각 1 (60%)",
      "34K 순금 조각 10 => 48K 순금 조각 1 (40%)",
      "48K 순금 조각 5 => 48K 골드바 1 (20%)",
    ],
  },
  {
    id: "silver",
    name: "은",
    max: 700,
    basePrice: 3000000,
    uses: "플레이어 발견 필요",
    recipes: ["원시 은 3 => 은 조각 1", "은 조각 5 => 은괴 1 (75%)"],
  },
  {
    id: "prismarine",
    name: "프리즈머린",
    max: 5,
    basePrice: 30000000,
    uses: "고급 장치와 특수 아이템 제조",
    recipes: ["원시 프리즈머린 5 => 정제 프리즈머린 1 (40%)", "정제 프리즈머린 3 => 샤인 프리즈머린 1"],
  },
  {
    id: "titanium",
    name: "티타늄",
    max: 250,
    basePrice: 10000000,
    uses: "고급 무기와 장갑 제조",
    recipes: ["티타늄 광석 5 => 티타늄 G1/G2/G3/G4 중 1개", "같은 G 티타늄 4 => 티타늄 합금 1", "티타늄 합금 2 => 티타늄 합금 주괴 1"],
  },
];

export const GEMS = [
  { id: "diamond", name: "다이아몬드", value: 100000000, chance: "1/4" },
  { id: "little-rivery", name: "리틀 리버리", value: 98000000, chance: "1/4" },
  { id: "galaxy-gallard", name: "은하 갈라드", value: 95000000, chance: "1/5" },
  { id: "sapphire", name: "사파이어", value: 93000000, chance: "1/2" },
  { id: "ruby", name: "루비", value: 82000000, chance: "1/3" },
  { id: "moonstone", name: "문스톤", value: 77000000, chance: "1/3" },
  { id: "emerald", name: "에메랄드", value: 60000000, chance: "1/3" },
  { id: "topaz", name: "토파즈", value: 45000000, chance: "1" },
  { id: "bright", name: "브라이트", value: 33000000, chance: "1/2" },
  { id: "powergem", name: "파워젬", value: 29000000, chance: "1" },
  { id: "amethyst", name: "자수정", value: 20000000, chance: "1" },
];

export const ITEM_GUIDE = [
  { id: "ext-ticket", name: "ExT 테크니션 티켓", description: "피플의 ExT 레벨을 업그레이드할 수 있는 티켓." },
  { id: "skin-book", name: "스킨 랜덤북", description: "NPC 또는 플레이어블 캐릭터의 스킨을 랜덤 획득합니다." },
  { id: "grade-summon", name: "랜덤 등급 캐릭터 소환권", description: "정해진 등급 내 피플을 랜덤으로 1회 소환합니다." },
  { id: "summon-ticket", name: "소환권", description: "기본, 프리미엄, 10회 소환권으로 나뉘는 추첨 티켓." },
  { id: "retouch-ink", name: "리터치 잉크", description: "추첨 시 특정 등급 확률을 높여주는 보정 아이템." },
  { id: "potion", name: "물약", description: "플레이어 레벨을 올려주는 +10, +30, +50, +100 Lv. 물약." },
  { id: "character-shard", name: "캐릭터 소환 조각", description: "특정 등급 조각 50개 합성으로 1회 소환할 수 있습니다." },
  { id: "attribute-boost-template", name: "속성 강화 형판", description: "확률적으로 랜덤 속성 하나의 레벨을 올립니다. I~XV형." },
  { id: "attribute-template", name: "속성 형판", description: "가지고 있지 않은 랜덤 속성 하나를 획득합니다. 같은 형판 3개로 상위 형판 합성." },
];

export const REFINING_RULES = {
  quartzCost: 70000,
  failText: "실패 시 사용한 각 광물을 하나씩 잃고 나머지는 돌려받지만 쿼츠는 돌려받지 않습니다.",
};
