// systems/CombatSystem.js - 完全按照技術規格書實現
import { GAME_BALANCE } from '../data/balance/GameBalance.js';
import { EventBus } from '../core/EventBus.js';

export class CombatSystem {
  constructor(eventBus) {
    this.eventBus = eventBus || new EventBus();
  }

  /**
   * 🎯 傷害計算公式 - 完全按照技術規格書 4.1 實現
   * 在玩家點擊「攻擊」按鈕後觸發
   */
  calculateDamage(gameState) {
    console.log('⚔️ 開始傷害計算...');
    
    // Step 1: 初始化基礎值
    let totalAttack = 0;
    let totalCrit = 0;
    
    const strikeCard = gameState.player.strike_zone[0];
    const supportCard = gameState.player.support_zone[0];
    
    if (strikeCard) {
      totalAttack += strikeCard.stats.attack;
      totalCrit += strikeCard.stats.crit;
      console.log(`🗡️ 打擊區: ${strikeCard.name} - 攻擊:${strikeCard.stats.attack} 暴擊:${strikeCard.stats.crit}`);
    }
    
    if (supportCard) {
      // 輔助卡的攻擊力和暴擊值也完全計入
      totalAttack += supportCard.stats.attack;
      totalCrit += supportCard.stats.crit;
      console.log(`🛡️ 輔助區: ${supportCard.name} - 攻擊:${supportCard.stats.attack} 暴擊:${supportCard.stats.crit}`);
    }
    
    console.log(`📊 基礎數值 - 總攻擊:${totalAttack} 總暴擊:${totalCrit}`);

    // Step 2: 應用卡牌效果與Buff
    const modifiedStats = this.applyEffectsAndBuffs(gameState, totalAttack, totalCrit, strikeCard, supportCard);
    totalAttack = modifiedStats.attack;
    totalCrit = modifiedStats.crit;
    
    console.log(`💪 效果後數值 - 總攻擊:${totalAttack} 總暴擊:${totalCrit}`);

    // Step 3: 計算最終傷害 - 應用核心公式
    let finalDamage = totalAttack * (1 + totalCrit / 100);
    console.log(`🧮 核心公式: ${totalAttack} * (1 + ${totalCrit}/100) = ${finalDamage}`);

    // Step 4: 應用屬性克制
    const playerMainAttr = this.getPlayerMainAttribute(gameState);
    const pitcherAttr = gameState.pitcher.attribute;
    
    if (this.isStrongAgainst(playerMainAttr, pitcherAttr)) {
      finalDamage *= 1.2;
      console.log(`⚡ 屬性克制: ${playerMainAttr} 克制 ${pitcherAttr}, 傷害 x1.2 = ${finalDamage}`);
    }

    // Step 5: 四捨五入取整
    finalDamage = Math.round(finalDamage);
    console.log(`🎯 最終傷害: ${finalDamage}`);

    return {
      finalDamage,
      breakdown: {
        baseAttack: totalAttack,
        baseCrit: totalCrit,
        critMultiplier: (1 + totalCrit / 100),
        attributeBonus: this.isStrongAgainst(playerMainAttr, pitcherAttr) ? 1.2 : 1.0,
        playerAttribute: playerMainAttr,
        pitcherAttribute: pitcherAttr
      }
    };
  }

  /**
   * 🎭 應用卡牌效果與Buff - Step 2 的詳細實現
   */
  applyEffectsAndBuffs(gameState, baseAttack, baseCrit, strikeCard, supportCard) {
    let totalAttack = baseAttack;
    let totalCrit = baseCrit;

    // 應用打擊區卡牌的臨時加成
    if (strikeCard && strikeCard.tempBonus) {
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
    if (supportCard && supportCard.tempBonus) {
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

    // 應用回合Buff (如慈愛效果)
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
   * 🎯 獲取玩家主屬性
   */
  getPlayerMainAttribute(gameState) {
    // 優先從打擊區卡牌獲取屬性
    if (gameState.player.strike_zone[0]) {
      return gameState.player.strike_zone[0].attribute;
    }
    
    // 其次從輔助區卡牌獲取
    if (gameState.player.support_zone[0]) {
      return gameState.player.support_zone[0].attribute;
    }
    
    // 默認為人屬性
    return 'human';
  }

  /**
   * ⚔️ 執行完整戰鬥流程
   */
  async executeCombat(gameState) {
    console.log('🎮 開始戰鬥階段...');
    
    // 檢查是否有可攻擊的卡牌
    if (!gameState.player.strike_zone[0]) {
      return { success: false, reason: '打擊區沒有卡牌' };
    }

    // 觸發打擊區卡牌的 on_strike 效果
    const strikeCard = gameState.player.strike_zone[0];
    if (strikeCard.effects?.on_strike) {
      console.log(`🎯 觸發 ${strikeCard.name} 的打擊效果`);
      const effectResult = await strikeCard.effects.on_strike.call(strikeCard, gameState);
      if (effectResult.success) {
        console.log(`✅ 打擊效果: ${effectResult.description}`);
      }
    }

    // 觸發輔助區卡牌的 on_support 效果
    const supportCard = gameState.player.support_zone[0];
    if (supportCard?.effects?.on_support) {
      console.log(`🛡️ 觸發 ${supportCard.name} 的輔助效果`);
      const supportResult = await supportCard.effects.on_support.call(supportCard, gameState);
      if (supportResult.success) {
        console.log(`✅ 輔助效果: ${supportResult.description}`);
      }
    }

    // 計算傷害
    const damageResult = this.calculateDamage(gameState);
    
    // 對投手造成傷害
    gameState.pitcher.current_hp -= damageResult.finalDamage;
    gameState.pitcher.current_hp = Math.max(0, gameState.pitcher.current_hp);
    
    // 發出事件
    this.eventBus.emit('damage_dealt', {
      damage: damageResult.finalDamage,
      breakdown: damageResult.breakdown,
      pitcherHP: gameState.pitcher.current_hp,
      pitcherMaxHP: gameState.pitcher.max_hp
    });

    // 玩家受到投手攻擊
    const pitcherDamage = this.calculatePitcherDamage(gameState);
    gameState.player.current_hp -= pitcherDamage;
    gameState.player.current_hp = Math.max(0, gameState.player.current_hp);

    console.log(`🎯 戰鬥結果: 對投手造成${damageResult.finalDamage}傷害, 受到${pitcherDamage}傷害`);

    return {
      success: true,
      playerDamageDealt: damageResult.finalDamage,
      playerDamageReceived: pitcherDamage,
      damageBreakdown: damageResult.breakdown
    };
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