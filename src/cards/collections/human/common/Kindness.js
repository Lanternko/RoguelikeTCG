// src/cards/collections/human/common/Kindness.js
export class KindnessCard {
  static create() {
    return {
      id: 'kindness',
      name: '慈愛',
      type: 'support',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 10,    // 較低血量，主要提供輔助
        attack: 15,      // 輔助卡也有攻擊力
        crit: 40         // 高暴擊補償低攻擊
      },
      description: '輔助：本回合所有人屬性打者攻擊力+10。',
      balanceNotes: '團隊增益卡，人屬構築的核心支援。數值較低但團隊效果強。',
      designNotes: '慈愛的力量能激勵所有人類戰士，體現團結就是力量。',
      
      effects: {
        on_support: async function(gameState) {
          gameState.turnBuffs.push({
            type: 'human_batter_attack_boost',
            value: 10,
            source: '慈愛'
          });
          
          return { 
            success: true,
            description: '本回合人屬性打者攻擊力+10' 
          };
        }
      }
    };
  }
}