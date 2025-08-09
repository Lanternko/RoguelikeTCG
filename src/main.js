// main.js - 修復導入路徑
// 只負責應用程序的初始化和啟動

// ❌ 錯誤的路徑 (會導致 src/src/ 重複)
// import { GameController } from './src/core/GameController.js';

// ✅ 正確的路徑
import { GameController } from './core/GameController.js';
import { UIManager } from './ui/UIManager.js';
import { CardRegistry } from './cards/CardRegistry.js';
import { SeasonController } from './core/SeasonController.js';

/**
 * 🎮 主應用程序類 - 輕量化版本
 * 只負責協調各個系統，不包含具體的遊戲邏輯
 */
class MyGoTCGApplication {
  constructor() {
    console.log('🎸 MyGO!!!!! TCG 應用程序初始化...');
    
    this.gameController = null;
    this.uiManager = null;
    this.seasonController = null;
    this.isInitialized = false;
  }

  /**
   * 🚀 初始化應用程序
   */
  async initialize() {
    console.log('🔧 正在初始化各個系統...');
    
    try {
      // 1. 初始化卡牌註冊表
      await CardRegistry.initialize();
      
      // 2. 初始化UI管理器
      this.uiManager = new UIManager();
      
      // 3. 初始化遊戲控制器
      this.gameController = new GameController();
      
      // 4. 初始化賽季控制器
      this.seasonController = new SeasonController(this.gameController, this.uiManager);
      
      // 5. 連接系統
      this.connectSystems();
      
      this.isInitialized = true;
      console.log('✅ 應用程序初始化完成！');
      
    } catch (error) {
      console.error('❌ 應用程序初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 🔗 連接各個系統
   */
  connectSystems() {
    // 將UI管理器注入到遊戲控制器中
    this.gameController.setUIManager(this.uiManager);
    
    // 設置全局事件處理
    this.setupGlobalEvents();
    
    console.log('🔗 系統連接完成');
  }

  /**
   * 🎧 設置全局事件
   */
  setupGlobalEvents() {
    // 綁定UI事件到遊戲控制器
    this.bindUIEvents();
    
    // 設置移動端適配
    this.setupMobileAdaptation();
    
    // 設置調試工具
    this.setupDebugTools();
  }

  /**
   * 🖱️ 綁定UI事件
   */
  bindUIEvents() {
    // 結束回合按鈕
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        this.gameController.endTurn();
      });
    }

    // 重置按鈕 (改為撤銷功能)
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.innerHTML = '↩️ 撤銷';
      resetBtn.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors';
      resetBtn.addEventListener('click', () => {
        this.gameController.undoLastAction();
      });
    }

    // 添加賽季重啟按鈕
    this.addSeasonRestartButton();

