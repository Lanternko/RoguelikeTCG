// src/core/GameController.js - 修復攻擊力計算系統

import { EventBus } from './EventBus.js';
import { CardRegistry } from '../cards/CardRegistry.js';

/**
 * 🎮 遊戲控制器 - 修復版
 * 正確處理攻擊力加成和暴擊計算
 */
export class GameController {
  constructor() {
    console.log('🎮 初始化遊戲控制器...');
    
    this.eventBus = new EventBus();
    this.uiManager = null;
    this.gameState = null;
    this.isGameRunning = false;
    
    // 記錄已觸發效果的卡牌，防止撤回後重複觸發
    this.triggeredEffects = new Set();
    
    this.initializeDefaultGameState();
  }

  /**
   * 🔗 設置UI管理器
   */
  setUIManager(uiManager) {
    this.uiManager = uiManager;
    console.log('🔗 UI管理器已連接到遊戲控制器');
  }

  /**
   * 🎯 初始化默認遊戲狀態
   */
  initializeDefaultGameState() {
    this.gameState = {
      player: {
        current_hp: 100,
        max_hp: 100,
        deck: [],
        hand: [],
        discard_pile: [],
        strike_zone: null,
        support_zone: null,
        spell_zone: null
      },
      pitcher: {
        current_hp: 150,
        max_hp: 150,
        current_attack: 30,
        base_attack: 30,
        attribute: 'heaven',
        skipNextTurn: false
      },
      gamePhase: 'PLAY_PHASE',
      turnCount: 1,
      turnBuffs: []  // 確保turnBuffs初始化
    };
  }

  /**
   * 🎴 添加卡牌到手牌 (調試用)
   */
  addCardToHand(cardId) {
    try {
      const card = CardRegistry.create(cardId);
      if (card && this.gameState?.player?.hand) {
        // 添加唯一實例ID
        card.cardInstanceId = Date.now() + Math.random();
        card.tempAttack = 0;
        card.permanentBonus = 0;
        
        this.gameState.player.hand.push(card);
        this.updateUI();
        
        if (this.uiManager) {
          this.uiManager.addLogEntry(`🎴 添加了 ${card.name}`, 'success');
        }
        
        return true;
      }
    } catch (error) {
      console.error(`❌ 無法添加卡牌 ${cardId}:`, error);
      return false;
    }
  }

