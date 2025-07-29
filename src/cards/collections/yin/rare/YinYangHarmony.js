// cards/collections/yang/rare/YinYangHarmony.js
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class YinYangHarmonyCard {
  static create() {
    const balance = CARD_BALANCE.YIN_YANG_HARMONY;
    
    return {
      id: 'yinyang_harmony',
      name: '陰陽調和',
      type: 'batter',
      attribute: 'yang',
      rarity: 'rare',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '打擊：若你的輔助格為陰屬性，此卡攻擊力變為兩倍。',
      
      effects: {
        on_strike: async function(gameState) {
          const supportCard = gameState.supportZone[0];
          
          if (supportCard && supportCard.attribute === 'yin') {
            const currentAttack = this.stats.attack + (this.tempBonus?.attack || 0);
            this.tempBonus = this.tempBonus || {};
            this.tempBonus.attack = currentAttack; // 使攻擊力變為兩倍
            
            return { success: true, description: '輔助格為陰屬性，攻擊力翻倍！' };
          }
          
          return { success: false, reason: '輔助格不是陰屬性' };
        }
      }
    };
  }
}