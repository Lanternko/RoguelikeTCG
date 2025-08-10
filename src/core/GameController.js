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
   * ⚔️ 執行自動攻擊 - 修復版
   */
  executeAutoAttack() {
    const strikeCard = this.gameState?.player?.strike_zone;
    if (!strikeCard) {
      if (this.uiManager) {
        this.uiManager.addLogEntry('❌ 沒有打擊卡牌！', 'system');
      }
      return;
    }

    // 🎯 第一步：計算基礎攻擊力和暴擊率
    let totalAttack = 0;
    let totalCrit = 0;

    // 打擊卡基礎數值
    totalAttack += (strikeCard.stats?.attack || 0);
    totalCrit += (strikeCard.stats?.crit || 0);
    
    // 輔助卡基礎數值（只加暴擊率，不加攻擊力）
    const supportCard = this.gameState.player.support_zone;
    if (supportCard) {
      totalCrit += supportCard.stats?.crit || 0;
    }

    console.log(`📊 基礎數值: 攻擊力 ${totalAttack}, 暴擊率 ${totalCrit}%`);

    // 🎯 第二步：應用卡牌臨時加成
    if (strikeCard.tempAttack) {
      totalAttack += strikeCard.tempAttack;
      console.log(`✨ ${strikeCard.name} 臨時攻擊力: +${strikeCard.tempAttack}`);
    }

    // 🎯 第三步：應用turnBuffs（最重要！）
    if (this.gameState.turnBuffs && this.gameState.turnBuffs.length > 0) {
      console.log(`🔥 應用 ${this.gameState.turnBuffs.length} 個回合Buff:`);
      
      this.gameState.turnBuffs.forEach(buff => {
        console.log(`  - ${buff.type}: ${buff.value} (來源: ${buff.source})`);
        
        if (buff.type === 'human_batter_attack_boost' && strikeCard.attribute === 'human') {
          totalAttack += buff.value;
          console.log(`    ✅ 應用到 ${strikeCard.name}: 攻擊力 +${buff.value}`);
        }
      });
    } else {
      console.log(`⚠️ 沒有turnBuffs可應用`);
    }

    // 🎯 第四步：計算最終傷害
    const isCritical = Math.random() * 100 < totalCrit;
    const critMultiplier = isCritical ? 1.5 : 1;
    const finalDamage = Math.round(totalAttack * critMultiplier);

    // 對投手造成傷害
    this.gameState.pitcher.current_hp = Math.max(0, this.gameState.pitcher.current_hp - finalDamage);

    // 詳細日誌
    const critMessage = isCritical ? ' 💥 觸發暴擊！' : '';
    const buffInfo = this.gameState.turnBuffs.length > 0 ? 
      ` (含Buff加成)` : '';
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(
        `⚔️ 攻擊力 ${totalAttack}${buffInfo} (暴擊率${totalCrit}%) 造成 ${finalDamage} 傷害！${critMessage}`, 
        'damage'
      );
    }
    
    console.log(`⚔️ 攻擊詳情:
    - 基礎攻擊力: ${strikeCard.stats?.attack || 0}
    - 臨時加成: ${strikeCard.tempAttack || 0}
    - Buff加成: ${this.gameState.turnBuffs.filter(b => b.type === 'human_batter_attack_boost' && strikeCard.attribute === 'human').reduce((sum, b) => sum + b.value, 0)}
    - 總攻擊力: ${totalAttack}
    - 暴擊率: ${totalCrit}%
    - 暴擊觸發: ${isCritical}
    - 最終傷害: ${finalDamage}`);
    
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