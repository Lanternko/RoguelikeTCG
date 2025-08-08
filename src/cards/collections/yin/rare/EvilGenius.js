// src/cards/collections/yin/rare/EvilGenius.js
import { CardUtils } from '../../../CardUtils.js';

export class EvilGeniusCard {
  static create() {
    return {
      id: 'evil_genius',
      name: '邪惡天才',
      type: 'batter',
      attribute: 'yin',
      rarity: 'rare',
      stats: {
        hp_bonus: 10,    // 中等血量
        attack: 26,      // 高攻擊，配合吸取效果
        crit: 45         // 中等暴擊
      },
      description: '打擊：吸取投手5點攻擊力。',
      balanceNotes: '雙重效果卡：自我增強+敵人削弱。稀有卡的複雜機制。',
      designNotes: '邪惡的智慧能夠竊取敵人的力量為己所用，體現陰屬性的狡詐。',
      
      effects: {
        on_strike: async function(gameState) {
          // 減少投手攻擊力
          const reduction = CardUtils.reducePitcherAttack(gameState, 5);
          
          // 增加自己攻擊力
          this.tempBonus = this.tempBonus || {};
          this.tempBonus.attack = (this.tempBonus.attack || 0) + 5;
          
          return { 
            success: true,
            description: `吸取投手${reduction}點攻擊力` 
          };
        }
      }
    };
  }
}