// ===== 4. 更新遊戲常數 =====

export const GAME_BALANCE = {
  // 玩家基礎數值
  PLAYER_INITIAL_HP: 100,
  
  // 投手數值
  PITCHER_INITIAL_HP: 150,
  PITCHER_BASE_ATTACK: 30,
  PITCHER_BASE_FATIGUE_RATE: 0.05,
  
  // 🆕 暴擊系統
  BASE_CRIT_RATE: 20,  // 固定20%暴擊率
  
  // 遊戲限制
  HAND_SIZE_LIMIT: 7,
  STRIKE_ZONE_LIMIT: 1,
  SUPPORT_ZONE_LIMIT: 1,
  SPELL_ZONE_LIMIT: 1,
  
  // 效果參數
  MIN_ATTRIBUTES_FOR_BONUS: 3,
  
  // 賽季設置
  TOTAL_BATTLES_PER_SEASON: 15,
  BADGE_BATTLE_NUMBERS: [1, 4, 7, 10, 13]
};

// ===== 5. 更新調試工具 =====

// 在調試工具中添加暴擊測試
testCrit: () => {
  const gameState = this.gameController.getGameState();
  const strikeCard = gameState?.player?.strike_zone;
  const supportCard = gameState?.player?.support_zone;
  
  console.log('🎯 暴擊系統測試:');
  console.log(`基礎暴擊率: 20% (固定)`);
  
  if (strikeCard) {
    console.log(`打擊卡 ${strikeCard.name}: ${strikeCard.stats.crit}%暴擊增傷 (❌ 無效)`);
  }
  
  if (supportCard) {
    console.log(`輔助卡 ${supportCard.name}: ${supportCard.stats.crit}%暴擊增傷 (✅ 有效)`);
  } else {
    console.log('輔助卡: 無 (0%暴擊增傷)');
  }
}