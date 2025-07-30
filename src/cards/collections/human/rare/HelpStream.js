// 帮我开直播卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class HelpStreamCard {
  static create() {
    const balance = CARD_BALANCE.HELP_STREAM;
    
    return {
      id: 'help_stream',
      name: '幫我開直播',
      type: 'deathrattle',
      attribute: 'human',
      rarity: 'rare',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '死聲：你的人屬性打者卡+5攻擊力',
      effects: {
        on_deathrattle: async function(gameState) {
          let boostedCount = 0;
          [...gameState.player.hand, ...gameState.player.deck, ...gameState.player.discard_pile].forEach(card => {
            if (card.attribute === 'human' && card.type === 'batter') {
              card.permanentBonus = card.permanentBonus || {};
              card.permanentBonus.attack = (card.permanentBonus.attack || 0) + 5;
              boostedCount++;
            }
          });
          return { success: true, description: `${boostedCount}張人屬打者卡永久+5攻擊力` };
        }
      }
    };
  }
}