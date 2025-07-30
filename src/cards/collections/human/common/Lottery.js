// 大乐透卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class LotteryCard {
  static create() {
    const balance = CARD_BALANCE.LOTTERY;
    
    return {
      id: 'lottery',
      name: '大樂透',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp
      },
      description: '抽1張人屬性打者卡',
      effects: {
        on_play: async function(gameState) {
          const humanBatters = gameState.player.deck.filter(
            card => card.attribute === 'human' && card.type === 'batter'
          );
          
          if (humanBatters.length > 0) {
            const randomCard = humanBatters[Math.floor(Math.random() * humanBatters.length)];
            gameState.player.deck = gameState.player.deck.filter(c => c !== randomCard);
            gameState.player.hand.push(randomCard);
            
            return {
              success: true,
              description: `抽到了 ${randomCard.name}`
            };
          }
          
          return {
            success: false,
            reason: '牌庫中沒有人屬性打者卡'
          };
        }
      }
    };
  }
}