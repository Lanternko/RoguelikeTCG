// ===== 🎮 SEASON CONTROLLER (src/core/SeasonController.js) =====

import { EventBus } from './EventBus.js';
import { SeasonManager } from '../systems/SeasonManager.js';
import { MapSystem } from '../systems/MapSystem.js';
import { DeckbuilderSystem } from '../systems/DeckbuilderSystem.js';
import { BadgeSystem } from '../systems/BadgeSystem.js';
import { SeasonUI } from '../ui/components/SeasonUI.js';

/**
 * 🎮 賽季控制器
 * 統一管理整個賽季系統的核心控制器
 */
export class SeasonController {
  constructor(gameController, uiManager) {
    this.eventBus = new EventBus();
    this.gameController = gameController;
    this.uiManager = uiManager;
    
    // 初始化子系統
    this.seasonManager = new SeasonManager(this.eventBus);
    this.mapSystem = new MapSystem(this.eventBus);
    this.deckbuilderSystem = new DeckbuilderSystem(this.eventBus);
    this.badgeSystem = new BadgeSystem(this.eventBus);
    this.seasonUI = new SeasonUI(this.uiManager);
    
    // 當前狀態
    this.currentView = 'map'; // 'map', 'deck', 'battle', 'rewards'
    this.isInSeason = false;
    
    this.setupEventListeners();
    
    console.log('🎮 賽季控制器初始化完成');
  }

  /**
   * 🎧 設置事件監聽
   */
  setupEventListeners() {
    // 賽季事件
    this.eventBus.on('season_started', (data) => {
      console.log('🌟 賽季開始事件');
      this.onSeasonStarted(data.season);
    });

    this.eventBus.on('battle_victory', (data) => {
      console.log('🏆 戰鬥勝利事件');
      this.onBattleVictory(data);
    });

    this.eventBus.on('season_complete', (data) => {
      console.log('🏁 賽季完成事件');
      this.onSeasonComplete(data);
    });

    // 地圖事件
    this.eventBus.on('node_completed', (data) => {
      console.log('✅ 節點完成事件');
      this.onNodeCompleted(data);
    });

    // 獎勵事件
    this.eventBus.on('card_selection_completed', (data) => {
      console.log('🎴 卡牌選擇完成');
      this.onCardSelectionCompleted(data);
    });

    // 徽章事件
    this.eventBus.on('badge_earned', (data) => {
      console.log('🏅 獲得徽章');
      this.onBadgeEarned(data);
    });
  }

