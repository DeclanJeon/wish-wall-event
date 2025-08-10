// 비속어 필터링 유틸리티
export const badWords = [
  "씨발", "씨팔", "시발", "씨바", "씨빨", "시팔", "시바", "씹할",
  "개새끼", "개새끼들", "개색끼", "개색히", "개세끼", "개쉐이", "개쉑", "개쎄끼",
  "씹새끼", "씹새끼들", "씹세끼", "씹쉐이", "씹쎄끼",
  "좆", "좆같", "좆나", "좆만", "좆밥", "좆까", "좆대가리", "좆되",
  "지랄", "지럴", "지롤", "지뢀",
  "염병", "엠병", "옘병",
  "미친놈", "미친년", "미친새끼", "미친", "미쳤",
  "병신", "병신새끼", "뱅신", "빙신", "븅신",
  "쌍년", "쌍놈", "썅년", "썅놈",
  "등신", "등쉰",
  "아가리", "아갈", "아구리",
  "닥쳐", "닥치", "닥쳐라", "닥치라",
  "꺼져", "꺼지", "꺼져라", "꺼지라",
  "보지", "보짓", "봊이",
  "자지", "자짓",
  "빠구리", "빠굴이",
  "딸딸이", "딸치",
  "걸레", "걸레년",
  "후장", "후방",
  "찐따", "찐따새끼",
  "찌질이", "찌질",
  "꼰대", "꼰머",
  "틀딱", "틀딱충",
  "한남충", "한남", "한녀충", "한녀",
  "김치녀", "김치남",
  "맘충", "급식충", "애미충", "애비충",
  "호구", "호갱",
  "병맛", "병먹금",
  "엠창", "앰창", "엠챙",
  "패드립", "패륜",
  "존나", "존니", "존내", "졸라", "졸리",
  "개같", "개처럼", "개만도", "개보다",
  "빡치", "빡쳐", "빡침",
  "쩔", "쩐다", "쩔어",
  "ㅅㅂ", "ㅆㅂ", "ㅂㅅ", "ㅈㄹ", "ㅁㅊ", "ㅄ",
  "시부랄", "시부럴", "시부렬",
  "썅", "썩을", "썩어",
  "새끼", "쉐끼", "쌔끼", "색끼",
  "창녀", "창남",
  "또라이", "또라이새끼", "또라이년", "또라이놈",
  "개돼지", "개쓰레기", "개소리", "개수작",
  "니미", "니애미", "니애비", "니미럴",
  "느금마", "느금", "느개비",
  "십새", "십세", "십쉐",
  "좃나", "존나게", "졸라게",
  "뒤질", "뒤져", "뒤졌",
  "디질", "디져", "디졌",
  "엿먹", "엿같",
  "개년", "개놈",
  "쓰레기", "쓰렉", "쓰벌",
  "썩을놈", "썩을년",
  "죽일놈", "죽일년",
  "미친놈", "미친년",
  "병신같", "병신년", "병신놈",
  "좆병신", "씹병신",
  "개병신", "쓰레기새끼",
  "니엄마", "니아빠", "니애미", "니애비"
];

export const badWordPatterns = [
  /시[ㅂ발팔바빨]/g,
  /씨[ㅂ발팔바빨]/g,
  /[개객갯]새[끼키기]/g,
  /병[시신쉰싄]/g,
  /[좆조좃]같/g,
  /미친[놈년넘련]/g,
  /[쌍썅상][놈년넘련]/g,
  /[씹십쉽][할세새]/g
];

export function containsProfanity(text: string): boolean {
  const normalizedText = text.toLowerCase().replace(/\s/g, '');
  
  // 직접적인 비속어 체크
  for (const word of badWords) {
    if (normalizedText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  // 패턴 체크
  for (const pattern of badWordPatterns) {
    if (pattern.test(normalizedText)) {
      return true;
    }
  }
  
  return false;
}

export function filterProfanity(text: string): string {
  let filteredText = text;
  
  // 직접적인 비속어 필터링
  for (const word of badWords) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  }
  
  // 패턴 필터링
  for (const pattern of badWordPatterns) {
    filteredText = filteredText.replace(pattern, (match) => '*'.repeat(match.length));
  }
  
  return filteredText;
}