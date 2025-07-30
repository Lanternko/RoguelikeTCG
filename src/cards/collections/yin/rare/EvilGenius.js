// 邪恶天才卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class EvilGeniusCard {
  static create() {
    const balance = CARD_BALANCE.EVIL_GENIUS;
    
    return {
      id: 'evil_genius',
      name: '邪惡天才',
      type: 'batter',
      attribute: 'yin',
      rarity: 'rare',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '打擊：吸取投手5點攻擊力',
      effects: {
        on_strike: async function(gameState) {
          // 減少投手攻擊力
          gameState.pitcher.tempDebuff = gameState.pitcher.tempDebuff || {};
          gameState.pitcher.tempDebuff.attack = 
            (gameState.pitcher.tempDebuff.attack || 0) - 5;
          
          // 增加自己攻擊力
          this.tempBonus = this.tempBonus || {};
          this.tempBonus.attack = (this.tempBonus.attack || 0) + 5;
          
          return {
            success: true,
            description: '吸取投手5點攻擊力'
          };
        }
      }
    };
  }
}