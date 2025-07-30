// 武器大师卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class WeaponMasterCard {
  static create() {
    const balance = CARD_BALANCE.WEAPON_MASTER;
    
    return {
      id: 'weapon_master',
      name: '武器大師',
      type: 'batter',
      attribute: 'yang',
      rarity: 'common',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '輔助：手牌中每有一種不同屬性的卡，打者攻擊力+5',
      effects: {
        on_support: async function(gameState) {
          const attributes = new Set();
          gameState.player.hand.forEach(card => {
            attributes.add(card.attribute);
          });
          
          const boost = attributes.size * 5;
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'batter_attack_boost',
            value: boost,
            source: this.name
          });
          
          return {
            success: true,
            description: `手牌${attributes.size}種屬性，打者攻擊力+${boost}`
          };
        }
      }
    };
  }
}