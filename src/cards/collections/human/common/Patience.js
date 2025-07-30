// 忍耐卡的完整实现
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class PatienceCard {
  static create() {
    const balance = CARD_BALANCE.PATIENCE;
    
    return {
      id: 'patience',
      name: '忍耐',
      type: 'spell',
      attribute: 'human',
      rarity: 'common',
      stats: { hp_bonus: balance.hp },
      description: '本回合減少10點所受傷害',
      effects: {
        on_play: async function(gameState) {
          gameState.turnBuffs = gameState.turnBuffs || [];
          gameState.turnBuffs.push({
            type: 'damage_reduction',
            value: 10,
            source: this.name
          });
          return { success: true, description: '本回合減少10點所受傷害' };
        }
      }
    };
  }
}