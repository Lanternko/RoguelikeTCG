// src/cards/collections/yang/rare/YinYangHarmony.js
import { CardUtils } from '../../../CardUtils.js';

export class YinYangHarmonyCard {
  static create() {
    return {
      id: 'yinyang_harmony',
      name: '陰陽調和',
      type: 'batter',
      attribute: 'yang',
      rarity: 'rare',
      stats: {
        hp_bonus: 12,    // 中等血量
        attack: 24,      // 基礎攻擊，可大幅增強
        crit: 50         // 高暴擊率
      },
      description: '打擊：若場上有陰或陽屬性卡，攻擊力+20。',
      balanceNotes: '需要構築支持的爆發卡。條件滿足時非常強力。',
      designNotes: '陰陽平衡的力量，當場上有對立屬性時能發揮最大威力。',
      
      effects: {
        on_strike: async function(gameState) {
          const fieldCards = [
            gameState.player.strike_zone,
            gameState.player.support_zone,
            gameState.player.spell_zone
          ].filter(Boolean);
          
          const hasYinYang = fieldCards.some(card => 
            card && (card.attribute === 'yin' || card.attribute === 'yang')
          );
          
          if (hasYinYang) {
            this.tempBonus = this.tempBonus || {};
            this.tempBonus.attack = (this.tempBonus.attack || 0) + 20;
            
            return { 
              success: true,
              description: '場上有陰/陽屬性，攻擊力+20' 
            };
          }
          
          return { 
            success: false,
            description: '場上無陰/陽屬性卡，無法觸發效果' 
          };
        }
      }
    };
  }
}