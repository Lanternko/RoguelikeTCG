// effects/keywords/PitcherDebuff.js
export class PitcherDebuffKeyword {
  // 暗影吞噬輔助：投手攻擊力-3
  static async reducePitcherAttack(gameState, amount = 3) {
    gameState.cpu.activePitcher.tempDebuff = gameState.cpu.activePitcher.tempDebuff || {};
    gameState.cpu.activePitcher.tempDebuff.attack = 
      (gameState.cpu.activePitcher.tempDebuff.attack || 0) - amount;
    
    return { success: true, description: `投手攻擊力-${amount}` };
  }
  
  // 邪惡天才：吸取投手5點攻擊力
  static async drainPitcherAttack(card, gameState, amount = 5) {
    // 減少投手攻擊力
    await this.reducePitcherAttack(gameState, amount);
    
    // 增加自己攻擊力
    card.tempBonus = card.tempBonus || {};
    card.tempBonus.attack = (card.tempBonus.attack || 0) + amount;
    
    return { success: true, description: `吸取投手${amount}點攻擊力` };
  }
  
  // 偷襲：直接降低投手10點血量
  static async directDamagePitcher(gameState, damage = 10) {
    gameState.cpu.activePitcher.current_hp -= damage;
    gameState.cpu.activePitcher.current_hp = Math.max(0, gameState.cpu.activePitcher.current_hp);
    
    return { success: true, description: `直接對投手造成${damage}點傷害` };
  }
}