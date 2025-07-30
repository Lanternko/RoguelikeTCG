// 传承卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class InheritanceCard {
  static create() {
    const balance = CARD_BALANCE.INHERITANCE;
    
    return {
      id: 'inheritance',
      name: '傳承',
      type: 'deathrattle',
      attribute: 'human',
      rarity: 'common',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '死聲：抽1張人屬性卡牌。下一回合，你打出的人屬性打者卡攻擊力+10',
      effects: {
        on_deathrattle: async function(gameState) {
          // 抽1張人屬性卡
          const humanCards = gameState.player.deck.filter(card => card.attribute === 'human');
          if (humanCards.length > 0) {
            const randomCard = humanCards[Math.floor(Math.random() * humanCards.length)];
            gameState.player.deck = gameState.player.deck.filter(c => c !== randomCard);
            gameState.player.hand.push(randomCard);
            
            // 下回合buff
            gameState.player.active_buffs.push({
              type: 'human_batter_attack_boost_next_turn',
              value: 10,
              duration: 1
            });
            
            return { success: true, description: `抽到了 ${randomCard.name}，下回合人屬打者+10攻擊` };
          }
          return { success: false, reason: '牌庫中沒有人屬性卡' };
        }
      }
    };
  }
}