// src/cards/collections/yin/common/ShadowDevour.js
import { CardUtils } from '../../../CardUtils.js';

export class ShadowDevourCard {
  static create() {
    return {
      id: 'shadow_devour',
      name: '暗影吞噬',
      type: 'batter',
      attribute: 'yin',
      rarity: 'common',
      stats: {
        hp_bonus: 8,     // 較低血量，陰屬性特色
        attack: 28,      // 高攻擊力
        crit: 60         // 極高暴擊，高風險高回報
      },
      description: '輔助：投手攻擊力-3（本場戰鬥）。',
      balanceNotes: '控制型卡牌，降低敵人威脅。高攻高暴但血量低，玻璃大炮。',
      designNotes: '陰影的力量能夠削弱敵人，代表暗中破壞和腐蝕的能力。',
      
      effects: {
        on_support: async function(gameState) {
          const reduction = CardUtils.reducePitcherAttack(gameState, 3);
          return { 
            success: true,
            description: `投手攻擊力-${reduction}` 
          };
        }
      }
    };
  }
}
