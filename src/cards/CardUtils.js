// ===== 🧰 UPDATED CARD UTILS (src/cards/CardUtils.js) =====

/**
 * 🧰 卡牌工具函數
 * 提供所有卡牌共用的邏輯和輔助函數
 */
export class CardUtils {
  /**
   * 🎴 抽牌輔助函數
   */
  static async drawCard(gameState) {
    // 如果牌庫為空，洗牌
    if (gameState.player.deck.length === 0) {
      if (gameState.player.discard_pile.length > 0) {
        console.log('🔄 牌庫為空，洗牌棄牌堆...');
        gameState.player.deck = [...gameState.player.discard_pile];
        gameState.player.discard_pile = [];
        this.shuffleDeck(gameState.player.deck);
      } else {
        console.log('📭 牌庫和棄牌堆都為空，無法抽牌');
        return false;
      }
    }
    
    const card = gameState.player.deck.pop();
    if (card) {
      gameState.player.hand.push(card);
      console.log(`🎴 抽到: ${card.name}`);
      return true;
    }
    return false;
  }

  /**
   * 🔀 洗牌函數
   */
  static shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    console.log(`🔀 牌庫洗牌完成 (${deck.length} 張卡)`);
  }

  /**
   * 🎯 計算場上屬性種類
   */
  static countFieldAttributes(gameState) {
    const attributes = new Set();
    
    const fieldCards = [
      gameState.player.strike_zone,
      gameState.player.support_zone,
      gameState.player.spell_zone
    ].filter(Boolean);
    
    fieldCards.forEach(card => {
      if (card && card.attribute) {
        attributes.add(card.attribute);
      }
    });
    
    return attributes.size;
  }

  /**
   * 🔢 計算特定屬性卡牌數量
   */
  static countCardsWithAttribute(gameState, attribute, zones = ['hand', 'discard_pile']) {
    let count = 0;
    
    zones.forEach(zone => {
      if (gameState.player[zone] && Array.isArray(gameState.player[zone])) {
        gameState.player[zone].forEach(card => {
          if (card.attribute === attribute) {
            count++;
          }
        });
      }
    });
    
    return count;
  }

  /**
   * 💊 治療玩家
   */
  static healPlayer(gameState, amount) {
    const oldHP = gameState.player.current_hp;
    gameState.player.current_hp += amount;
    gameState.player.current_hp = Math.min(
      gameState.player.max_hp,
      gameState.player.current_hp
    );
    
    const actualHeal = gameState.player.current_hp - oldHP;
    console.log(`💚 玩家回復 ${actualHeal} 血量 (${oldHP} → ${gameState.player.current_hp})`);
    return actualHeal;
  }

  /**
   * 💥 對投手造成直接傷害
   */
  static damagePitcher(gameState, amount) {
    const oldHP = gameState.pitcher.current_hp;
    gameState.pitcher.current_hp -= amount;
    gameState.pitcher.current_hp = Math.max(0, gameState.pitcher.current_hp);
    
    const actualDamage = oldHP - gameState.pitcher.current_hp;
    console.log(`💥 投手受到 ${actualDamage} 傷害 (${oldHP} → ${gameState.pitcher.current_hp})`);
    return actualDamage;
  }

  /**
   * 🔻 減少投手攻擊力
   */
  static reducePitcherAttack(gameState, amount) {
    gameState.pitcher.tempDebuff = gameState.pitcher.tempDebuff || {};
    gameState.pitcher.tempDebuff.attack = 
      (gameState.pitcher.tempDebuff.attack || 0) - amount;
    
    console.log(`🔻 投手攻擊力減少 ${amount} (臨時減益: ${gameState.pitcher.tempDebuff.attack})`);
    return amount;
  }

  /**
   * 🎭 檢查場上是否有特定屬性卡牌
   */
  static hasAttributeOnField(gameState, attributes) {
    const fieldCards = [
      gameState.player.strike_zone,
      gameState.player.support_zone,
      gameState.player.spell_zone
    ].filter(Boolean);

    const attributeArray = Array.isArray(attributes) ? attributes : [attributes];
    
    return fieldCards.some(card => 
      card && attributeArray.includes(card.attribute)
    );
  }

  /**
   * 🎪 獲取特定類型的卡牌數量
   */
  static countCardsByType(gameState, cardType, zones = ['hand', 'discard_pile']) {
    let count = 0;
    
    zones.forEach(zone => {
      if (gameState.player[zone] && Array.isArray(gameState.player[zone])) {
        gameState.player[zone].forEach(card => {
          if (card.type === cardType) {
            count++;
          }
        });
      }
    });
    
    return count;
  }
}