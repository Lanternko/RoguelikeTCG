// cards/collections/yin/common/ShadowDevour.js
import { PitcherDebuffKeyword } from '../../../../effects/keywords/PitcherDebuff.js';
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class ShadowDevourCard {
  static create() {
    const balance = CARD_BALANCE.SHADOW_DEVOUR;
    
    return {
      id: 'shadow_devour',
      name: '暗影吞噬',
      type: 'batter',
      attribute: 'yin',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '打擊：若本回合沒有打出其他陰屬卡，此卡獲得+10攻擊力。輔助：投手攻擊力-3。',
      
      effects: {
        on_strike: async function(gameState) {
          // 檢查本回合是否打出了其他陰屬卡
          const turnPlayedCards = gameState.turnPlayedCards || [];
          const otherYinCards = turnPlayedCards.filter(card => 
            card.attribute === 'yin' && card.id !== this.id
          );
          
          if (otherYinCards.length === 0) {
            this.tempBonus = this.tempBonus || {};
            this.tempBonus.attack = (this.tempBonus.attack || 0) + 10;
            return { success: true, description: '本回合未打出其他陰屬卡，攻擊力+10' };
          }
          
          return { success: false, reason: '本回合已打出其他陰屬卡' };
        },
        
        on_support: async function(gameState) {
          return await PitcherDebuffKeyword.reducePitcherAttack(gameState, 3);
        }
      }
    };
  }
}
