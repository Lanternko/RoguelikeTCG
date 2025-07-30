// 团结卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class UnityCard {
  static create() {
    const balance = CARD_BALANCE.UNITY;
    
    return {
      id: 'unity',
      name: '團結',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: { hp_bonus: balance.hp },
      description: '此回合中，你所有的人屬性打者卡攻擊力+8',
      effects: {
        on_play: async function(gameState) {
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'human_batter_attack_boost',
            value: 8,
            source: this.name
          });
          return { success: true, description: '人屬性打者卡攻擊力+8' };
        }
      }
    };
  }
}