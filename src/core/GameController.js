// src/core/GameController.js - Main Game Controller
import { EventBus } from './EventBus.js';
import { GameState } from './GameState.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { TurnSystem } from '../systems/TurnSystem.js';
import { EffectProcessor } from '../effects/EffectProcessor.js';
import { CardRegistry } from '../cards/CardRegistry.js';
import { GAME_BALANCE } from '../data/balance/GameBalance.js';

/**
 * 🎮 遊戲控制器
 * 負責協調所有遊戲系統，管理遊戲狀態和流程
 */
export class GameController {
  constructor() {
    console.log('🎮 初始化遊戲控制器...');
    
    // 初始化核心系統
    this.eventBus = new EventBus();
    this.gameState = new GameState();
    
    // 初始化子系統
    this.combatSystem = new CombatSystem(this.eventBus);
    this.turnSystem = new TurnSystem(this.eventBus);
    this.effectProcessor = new EffectProcessor(this.eventBus);
    
    // 設置事件監聽
    this.setupEventListeners();
    
    // 遊戲狀態標誌
    this.isGameRunning = false;
    this.gameStartTime = null;
    
    console.log('✅ 遊戲控制器初始化完成');
  }

  /**
   * 🎧 設置事件監聽器
   */
  setupEventListeners() {
    // 監聽戰鬥事件
    this.eventBus.on('damage_dealt', (data) => {
      console.log(`💥 造成傷害: ${data.damage}`);
      this.checkGameEnd();
    });

    // 監聽卡牌事件
    this.eventBus.on('card_played', (data) => {
      console.log(`🎴 卡牌打出: ${data.card.name}`);
    });

    // 監聽回合事件
    this.eventBus.on('turn_start', (data) => {
      console.log(`🌅 回合 ${data.turnCount} 開始`);
    });

    // 監聽投手階段轉換
    this.eventBus.on('pitcher_stage_transition', (data) => {
      console.log(`🔥 投手進入第 ${data.stage} 階段！`);
    });

    console.log('🎧 事件監聽器設置完成');
  }

  /**
   * 🔄 重置遊戲狀態
   */
  resetGame() {
    console.log('🔄 重置遊戲狀態...');
    
    this.gameState = new GameState();
    this.isGameRunning = false;
    this.gameStartTime = null;
    
    // 清理事件總線
    this.eventBus.removeAllListeners();
    this.setupEventListeners();
    
    console.log('✅ 遊戲狀態重置完成');
  }

  /**
   * 🃏 初始化測試牌組
   */
  initializeTestDeck() {
    console.log('🃏 初始化測試牌組...');
    
    const testDeckIds = [
      // 人屬性卡牌
      'president', 'president', 'kindness', 'kindness', 
      'hero', 'hero', 'lottery', 'strongman', 'democracy',
      
      // 陰屬性卡牌
      'shadow_devour', 'lone_shadow', 'evil_genius', 
      
      // 特殊卡牌
      'weapon_master', 'yinyang_harmony', 'holy_light'
    ];

    // 創建牌組（存儲完整卡牌對象，不只是ID）
    this.gameState.player.deck = testDeckIds.map(id => {
      try {
        return CardRegistry.create(id);
      } catch (error) {
        console.warn(`⚠️ 無法創建卡牌 ${id}:`, error);
        return null;
      }
    }).filter(Boolean); // 移除空值

    // 洗牌
    this.turnSystem.shuffleDeck(this.gameState.player.deck);
    
    console.log(`🎴 牌組初始化完成: ${this.gameState.player.deck.length} 張卡牌`);
  }

  /**
   * 🌅 開始新回合
   */
  async startNewTurn() {
    console.log(`🌅 開始回合 ${this.gameState.turnCount}...`);
    
    if (!this.isGameRunning) {
      this.isGameRunning = true;
      this.gameStartTime = Date.now();
    }

    // 執行回合開始階段
    await this.turnSystem.startOfTurn(this.gameState);
    
    // 執行抽牌階段
    await this.turnSystem.drawPhase(this.gameState);
    
    // 進入出牌階段
    this.gameState.gamePhase = 'PLAY_PHASE';
    
    // 發出回合開始事件
    this.eventBus.emit('turn_start', {
      turnCount: this.gameState.turnCount,
      gamePhase: this.gameState.gamePhase
    });
  }

  /**
   * 🎴 打出卡牌
   */
  async playCard(cardIndex, targetZone) {
    console.log(`🎴 嘗試打出卡牌 ${cardIndex} 到 ${targetZone}...`);
    
    // 驗證遊戲狀態
    if (this.gameState.gamePhase !== 'PLAY_PHASE') {
      console.warn('❌ 不在出牌階段！');
      return { success: false, reason: '不在出牌階段' };
    }

    // 驗證卡牌索引
    if (cardIndex < 0 || cardIndex >= this.gameState.player.hand.length) {
      console.warn('❌ 無效的卡牌索引！');
      return { success: false, reason: '無效的卡牌索引' };
    }

    const card = this.gameState.player.hand[cardIndex];
    
    // 驗證目標區域
    if (!this.isValidCardPlacement(card, targetZone)) {
      console.warn(`❌ 無法將 ${card.name} 放置到 ${targetZone}！`);
      return { success: false, reason: '無效的放置目標' };
    }

    // 檢查目標區域是否為空
    if (this.gameState.player[targetZone]) {
      console.warn(`❌ ${targetZone} 已有卡牌！`);
      return { success: false, reason: '目標區域已佔用' };
    }

    // 執行卡牌放置
    this.gameState.player.hand.splice(cardIndex, 1);
    this.gameState.player[targetZone] = card;
    this.gameState.turnPlayedCards.push(card);

    // 觸發 on_play 效果
    if (card.effects?.on_play) {
      console.log(`✨ 觸發 ${card.name} 的 on_play 效果`);
      try {
        const result = await this.effectProcessor.processEffect(
          card.effects.on_play, 
          card, 
          this.gameState
        );
        if (result.success) {
          console.log(`✅ on_play 效果: ${result.description}`);
        }
      } catch (error) {
        console.error(`❌ on_play 效果執行失敗:`, error);
      }
    }

    // 發出卡牌打出事件
    this.eventBus.emit('card_played', {
      card,
      targetZone,
      gameState: this.gameState
    });

    console.log(`✅ ${card.name} 成功放置到 ${targetZone}`);
    return { success: true, card, targetZone };
  }

