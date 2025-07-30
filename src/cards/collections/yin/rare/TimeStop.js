// 时间暂停卡的完整实现
import { CARD_BALANCE } from '../../../data/balance/CardBalance.js';

export class TimeStopCard {
  static create() {
    const balance = CARD_BALANCE.TIME_STOP;
    
    return {
      id: 'time_stop',
      name: '時間暫停',
      type: 'spell',
      attribute: 'yin',
      rarity: 'legendary',  // 确认稀有度为 legendary
      stats: { hp_bonus: balance.hp },
      description: '投手跳過他的下一個回合',
      effects: {
        on_play: async function(gameState) {
          gameState.pitcher.skipNextTurn = true;
          return { success: true, description: '投手將跳過下一回合' };
        }
      }
    };
  }
}