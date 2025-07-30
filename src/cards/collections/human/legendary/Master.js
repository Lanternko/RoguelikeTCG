// 集大成者卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class MasterCard {
  static create() {
    const balance = CARD_BALANCE.MASTER;
    
    return {
      id: 'master',
      name: '集大成者',
      type: 'batter',
      attribute: 'human',
      rarity: 'legendary',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '被動：此卡在你手中時，你每打出一張人屬性卡，其攻擊力+2。打擊：牌組中每有一張人屬性卡，攻擊力+1',
      effects: {
        passive_in_hand: async function(gameState, playedCard) {
          if (playedCard.attribute === 'human') {
            this.tempBonus = this.tempBonus || {};
            this.tempBonus.attack = (this.tempBonus.attack || 0) + 2;
            return { success: true, description: '集大成者攻擊力+2' };
          }
          return { success: false };
        },
        on_strike: async function(gameState) {
          let humanCards = 0;
          gameState.player.hand.forEach(card => {
            if (card.attribute === 'human') humanCards++;
          });
          gameState.player.discard_pile.forEach(card => {
            if (card.attribute === 'human') humanCards++;
          });
          
          this.tempBonus = this.tempBonus || {};
          this.tempBonus.attack = (this.tempBonus.attack || 0) + humanCards;
          
          return { success: true, description: `人屬性卡數量: ${humanCards}，攻擊力+${humanCards}` };
        }
      }
    };
  }
}