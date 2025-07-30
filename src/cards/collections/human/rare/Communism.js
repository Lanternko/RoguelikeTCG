// 共产主义卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class CommunismCard {
  static create() {
    const balance = CARD_BALANCE.COMMUNISM;
    
    return {
      id: 'communism',
      name: '共產主義',
      type: 'spell',
      attribute: 'human',
      rarity: 'rare',
      stats: { hp_bonus: balance.hp },
      description: '若我方血量低於敵方，則回復血量至與敵方相同',
      effects: {
        on_play: async function(gameState) {
          const playerHP = gameState.player.current_hp;
          const enemyHP = gameState.pitcher.current_hp;
          
          if (playerHP < enemyHP) {
            const healAmount = Math.min(enemyHP - playerHP, gameState.player.max_hp - playerHP);
            gameState.player.current_hp += healAmount;
            return { success: true, description: `回復${healAmount}點血量，追平敵方` };
          }
          return { success: false, reason: '血量不低於敵方' };
        }
      }
    };
  }
}