// 3. 修復 src/effects/keywords/AttributeBonus.js - 修正導入路徑
import { GAME_BALANCE } from '../../data/balance/GameBalance.js';

export class AttributeBonusKeyword {
  // 總統效果：每有一張人屬性卡，攻擊力+1
  static async presidentBonus(card, gameState) {
    // 計算牌庫+手牌+棄牌堆中的人屬性卡數量
    let humanCardsCount = 0;
    
    // 計算手牌中的人屬性卡
    gameState.player.hand.forEach(handCard => {
      if (handCard.attribute === 'human') {
        humanCardsCount++;
      }
    });
    
    // 計算棄牌堆中的人屬性卡
    gameState.player.discard_pile.forEach(discardCard => {
      if (discardCard.attribute === 'human') {
        humanCardsCount++;
      }
    });
    
    // 應用加成
    card.tempBonus = card.tempBonus || {};
    card.tempBonus.attack = (card.tempBonus.attack || 0) + humanCardsCount;
    
    return { 
      success: true,
      description: `人屬性卡數量: ${humanCardsCount}，攻擊力+${humanCardsCount}` 
    };
  }
  
  // 多元文化：檢查場上屬性種類
  static countFieldAttributes(gameState) {
    const attributes = new Set();
    
    // 檢查打擊區
    if (gameState.player.strike_zone[0]) {
      attributes.add(gameState.player.strike_zone[0].attribute);
    }
    
    // 檢查輔助區
    if (gameState.player.support_zone[0]) {
      attributes.add(gameState.player.support_zone[0].attribute);
    }
    
    // 檢查法術區
    if (gameState.player.spell_zone[0]) {
      attributes.add(gameState.player.spell_zone[0].attribute);
    }
    
    return attributes.size;
  }
  
  // 多元文化效果
  static async multicultureBonus(gameState) {
    const attributeCount = this.countFieldAttributes(gameState);
    
    if (attributeCount >= (GAME_BALANCE.MIN_ATTRIBUTES_FOR_BONUS || 3)) {
      // 為手牌中所有人屬性打者卡+10攻擊力
      let boostedCount = 0;
      
      gameState.player.hand.forEach(card => {
        if (card.attribute === 'human' && card.type === 'batter') {
          card.tempBonus = card.tempBonus || {};
          card.tempBonus.attack = (card.tempBonus.attack || 0) + 10;
          boostedCount++;
        }
      });
      
      return { 
        success: true, 
        description: `場上${attributeCount}種屬性，${boostedCount}張人屬打者+10攻擊` 
      };
    }
    
    return { 
      success: false, 
      reason: `場上屬性種類不足(${attributeCount}/3)` 
    };
  }
}