// 2. 修復 src/cards/collections/human/common/Kindness.js - 移除測試文字
export class KindnessCard {
  static create() {
    const balance = CARD_BALANCE.KINDNESS;
    
    return {
      id: 'kindness',
      name: '慈愛', // 移除了測試文字
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '輔助：此回合中，你打出的人屬性打者卡攻擊力+10。',
      
      effects: {
        on_support: async function(gameState) {
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'human_batter_attack_boost',
            value: GAME_BALANCE.KINDNESS_BOOST || 10,
            source: this.name
          });
          
          return { 
            success: true, 
            description: '人屬性打者卡本回合攻擊力+10' 
          };
        }
      }
    };
  }
}