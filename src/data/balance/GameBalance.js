// data/balance/GameBalance.js
export const GAME_BALANCE = {
  // 基礎遊戲參數
  PLAYER_INITIAL_HP: 100,
  PITCHER_INITIAL_HP: 150,
  HAND_SIZE_LIMIT: 7,
  STRIKE_ZONE_LIMIT: 1,
  SUPPORT_ZONE_LIMIT: 1,
  SPELL_ZONE_LIMIT: 1,
  
  // 效果數值
  KINDNESS_BOOST: 10,       // 慈愛輔助加成
  DEMOCRACY_OUT_REDUCTION: 5, // 民主出局率減少
  PATIENCE_DAMAGE_REDUCTION: 10, // 忍耐傷害減少
  UNITY_BOOST: 8,           // 團結攻擊力加成
  PITCHER_ATTACK_REDUCTION: 3, // 投手攻擊力減少
  
  // 屬性相關
  ATTRIBUTE_TYPES: ['human', 'yin', 'yang', 'heaven', 'earth'],
  MIN_ATTRIBUTES_FOR_BONUS: 3 // 多元文化/共榮觸發條件
};
