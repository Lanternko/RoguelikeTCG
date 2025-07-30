// Hero 卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class HeroCard {
  static create() {
    const balance = CARD_BALANCE.HERO;
    
    return {
      id: 'hero',
      name: '英雄',
      type: 'batter',
      attribute: 'human',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '基礎打者卡，無特殊效果',
      effects: {}
    };
  }
}