// 死者苏生卡的完整实现
import { CARD_BALANCE } from '../../../data/balance/CardBalance.js';

export class ResurrectionCard {
  static create() {
    const balance = CARD_BALANCE.RESURRECTION;
    
    return {
      id: 'resurrection',
      name: '死者蘇生',
      type: 'deathrattle',
      attribute: 'yang',
      rarity: 'legendary',  // 确认稀有度为 legendary
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '死聲：你棄牌堆中所有攻擊力≥10的打者卡洗回牌庫。若牌庫≥15張，陽屬卡攻擊力+20；若<15張，抽1張陽屬卡',
      effects: {
        on_deathrattle: async function(gameState) {
          const strongCards = gameState.player.discard_pile.filter(
            card => card.type === 'batter' && (card.stats.attack + (card.tempBonus?.attack || 0)) >= 10
          );
          
          if (strongCards.length > 0) {
            strongCards.forEach(card => {
              const index = gameState.player.discard_pile.indexOf(card);
              gameState.player.discard_pile.splice(index, 1);
              gameState.player.deck.push(card);
            });
            
            // 洗牌
            for (let i = gameState.player.deck.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [gameState.player.deck[i], gameState.player.deck[j]] = [gameState.player.deck[j], gameState.player.deck[i]];
            }
            
            if (gameState.player.deck.length >= 15) {
              [...gameState.player.deck, ...gameState.player.hand].forEach(card => {
                if (card.attribute === 'yang') {
                  card.permanentBonus = card.permanentBonus || {};
                  card.permanentBonus.attack = (card.permanentBonus.attack || 0) + 20;
                }
              });
              return { success: true, description: `復活${strongCards.length}張卡牌，陽屬卡+20攻擊` };
            } else {
              const yangCards = gameState.player.deck.filter(card => card.attribute === 'yang');
              if (yangCards.length > 0) {
                const drawnCard = yangCards[Math.floor(Math.random() * yangCards.length)];
                const deckIndex = gameState.player.deck.indexOf(drawnCard);
                gameState.player.deck.splice(deckIndex, 1);
                gameState.player.hand.push(drawnCard);
              }
              return { success: true, description: `復活${strongCards.length}張卡牌，抽1張陽屬卡` };
            }
          }
          
          return { success: false, reason: '棄牌堆中沒有符合條件的卡牌' };
        }
      }
    };
  }
}