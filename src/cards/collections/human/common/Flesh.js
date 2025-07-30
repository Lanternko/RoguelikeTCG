// 肉块卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class FleshCard {
  static create() {
    const balance = CARD_BALANCE.FLESH;
    
    return {
      id: 'flesh',
      name: '肉塊',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: { 
        hp_bonus: balance.hp, 
        attack: balance.attack, 
        crit: balance.crit 
      },
      description: '高血量的肉盾打者',
      effects: {}
    };
  }
}