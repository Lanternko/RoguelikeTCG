// 多元文化卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class MulticultureCard {
  static create() {
    const balance = CARD_BALANCE.MULTICULTURE;
    
    return {
      id: 'multiculture',
      name: '多元文化',
      type: 'batter',
      attribute: 'human',
      rarity: 'rare',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '輔助：若場上存在≥3種屬性，你手牌中所有的人屬性打者卡攻擊力+10',
      effects: {
        on_support: async function(gameState) {
          const attributes = new Set();
          const fieldCards = [gameState.player.strike_zone, gameState.player.support_zone, gameState.player.spell_zone];
          fieldCards.forEach(card => {
            if (card) attributes.add(card.attribute);
          });
          
          if (attributes.size >= 3) {
            let boostedCount = 0;
            gameState.player.hand.forEach(card => {
              if (card.attribute === 'human' && card.type === 'batter') {
                card.tempBonus = card.tempBonus || {};
                card.tempBonus.attack = (card.tempBonus.attack || 0) + 10;
                boostedCount++;
              }
            });
            return { success: true, description: `場上${attributes.size}種屬性，${boostedCount}張人屬打者+10攻擊` };
          }
          return { success: false, reason: `場上屬性種類不足(${attributes.size}/3)` };
        }
      }
    };
  }
}