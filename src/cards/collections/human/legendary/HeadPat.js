// 摸头卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class HeadPatCard {
  static create() {
    const balance = CARD_BALANCE.HEAD_PAT;
    
    return {
      id: 'head_pat',
      name: '摸頭',
      type: 'spell',
      attribute: 'human',
      rarity: 'legendary',
      stats: { hp_bonus: balance.hp },
      description: '抽3張卡。其中每抽到一張人屬性卡，該卡+5攻擊力',
      effects: {
        on_play: async function(gameState) {
          let drawnCards = [];
          let humanCardsBoosted = 0;
          
          for (let i = 0; i < 3 && gameState.player.deck.length > 0; i++) {
            const drawnCard = gameState.player.deck.pop();
            gameState.player.hand.push(drawnCard);
            drawnCards.push(drawnCard.name);
            
            if (drawnCard.attribute === 'human') {
              drawnCard.permanentBonus = drawnCard.permanentBonus || {};
              drawnCard.permanentBonus.attack = (drawnCard.permanentBonus.attack || 0) + 5;
              humanCardsBoosted++;
            }
          }
          
          return { 
            success: true, 
            description: `抽到${drawnCards.length}張卡，${humanCardsBoosted}張人屬卡+5攻擊力` 
          };
        }
      }
    };
  }
}