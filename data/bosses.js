export const BOSSES = [
  {
    stageId: "pions-03",
    enemyId: "pions-controller",
    title: "피온스 보스",
    name: "도심 제어기",
    description: "질서를 유지하던 도시 제어 장치가 균열 신호를 통제 명령으로 오인하고 있습니다.",
    skillName: "질서 재기동",
    skillEvery: 4,
    skillPower: 1.28,
    aura: "boss-aura-pions",
    rewardText: "트로맨션 진입 권한",
  },
  {
    stageId: "tromansion-03",
    enemyId: "trade-enforcer",
    title: "트로맨션 보스",
    name: "무역 구역 집행병",
    description: "교역 구역의 자동 집행 체계가 모든 통행자를 압류 대상으로 분류했습니다.",
    skillName: "압류 집행",
    skillEvery: 3,
    skillPower: 1.42,
    aura: "boss-aura-tromansion",
    rewardText: "오로시스 진입 권한",
  },
  {
    stageId: "orosis-04",
    enemyId: "polluted-aqua-core",
    title: "오로시스 보스",
    name: "오염된 수핵 실험체",
    description: "맑은 수원에서 태어난 실험핵이 허수와 양자 반응을 동시에 일으킵니다.",
    skillName: "수핵 폭주",
    skillEvery: 3,
    skillPower: 1.62,
    aura: "boss-aura-orosis",
    rewardText: "펜타 변칙핵 기록",
  },
];

export function getBossByStage(stageId) {
  return BOSSES.find((boss) => boss.stageId === stageId);
}

export function isBossStage(stageId) {
  return Boolean(getBossByStage(stageId));
}
