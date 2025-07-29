// systems/CombatSystem.js
import { CardRegistry } from '../cards/CardRegistry.js';
import { GAME_BALANCE } from '../data/balance/GameBalance.js';

export class CombatSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }
  
  // 處理打擊階段
  async processStrike(gameState, card) {
    console.log(`⚔️ ${card.name} 進行打擊`);
    
    // 記錄本回合打出的卡牌
    gameState.turnPlayedCards = gameState.turnPlayedCards || [];
    gameState.turnPlayedCards.push(card);
    
    // 應用回合Buff（如慈愛效果）
    this.applyTurnBuffs(gameState, card);
    
    // 觸發打擊效果
    if (card.effects?.on_strike) {
      const result = await card.effects.on_strike.call(card, gameState);
      console.log(`🎯 打擊效果: ${result.description}`);
    }
    
    // 計算最終傷害
    const finalDamage = this.calculateDamage(card, gameState);
    
    // 對投手造成傷害
    gameState.cpu.activePitcher.current_hp -= finalDamage;
    gameState.cpu.activePitcher.current_hp = Math.max(0, gameState.cpu.activePitcher.current_hp);
    
    this.eventBus.emit('damage_dealt', {
      card: card.name,
      damage: finalDamage,
      remaining: gameState.cpu.activePitcher.current_hp
    });
    
    return finalDamage;
  }
  
  // 處理輔助階段
  async processSupport(gameState, card) {
    console.log(`🛡️ ${card.name} 進行輔助`);
    
    // 觸發輔助效果
    if (card.effects?.on_support) {
      const result = await card.effects.on_support.call(card, gameState);
      console.log(`🎯 輔助效果: ${result.description}`);
      return result;
    }
    
    return { success: false, reason: '無輔助效果' };
  }
  
  // 應用回合Buff
  applyTurnBuffs(gameState, card) {
    const turnBuffs = gameState.turnBuffs || [];
    
    turnBuffs.forEach(buff => {
      switch (buff.type) {
        case 'human_batter_attack_boost':
          if (card.attribute === 'human' && card.type === 'batter') {
            card.tempBonus = card.tempBonus || {};
            card.tempBonus.attack = (card.tempBonus.attack || 0) + buff.value;
            console.log(`💪 ${card.name} 受到 ${buff.source} 加成，攻擊力+${buff.value}`);
          }
          break;
      }
    });
  }
  
  // 計算最終傷害
  calculateDamage(card, gameState) {
    const baseAttack = card.stats.attack;
    const tempBonus = card.tempBonus?.attack || 0;
    const finalAttack = baseAttack + tempBonus;
    
    console.log(`📊 ${card.name} 最終攻擊力: ${baseAttack} + ${tempBonus} = ${finalAttack}`);
    return finalAttack;
  }
  
  // 回合結束清理
  endTurn(gameState) {
    // 清理回合Buff
    gameState.turnBuffs = [];
    
    // 清理臨時加成
    gameState.player.hand.forEach(card => {
      if (card.tempBonus) {
        delete card.tempBonus;
      }
    });
    
    // 清理本回合打出的卡牌記錄
    gameState.turnPlayedCards = [];
    
    console.log('🔄 回合結束，清理臨時效果');
  }
}