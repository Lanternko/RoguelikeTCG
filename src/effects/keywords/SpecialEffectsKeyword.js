// effects/keywords/SpecialEffects.js
export class SpecialEffectsKeyword {
  // 共產主義：血量追平
  static async communismEffect(gameState) {
    const playerHP = gameState.player.current_hp;
    const enemyHP = gameState.cpu.activePitcher.current_hp;
    
    if (playerHP < enemyHP) {
      const healAmount = Math.min(enemyHP - playerHP, gameState.player.max_hp - playerHP);
      gameState.player.current_hp += healAmount;
      
      return { success: true, description: `回復${healAmount}點血量，追平敵方` };
    }
    
    return { success: false, reason: '血量不低於敵方' };
  }
  
  // 時間暫停：投手跳過下一回合
  static async timeStopEffect(gameState) {
    gameState.cpu.skipNextTurn = true;
    return { success: true, description: '投手將跳過下一回合' };
  }
  
  // 死者蘇生：復活棄牌堆中的強力卡牌
  static async resurrectionEffect(gameState) {
    const strongCards = gameState.player.discard.filter(
      card => card.type === 'batter' && (card.stats.attack + (card.tempBonus?.attack || 0)) >= 10
    );
    
    if (strongCards.length > 0) {
      // 將強力卡牌洗回牌庫
      strongCards.forEach(card => {
        const index = gameState.player.discard.indexOf(card);
        gameState.player.discard.splice(index, 1);
        gameState.player.deck.push(card);
      });
      
      // 洗牌
      this.shuffleDeck(gameState.player.deck);
      
      // 根據牌庫數量給予額外效果
      if (gameState.player.deck.length >= 15) {
        // 陽屬卡攻擊力+20
        [...gameState.player.deck, ...gameState.player.hand].forEach(card => {
          if (card.attribute === 'yang') {
            card.permanentBonus = card.permanentBonus || {};
            card.permanentBonus.attack = (card.permanentBonus.attack || 0) + 20;
          }
        });
        return { success: true, description: `復活${strongCards.length}張卡牌，陽屬卡+20攻擊` };
      } else {
        // 抽1張陽屬卡
        const yangCards = gameState.player.deck.filter(card => card.attribute === 'yang');
        if (yangCards.length > 0) {
          const drawnCard = yangCards[Math.floor(Math.random() * yangCards.length)];
          const deckIndex = gameState.player.deck.indexOf(drawnCard);
          gameState.player.deck.splice(deckIndex, 1);
          gameState.player.hand.push(drawnCard);
        }
        return { success: true, description: `復活${strongCards.length}張卡牌，抽1張陽屬卡` };
      }
    }
    
    return { success: false, reason: '棄牌堆中沒有符合條件的卡牌' };
  }
  
  static shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
}