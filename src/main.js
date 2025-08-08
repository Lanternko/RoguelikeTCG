// main.js - Single Entry Point for MyGO!!!!! Roguelike TCG v2
import { GameController } from './src/core/GameController.js';
import { UIManager } from './src/ui/UIManager.js';
import { CardRegistry } from './src/cards/CardRegistry.js';
import { GAME_BALANCE } from './src/data/balance/GameBalance.js';

/**
 * 🎮 MyGO!!!!! TCG Application Class
 * Main application controller that orchestrates all systems
 */
class MyGoTCGApplication {
  constructor() {
    console.log('🎸 MyGO!!!!! TCG Application 初始化中...');
    
    this.gameController = null;
    this.uiManager = null;
    this.isInitialized = false;
    this.isGameRunning = false;
  }

  /**
   * 🔧 初始化應用程序
   */
  async initialize() {
    console.log('🔧 正在初始化系統...');
    
    try {
      // 1. 初始化卡牌註冊表
      console.log('📚 初始化卡牌註冊表...');
      await CardRegistry.initialize();
      this.logCardStats();
      
      // 2. 初始化遊戲控制器
      console.log('🎮 初始化遊戲控制器...');
      this.gameController = new GameController();
      
      // 3. 初始化UI管理器
      console.log('🎨 初始化UI管理器...');
      this.uiManager = new UIManager();
      
      // 4. 連接UI事件到遊戲控制器
      this.connectUIEvents();
      
      this.isInitialized = true;
      console.log('✅ 應用程序初始化完成！');
      
    } catch (error) {
      console.error('❌ 應用程序初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 🔗 連接UI事件到遊戲邏輯
   */
  connectUIEvents() {
    const ui = this.uiManager;
    const game = this.gameController;

    // 攻擊按鈕
    ui.elements.attackBtn?.addEventListener('click', () => {
      game.executeAttack();
    });

    // 結束回合按鈕
    ui.elements.endTurnBtn?.addEventListener('click', () => {
      game.endTurn();
    });

    // 重置按鈕
    ui.elements.resetBtn?.addEventListener('click', () => {
      this.restart();
    });

    // 卡牌拖拽事件
    this.setupCardDragEvents();

    console.log('🔗 UI事件連接完成');
  }

  /**
   * 🎴 設置卡牌拖拽事件
   */
  setupCardDragEvents() {
    // 設置拖拽目標區域
    const dropZones = ['strike-zone', 'support-zone', 'spell-zone'];
    
    dropZones.forEach(zoneId => {
      const zone = document.getElementById(zoneId);
      if (!zone) return;

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        
        const cardIndex = e.dataTransfer.getData('text/plain');
        const targetZone = zoneId.replace('-zone', '_zone');
        
        this.gameController.playCard(parseInt(cardIndex), targetZone);
      });
    });
  }

  /**
   * 🎯 開始新遊戲
   */
  async startGame() {
    if (!this.isInitialized) {
      console.error('❌ 應用程序尚未初始化');
      return;
    }

    console.log('🎯 開始新遊戲...');

    try {
      // 重置遊戲狀態
      this.gameController.resetGame();
      
      // 初始化測試牌組
      this.gameController.initializeTestDeck();
      
      // 開始第一回合
      await this.gameController.startNewTurn();
      
      // 更新UI
      this.uiManager.updateUI(this.gameController.getGameState());
      
      // 添加歡迎訊息
      this.uiManager.addLogEntry('🎉 歡迎來到 MyGO!!!!! Roguelike TCG v2', 'success');
      this.uiManager.addLogEntry('💡 提示：將卡牌拖拽到戰鬥區域，然後點擊攻擊！', 'system');
      this.uiManager.addLogEntry('⚡ 法術卡帶有✨特效，死聲卡帶有💀標記', 'system');
      
      this.isGameRunning = true;
      console.log('✅ 遊戲開始成功');
      
    } catch (error) {
      console.error('❌ 開始遊戲時發生錯誤:', error);
    }
  }

  /**
   * 🔄 重新開始遊戲
   */
  async restart() {
    console.log('🔄 重新開始遊戲...');
    
    try {
      this.isGameRunning = false;
      await this.startGame();
    } catch (error) {
      console.error('❌ 重新開始失敗:', error);
    }
  }

  /**
   * 📊 記錄卡牌統計
   */
  logCardStats() {
    const stats = CardRegistry.getStats();
    console.log('📊 卡牌統計:', stats);
    console.log(`✅ 成功註冊 ${stats.total} 張卡牌`);
    
    if (stats.byAttribute) {
      console.log('🎨 屬性分佈:', stats.byAttribute);
    }
    if (stats.byType) {
      console.log('🎭 類型分佈:', stats.byType);
    }
    if (stats.byRarity) {
      console.log('💎 稀有度分佈:', stats.byRarity);
    }
  }

  /**
   * 🧪 運行系統測試
   */
  runTests() {
    console.log('\n🧪 運行系統測試...\n');
    
    try {
      // 測試卡牌創建
      const testCards = ['president', 'kindness', 'shadow_devour'];
      testCards.forEach(cardId => {
        try {
          const card = CardRegistry.create(cardId);
          console.log(`✅ ${cardId}: ${card.name} (${card.type}, ${card.attribute})`);
        } catch (error) {
          console.error(`❌ ${cardId} 創建失敗:`, error);
        }
      });
      
      // 測試遊戲狀態
      if (this.gameController) {
        const gameState = this.gameController.getGameState();
        console.log('📊 遊戲狀態檢查: 玩家HP =', gameState.player.current_hp);
        console.log('📊 投手狀態檢查: 投手HP =', gameState.pitcher.current_hp);
      }
      
      console.log('\n✅ 系統測試完成！');
      
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  }

  /**
   * 📈 獲取系統狀態
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      gameRunning: this.isGameRunning,
      cardRegistrySize: CardRegistry.cards?.size || 0,
      gameState: this.gameController?.getGameState() || null,
      timestamp: new Date().toISOString()
    };
  }
}

// ===== 🚀 應用程序啟動邏輯 =====

/**
 * 🎬 應用程序啟動函數
 */
async function startApplication() {
  console.log('🎬 啟動 MyGO!!!!! TCG...');
  
  // 創建全局應用程序實例
  const app = new MyGoTCGApplication();
  
  try {
    // 初始化應用程序
    await app.initialize();
    
    console.log('🎉 MyGO!!!!! TCG 應用程序就緒');
    
    // 運行測試（開發模式）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🔧 開發模式：運行測試');
      app.runTests();
    }
    
    // 自動開始遊戲
    setTimeout(async () => {
      await app.startGame();
    }, 500);
    
  } catch (error) {
    console.error('💥 應用程序啟動失敗:', error);
    // 顯示錯誤信息給用戶
    document.body.innerHTML = `
      <div class="min-h-screen bg-red-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 class="text-2xl font-bold text-red-600 mb-4">啟動失敗</h1>
          <p class="text-gray-700 mb-4">應用程序無法正常啟動，請檢查控制台獲取詳細錯誤信息。</p>
          <button onclick="location.reload()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            重新載入
          </button>
        </div>
      </div>
    `;
  }
  
  // 將應用程序實例暴露到全局，便於調試
  window.MyGoTCG = app;
  
  // 添加調試工具
  window.gameDebug = {
    getState: () => app.gameController?.getGameState(),
    getStatus: () => app.getSystemStatus(),
    addCard: (cardId) => {
      if (app.gameController && CardRegistry.cards.has(cardId)) {
        const card = CardRegistry.create(cardId);
        app.gameController.gameState.player.hand.push(card);
        app.uiManager.updateUI(app.gameController.gameState);
        console.log(`🔧 調試：添加了 ${card.name}`);
      }
    },
    restart: () => app.restart()
  };
  
  return app;
}

// 等待DOM載入完成後啟動
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}

// 導出主類別（用於模組化）
export { MyGoTCGApplication, startApplication };