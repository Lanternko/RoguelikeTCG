// ===== ⚔️ COMBAT SYSTEM (src/systems/CombatSystem.js) =====

import { GAME_BALANCE } from '../data/balance/GameBalance.js';

/**
 * ⚔️ 戰鬥系統
 * 處理所有戰鬥相關邏輯：傷害計算、屬性克制、投手機制等
 */
export class CombatSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  /**
   * 💥 計算傷害 - 按照技術規格書 4.1 實現
   */
  calculateDamage(gameState) {
    console.log('⚔️ 開始傷害計算...');
    
    // Step 1: 初始化基礎值
    let totalAttack = 0;
    let totalCrit = 0;
    
    const strikeCard = gameState.player.strike_zone;
    const supportCard = gameState.player.support_zone;
    
    // 累加基礎攻擊力和暴擊值
    if (strikeCard) {
      totalAttack += strikeCard.stats.attack;
      totalCrit += strikeCard.stats.crit;
      console.log(`🗡️ 打擊卡: ${strikeCard.name} (攻擊:${strikeCard.stats.attack}, 暴擊:${strikeCard.stats.crit})`);
    }
    
    if (supportCard) {
      totalAttack += supportCard.stats.attack;
      totalCrit += supportCard.stats.crit;
      console.log(`🛡️ 輔助卡: ${supportCard.name} (攻擊:${supportCard.stats.attack}, 暴擊:${supportCard.stats.crit})`);
    }

    // Step 2: 應用卡牌效果與Buff
    const modifiedStats = this.applyEffectsAndBuffs(
      gameState, totalAttack, totalCrit, strikeCard, supportCard
    );
    totalAttack = modifiedStats.attack;
    totalCrit = modifiedStats.crit;

    // Step 3: 計算最終傷害
    let finalDamage = totalAttack * (1 + totalCrit / 100);
    console.log(`📐 基礎傷害計算: ${totalAttack} × (1 + ${totalCrit}/100) = ${finalDamage}`);

    // Step 4: 應用屬性克制
    const playerMainAttr = this.getPlayerMainAttribute(gameState);
    const pitcherAttr = gameState.pitcher.attribute;
    const attributeMultiplier = this.isStrongAgainst(playerMainAttr, pitcherAttr) ? 1.2 : 1.0;
    
    if (attributeMultiplier > 1.0) {
      finalDamage *= attributeMultiplier;
      console.log(`🌟 屬性克制: ${playerMainAttr} 克制 ${pitcherAttr}, 傷害 ×${attributeMultiplier}`);
    }

    // Step 5: 四捨五入取整
    finalDamage = Math.round(finalDamage);
    
    console.log(`🎯 最終傷害: ${finalDamage}`);

    return {
      finalDamage,
      breakdown: {
        baseAttack: totalAttack,
        baseCrit: totalCrit,
        attributeMultiplier,
        playerAttribute: playerMainAttr,
        pitcherAttribute: pitcherAttr
      }
    };
  }

  /**
   * ✨ 應用卡牌效果與Buff - Step 2 的詳細實現
   */
  applyEffectsAndBuffs(gameState, baseAttack, baseCrit, strikeCard, supportCard) {
    let totalAttack = baseAttack;
    let totalCrit = baseCrit;

    // 應用打擊區卡牌的臨時加成
    if (strikeCard?.tempBonus) {
      if (strikeCard.tempBonus.attack) {
        totalAttack += strikeCard.tempBonus.attack;
        console.log(`✨ ${strikeCard.name} 臨時攻擊力: +${strikeCard.tempBonus.attack}`);
      }
      if (strikeCard.tempBonus.crit) {
        totalCrit += strikeCard.tempBonus.crit;
        console.log(`✨ ${strikeCard.name} 臨時暴擊: +${strikeCard.tempBonus.crit}`);
      }
    }

    // 應用輔助區卡牌的臨時加成
    if (supportCard?.tempBonus) {
      if (supportCard.tempBonus.attack) {
        totalAttack += supportCard.tempBonus.attack;
        console.log(`✨ ${supportCard.name} 臨時攻擊力: +${supportCard.tempBonus.attack}`);
      }
      if (supportCard.tempBonus.crit) {
        totalCrit += supportCard.tempBonus.crit;
        console.log(`✨ ${supportCard.name} 臨時暴擊: +${supportCard.tempBonus.crit}`);
      }
    }

    // 應用全局Buff
    gameState.player.active_buffs?.forEach(buff => {
      if (buff.type === 'ATTACK_UP') {
        totalAttack += buff.value;
        console.log(`🔥 全局Buff: 攻擊力 +${buff.value}`);
      }
      if (buff.type === 'CRIT_UP') {
        totalCrit += buff.value;
        console.log(`⚡ 全局Buff: 暴擊 +${buff.value}`);
      }
    });

    // 應用回合Buff
    gameState.turnBuffs?.forEach(buff => {
      if (buff.type === 'human_batter_attack_boost' && strikeCard?.attribute === 'human') {
        totalAttack += buff.value;
        console.log(`💝 ${buff.source}: 人屬打者攻擊力 +${buff.value}`);
      }
    });

    return { attack: totalAttack, crit: totalCrit };
  }

  /**
   * 🌟 屬性克制判定
   */
  isStrongAgainst(playerAttr, enemyAttr) {
    const advantages = {
      'human': ['yin'],
      'yin': ['yang'], 
      'yang': ['heaven'],
      'heaven': ['earth'],
      'earth': ['human']
    };
    
    return advantages[playerAttr]?.includes(enemyAttr) || false;
  }

  /**
   * 🎭 獲取玩家主屬性
   */
  getPlayerMainAttribute(gameState) {
    // 優先從打擊區卡牌獲取屬性
    if (gameState.player.strike_zone) {
      return gameState.player.strike_zone.attribute;
    }
    
    // 其次從輔助區卡牌獲取
    if (gameState.player.support_zone) {
      return gameState.player.support_zone.attribute;
    }
    
    // 默認為人屬性
    return 'human';
  }

  /**
   * 🏹 計算投手攻擊傷害
   */
  calculatePitcherDamage(gameState) {
    let pitcherDamage = gameState.pitcher.current_attack;
    
    // 應用投手的臨時減益
    if (gameState.pitcher.tempDebuff?.attack) {
      pitcherDamage += gameState.pitcher.tempDebuff.attack; // 注意這裡是加法，因為debuff是負數
      console.log(`🔻 投手攻擊力減益: ${gameState.pitcher.tempDebuff.attack}`);
    }

    // 應用屬性克制（玩家被克制時受到更少傷害）
    const playerAttr = this.getPlayerMainAttribute(gameState);
    const pitcherAttr = gameState.pitcher.attribute;
    
    if (this.isStrongAgainst(pitcherAttr, playerAttr)) {
      pitcherDamage *= 0.8; // 玩家被克制時減少20%傷害
      console.log(`🛡️ 玩家被克制，傷害減少20%: ${pitcherDamage}`);
    }

    return Math.round(pitcherDamage);
  }

  /**
   * ⚔️ 執行完整戰鬥流程
   */
  async executeCombat(gameState) {
    console.log('🎮 開始戰鬥階段...');
    
    // 檢查是否有可攻擊的卡牌
    if (!gameState.player.strike_zone) {
      return { success: false, reason: '打擊區沒有卡牌' };
    }

    // 觸發打擊區卡牌的 on_strike 效果
    const strikeCard = gameState.player.strike_zone;
    if (strikeCard.effects?.on_strike) {
      console.log(`🎯 觸發 ${strikeCard.name} 的打擊效果`);
      try {
        const effectResult = await strikeCard.effects.on_strike.call(strikeCard, gameState);
        if (effectResult.success) {
          console.log(`✅ 打擊效果: ${effectResult.description}`);
        }
      } catch (error) {
        console.error(`❌ 打擊效果執行失敗:`, error);
      }
    }

    // 觸發輔助區卡牌的 on_support 效果
    const supportCard = gameState.player.support_zone;
    if (supportCard?.effects?.on_support) {
      console.log(`🛡️ 觸發 ${supportCard.name} 的輔助效果`);
      try {
        const supportResult = await supportCard.effects.on_support.call(supportCard, gameState);
        if (supportResult.success) {
          console.log(`✅ 輔助效果: ${supportResult.description}`);
        }
      } catch (error) {
        console.error(`❌ 輔助效果執行失敗:`, error);
      }
    }

    // 計算傷害
    const damageResult = this.calculateDamage(gameState);
    
    // 對投手造成傷害
    gameState.pitcher.current_hp -= damageResult.finalDamage;
    gameState.pitcher.current_hp = Math.max(0, gameState.pitcher.current_hp);
    
    // 檢查投手階段轉換
    this.checkPitcherStageTransition(gameState);
    
    // 發出傷害事件
    this.eventBus.emit('damage_dealt', {
      damage: damageResult.finalDamage,
      breakdown: damageResult.breakdown,
      pitcherHP: gameState.pitcher.current_hp,
      pitcherMaxHP: gameState.pitcher.max_hp
    });

    console.log(`🎯 戰鬥結果: 對投手造成${damageResult.finalDamage}傷害`);

    return {
      success: true,
      playerDamageDealt: damageResult.finalDamage,
      damageBreakdown: damageResult.breakdown
    };
  }

  /**
   * 🔥 檢查投手階段轉換
   */
  checkPitcherStageTransition(gameState) {
    if (gameState.pitcher.stage === 1 && 
        gameState.pitcher.current_hp <= gameState.pitcher.max_hp * 0.5) {
      
      console.log('🔥 投手進入第二階段！');
      gameState.pitcher.stage = 2;
      gameState.pitcher.max_hp = GAME_BALANCE.PITCHER_STAGE2_HP || 200;
      gameState.pitcher.current_hp = Math.min(
        gameState.pitcher.current_hp + 50, 
        gameState.pitcher.max_hp
      );
      gameState.pitcher.current_attack = GAME_BALANCE.PITCHER_STAGE2_ATTACK || 45;
      gameState.pitcher.base_attack = GAME_BALANCE.PITCHER_STAGE2_ATTACK || 45;
      
      this.eventBus.emit('pitcher_stage_transition', {
        stage: 2,
        newHP: gameState.pitcher.current_hp,
        newMaxHP: gameState.pitcher.max_hp,
        newAttack: gameState.pitcher.current_attack
      });
    }
  }

  /**
   * 😴 投手疲勞機制 - 按照技術規格書 4.2 實現
   */
  applyPitcherFatigue(gameState) {
    const fatigueRate = GAME_BALANCE.PITCHER_BASE_FATIGUE_RATE || 0.05;
    
    gameState.pitcher.current_attack *= (1 - fatigueRate);
    gameState.pitcher.current_attack = Math.round(gameState.pitcher.current_attack);
    
    console.log(`😴 投手疲勞: 攻擊力降至 ${gameState.pitcher.current_attack} (疲勞率: ${fatigueRate * 100}%)`);
    
    this.eventBus.emit('pitcher_fatigue', {
      newAttack: gameState.pitcher.current_attack,
      fatigueRate: fatigueRate
    });
  }
}

