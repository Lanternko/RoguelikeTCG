// 修正文件路径：从 yin/common/ 移动到 yin/
// 孤影卡的完整实现
import { CARD_BALANCE } from '../../../data/balance/CardBalance.js';

export class LoneShadowCard {
  static create() {
    const balance = CARD_BALANCE.LONE_SHADOW;
    
    return {
      id: 'lone_shadow',
      name: '孤影',
      type: 'spell',
      attribute: 'yin',
      rarity: 'common',  // 确认稀有度为 common
      stats: {
        hp_bonus: balance.hp
      },
      description: '減投手5攻(本回合)。抽1張牌',
      effects: {
        on_play: async function(gameState) {
          gameState.pitcher.tempDebuff = gameState.pitcher.tempDebuff || {};
          gameState.pitcher.tempDebuff.attack = 
            (gameState.pitcher.tempDebuff.attack || 0) - 5;
          
          // 抽1張牌
          if (gameState.player.deck.length > 0) {
            const drawnCard = gameState.player.deck.pop();
            gameState.player.hand.push(drawnCard);
          }
          
          return {
            success: true,
            description: '投手攻擊力-5，抽1張牌'
          };
        }
      }
    };
  }
}