    console.log('🖱️ UI事件綁定完成');
  }

  /**
   * 🔄 添加賽季重啟按鈕
   */
  addSeasonRestartButton() {
    const buttonContainer = document.getElementById('reset-btn')?.parentElement;
    if (buttonContainer && !document.getElementById('restart-season-btn')) {
      const restartBtn = document.createElement('button');
      restartBtn.id = 'restart-season-btn';
      restartBtn.innerHTML = '🔄 重新開始賽季';
      restartBtn.className = 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors';
      restartBtn.addEventListener('click', () => {
        this.seasonController.startNewSeason();
      });
      buttonContainer.appendChild(restartBtn);
    }
  }

  /**
   * 📱 設置移動端適配
   */
  setupMobileAdaptation() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 檢測到移動設備，應用移動端適配...');
      
      // 設置視口
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      
      // 添加移動端CSS
      this.addMobileStyles();
      
      document.body.classList.add('mobile-device');
    }
  }

  /**
   * 🎨 添加移動端樣式
   */
  addMobileStyles() {
    if (!document.getElementById('mobile-styles')) {
      const mobileStyle = document.createElement('style');
      mobileStyle.id = 'mobile-styles';
      mobileStyle.textContent = `
        body { 
          -webkit-touch-callout: none; 
          -webkit-user-select: none; 
          touch-action: manipulation; 
        }
        .hand-card { 
          width: 64px !important; 
          height: 90px !important; 
          font-size: 9px !important; 
        }
        .card-hover:active { 
          transform: scale(0.95); 
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); 
        }
        button { 
          min-height: 48px !important; 
          font-size: 16px !important; 
        }
        @media (max-width: 380px) { 
          .hand-card { 
            width: 56px !important; 
            height: 80px !important; 
          } 
        }
      `;
      document.head.appendChild(mobileStyle);
    }
  }

  /**
   * 🔧 設置調試工具
   */
  setupDebugTools() {
    if (this.isDevelopmentMode()) {
      window.MyGoTCG = this;
      window.gameDebug = this.createDebugTools();
      
      setTimeout(() => {
        console.log(`%c🎮 MyGO!!!!! TCG - 調試工具已啟用`, 'color: #f97316; font-weight: bold; font-size: 14px;');
        console.log(`在控制台輸入 gameDebug 來使用調試功能`);
      }, 2000);
    }
  }

  /**
   * 🔍 檢查是否為開發模式
   */
  isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  }

  /**
   * 🛠️ 創建調試工具
   */
  createDebugTools() {
    return {
      getState: () => this.gameController.getGameState(),
      addCard: (cardId = null) => {
        const allCards = CardRegistry.getAllCardIds();
        const randomCard = cardId || allCards[Math.floor(Math.random() * allCards.length)];
        this.gameController.addCardToHand(randomCard);
        this.uiManager.updateUI(this.gameController.getGameState());
        console.log(`🎴 添加了 ${randomCard}`);
      },
      heal: (amount = 20) => {
        this.gameController.healPlayer(amount);
        this.uiManager.updateUI(this.gameController.getGameState());
        console.log(`💚 回復 ${amount} 血量`);
      },
      damage: (amount = 30) => {
        this.gameController.damagePitcher(amount);
        this.uiManager.updateUI(this.gameController.getGameState());
        console.log(`💥 對投手造成 ${amount} 傷害`);
      },
      winBattle: () => {
        const gameState = this.gameController.getGameState();
        if (gameState && this.gameController.isGameRunning) {
          gameState.pitcher.current_hp = 0;
          this.gameController.endTurn();
          console.log('🏆 強制戰鬥勝利');
        }
      },
      restart: () => this.seasonController.startNewSeason(),
      showDeck: () => {
        const gameState = this.gameController.getGameState();
        if (gameState) {
          console.log('📊 當前牌組分析:');
          console.log('手牌:', gameState.player.hand.map(c => c.name));
          console.log('牌庫:', gameState.player.deck.map(c => c.name));
          console.log('棄牌堆:', gameState.player.discard_pile.map(c => c.name));
        }
      }
    };
  }

  /**
   * 🎯 開始遊戲
   */
  async startGame() {
    if (!this.isInitialized) {
      console.error('❌ 應用程序尚未初始化');
      return;
    }

    console.log('🎯 開始新賽季...');
    
    try {
      // 啟動賽季系統
      await this.seasonController.startNewSeason();
      
      this.uiManager.addLogEntry('🎉 歡迎來到 MyGO!!!!! TCG！', 'success');
      this.uiManager.addLogEntry('💡 拖拽卡牌到戰鬥區域，或點擊卡牌選擇位置', 'system');
      this.uiManager.addLogEntry('💡 雙擊戰鬥區域的卡牌可以撤銷放置', 'system');
      this.uiManager.addLogEntry('⚔️ 佈置好卡牌後，點擊「結束回合」來發動攻擊', 'system');
      
      console.log('✅ 遊戲開始成功');
      
    } catch (error) {
      console.error('❌ 開始遊戲時發生錯誤:', error);
      this.uiManager.addLogEntry('❌ 遊戲啟動失敗，請重新載入頁面', 'damage');
    }
  }

  /**
   * 📊 獲取遊戲狀態
   */
  getGameState() {
    return this.gameController?.getGameState();
  }

  /**
   * 🔄 重啟應用程序
   */
  restart() {
    this.seasonController.startNewSeason();
  }
}

// ===== 🚀 應用程序啟動邏輯 =====

/**
 * 🎬 啟動應用程序
 */
export async function startApplication() {
  console.log('🎬 啟動 MyGO!!!!! TCG...');
  
  const app = new MyGoTCGApplication();
  
  try {
    await app.initialize();
    console.log('🎉 MyGO!!!!! TCG 初始化完成');
    
    // 延遲啟動遊戲，確保UI就緒
    setTimeout(async () => {
      await app.startGame();
    }, 500);
    
    return app;
    
  } catch (error) {
    console.error('💥 應用程序啟動失敗:', error);
    throw error;
  }
}

/**
 * 💥 顯示錯誤界面
 */
function showErrorScreen(error) {
  const gameContainer = document.getElementById('game-container');
  const loadingScreen = document.getElementById('loading-screen');
  
  if (loadingScreen) loadingScreen.style.display = 'none';
  
  if (gameContainer) {
    gameContainer.innerHTML = `
      <div class="min-h-screen bg-red-900 text-white flex items-center justify-center p-4">
        <div class="bg-red-800 p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 class="text-2xl font-bold text-red-300 mb-4">載入失敗</h1>
          <p class="text-red-200 mb-4">遊戲無法正常啟動，請檢查控制台錯誤訊息。</p>
          <pre class="text-xs bg-gray-900 p-2 rounded mb-4 text-left whitespace-pre-wrap">${error.stack || error.message}</pre>
          <button onclick="location.reload()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            重新載入
          </button>
        </div>
      </div>
    `;
    gameContainer.style.display = 'block';
  }
}

/**
 * 🏁 主初始化函數
 */
async function initializeApp() {
  console.log('🚀 開始初始化 MyGO!!!!! TCG...');
  
  try {
    const app = await startApplication();
    
    // 隱藏載入畫面
    const loadingScreen = document.getElementById('loading-screen');
    const gameContainer = document.getElementById('game-container');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
    
    console.log('✅ MyGO!!!!! TCG 成功啟動！');
    
  } catch (error) {
    console.error('💥 初始化失敗:', error);
    showErrorScreen(error);
  }
}

// ===== 🌟 全局錯誤處理 =====

window.addEventListener('error', (event) => {
  console.error('💥 全局錯誤:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 未處理的Promise拒絕:', event.reason);
});

// ===== 🎬 應用程序入口點 =====

// 根據DOM就緒狀態決定何時初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// 導出主要類供測試使用
export { MyGoTCGApplication };