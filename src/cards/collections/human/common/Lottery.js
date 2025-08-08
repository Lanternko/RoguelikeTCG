// src/cards/collections/human/common/Lottery.js
import { CardUtils } from '../../../CardUtils.js';

export class LotteryCard {
  static create() {
    return {
      id: 'lottery',
      name: '樂透',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: 0,     // 法術卡無血量加成
        attack: 0,       // 法術卡無攻擊力
        crit: 0          // 法術卡無暴擊
      },
      description: '法術：抽2張牌。',
      balanceNotes: '純工具卡，提供手牌資源。無戰鬥能力但能加速抽牌。',
      designNotes: '幸運的象徵，代表機會和可能性，為玩家提供更多選擇。',
      
      effects: {
        on_play: async function(gameState) {
          let cardsDrawn = 0;
          
          for (let i = 0; i < 2; i++) {
            if (await CardUtils.drawCard(gameState)) {
              cardsDrawn++;
            }
          }
          
          return { 
            success: true,
            description: `抽了 ${cardsDrawn} 張牌` 
          };
        }
      }
    };
  }
}