  /**
   * 🌟 開始新賽季
   */
  async startNewSeason() {
    console.log('🌟 開始新賽季...');
    
    try {
      // 1. 初始化賽季數據
      const season = this.seasonManager.startNewSeason();
      
      // 2. 生成地圖
      const map = this.mapSystem.generateSeasonMap();
      
      // 3. 應用徽章效果到初始牌組
      const enhancedDeck = this.badgeSystem.applyBadgesToDeck(
        season.playerDeck, 
        season.badges
      );
      season.playerDeck = enhancedDeck;
      
      // 4. 切換到地圖視圖
      this.switchToMapView();
      
      this.isInSeason = true;
      
      console.log('✅ 新賽季開始成功');
      
      return { success: true, season, map };
      
    } catch (error) {
      console.error('❌ 開始新賽季失敗:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ⚔️ 開始戰鬥
   */
  async startBattle(battleNumber) {
    if (!this.isInSeason) {
      throw new Error('沒有活躍的賽季');
    }
    
    console.log(`⚔️ 開始第 ${battleNumber} 場戰鬥...`);
    
    try {
      // 1. 生成戰鬥數據
      const battleData = this.seasonManager.startBattle(battleNumber);
      
      // 2. 獲取當前牌組（應用徽章效果）
      const season = this.seasonManager.getCurrentSeason();
      const enhancedDeck = this.badgeSystem.applyBadgesToDeck(
        season.playerDeck,
        season.badges
      );
      
      // 3. 配置遊戲控制器的戰鬥
      this.gameController.resetGame();
      this.gameController.gameState.player.deck = [...enhancedDeck];
      
      // 4. 設置投手數據
      this.gameController.gameState.pitcher.current_hp = battleData.pitcherHP;
      this.gameController.gameState.pitcher.max_hp = battleData.pitcherHP;
      this.gameController.gameState.pitcher.current_attack = battleData.pitcherAttack;
      this.gameController.gameState.pitcher.base_attack = battleData.pitcherAttack;
      this.gameController.gameState.pitcher.attribute = battleData.pitcherAttribute;
      
      // 5. 開始戰鬥
      await this.gameController.startNewTurn();
      
      // 6. 切換到戰鬥視圖
      this.switchToBattleView();
      
      console.log('✅ 戰鬥開始成功');
      
      return { success: true, battleData };
      
    } catch (error) {
      console.error('❌ 開始戰鬥失敗:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏆 完成戰鬥
   */
  async completeBattle(battleResult) {
    if (!this.isInSeason) {
      throw new Error('沒有活躍的賽季');
    }
    
    console.log('🏆 完成戰鬥...');
    
    try {
      // 1. 記錄戰鬥結果
      const completionResult = this.seasonManager.completeBattle(battleResult);
      
      // 2. 完成地圖節點
      const season = this.seasonManager.getCurrentSeason();
      this.mapSystem.completeNode(season.currentBattle - 1, battleResult);
      
      if (battleResult.victory) {
        // 3. 處理戰鬥勝利
        if (completionResult.seasonComplete) {
          // 賽季完成
          this.onSeasonComplete(completionResult);
        } else {
          // 顯示獎勵選擇
          await this.showBattleRewards(season.currentBattle - 1);
        }
      } else {
        // 4. 處理戰鬥失敗
        this.onSeasonComplete(completionResult);
      }
      
      return completionResult;
      
    } catch (error) {
      console.error('❌ 完成戰鬥失敗:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎁 顯示戰鬥獎勵
   */
  async showBattleRewards(battleNumber) {
    console.log(`🎁 顯示第 ${battleNumber} 場戰鬥獎勵...`);
    
    try {
      // 1. 生成戰鬥數據獲取獎勵
      const battleData = this.seasonManager.generateBattleData(battleNumber);
      const rewards = battleData.rewards;
      
      // 2. 檢查是否有徽章獎勵
      if (rewards.badge) {
        this.seasonManager.addBadge(rewards.badge);
        this.showBadgeReward(rewards.badge);
      }
      
      // 3. 開始卡牌選擇
      const session = this.deckbuilderSystem.startCardSelection(
        rewards.cardChoices,
        rewards.cardCount,
        'battle_reward'
      );
      
      // 4. 渲染獎勵界面
      this.switchToRewardsView(rewards.cardChoices, rewards.cardCount);
      
      return session;
      
    } catch (error) {
      console.error('❌ 顯示獎勵失敗:', error);
    }
  }

  /**
   * 🏅 顯示徽章獎勵
   */
  showBadgeReward(badge) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg p-8 max-w-md mx-4 text-center animate-pulse">
        <div class="text-6xl mb-4">🏅</div>
        <h3 class="text-2xl font-bold text-white mb-2">獲得新徽章！</h3>
        <h4 class="text-xl font-bold text-yellow-200 mb-4">${badge.name}</h4>
        <p class="text-yellow-100 mb-6">${badge.description}</p>
        <button onclick="this.closest('.fixed').remove()" 
                class="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-lg">
          太棒了！
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 3秒後自動關閉
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 5000);
  }

  /**
   * 🎴 完成卡牌選擇
   */
  async completeCardSelection(selectedCardIds) {
    console.log('🎴 完成卡牌選擇:', selectedCardIds);
    
    try {
      // 1. 完成選擇會話
      const result = this.deckbuilderSystem.finishSelection();
      
      // 2. 將選中的卡牌加入牌組
      selectedCardIds.forEach(cardId => {
        this.seasonManager.addCardToDeck(cardId);
      });
      
      // 3. 返回地圖視圖
      this.switchToMapView();
      
      console.log('✅ 卡牌選擇完成');
      
      return { success: true, selectedCards: result.selectedCards };
      
    } catch (error) {
      console.error('❌ 完成卡牌選擇失敗:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗺️ 切換到地圖視圖
   */
  switchToMapView() {
    this.currentView = 'map';
    
    const season = this.seasonManager.getCurrentSeason();
    const map = this.mapSystem.getCurrentMap();
    
    if (season && map) {
      this.seasonUI.renderMapView(map, season);
      this.showSeasonContainer();
    }
    
    console.log('🗺️ 切換到地圖視圖');
  }

  /**
   * 🎴 切換到牌組視圖
   */
  switchToDeckView() {
    this.currentView = 'deck';
    
    const season = this.seasonManager.getCurrentSeason();
    
    if (season) {
      this.seasonUI.renderDeckView(season, season.badges);
      this.showSeasonContainer();
    }
    
    console.log('🎴 切換到牌組視圖');
  }

  /**
   * ⚔️ 切換到戰鬥視圖
   */
  switchToBattleView() {
    this.currentView = 'battle';
    this.hideSeasonContainer();
    this.showGameContainer();
    
    console.log('⚔️ 切換到戰鬥視圖');
  }

  /**
   * 🎁 切換到獎勵視圖
   */
  switchToRewardsView(availableCards, selectionCount) {
    this.currentView = 'rewards';
    
    this.seasonUI.renderRewardView(availableCards, selectionCount);
    this.showSeasonContainer();
    
    console.log('🎁 切換到獎勵視圖');
  }

  /**
   * 📊 獲取賽季狀態
   */
  getSeasonStatus() {
    if (!this.isInSeason) {
      return { active: false };
    }
    
    const season = this.seasonManager.getCurrentSeason();
    const map = this.mapSystem.getCurrentMap();
    const progress = this.seasonManager.getSeasonProgress();
    
    return {
      active: true,
      season,
      map,
      progress,
      currentView: this.currentView,
      canStartBattle: this.canStartBattle(),
      nextBattle: this.getNextBattleInfo()
    };
  }

  /**
   * ⚔️ 檢查是否可以開始戰鬥
   */
  canStartBattle() {
    const availableNodes = this.mapSystem.getAvailableNodes();
    return availableNodes.length > 0;
  }

  /**
   * 📋 獲取下一場戰鬥信息
   */
  getNextBattleInfo() {
    const availableNodes = this.mapSystem.getAvailableNodes();
    if (availableNodes.length === 0) return null;
    
    const nextNode = availableNodes[0];
    return {
      battleNumber: nextNode.battleNumber,
      enemy: nextNode.enemyInfo,
      rewards: nextNode.rewards,
      type: nextNode.type
    };
  }

  /**
   * 🎯 事件處理：賽季開始
   */
  onSeasonStarted(season) {
    this.isInSeason = true;
    this.uiManager.addLogEntry('🌟 新賽季開始！15場戰鬥等著你！', 'success');
  }

  /**
   * 🎯 事件處理：戰鬥勝利
   */
  onBattleVictory(data) {
    const { battleData, season } = data;
    this.uiManager.addLogEntry(
      `🏆 第${battleData.battleNumber}場戰鬥勝利！造成${battleData.playerDamageDealt}傷害`, 
      'success'
    );
  }

  /**
   * 🎯 事件處理：賽季完成
   */
  onSeasonComplete(data) {
    const { victory, stats } = data;
    
    this.isInSeason = false;
    
    if (victory) {
      this.showSeasonVictory(stats);
    } else {
      this.showSeasonDefeat(stats);
    }
  }

  /**
   * 🎯 事件處理：節點完成
   */
  onNodeCompleted(data) {
    const { node, result } = data;
    console.log(`✅ 節點 ${node.id} 完成: ${result.victory ? '勝利' : '失敗'}`);
  }

  /**
   * 🎯 事件處理：卡牌選擇完成
   */
  onCardSelectionCompleted(data) {
    const { result } = data;
    console.log(`🎴 選擇了 ${result.selectedCards.length} 張卡牌`);
  }

  /**
   * 🎯 事件處理：獲得徽章
   */
  onBadgeEarned(data) {
    const { badge } = data;
    this.uiManager.addLogEntry(`🏅 獲得徽章: ${badge.name}`, 'success');
  }

  /**
   * 🏆 顯示賽季勝利
   */
  showSeasonVictory(stats) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-8 max-w-lg mx-4 text-center">
        <div class="text-8xl mb-4">🏆</div>
        <h2 class="text-4xl font-bold text-white mb-4">賽季勝利！</h2>
        <div class="text-green-100 space-y-2 mb-6">
          <p>完成戰鬥: ${stats.battlesWon}/${stats.totalBattles}</p>
          <p>總傷害: ${stats.totalDamageDealt}</p>
          <p>獲得徽章: ${stats.badgesEarned}/5</p>
          <p>最終牌組: ${stats.finalDeckSize}張卡牌</p>
        </div>
        <button onclick="this.closest('.fixed').remove(); window.location.reload()" 
                class="bg-green-500 hover:bg-green-400 text-green-900 font-bold py-3 px-6 rounded-lg">
          開始新賽季
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * 💀 顯示賽季失敗
   */
  showSeasonDefeat(stats) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-8 max-w-lg mx-4 text-center">
        <div class="text-8xl mb-4">💀</div>
        <h2 class="text-4xl font-bold text-white mb-4">賽季失敗</h2>
        <div class="text-red-100 space-y-2 mb-6">
          <p>戰鬥進度: ${stats.battlesWon}/${stats.totalBattles}</p>
          <p>總傷害: ${stats.totalDamageDealt}</p>
          <p>獲得徽章: ${stats.badgesEarned}/5</p>
          <p>最終牌組: ${stats.finalDeckSize}張卡牌</p>
        </div>
        <button onclick="this.closest('.fixed').remove(); window.location.reload()" 
                class="bg-red-500 hover:bg-red-400 text-red-900 font-bold py-3 px-6 rounded-lg">
          重新挑戰
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * 👁️ 顯示/隱藏容器
   */
  showSeasonContainer() {
    const seasonContainer = document.getElementById('season-container');
    const gameContainer = document.getElementById('game-container');
    
    if (seasonContainer) seasonContainer.classList.remove('hidden');
    if (gameContainer) gameContainer.classList.add('hidden');
  }

  showGameContainer() {
    const seasonContainer = document.getElementById('season-container');
    const gameContainer = document.getElementById('game-container');
    
    if (seasonContainer) seasonContainer.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
  }

  hideSeasonContainer() {
    const seasonContainer = document.getElementById('season-container');
    if (seasonContainer) seasonContainer.classList.add('hidden');
  }

  /**
   * 🔧 調試功能
   */
  debug() {
    console.log('🔧 賽季控制器調試信息:');
    console.log(`當前視圖: ${this.currentView}`);
    console.log(`賽季活躍: ${this.isInSeason}`);
    
    if (this.isInSeason) {
      const status = this.getSeasonStatus();
      console.log('📊 賽季狀態:', status);
    }
  }
}

// ===== 🔗 INTEGRATION HELPERS (src/utils/SeasonIntegration.js) =====

/**
 * 🔗 賽季集成輔助函數
 * 幫助連接賽季系統和現有遊戲邏輯
 */
export class SeasonIntegration {
  
  /**
   * 🎮 集成到主遊戲控制器
   */
  static integrateWithGameController(gameController, uiManager) {
    console.log('🔗 集成賽季系統到主遊戲控制器...');
    
    // 創建賽季控制器
    const seasonController = new SeasonController(gameController, uiManager);
    
    // 擴展遊戲控制器的功能
    gameController.seasonController = seasonController;
    
    // 添加賽季相關方法
    gameController.startSeason = () => seasonController.startNewSeason();
    gameController.getSeasonStatus = () => seasonController.getSeasonStatus();
    
    // 修改戰鬥完成邏輯以支持賽季
    const originalCheckGameEnd = gameController.checkGameEnd.bind(gameController);
    gameController.checkGameEnd = function() {
      const gameEnd = originalCheckGameEnd();
      
      // 如果在賽季中且戰鬥結束，通知賽季控制器
      if (gameEnd.gameOver && seasonController.isInSeason) {
        const battleResult = {
          victory: gameEnd.winner === 'player',
          playerDamageDealt: this.gameState.totalDamageDealt || 0,
          playerDamageReceived: this.gameState.totalDamageReceived || 0,
          turnsPlayed: this.gameState.turnCount || 0,
          playTime: gameEnd.playTime || 0
        };
        
        // 異步處理戰鬥完成
        setTimeout(() => {
          seasonController.completeBattle(battleResult);
        }, 1000);
      }
      
      return gameEnd;
    };
    
    console.log('✅ 賽季系統集成完成');
    return seasonController;
  }

  /**
   * 🖱️ 綁定全局UI事件
   */
  static bindGlobalUIEvents(seasonController) {
    // 全局函數：開始戰鬥
    window.startBattle = (battleNumber) => {
      seasonController.startBattle(battleNumber);
    };
    
    // 全局函數：切換視圖
    window.switchSeasonView = (view) => {
      switch (view) {
        case 'map':
          seasonController.switchToMapView();
          break;
        case 'deck':
          seasonController.switchToDeckView();
          break;
        default:
          console.warn(`未知視圖: ${view}`);
      }
    };
    
    // 全局函數：確認卡牌選擇
    window.confirmCardSelection = () => {
      const confirmButton = document.getElementById('confirm-selection');
      if (confirmButton && confirmButton.dataset.selectedCards) {
        const selectedCards = JSON.parse(confirmButton.dataset.selectedCards);
        seasonController.completeCardSelection(selectedCards);
      }
    };
    
    // 全局函數：開始新賽季
    window.startNewSeason = () => {
      seasonController.startNewSeason();
    };
    
    console.log('🖱️ 全局UI事件綁定完成');
  }

  /**
   * 📱 創建賽季UI容器
   */
  static createSeasonUIContainer() {
    const seasonContainer = document.createElement('div');
    seasonContainer.id = 'season-container';
    seasonContainer.className = 'hidden min-h-screen p-4';
    
    seasonContainer.innerHTML = `
      <!-- 賽季導航 -->
      <div class="season-nav bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-white">MyGO!!!!! Roguelike TCG</h1>
          
          <div class="flex space-x-4">
            <button onclick="switchSeasonView('map')" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              🗺️ 地圖
            </button>
            <button onclick="switchSeasonView('deck')" 
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              🎴 牌組
            </button>
          </div>
        </div>
      </div>

      <!-- 動態內容區域 -->
      <div id="season-map-container" class="hidden"></div>
      <div id="season-deck-container" class="hidden"></div>
      <div id="season-reward-container" class="hidden"></div>
    `;
    
    // 添加到頁面
    document.body.appendChild(seasonContainer);
    
    console.log('📱 賽季UI容器創建完成');
    return seasonContainer;
  }

  /**
   * 🎨 添加賽季CSS樣式
   */
  static addSeasonStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 地圖節點樣式 */
      .map-node {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        transform-origin: center;
      }
      
      .node-available {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border: 3px solid #60a5fa;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        animation: pulse 2s infinite;
      }
      
      .node-completed {
        background: linear-gradient(135deg, #10b981, #059669);
        border: 3px solid #34d399;
      }
      
      .node-locked {
        background: linear-gradient(135deg, #6b7280, #4b5563);
        border: 3px solid #9ca3af;
        cursor: not-allowed;
        opacity: 0.6;
      }
      
      .boss-icon {
        background: linear-gradient(135deg, #dc2626, #991b1b);
        border: 3px solid #f87171;
      }
      
      .elite-icon {
        background: linear-gradient(135deg, #7c3aed, #5b21b6);
        border: 3px solid #a78bfa;
      }
      
      .badge-icon {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 3px solid #fbbf24;
      }
      
      .connection-line {
        position: absolute;
        top: 50%;
        right: -50px;
        width: 40px;
        height: 2px;
        background: #4b5563;
        transform: translateY(-50%);
      }
      
      .map-node:hover {
        transform: scale(1.1);
      }
      
      .node-info {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        font-size: 12px;
        color: white;
      }
      
      /* 卡牌選擇動畫 */
      .reward-card {
        transition: all 0.3s ease;
      }
      
      .reward-card:hover {
        transform: translateY(-10px) scale(1.05);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }
      
      /* 徽章發光效果 */
      .badge-item {
        animation: badgeGlow 3s ease-in-out infinite alternate;
      }
      
      @keyframes badgeGlow {
        from { box-shadow: 0 0 5px rgba(251, 191, 36, 0.3); }
        to { box-shadow: 0 0 25px rgba(251, 191, 36, 0.7); }
      }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 賽季CSS樣式添加完成');
  }
}