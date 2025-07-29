// ===== 🃏 卡牌邏輯層 - 實現你設計的每張卡 =====

// cards/collections/human/common/President.js
import { AttributeBonusKeyword } from '../../../../effects/keywords/attributeBonus.js';
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class PresidentCard {
  static create() {
    const balance = CARD_BALANCE.PRESIDENT;
    
    return {
      id: 'president',
      name: '總統',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '打擊：此回合中，你的牌組裡每有一張人屬性卡，此卡攻擊力+1。',
      
      effects: {
        on_strike: async function(gameState) {
          return await AttributeBonusKeyword.presidentBonus(this, gameState);
        }
      }
    };
  }
}
