// 共荣卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class ProsperityCard {
  static create() {
    const balance = CARD_BALANCE.PROSPERITY;
    
    return {
      id: 'prosperity',
      name: '共榮',
      type: 'batter',
      attribute: 'human',
      rarity: 'rare',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '輔助：若場上存在≥3種屬性，你的人屬性打者卡+15攻擊力',
      effects: {
        on_support: async function(gameState) {
          const attributes = new Set();
          const fieldCards = [gameState.player.strike_zone, gameState.player.support_zone, gameState.player.spell_zone];
          fieldCards.forEach(card => {
            if (card) attributes.add(card.attribute);
          });
          
          if (attributes.size >= 3) {
            gameState.turnBuffs = gameState.turnBuffs || [];
            gameState.turnBuffs.push({
              type: 'human_batter_attack_boost',
              value: 15,
              source: this.name
            });
            return { success: true, description: `場上${attributes.size}種屬性，人屬打者+15攻擊力` };
          }
          return { success: false, reason: `場上屬性種類不足(${attributes.size}/3)` };
        }
      }
    };
  }
}