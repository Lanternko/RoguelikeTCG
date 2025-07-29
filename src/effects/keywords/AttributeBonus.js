// effects/keywords/AttributeBonus.js
import { GAME_BALANCE } from '../../data/balance/gameBalance.js';

export class AttributeBonusKeyword {
  // 總統效果：每有一張人屬性卡，攻擊力+1
  static async presidentBonus(card, gameState) {
    const humanCards = gameState.player.deck.filter(c => c.attribute === 'human').length;
    card.tempBonus = card.tempBonus || {};
    card.tempBonus.attack = (card.tempBonus.attack || 0) + humanCards;
    
    return { description: `人屬性卡數量: ${humanCards}，攻擊力+${humanCards}` };
  }
  
  // 多元文化：檢查場上屬性種類
  static countFieldAttributes(gameState) {
    const attributes = new Set();
    
    // 檢查打擊區
    if (gameState.strikeZone[0]) {
      attributes.add(gameState.strikeZone[0].attribute);
    }
    
    // 檢查輔助區
    if (gameState.supportZone[0]) {
      attributes.add(gameState.supportZone[0].attribute);
    }
    
    return attributes.size;
  }
  
  // 多元文化效果
  static async multicultureBonus(gameState) {
    const attributeCount = this.countFieldAttributes(gameState);
    
    if (attributeCount >= GAME_BALANCE.MIN_ATTRIBUTES_FOR_BONUS) {
      // 為手牌中所有人屬性打者卡+10攻擊力
      gameState.player.hand.forEach(card => {
        if (card.attribute === 'human' && card.type === 'batter') {
          card.tempBonus = card.tempBonus || {};
          card.tempBonus.attack = (card.tempBonus.attack || 0) + 10;
        }
      });
      
      return { success: true, description: `場上${attributeCount}種屬性，人屬打者+10攻擊` };
    }
    return { success: false, reason: '場上屬性種類不足' };
  }
}
