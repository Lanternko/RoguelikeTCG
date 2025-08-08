// ===== 📡 EVENT BUS (src/core/EventBus.js) =====

/**
 * 📡 事件總線
 * 提供解耦的事件通信機制
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 📝 註冊事件監聽器
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 🗑️ 移除事件監聽器
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 📢 發出事件
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ 事件處理錯誤 [${event}]:`, error);
      }
    });
  }

  /**
   * 🧹 清理所有監聽器
   */
  removeAllListeners() {
    this.listeners.clear();
  }

  /**
   * 📊 獲取統計信息
   */
  getStats() {
    const stats = {};
    for (const [event, callbacks] of this.listeners) {
      stats[event] = callbacks.length;
    }
    return stats;
  }
}

// ===== 🎮 GAME STATE (src/core/GameState.js) =====

import { GAME_BALANCE } from '../data/balance/GameBalance.js';

/**
 * 🎮 遊戲狀態
 * 統一管理所有遊戲數據
 */
export class GameState {
  constructor() {
    this.player = {
      current_hp: GAME_BALANCE.PLAYER_INITIAL_HP,
      max_hp: GAME_BALANCE.PLAYER_INITIAL_HP,
      deck: [],                    // 存放完整卡牌對象
      hand: [],                    // 存放完整卡牌對象
      discard_pile: [],            // 存放完整卡牌對象
      strike_zone: null,           // 單個卡牌對象或null
      support_zone: null,          // 單個卡牌對象或null
      spell_zone: null,            // 單個卡牌對象或null
      active_buffs: []             // Buff數組
    };
    
    this.pitcher = {
      current_hp: GAME_BALANCE.PITCHER_INITIAL_HP,
      max_hp: GAME_BALANCE.PITCHER_INITIAL_HP,
      base_attack: GAME_BALANCE.PITCHER_BASE_ATTACK || 30,
      current_attack: GAME_BALANCE.PITCHER_BASE_ATTACK || 30,
      attribute: 'heaven',
      active_debuffs: [],
      stage: 1,                    // 投手階段 (1 或 2)
      tempDebuff: null             // 臨時減益效果
    };
    
    this.gamePhase = 'DRAW_PHASE';   // 'DRAW_PHASE', 'PLAY_PHASE', 'COMBAT_PHASE', 'END_PHASE'
    this.turnCount = 1;
    this.turnBuffs = [];             // 當前回合的臨時Buff
    this.turnPlayedCards = [];       // 當前回合打出的卡牌
    this.battleNumber = 1;           // 當前戰鬥編號
    this.seasonProgress = {          // 賽季進度
      currentBattle: 1,
      totalBattles: 15,
      badges: [],                    // 獲得的徽章
      defeatedEnemies: []
    };
  }

  /**
   * 🔄 重置回合數據
   */
  resetTurnData() {
    this.turnBuffs = [];
    this.turnPlayedCards = [];
    
    // 清理卡牌臨時加成
    const allCards = [
      ...this.player.hand,
      ...this.player.discard_pile,
      this.player.strike_zone,
      this.player.support_zone,
      this.player.spell_zone
    ].filter(Boolean);
    
    allCards.forEach(card => {
      if (card.tempBonus) {
        delete card.tempBonus;
      }
    });
    
    // 清理投手臨時減益
    if (this.pitcher.tempDebuff) {
      delete this.pitcher.tempDebuff;
    }
  }

  /**
   * 📊 獲取遊戲統計
   */
  getGameStats() {
    return {
      turnCount: this.turnCount,
      cardsInDeck: this.player.deck.length,
      cardsInHand: this.player.hand.length,
      cardsInDiscard: this.player.discard_pile.length,
      playerHP: `${this.player.current_hp}/${this.player.max_hp}`,
      pitcherHP: `${this.pitcher.current_hp}/${this.pitcher.max_hp}`,
      pitcherStage: this.pitcher.stage,
      gamePhase: this.gamePhase,
      battleProgress: `${this.seasonProgress.currentBattle}/${this.seasonProgress.totalBattles}`
    };
  }
}

// ===== ⚡ EFFECT PROCESSOR (src/effects/EffectProcessor.js) =====

/**
 * ⚡ 效果處理器
 * 統一處理所有卡牌效果和關鍵字
 */
export class EffectProcessor {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.effectQueue = [];           // 效果執行佇列
    this.isProcessing = false;       // 防止遞歸執行
  }

  /**
   * 🎯 處理單個效果
   */
  async processEffect(effectFunction, sourceCard, gameState, ...args) {
    if (typeof effectFunction !== 'function') {
      console.warn('❌ 效果不是函數:', effectFunction);
      return { success: false, reason: '無效的效果函數' };
    }

    try {
      console.log(`⚡ 處理效果: ${sourceCard.name}`);
      
      // 執行效果函數
      const result = await effectFunction.call(sourceCard, gameState, ...args);
      
      // 發出效果執行事件
      this.eventBus.emit('effect_processed', {
        sourceCard,
        result,
        args
      });
      
      return result || { success: true, description: '效果執行完成' };
      
    } catch (error) {
      console.error(`❌ 效果執行失敗 [${sourceCard.name}]:`, error);
      return { 
        success: false, 
        reason: `效果執行錯誤: ${error.message}` 
      };
    }
  }

  /**
   * 🔄 處理效果佇列
   */
  async processEffectQueue(gameState) {
    if (this.isProcessing || this.effectQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 處理效果佇列 (${this.effectQueue.length} 個效果)`);

    while (this.effectQueue.length > 0) {
      const { effectFunction, sourceCard, args } = this.effectQueue.shift();
      await this.processEffect(effectFunction, sourceCard, gameState, ...args);
    }

    this.isProcessing = false;
  }

  /**
   * ➕ 添加效果到佇列
   */
  queueEffect(effectFunction, sourceCard, ...args) {
    this.effectQueue.push({
      effectFunction,
      sourceCard,
      args
    });
  }

  /**
   * 🎭 觸發特定時機的所有效果
   */
  async triggerEffects(trigger, gameState, sourceCard = null) {
    const effects = [];
    
    // 收集所有相關效果
    const allCards = [
      ...gameState.player.hand,
      ...gameState.player.discard_pile,
      gameState.player.strike_zone,
      gameState.player.support_zone,
      gameState.player.spell_zone
    ].filter(Boolean);

    allCards.forEach(card => {
      if (card.effects && card.effects[trigger]) {
        effects.push({
          effectFunction: card.effects[trigger],
          sourceCard: card
        });
      }
    });

    // 執行所有效果
    const results = [];
    for (const { effectFunction, sourceCard } of effects) {
      const result = await this.processEffect(effectFunction, sourceCard, gameState);
      results.push({ sourceCard, result });
    }

    return results;
  }

  /**
   * 🧹 清理效果佇列
   */
  clearQueue() {
    this.effectQueue = [];
    this.isProcessing = false;
  }
}