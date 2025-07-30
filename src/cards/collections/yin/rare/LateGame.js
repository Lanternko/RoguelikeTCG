// 专打后期卡的完整实现
import { CARD_BALANCE } from '../../../data/balance/CardBalance.js';

export class LateGameCard {
  static create() {
    const balance = CARD_BALANCE.LATE_GAME;
    
    return {
      id: 'late_game',
      name: '專打後期',
      type: 'batter',
      attribute: 'yang',
      rarity: 'rare',  // 确认稀有度为 rare
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '打擊：本場你每抽1張牌，此卡攻擊力+3',
      effects: {
        on_strike: async function(gameState) {
          const cardsDrawn = gameState.cardsDrawnThisGame || 0;
          const bonus = cardsDrawn * 3;
          this.tempBonus = this.tempBonus || {};
          this.tempBonus.attack = (this.tempBonus.attack || 0) + bonus;
          return { success: true, description: `已抽${cardsDrawn}張牌，攻擊力+${bonus}` };
        }
      }
    };
  }
}