// 民主卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';
import { GAME_BALANCE } from '../../../../data/balance/GameBalance.js';

export class DemocracyCard {
  static create() {
    const balance = CARD_BALANCE.DEMOCRACY;
    
    return {
      id: 'democracy',
      name: '民主',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '輔助：此回合中，降低5%出局機率',
      effects: {
        on_support: async function(gameState) {
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'reduce_out_rate',
            value: GAME_BALANCE.DEMOCRACY_OUT_REDUCTION,
            source: this.name
          });
          
          return {
            success: true,
            description: '降低5%出局機率'
          };
        }
      }
    };
  }
}