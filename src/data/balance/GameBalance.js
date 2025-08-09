// ===== 📊 GAME BALANCE (src/data/balance/GameBalance.js) =====

/**
 * 📊 遊戲平衡數據
 * 只包含全局遊戲參數，避免循環依賴
 */
export const GAME_BALANCE = {
  // 玩家基礎數值
  PLAYER_INITIAL_HP: 100,
  
  // 投手數值
  PITCHER_INITIAL_HP: 150,
  PITCHER_BASE_ATTACK: 30,
  PITCHER_BASE_FATIGUE_RATE: 0.05,
  
  // 投手第二階段
  PITCHER_STAGE2_HP: 200,
  PITCHER_STAGE2_ATTACK: 45,
  
  // 遊戲限制
  HAND_SIZE_LIMIT: 7,
  STRIKE_ZONE_LIMIT: 1,
  SUPPORT_ZONE_LIMIT: 1,
  SPELL_ZONE_LIMIT: 1,
  
  // 效果參數
  MIN_ATTRIBUTES_FOR_BONUS: 3,
  
  // 賽季設置
  TOTAL_BATTLES_PER_SEASON: 15,
  BADGE_BATTLE_NUMBERS: [1, 4, 7, 10, 13],
  
  // 平衡調整開關
  BALANCE_MODIFIERS: {
    GLOBAL_DAMAGE_MULTIPLIER: 1.0,      // 全局傷害倍數
    GLOBAL_HP_MULTIPLIER: 1.0,          // 全局血量倍數
    CRIT_DAMAGE_MULTIPLIER: 1.0,        // 暴擊傷害倍數
    PITCHER_DIFFICULTY_MULTIPLIER: 1.0   // 投手難度倍數
  }
};