// 偷袭卡的完整实现
import { CARD_BALANCE } from '../../../data/balance/CardBalance.js';

export class AmbushCard {
  static create() {
    const balance = CARD_BALANCE.AMBUSH;
    
    return {
      id: 'ambush',
      name: '偷襲',
      type: 'batter',
      attribute: 'yin',
      rarity: 'rare',  // 确认稀有度为 rare
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '輔助：直接降低投手10點血量',
      effects: {
        on_support: async function(gameState) {
          gameState.pitcher.current_hp -= 10;
          gameState.pitcher.current_hp = Math.max(0, gameState.pitcher.current_hp);
          return { success: true, description: '直接對投手造成10點傷害' };
        }
      }
    };
  }
}