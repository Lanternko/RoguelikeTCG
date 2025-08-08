// src/cards/collections/yang/common/HolyLight.js
import { CardUtils } from '../../../CardUtils.js';

export class HolyLightCard {
  static create() {
    return {
      id: 'holy_light',
      name: '聖光',
      type: 'spell',
      attribute: 'yang',
      rarity: 'common',
      stats: {
        hp_bonus: 0,     // 法術卡無數值
        attack: 0,
        crit: 0
      },
      description: '法術：回復15點生命值。',
      balanceNotes: '純治療法術，生存工具。陽屬性的經典治療效果。',
      designNotes: '神聖的光芒具有治癒的力量，體現陽屬性的正面能量。',
      
      effects: {
        on_play: async function(gameState) {
          const healAmount = 15;
          const actualHeal = CardUtils.healPlayer(gameState, healAmount);
          
          return { 
            success: true,
            description: `回復 ${actualHeal} 點生命值` 
          };
        }
      }
    };
  }
}
