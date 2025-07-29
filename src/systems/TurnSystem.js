// systems/TurnSystem.js - 按照技術規格書第5章實現
export class TurnSystem {
  constructor(eventBus) {
    this.eventBus = eventBus || new EventBus();
  }

  /**
   * 🎯 完整回合流程 - 嚴格按順序執行
   */
  async processTurn(gameState) {
    console.log(`🔄 開始新回合...`);
    
    try {
      // 1. 回合開始
      await this.startOfTurn(gameState);
      
      // 2. 抽牌階段
      await this.drawPhase(gameState);
      
      // 3. 出牌階段 - 等待玩家操作
      gameState.gamePhase = 'PLAY_PHASE';
      this.eventBus.emit('turn_phase_changed', { phase: 'PLAY_PHASE' });
      
      // 注意：戰鬥階段和回合結束由玩家操作觸發
      
    } catch (error) {
      console.error('❌ 回合處理失敗:', error);
      this.eventBus.emit('turn_error', { error: error.message });
    }
  }

  /**
   * 🌅 回合開始階段
   */
  async startOfTurn(gameState) {
    console.log('🌅 回合開始階段...');
    
    // 處理Buff/Debuff的持續時間
    this.updateBuffDurations(gameState.player.active_buffs);
    this.updateBuffDurations(gameState.pitcher.active_debuffs);
    
    // 觸發所有 on_turn_start 效果
    await this.triggerTurnStartEffects(gameState);
    
    this.eventBus.emit('turn_start', { gameState });
  }

  /**
   * 🎴 抽牌階段
   */
  async drawPhase(gameState) {
    console.log('🎴 抽牌階段...');
    
    const handSizeLimit = GAME_BALANCE.HAND_SIZE_LIMIT;
    const drawCount = handSizeLimit - gameState.player.hand.length;
    
    console.log(`📋 當前手牌: ${gameState.player.hand.length}, 需抽牌: ${drawCount}`);
    
    for (let i = 0; i < drawCount; i++) {
      if (!this.drawSingleCard(gameState)) {
        console.log('⚠️ 無法繼續抽牌');
        break;
      }
    }
    
    this.eventBus.emit('draw_phase_complete', { 
      drawnCards: drawCount,
      handSize: gameState.player.hand.length 
    });
  }

  /**
   * 🎴 抽一張牌
   */
  drawSingleCard(gameState) {
    // 如果牌庫為空，重新洗牌
    if (gameState.player.deck.length === 0) {
      if (gameState.player.discard_pile.length === 0) {
        console.log('📚 牌庫和棄牌堆都是空的，無法抽牌');
        return false;
      }
      
      console.log('🔀 牌庫為空，重新洗牌...');
      gameState.player.deck = [...gameState.player.discard_pile];
      gameState.player.discard_pile = [];
      this.shuffleDeck(gameState.player.deck);
      
      this.eventBus.emit('deck_shuffled', { deckSize: gameState.player.deck.length });
    }
    
    if (gameState.player.deck.length > 0) {
      const cardId = gameState.player.deck.pop();
      // 這裡需要根據ID獲取完整卡牌數據
      const fullCard = this.getCardById(cardId, gameState);
      if (fullCard) {
        gameState.player.hand.push(fullCard);
        console.log(`🎴 抽到: ${fullCard.name}`);
        
        this.eventBus.emit('card_drawn', { card: fullCard });
        return true;
      }
    }
    
    return false;
  }

  /**
   * ⚔️ 戰鬥階段 - 由外部觸發
   */
  async combatPhase(gameState, combatSystem) {
    console.log('⚔️ 戰鬥階段...');
    gameState.gamePhase = 'COMBAT_PHASE';
    
    const combatResult = await combatSystem.executeCombat(gameState);
    
    this.eventBus.emit('combat_complete', { result: combatResult });
    
    return combatResult;
  }

