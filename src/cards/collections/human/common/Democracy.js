// src/cards/collections/human/common/Democracy.js
import { CardUtils } from '../../../CardUtils.js';

export class DemocracyCard {
  static create() {
    return {
      id: 'democracy',
      name: '民主',
      type: 'support',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 10,    // 中等血量加成
        attack: 18,      // 中等攻擊力
        crit: 35         // 中等暴擊
      },
      description: '輔助：抽1張牌。',
      balanceNotes: '輔助+資源的平衡型卡牌。既能戰鬥又能提供工具性。',
      designNotes: '民主制度代表集思廣益，能為團隊帶來更多的策略選擇。',
      
      effects: {
        on_support: async function(gameState) {
          const success = await CardUtils.drawCard(gameState);
          return { 
            success,
            description: success ? '抽了1張牌' : '無法抽牌' 
          };
        }
      }
    };
  }
}