// ===== 🔄 TURN SYSTEM (src/systems/TurnSystem.js) =====

import { CardRegistry } from '../cards/CardRegistry.js';

/**
 * 🔄 回合系統
 * 管理遊戲回合流程和階段轉換
 */
export class TurnSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  /**
   * 🌅 回合開始階段
   */
  async startOfTurn(gameState) {
    console.log(`🌅 回合 ${gameState.turnCount} 開始階段...`);
    
    // 處理Buff/Debuff持續時間
    this.updateBuffDurations(gameState.player.active_buffs);
    this.updateBuffDurations(gameState.pitcher.active_debuffs);
    
    // 觸發回合開始效果
    await this.triggerTurnStartEffects(gameState);
    
    this.eventBus.emit('start_of_turn', { 
      turnCount: gameState.turnCount,
      gameState 
    });
  }

  /**
   * 🎴 抽牌階段
   */
  async drawPhase(gameState) {
    console.log('🎴 抽牌階段...');
    
    const handLimit = GAME_BALANCE.HAND_SIZE_LIMIT || 7;
    const drawCount = handLimit - gameState.player.hand.length;
    
    console.log(`📏 手牌上限: ${handLimit}, 當前手牌: ${gameState.player.hand.length}, 需抽牌: ${drawCount}`);
    
    for (let i = 0; i < drawCount; i++) {
      const success = await this.drawCard(gameState);
      if (!success) {
        console.log('📪 無法抽更多卡牌');
        break;
      }
    }
    
    this.eventBus.emit('draw_phase_complete', { 
      cardsDrawn: drawCount,
      gameState 
    });
  }

  /**
   * 🎴 抽一張卡
   */
  async drawCard(gameState) {
    // 如果牌庫為空，將棄牌堆洗牌放回牌庫
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
    
    // 從牌庫頂部抽一張卡
    const card = gameState.player.deck.pop();
    if (card) {
      gameState.player.hand.push(card);
      console.log(`🎴 抽到: ${card.name}`);
      
      this.eventBus.emit('card_drawn', { card });
      return true;
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
    
    gameState.gamePhase = 'END_PHASE';
    
    // 將場上卡牌移入棄牌堆
    this.moveCardsToDiscard(gameState);
    
    // 觸發死聲效果
    await this.triggerDeathrattleEffects(gameState);
    
    // 觸發回合結束效果
    await this.triggerTurnEndEffects(gameState);
    
    // 投手疲勞
    combatSystem.applyPitcherFatigue(gameState);
    
    // 檢查勝負
    const gameEnd = this.checkGameEnd(gameState);
    
    // 清理臨時效果
    gameState.resetTurnData();
    
    this.eventBus.emit('turn_end', { gameState, gameEnd });
    
    return gameEnd;
  }

  /**
   * 🃏 將場上卡牌移入棄牌堆
   */
  moveCardsToDiscard(gameState) {
    const zones = ['strike_zone', 'support_zone', 'spell_zone'];
    
    zones.forEach(zone => {
      if (gameState.player[zone]) {
        const card = gameState.player[zone];
        gameState.player.discard_pile.push(card);
        gameState.player[zone] = null;
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
        try {
          const result = await card.effects.on_deathrattle.call(card, gameState);
          if (result.success) {
            console.log(`✅ 死聲效果: ${result.description}`);
          }
        } catch (error) {
          console.error(`❌ 死聲效果執行失敗:`, error);
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
    console.log(`🔀 牌庫洗牌完成 (${deck.length} 張卡)`);
  }

  /**
   * 觸發回合開始和結束效果的占位符
   */
  async triggerTurnStartEffects(gameState) {
    // TODO: 實現回合開始效果
    console.log('🌅 處理回合開始效果...');
  }

  async triggerTurnEndEffects(gameState) {
    // TODO: 實現回合結束效果
    console.log('🌙 處理回合結束效果...');
  }
}