  /**
   * 🌙 回合結束階段
   */
  async endOfTurn(gameState, combatSystem) {
    console.log('🌙 回合結束階段...');
    
    // 將場上卡牌移入棄牌堆
    this.moveCardsToDiscard(gameState);
    
    // 觸發死聲效果
    await this.triggerDeathrattleEffects(gameState);
    
    // 觸發回合結束效果
    await this.triggerTurnEndEffects(gameState);
    
    // 投手疲勞
    combatSystem.applyPitcherFatigue(gameState);
    
    // 檢查勝負
    const gameOver = this.checkGameEnd(gameState);
    
    // 清理臨時效果
    this.cleanupTurnBuffs(gameState);
    
    this.eventBus.emit('turn_end', { gameState, gameOver });
    
    return gameOver;
  }

  /**
   * 🃏 將場上卡牌移入棄牌堆
   */
  moveCardsToDiscard(gameState) {
    const zones = ['strike_zone', 'support_zone', 'spell_zone'];
    
    zones.forEach(zone => {
      if (gameState.player[zone][0]) {
        const card = gameState.player[zone][0];
        gameState.player.discard_pile.push(card);
        gameState.player[zone] = [];
        console.log(`🗂️ ${card.name} 移入棄牌堆`);
      }
    });
  }

  /**
   * 💀 觸發死聲效果
   */
  async triggerDeathrattleEffects(gameState) {
    // 處理剛剛移入棄牌堆的卡牌的死聲效果
    const recentlyDiscarded = gameState.player.discard_pile.slice(-3); // 最近3張卡
    
    for (const card of recentlyDiscarded) {
      if (card.effects?.on_deathrattle) {
        console.log(`💀 觸發 ${card.name} 的死聲效果`);
        const result = await card.effects.on_deathrattle.call(card, gameState);
        if (result.success) {
          console.log(`✅ 死聲效果: ${result.description}`);
        }
      }
    }
  }

  /**
   * ⏰ 更新Buff持續時間
   */
  updateBuffDurations(buffs) {
    if (!Array.isArray(buffs)) return;
    
    for (let i = buffs.length - 1; i >= 0; i--) {
      const buff = buffs[i];
      if (buff.duration > 0) {
        buff.duration--;
        if (buff.duration === 0) {
          console.log(`⏰ Buff過期: ${buff.type}`);
          buffs.splice(i, 1);
        }
      }
      // duration為-1代表永久效果，不處理
    }
  }

  /**
   * 🧹 清理回合Buff
   */
  cleanupTurnBuffs(gameState) {
    gameState.turnBuffs = [];
    
    // 清理卡牌的臨時加成
    [...gameState.player.hand, ...gameState.player.discard_pile].forEach(card => {
      if (card.tempBonus) {
        delete card.tempBonus;
      }
    });
    
    // 清理投手的臨時減益
    if (gameState.pitcher.tempDebuff) {
      delete gameState.pitcher.tempDebuff;
    }
  }

  /**
   * 🏆 檢查勝負
   */
  checkGameEnd(gameState) {
    if (gameState.player.current_hp <= 0) {
      return { gameOver: true, winner: 'pitcher', reason: '玩家血量歸零' };
    }
    
    if (gameState.pitcher.current_hp <= 0) {
      return { gameOver: true, winner: 'player', reason: '投手血量歸零' };
    }
    
    return { gameOver: false };
  }

  /**
   * 🔀 洗牌
   */
  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * 🆔 根據ID獲取卡牌
   */
  getCardById(cardId, gameState) {
    // 這裡需要從CardRegistry獲取卡牌
    // 暫時返回一個模擬卡牌
    return {
      id: cardId,
      name: '模擬卡牌',
      type: 'batter',
      attribute: 'human',
      stats: { attack: 10, crit: 50 }
    };
  }

  /**
   * 觸發回合開始和結束效果的占位符
   */
  async triggerTurnStartEffects(gameState) {
    // TODO: 實現回合開始效果
  }

  async triggerTurnEndEffects(gameState) {
    // TODO: 實現回合結束效果
  }
}
