// 5. 修復 src/core/GameController.js - 添加缺失的導入
import { EventBus } from './EventBus.js';
import { GameState } from './GameState.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { TurnSystem } from '../systems/TurnSystem.js';
import { CardRegistry } from '../cards/CardRegistry.js';
import { GAME_BALANCE } from '../data/balance/GameBalance.js';

export class GameController {
  constructor() {
    console.log('🎮 初始化遊戲控制器...');
    
    // 初始化核心系統
    this.eventBus = new EventBus();
    this.gameState = new GameState();
    
    // 初始化子系統
    this.combatSystem = new CombatSystem(this.eventBus);
    this.turnSystem = new TurnSystem(this.eventBus);
    
    // 初始化卡牌系統
    CardRegistry.initialize();
    
    // 設置事件監聽
    this.setupEventListeners();
    
    // 遊戲狀態
    this.isGameRunning = false;
    this.gameStartTime = null;
    
    console.log('✅ 遊戲控制器初始化完成');
  }

  /**
   * 🏗️ 創建初始遊戲狀態
   */
  createInitialGameState() {
    return {
      player: {
        current_hp: GAME_BALANCE.PLAYER_INITIAL_HP,
        max_hp: GAME_BALANCE.PLAYER_INITIAL_HP,
        deck: [], // 存放卡牌ID
        hand: [], // 存放完整卡牌對象
        discard_pile: [],
        strike_zone: [],
        support_zone: [],
        spell_zone: [],
        active_buffs: []
      },
      pitcher: {
        current_hp: GAME_BALANCE.PITCHER_INITIAL_HP,
        max_hp: GAME_BALANCE.PITCHER_INITIAL_HP,
        base_attack: 30,
        current_attack: 30,
        attribute: "heaven",
        active_debuffs: []
      },
      gamePhase: 'DRAW_PHASE',
      turnBuffs: [],
      turnPlayedCards: []
    };
  }

  /**
   * 🎧 設置事件監聽器
   */
  setupEventListeners() {
    this.eventBus.on('damage_dealt', (data) => {
      console.log(`💥 造成傷害: ${data.damage} (投手剩餘: ${data.pitcherHP}/${data.pitcherMaxHP})`);
    });

    this.eventBus.on('turn_phase_changed', (data) => {
      console.log(`🔄 階段變更: ${data.phase}`);
    });

    this.eventBus.on('combat_complete', (data) => {
      console.log(`⚔️ 戰鬥完成:`, data.result);
    });
  }

  /**
   * 🃏 放置卡牌到指定區域
   */
  async playCard(cardIndex, targetZone) {
    const card = this.gameState.player.hand[cardIndex];
    if (!card) {
      return { success: false, reason: '無效的卡牌索引' };
    }

    // 檢查目標區域是否為空
    if (this.gameState.player[targetZone].length > 0) {
      return { success: false, reason: '目標區域已有卡牌' };
    }

    // 檢查卡牌類型是否匹配區域
    if (!this.isValidPlacement(card, targetZone)) {
      return { success: false, reason: '卡牌類型與區域不匹配' };
    }

    // 移動卡牌
    this.gameState.player.hand.splice(cardIndex, 1);
    this.gameState.player[targetZone].push(card);

    // 觸發打出時效果
    if (card.effects?.on_play) {
      const result = await card.effects.on_play.call(card, this.gameState);
      if (result.success) {
        console.log(`✨ 打出效果: ${result.description}`);
      }
    }

    console.log(`🎴 ${card.name} 放置到 ${targetZone}`);
    this.eventBus.emit('card_played', { card, targetZone });

    return { success: true };
  }

  /**
   * ⚔️ 執行攻擊
   */
  async executeAttack() {
    if (this.gameState.gamePhase !== 'PLAY_PHASE') {
      return { success: false, reason: '不在出牌階段' };
    }

    // 切換到戰鬥階段
    const combatResult = await this.turnSystem.combatPhase(this.gameState, this.combatSystem);
    
    // 自動結束回合
    const gameEndResult = await this.turnSystem.endOfTurn(this.gameState, this.combatSystem);
    
    if (gameEndResult.gameOver) {
      console.log(`🏆 遊戲結束: ${gameEndResult.winner} 獲勝 (${gameEndResult.reason})`);
      return { success: true, gameOver: true, winner: gameEndResult.winner };
    }

    // 開始新回合
    setTimeout(() => {
      this.turnSystem.processTurn(this.gameState);
    }, 1000);

    return { success: true, combatResult, gameOver: false };
  }

  /**
   * 🎯 檢查卡牌放置是否有效
   */
  isValidPlacement(card, targetZone) {
    const validPlacements = {
      'strike_zone': ['batter'],
      'support_zone': ['support', 'batter'], // 輔助卡和打者卡都可以放輔助區
      'spell_zone': ['spell']
    };

    return validPlacements[targetZone]?.includes(card.type) || false;
  }

  /**
   * 🚀 開始遊戲
   */
  startGame() {
    console.log('🚀 遊戲開始！');
    
    // 初始化牌組 (這裡用測試牌組)
    this.initializeTestDeck();
    
    // 開始第一回合
    this.turnSystem.processTurn(this.gameState);
    
    this.eventBus.emit('game_started', { gameState: this.gameState });
  }

  /**
   * 🧪 初始化測試牌組
   */
  initializeTestDeck() {
    // 創建測試牌組
    const testDeck = [
      'president', 'president',
      'kindness', 'kindness', 
      'hero', 'hero', 'hero',
      'shadow_devour',
      'yinyang_harmony'
    ];

    // 轉換為完整卡牌對象並洗牌
    this.gameState.player.deck = testDeck.map(id => CardRegistry.create(id));
    this.turnSystem.shuffleDeck(this.gameState.player.deck);
    
    console.log(`🎴 牌組初始化完成: ${this.gameState.player.deck.length} 張卡牌`);
  }

  /**
   * 📊 獲取遊戲狀態
   */
  getGameState() {
    return { ...this.gameState };
  }
}