  /**
   * 💚 治療玩家 (調試用)
   */
  healPlayer(amount = 20) {
    if (!this.gameState?.player) return;
    
    const oldHP = this.gameState.player.current_hp;
    this.gameState.player.current_hp = Math.min(
      this.gameState.player.max_hp,
      this.gameState.player.current_hp + amount
    );
    
    const actualHeal = this.gameState.player.current_hp - oldHP;
    this.updateUI();
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`💚 回復 ${actualHeal} 血量`, 'success');
    }
  }

  /**
   * 💥 傷害投手 (調試用)
   */
  damagePitcher(amount = 30) {
    if (!this.gameState?.pitcher) return;
    
    const oldHP = this.gameState.pitcher.current_hp;
    this.gameState.pitcher.current_hp = Math.max(0, this.gameState.pitcher.current_hp - amount);
    
    const actualDamage = oldHP - this.gameState.pitcher.current_hp;
    this.updateUI();
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`💥 對投手造成 ${actualDamage} 傷害`, 'damage');
    }
  }

  /**
   * ↩️ 撤銷最後一次動作
   */
  undoLastAction() {
    if (!this.gameState?.player) return;
    
    let undone = false;
    const zones = ['spell_zone', 'support_zone', 'strike_zone'];
    
    for (const zone of zones) {
      const card = this.gameState.player[zone];
      if (card) {
        // 檢查是否為抽牌類效果，若已觸發則不可撤回
        if (card.effectType === 'draw' && this.triggeredEffects.has(card.cardInstanceId)) {
          if (this.uiManager) {
            this.uiManager.addLogEntry(`❌ ${card.name} 已發動抽牌效果，無法撤回`, 'system');
          }
          continue;
        }
        
        this.removeCardFromZone(zone);
        undone = true;
        break;
      }
    }
    
    if (!undone && this.uiManager) {
      this.uiManager.addLogEntry('❌ 沒有可撤銷的動作', 'system');
    }
  }

  /**
   * 🗑️ 從指定區域移除卡牌
   */
  removeCardFromZone(zone) {
    if (!this.gameState?.player?.[zone]) return;

    const card = this.gameState.player[zone];
    
    // 檢查抽牌效果
    if (card.effectType === 'draw' && this.triggeredEffects.has(card.cardInstanceId)) {
      if (this.uiManager) {
        this.uiManager.addLogEntry(`❌ ${card.name} 已發動抽牌效果，無法撤回`, 'system');
      }
      return;
    }

    // 將卡牌放回手牌
    this.gameState.player.hand.push(card);
    this.gameState.player[zone] = null;
    
    // 清除臨時效果和turnBuffs
    if (card.tempAttack) {
      card.tempAttack = 0;
    }
    
    // 清除該卡牌產生的turnBuffs
    this.gameState.turnBuffs = this.gameState.turnBuffs.filter(buff => 
      buff.source !== card.name
    );
    
    // 從已觸發效果列表中移除
    this.triggeredEffects.delete(card.cardInstanceId);

    if (this.uiManager) {
      this.uiManager.addLogEntry(`↩️ 撤回 ${card.name}`, 'success');
    }
    
    this.updateUI();
  }

  /**
   * 🌙 結束回合
   */
  endTurn() {
    if (!this.gameState) return;
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`---------- 回合 ${this.gameState.turnCount} 結束 ----------`, 'system');
    }

    // 執行自動攻擊
    this.executeAutoAttack();

    // 檢查戰鬥結果
    if (this.checkBattleEnd()) {
      return;
    }

    // 投手反擊
    setTimeout(() => {
      this.pitcherAttack();
      
      if (this.checkBattleEnd()) {
        return;
      }

      setTimeout(() => {
        this.endTurnCleanup();
        this.gameState.turnCount++;
        this.startNewTurn();
      }, 1000);
    }, 500);
  }

  /**
   * ⚔️ 執行自動攻擊 - 正確的暴擊系統
   */
  executeAutoAttack() {
    const strikeCard = this.gameState?.player?.strike_zone;
    if (!strikeCard) {
      if (this.uiManager) {
        this.uiManager.addLogEntry('❌ 沒有打擊卡牌！', 'system');
      }
      return;
    }

    // 🎯 第一步：計算總攻擊力（只有攻擊力，不包含暴擊）
    let totalAttack = 0;
    let critDamageBonus = 0; // 暴擊增傷（只來自輔助卡）

    // 打擊卡：只提供攻擊力
    const strikeAttack = strikeCard.stats?.attack || 0;
    totalAttack += strikeAttack;
    
    // 輔助卡：提供攻擊力 + 暴擊增傷
    const supportCard = this.gameState.player.support_zone;
    if (supportCard) {
      const supportAttack = supportCard.stats?.attack || 0;
      const supportCritDamage = supportCard.stats?.crit || 0;
      totalAttack += supportAttack;
      critDamageBonus += supportCritDamage; // 只有輔助卡提供暴擊增傷
      console.log(`🛡️ 輔助卡 ${supportCard.name}: +${supportAttack}攻擊, +${supportCritDamage}%暴擊增傷`);
    }

    console.log(`📊 基礎數值: 攻擊力 ${totalAttack}, 暴擊增傷 ${critDamageBonus}%`);

    // 🎯 第二步：應用卡牌臨時攻擊力加成
    if (strikeCard.tempAttack) {
      totalAttack += strikeCard.tempAttack;
      console.log(`✨ ${strikeCard.name} 臨時攻擊力: +${strikeCard.tempAttack}`);
    }

    // 🎯 第三步：應用turnBuffs（只影響攻擊力）
    let buffBonus = 0;
    if (this.gameState.turnBuffs && this.gameState.turnBuffs.length > 0) {
      console.log(`🔥 檢查 ${this.gameState.turnBuffs.length} 個回合Buff:`);
      
      this.gameState.turnBuffs.forEach(buff => {
        console.log(`  - ${buff.type}: ${buff.value} (來源: ${buff.source})`);
        
        if (buff.type === 'human_batter_attack_boost') {
          if (strikeCard.attribute === 'human' && strikeCard.type === 'batter') {
            buffBonus += buff.value;
            console.log(`    ✅ 應用到 ${strikeCard.name}: 攻擊力 +${buff.value}`);
          }
        }
      });
    }
    
    totalAttack += buffBonus;

    // 🎯 第四步：暴擊判定和最終傷害計算
    const baseCritRate = 20; // 固定20%暴擊率
    const isCritical = Math.random() * 100 < baseCritRate;
    
    let finalDamage;
    if (isCritical) {
      // 暴擊：應用暴擊增傷
      const critMultiplier = 1 + (critDamageBonus / 100);
      finalDamage = Math.round(totalAttack * critMultiplier);
    } else {
      // 普通攻擊：無暴擊增傷
      finalDamage = totalAttack;
    }

    // 對投手造成傷害
    this.gameState.pitcher.current_hp = Math.max(0, this.gameState.pitcher.current_hp - finalDamage);

    // 📊 詳細戰鬥報告
    const battleReport = [
      `⚔️ 戰鬥詳情:`,
      `  打擊卡: ${strikeCard.name} (${strikeAttack}攻擊, ${strikeCard.stats?.crit || 0}%暴擊增傷-無效)`,
      supportCard ? 
        `  輔助卡: ${supportCard.name} (+${supportCard.stats?.attack || 0}攻擊, +${supportCard.stats?.crit || 0}%暴擊增傷)` : 
        `  輔助卡: 無`,
      strikeCard.tempAttack ? `  臨時加成: +${strikeCard.tempAttack}攻擊` : `  臨時加成: 無`,
      buffBonus > 0 ? `  Buff加成: +${buffBonus}攻擊` : `  Buff加成: 無`,
      `  總攻擊力: ${totalAttack}`,
      `  暴擊率: ${baseCritRate}% (固定)`,
      `  暴擊增傷: ${critDamageBonus}% (僅來自輔助卡)`,
      `  暴擊觸發: ${isCritical ? '是' : '否'}`,
      isCritical ? 
        `  最終傷害: ${totalAttack} × (1 + ${critDamageBonus}%) = ${finalDamage}` :
        `  最終傷害: ${totalAttack} (無暴擊)`
    ].join('\n');
    
    console.log(battleReport);

    // UI顯示
    const critMessage = isCritical ? ` 💥 暴擊！(+${critDamageBonus}%增傷)` : '';
    const buffInfo = buffBonus > 0 ? ` (含+${buffBonus}Buff)` : '';
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(
        `⚔️ ${totalAttack}攻擊力${buffInfo}${isCritical ? ` × ${1 + critDamageBonus/100}` : ''} = ${finalDamage}傷害${critMessage}`, 
        'damage'
      );
    }
    
    this.updateUI();
  }
  
  /**
   * 💥 投手攻擊
   */
  pitcherAttack() {
    if (!this.gameState?.pitcher) return;
    
    if (this.gameState.pitcher.skipNextTurn) {
      if (this.uiManager) {
        this.uiManager.addLogEntry('⏸️ 投手被時間暫停，跳過攻擊', 'system');
      }
      this.gameState.pitcher.skipNextTurn = false;
      return;
    }

    const damage = Math.max(1, this.gameState.pitcher.current_attack || 30);
    this.gameState.player.current_hp = Math.max(0, this.gameState.player.current_hp - damage);
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`💥 投手反擊，造成 ${damage} 點傷害`, 'damage');
    }
    
    this.updateUI();
  }

  /**
   * 🏆 檢查戰鬥結束
   */
  checkBattleEnd() {
    if (!this.gameState) return false;
    
    if (this.gameState.player.current_hp <= 0) {
      if (this.uiManager) {
        this.uiManager.addLogEntry('💀 戰敗！', 'damage');
      }
      this.isGameRunning = false;
      return true;
    }

    if (this.gameState.pitcher.current_hp <= 0) {
      if (this.uiManager) {
        this.uiManager.addLogEntry('🏆 戰鬥勝利！', 'success');
      }
      this.isGameRunning = false;
      return true;
    }

    return false;
  }

  /**
   * 🧹 回合結束清理
   */
  endTurnCleanup() {
    if (!this.gameState) return;
    
    // 將場上卡牌移入棄牌堆
    ['strike_zone', 'support_zone', 'spell_zone'].forEach(zone => {
      const card = this.gameState.player[zone];
      if (card) {
        this.gameState.player.discard_pile.push(card);
        this.gameState.player[zone] = null;
      }
    });

    // 清理回合效果
    this.gameState.turnBuffs = [];
    console.log(`🧹 清理turnBuffs，重置為空陣列`);
    
    // 投手疲勞
    this.gameState.pitcher.current_attack = Math.max(10, Math.round(this.gameState.pitcher.current_attack * 0.95));
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`😴 投手疲勞，攻擊力降至 ${this.gameState.pitcher.current_attack}`, 'system');
    }
  }

  /**
   * 🌅 開始新回合
   */
  startNewTurn() {
    if (!this.gameState) return;
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`---------- 回合 ${this.gameState.turnCount} 開始 ----------`, 'system');
    }
    
    // 確保turnBuffs已重置
    this.gameState.turnBuffs = [];
    console.log(`🌅 新回合開始，turnBuffs重置為空陣列`);
    
    // 抽牌到手牌上限
    const handLimit = 7;
    let drawnCount = 0;
    
    while (this.gameState.player.hand.length < handLimit && drawnCount < 3) {
      // 簡化版：直接創建卡牌（實際應該從牌庫抽取）
      if (Math.random() < 0.5) {
        this.addCardToHand('hero');
      } else {
        this.addCardToHand('kindness');
      }
      drawnCount++;
    }
    
    this.gameState.gamePhase = 'PLAY_PHASE';
    this.updateUI();
  }

  /**
   * 🎨 更新UI
   */
  updateUI() {
    if (this.uiManager && this.gameState) {
      this.uiManager.updateUI(this.gameState);
    }
  }

  /**
   * 📊 獲取遊戲狀態
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * 🔄 重置遊戲
   */
  resetGame() {
    this.triggeredEffects.clear();
    this.initializeDefaultGameState();
    this.isGameRunning = false;
    
    if (this.uiManager) {
      this.uiManager.addLogEntry('🔄 遊戲已重置', 'system');
    }
    
    this.updateUI();
  }

  /**
   * 🎯 開始遊戲
   */
  startGame() {
    this.resetGame();
    this.isGameRunning = true;
    
    // 添加一些初始卡牌
    ['hero', 'kindness', 'president', 'strongman'].forEach(cardId => {
      this.addCardToHand(cardId);
    });
    
    if (this.uiManager) {
      this.uiManager.addLogEntry('🎮 遊戲開始！', 'success');
      this.uiManager.addLogEntry('💡 點擊卡牌選擇放置位置', 'system');
      this.uiManager.addLogEntry('⚔️ 佈置好卡牌後，點擊「結束回合」發動攻擊', 'system');
    }
    
    this.updateUI();
  }
}