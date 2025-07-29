// effects/keywords/DrawKeyword.js
export class DrawKeyword {
  // 大樂透：抽1張人屬性打者卡
  static async drawHumanBatter(gameState) {
    const humanBatters = gameState.player.deck.filter(
      card => card.attribute === 'human' && card.type === 'batter'
    );
    
    if (humanBatters.length > 0) {
      const randomIndex = Math.floor(Math.random() * humanBatters.length);
      const drawnCard = humanBatters[randomIndex];
      
      // 從牌庫移除並加到手牌
      const deckIndex = gameState.player.deck.indexOf(drawnCard);
      gameState.player.deck.splice(deckIndex, 1);
      gameState.player.hand.push(drawnCard);
      
      return { success: true, description: `抽到了 ${drawnCard.name}` };
    }
    
    return { success: false, reason: '牌庫中沒有人屬性打者卡' };
  }
  
  // 文化脈絡：抽1張任意卡牌
  static async drawAnyCard(gameState) {
    if (gameState.player.deck.length > 0) {
      const drawnCard = gameState.player.deck.pop();
      gameState.player.hand.push(drawnCard);
      return { success: true, description: `抽到了 ${drawnCard.name}` };
    }
    return { success: false, reason: '牌庫為空' };
  }
}