  /**
   * 🎯 驗證卡牌放置是否有效
   */
  isValidCardPlacement(card, targetZone) {
    const zoneTypeMap = {
      'strike_zone': ['batter'],
      'support_zone': ['batter', 'support'],
      'spell_zone': ['spell', 'deathrattle']
    };

    return zoneTypeMap[targetZone]?.includes(card.type) || false;
  }

  /**
   * ⚔️ 執行攻擊
   */
  async executeAttack() {
    console.log('⚔️ 執行攻擊...');
    
    // 驗證遊戲狀態
    if (this.gameState.gamePhase !== 'PLAY_PHASE') {
      console.warn('❌ 不在出牌階段！');
      return { success: false, reason: '不在出牌階段' };
    }

    // 驗證是否有打擊卡
    if (!this.gameState.player.strike_zone) {
      console.warn('❌ 請先放置打擊卡牌！');
      return { success: false, reason: '沒有打擊卡牌' };
    }

    // 進入戰鬥階段
    this.gameState.gamePhase = 'COMBAT_PHASE';
    
    // 執行戰鬥
    const combatResult = await this.turnSystem.combatPhase(this.gameState, this.combatSystem);
    
    // 檢查遊戲結束
    const gameEnd = this.checkGameEnd();
    if (gameEnd.gameOver) {
      return { success: true, combatResult, gameEnd };
    }

    // 投手攻擊
    const pitcherDamage = this.combatSystem.calculatePitcherDamage(this.gameState);
    this.gameState.player.current_hp -= pitcherDamage;
    this.gameState.player.current_hp = Math.max(0, this.gameState.player.current_hp);

    console.log(`🎯 戰鬥完成: 造成 ${combatResult.playerDamageDealt} 傷害, 受到 ${pitcherDamage} 傷害`);

    return { 
      success: true, 
      combatResult, 
      pitcherDamage,
      gameEnd: this.checkGameEnd()
    };
  }

  /**
   * 🌙 結束回合
   */
  async endTurn() {
    console.log('🌙 結束回合...');
    
    // 執行回合結束階段
    const gameEnd = await this.turnSystem.endOfTurn(this.gameState, this.combatSystem);
    
    if (gameEnd.gameOver) {
      console.log(`🎮 遊戲結束: ${gameEnd.reason}`);
      this.isGameRunning = false;
      return gameEnd;
    }

    // 開始下一回合
    this.gameState.turnCount++;
    await this.startNewTurn();
    
    return { gameOver: false };
  }

  /**
   * 🏆 檢查遊戲結束條件
   */
  checkGameEnd() {
    if (this.gameState.player.current_hp <= 0) {
      this.isGameRunning = false;
      return { 
        gameOver: true, 
        winner: 'pitcher', 
        reason: '玩家血量歸零',
        playTime: Date.now() - this.gameStartTime
      };
    }
    
    if (this.gameState.pitcher.current_hp <= 0) {
      this.isGameRunning = false;
      return { 
        gameOver: true, 
        winner: 'player', 
        reason: '投手血量歸零',
        playTime: Date.now() - this.gameStartTime
      };
    }
    
    return { gameOver: false };
  }

  /**
   * 📊 獲取遊戲狀態（只讀副本）
   */
  getGameState() {
    return {
      player: { ...this.gameState.player },
      pitcher: { ...this.gameState.pitcher },
      gamePhase: this.gameState.gamePhase,
      turnCount: this.gameState.turnCount,
      turnBuffs: [...this.gameState.turnBuffs],
      turnPlayedCards: [...this.gameState.turnPlayedCards],
      isGameRunning: this.isGameRunning,
      gameStartTime: this.gameStartTime
    };
  }

  /**
   * 🔧 調試功能
   */
  addCardToHand(cardId) {
    try {
      const card = CardRegistry.create(cardId);
      this.gameState.player.hand.push(card);
      console.log(`🔧 調試：添加了 ${card.name}`);
      return true;
    } catch (error) {
      console.error(`❌ 無法添加卡牌 ${cardId}:`, error);
      return false;
    }
  }

  /**
   * 💊 調試：直接治療玩家
   */
  healPlayer(amount) {
    this.gameState.player.current_hp += amount;
    this.gameState.player.current_hp = Math.min(
      this.gameState.player.max_hp, 
      this.gameState.player.current_hp
    );
    console.log(`🔧 調試：玩家回復 ${amount} 血量`);
  }

  /**
   * 💥 調試：直接傷害投手
   */
  damagePitcher(amount) {
    this.gameState.pitcher.current_hp -= amount;
    this.gameState.pitcher.current_hp = Math.max(0, this.gameState.pitcher.current_hp);
    console.log(`🔧 調試：投手受到 ${amount} 傷害`);
  }
}