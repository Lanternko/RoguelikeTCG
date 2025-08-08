// src/cards/collections/human/common/President.js
import { CardUtils } from '../../../CardUtils.js';

export class PresidentCard {
  static create() {
    return {
      id: 'president',
      name: '總統',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 15,    // 中等血量加成
        attack: 20,      // 基礎攻擊，配合動態加成
        crit: 30         // 中等暴擊率
      },
      description: '打擊：每有一張人屬性卡，攻擊力+1。',
      balanceNotes: '後期變強的成長型卡牌，需要構築支持。人屬性越多越強。',
      designNotes: '代表領導力，團結人心的力量會隨著追隨者增加而增強。',
      
      effects: {
        on_strike: async function(gameState) {
          const humanCount = CardUtils.countCardsWithAttribute(gameState, 'human');
          
          this.tempBonus = this.tempBonus || {};
          this.tempBonus.attack = (this.tempBonus.attack || 0) + humanCount;
          
          return { 
            success: true,
            description: `人屬性卡數量: ${humanCount}，攻擊力+${humanCount}` 
          };
        }
      }
    };
  }
}