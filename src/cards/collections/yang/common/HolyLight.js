// 圣光卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class HolyLightCard {
  static create() {
    const balance = CARD_BALANCE.HOLY_LIGHT;
    
    return {
      id: 'holy_light',
      name: '聖光',
      type: 'spell',
      attribute: 'yang',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp
      },
      description: '選擇一張手牌，其攻擊力+8(本回合)。抽1張牌',
      effects: {
        on_play: async function(gameState) {
          // 簡化實現：給第一張打者卡+8攻擊力
          const batterCard = gameState.player.hand.find(card => card.type === 'batter');
          if (batterCard) {
            batterCard.tempBonus = batterCard.tempBonus || {};
            batterCard.tempBonus.attack = (batterCard.tempBonus.attack || 0) + 8;
          }
          
          // 抽1張牌
          if (gameState.player.deck.length > 0) {
            const drawnCard = gameState.player.deck.pop();
            gameState.player.hand.push(drawnCard);
          }
          
          return {
            success: true,
            description: batterCard ? `${batterCard.name}攻擊力+8，抽1張牌` : '抽1張牌'
          };
        }
      }
    };
  }
}