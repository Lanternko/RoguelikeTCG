// 修正文件名拼写错误：BenevelontLegacy.js -> BenevolentLegacy.js
// cards/collections/human/rare/BenevolentLegacy.js
import { DrawKeyword } from '../../../../effects/keywords/DrawKeyword.js';
import { CARD_BALANCE } from '../../../../data/balance/CardBalance.js';

export class BenevolentLegacyCard {
  static create() {
    const balance = CARD_BALANCE.BENEVOLENT_LEGACY;
    
    return {
      id: 'benevolent_legacy',
      name: '仁道傳承',
      type: 'batter',
      attribute: 'human',
      rarity: 'rare',
      stats: {
        hp_bonus: balance.hp,
        attack: balance.attack,
        crit: balance.crit
      },
      description: '打擊：若場上有陰或陽屬性卡，攻擊力+20；若場上有天或地屬性卡，棄1張牌抽2張（限一次）。輔助：抽1張人屬性卡。',
      
      effects: {
        on_strike: async function(gameState) {
          let effects = [];
          
          // 檢查場上的陰陽屬性
          const fieldCards = [
            gameState.player.strike_zone, 
            gameState.player.support_zone, 
            gameState.player.spell_zone
          ].filter(Boolean);
          
          const hasYinYang = fieldCards.some(card => 
            card && (card.attribute === 'yin' || card.attribute === 'yang')
          );
          
          if (hasYinYang) {
            this.tempBonus = this.tempBonus || {};
            this.tempBonus.attack = (this.tempBonus.attack || 0) + 20;
            effects.push('場上有陰/陽屬性，攻擊力+20');
          }
          
          // 檢查天地屬性
          const hasHeavenEarth = fieldCards.some(card => 
            card && (card.attribute === 'heaven' || card.attribute === 'earth')
          );
          
          if (hasHeavenEarth && !this.hasUsedDrawEffect) {
            // 棄1張牌
            if (gameState.player.hand.length > 1) {
              const discarded = gameState.player.hand.pop();
              gameState.player.discard_pile.push(discarded);
              
              // 抽2張牌
              for (let i = 0; i < 2; i++) {
                await DrawKeyword.drawAnyCard(gameState);
              }
              
              this.hasUsedDrawEffect = true;
              effects.push('場上有天/地屬性，棄1抽2');
            }
          }
          
          return { success: true, description: effects.join('；') };
        },
        
        on_support: async function(gameState) {
          return await DrawKeyword.drawHumanBatter(gameState);
        }
      }
    };
  }
}