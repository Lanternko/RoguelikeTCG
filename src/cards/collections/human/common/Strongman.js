// 猛男卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class StrongmanCard {
  static create() {
    const balance = CARD_BALANCE.STRONGMAN;
    
    return {
      id: 'strongman',
      name: '猛男',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '高血量的強力打者',
      effects: {}
    };
  }
}