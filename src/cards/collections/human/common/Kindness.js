// src/cards/collections/human/common/Kindness.js - 修復版
export class KindnessCard {
  static create() {
    return {
      id: 'kindness',
      name: '慈愛',
      type: 'support',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 12,    // 較低血量，主要提供輔助
        attack: 8,       // 輔助卡也有攻擊力
        crit: 70         // 高暴擊補償低攻擊
      },
      description: '輔助：本回合所有人屬性打者攻擊力+10。',
      balanceNotes: '團隊增益卡，人屬構築的核心支援。數值較低但團隊效果強。',
      designNotes: '慈愛的力量能激勵所有人類戰士，體現團結就是力量。',
      
      effects: {
        on_support: async function(gameState) {
          console.log('🛡️ 慈愛輔助效果觸發');
          
          // 確保 turnBuffs 存在
          if (!gameState.turnBuffs) {
            gameState.turnBuffs = [];
          }
          
          // 添加人屬性打者攻擊力加成
          gameState.turnBuffs.push({
            type: 'human_batter_attack_boost',
            value: 10,
            source: '慈愛'
          });
          
          console.log('✅ 慈愛效果已添加到 turnBuffs:', gameState.turnBuffs);
          
          return { 
            success: true,
            description: '本回合人屬性打者攻擊力+10' 
          };
        }
      }
    };
  }
}