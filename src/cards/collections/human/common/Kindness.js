// cards/collections/human/common/Kindness.js
import { CARD_BALANCE, GAME_BALANCE } from '../../../../data/balance/CardBalance.js';

export class KindnessCard {
  static create() {
    const balance = CARD_BALANCE.KINDNESS;
    
    return {
      id: 'kindness',
      name: '慈愛',
      type: 'support',
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
          // 為本回合的人屬性打者卡添加攻擊力加成
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'human_batter_attack_boost',
            value: GAME_BALANCE.KINDNESS_BOOST,
            source: this.name
          });
          
          return { success: true, description: '人屬性打者卡本回合攻擊力+10' };
        }
      }
    };
  }
}
