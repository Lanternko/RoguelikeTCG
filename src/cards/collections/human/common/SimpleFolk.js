// 民风淳朴卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class SimpleFolkCard {
  static create() {
    const balance = CARD_BALANCE.SIMPLE_FOLK;
    
    return {
      id: 'simple_folk',
      name: '民風淳樸',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '高攻擊力的基礎打者',
      effects: {}
    };
  }
}