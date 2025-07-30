// 遗产卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class LegacyCard {
  static create() {
    const balance = CARD_BALANCE.LEGACY;
    
    return {
      id: 'legacy',
      name: '遺產',
      type: 'deathrattle',
      attribute: 'human',
      rarity: 'common',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '死聲：抽1張卡牌',
      effects: {
        on_deathrattle: async function(gameState) {
          if (gameState.player.deck.length > 0) {
            const drawnCard = gameState.player.deck.pop();
            gameState.player.hand.push(drawnCard);
            return { success: true, description: `抽到了 ${drawnCard.name}` };
          }
          return { success: false, reason: '牌庫為空' };
        }
      }
    };
  }
}