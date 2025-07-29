// src/main.js - 修復版本
import { GameController } from './core/GameController.js';
import { UIManager } from './ui/UIManager.js';
import { CardRegistry } from './cards/CardRegistry.js';

class MyGoTCGApplication {
  constructor() {
    console.log('🎸 MyGO!!!!! Roguelike TCG v2 啟動');
    console.log('📋 整合平衡清單 v9');
    
    this.gameController = null;
    this.uiManager = null;
    this.isInitialized = false;
  }
  
  /**
   * 🚀 初始化應用程序
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ 應用程序已初始化');
      return;
    }
    
    try {
      console.log('🔧 初始化遊戲系統...');
      
      // 1. 初始化卡牌註冊系統
      console.log('🃏 初始化卡牌系統...');
      CardRegistry.initialize();
      this.logCardStats();
      
      // 2. 創建遊戲控制器
      console.log('🎮 創建遊戲控制器...');
      this.gameController = new GameController();
      
      // 3. 等待 DOM 加載完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // 4. 初始化 UI 管理器
      console.log('🎨 初始化 UI 管理器...');
      this.uiManager = new UIManager(this.gameController);
      
      // 5. 設置 DOM 交互
      this.setupDOMInteractions();
      
      this.isInitialized = true;
      console.log('✅ 應用程序初始化完成');
      
    } catch (error) {
      console.error('❌ 應用程序初始化失敗:', error);
      throw error;
    }
  }
  
  /**
   * 🖱️ 設置 DOM 交互
   */
  setupDOMInteractions() {
    console.log('🖱️ 設置 DOM 交互...');
    
    // 初始化 UI 元素
    if (!this.uiManager.initializeElements()) {
      console.warn('⚠️ UI 元素初始化不完整，某些功能可能不可用');
    }
    
    // 設置按鈕事件
    this.setupButtonEvents();
    
    // 設置拖拽區域
    this.setupDragAndDrop();
    
    console.log('✅ DOM 交互設置完成');
  }
  
  /**
   * 🔘 設置按鈕事件
   */
  setupButtonEvents() {
    // 攻擊按鈕
    const attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
      attackBtn.addEventListener('click', async () => {
        try {
          const result = await this.gameController.executeAttack();
          if (!result.success) {
            this.uiManager.addLogEntry(`❌ 攻擊失敗: ${result.reason}`, 'system');
          }
        } catch (error) {
          console.error('攻擊按鈕錯誤:', error);
        }
      });
    }
    
    // 新回合按鈕
    const newTurnBtn = document.getElementById('new-turn-btn');
    if (newTurnBtn) {
      newTurnBtn.addEventListener('click', async () => {
        try {
          const result = await this.gameController.startNewTurn();
          if (!result.success) {
            this.uiManager.addLogEntry(`❌ 新回合失敗: ${result.reason}`, 'system');
          }
        } catch (error) {
          console.error('新回合按鈕錯誤:', error);
        }
      });
    }
    
    // 重置按鈕
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('確定要重新開始遊戲嗎？')) {
          this.restart();
        }
      });
    }
    
    // 開始遊戲按鈕（如果存在）
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startGame();
      });
    }
  }
  
  /**
   * 🖱️ 設置拖拽功能
   */
  setupDragAndDrop() {
    const zones = ['strike-zone', 'support-zone', 'spell-zone'];
    
    zones.forEach(zoneId => {
      const zone = document.getElementById(zoneId);
      if (!zone) return;
      
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        
        const cardIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetZone = zone.dataset.zone || zoneId.replace('-', '_');
        
        try {
          const result = await this.gameController.playCard(cardIndex, targetZone);
          if (!result.success) {
            this.uiManager.addLogEntry(`❌ ${result.reason}`, 'system');
          }
        } catch (error) {
          console.error('拖拽卡牌錯誤:', error);
        }
      });
    });
  }
  
  /**
   * 🚀 開始遊戲
   */
  async startGame(customConfig = null) {
    if (!this.isInitialized) {
      console.error('❌ 應用程序未初始化');
      return;
    }
    
    try {
      console.log('🚀 開始新遊戲...');
      
      const result = await this.gameController.startGame(customConfig);
      
      if (result.success) {
        console.log('✅ 遊戲開始成功');
        this.uiManager.updateUI();
      } else {
        console.error('❌ 遊戲開始失敗:', result.reason);
        this.uiManager.addLogEntry(`❌ 遊戲開始失敗: ${result.reason}`, 'system');
      }
      
    } catch (error) {
      console.error('❌ 開始遊戲時發生錯誤:', error);
    }
  }
  
  /**
   * 🔄 重新開始
   */
  async restart() {
    console.log('🔄 重新開始遊戲...');
    
    try {
      this.gameController.reset();
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
    
    // 按屬性統計
    console.log('🎨 屬性分佈:', stats.byAttribute);
    console.log('🎭 類型分佈:', stats.byType);
    console.log('💎 稀有度分佈:', stats.byRarity);
  }
  
  /**
   * 🧪 運行測試
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
      const gameStats = this.gameController.getGameState();
      console.log('📊 遊戲狀態:', gameStats);
      
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
      gameRunning: this.gameController?.isGameRunning || false,
      cardRegistrySize: CardRegistry.cards.size,
      gameStats: this.gameController?.getGameState() || null,
      timestamp: new Date().toISOString()
    };
  }
}

// ===== 🚀 應用程序啟動 =====

// 創建全局應用程序實例
const app = new MyGoTCGApplication();

// 自動初始化
app.initialize().then(() => {
  console.log('🎉 MyGO!!!!! TCG 應用程序就緒');
  
  // 運行測試
  app.runTests();
  
  // 自動開始遊戲（開發模式）
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 開發模式：自動開始遊戲');
    setTimeout(() => {
      app.startGame();
    }, 1000);
  }
  
}).catch(error => {
  console.error('💥 應用程序啟動失敗:', error);
});

// 將應用程序實例暴露到全局，便於調試
window.MyGoTCG = app;

// 導出應用程序類（如果需要模塊化使用）
export { MyGoTCGApplication };