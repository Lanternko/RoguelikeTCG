
// main.js - 正確版本

import { GameController } from './core/GameController.js';
import { UIManager } from './ui/UIManager.js';
import { CardRegistry } from './cards/CardRegistry.js';

/**
 * 🎮 主應用程序類
 */
class MyGoTCGApplication {
  constructor() {
    console.log('🎸 MyGO!!!!! TCG 應用程序初始化...');
    
    this.gameController = null;
    this.uiManager = null;
    this.isInitialized = false;
    this.draggedCardIndex = null;
    this.isMobile = this.detectMobile();
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
      
      // 4. 連接系統
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
    
    // 設置拖拽系統
    this.setupDragAndDrop();
    
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

    // 撤銷按鈕
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.innerHTML = '↩️ 撤銷';
      resetBtn.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors';
      resetBtn.addEventListener('click', () => {
        this.gameController.undoLastAction();
      });
    }

    // 添加重新開始遊戲按鈕
    this.addRestartGameButton();

    console.log('🖱️ UI事件綁定完成');
  }

  /**
   * 🔄 添加重新開始遊戲按鈕
   */
  addRestartGameButton() {
    const buttonContainer = document.getElementById('reset-btn')?.parentElement;
    if (buttonContainer && !document.getElementById('restart-game-btn')) {
      const restartBtn = document.createElement('button');
      restartBtn.id = 'restart-game-btn';
      restartBtn.innerHTML = '🔄 重新開始';
      restartBtn.className = 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors';
      restartBtn.addEventListener('click', () => {
        this.gameController.startGame();
      });
      buttonContainer.appendChild(restartBtn);
    }
  }

  /**
   * 🎯 設置拖拽系統
   */
  setupDragAndDrop() {
    console.log('🎯 設置拖拽系統...');
    
    // 設置投放區域
    this.setupDropZones();
    
    // 重寫手牌渲染來包含拖拽事件
    this.enhanceHandCardEvents();
  }

  /**
   * 📦 設置投放區域
   */
  setupDropZones() {
    const zones = [
      { id: 'strike-zone', type: 'strike_zone' },
      { id: 'support-zone', type: 'support_zone' },
      { id: 'spell-zone', type: 'spell_zone' }
    ];

    zones.forEach(({ id, type }) => {
      const zone = document.getElementById(id);
      if (!zone) return;

      // 拖拽懸停效果
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      // 卡牌投放處理
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        
        const cardIndex = e.dataTransfer.getData('text/plain');
        this.handleCardDrop(parseInt(cardIndex), type);
      });

      // 雙擊移除卡牌
      zone.addEventListener('dblclick', () => {
        this.gameController.removeCardFromZone(type);
      });
    });

    console.log('📦 投放區域設置完成');
  }

  /**
   * 🎴 增強手牌卡牌事件
   */
  enhanceHandCardEvents() {
    // 監聽手牌容器變化，動態綁定事件
    const handContainer = document.getElementById('hand-container');
    if (!handContainer) return;

    const observer = new MutationObserver(() => {
      this.bindHandCardEvents();
    });

    observer.observe(handContainer, { childList: true });
    console.log('🎴 手牌事件監聽器設置完成');
  }

  /**
   * 🖱️ 綁定手牌卡牌事件
   */
  bindHandCardEvents() {
    const cards = document.querySelectorAll('[data-card-index]');
    
    cards.forEach(card => {
      const cardIndex = parseInt(card.dataset.cardIndex);
      
      // 桌面端拖拽事件
      if (!this.isMobile) {
        card.draggable = true;
        
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', cardIndex.toString());
          card.style.opacity = '0.5';
          this.draggedCardIndex = cardIndex;
        });
        
        card.addEventListener('dragend', () => {
          card.style.opacity = '1';
          this.draggedCardIndex = null;
        });
      }
      
      // 移動端點擊事件
      if (this.isMobile) {
        card.addEventListener('click', () => {
          this.showMobileCardMenu(cardIndex);
        });
      } else {
        // 桌面端右鍵菜單
        card.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.showDesktopCardMenu(cardIndex, e.clientX, e.clientY);
        });
      }
    });
  }

  /**
   * 📱 顯示移動端卡牌選擇菜單
   */
  showMobileCardMenu(cardIndex) {
    const gameState = this.gameController.getGameState();
    const card = gameState.player.hand[cardIndex];
    if (!card) return;

    // 移除現有菜單
    const existingMenu = document.getElementById('mobile-card-menu');
    if (existingMenu) existingMenu.remove();

    // 創建移動端菜單
    const menu = document.createElement('div');
    menu.id = 'mobile-card-menu';
    menu.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    
    menu.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
        <h3 class="text-xl font-bold text-white mb-4 text-center">${card.name}</h3>
        <p class="text-gray-300 text-sm mb-6 text-center">${card.description}</p>
        
        <div class="space-y-3">
          ${this.canPlaceInZone(card, 'strike_zone') ? 
            `<button onclick="window.myGoApp.placeCardInZone(${cardIndex}, 'strike_zone')" 
                     class="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg">
               🗡️ 放置到打擊區
             </button>` : ''
          }
          
          ${this.canPlaceInZone(card, 'support_zone') ? 
            `<button onclick="window.myGoApp.placeCardInZone(${cardIndex}, 'support_zone')" 
                     class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg">
               🛡️ 放置到輔助區
             </button>` : ''
          }
          
          ${this.canPlaceInZone(card, 'spell_zone') ? 
            `<button onclick="window.myGoApp.placeCardInZone(${cardIndex}, 'spell_zone')" 
                     class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg">
               ✨ 放置到法術區
             </button>` : ''
          }
          
          <button onclick="document.getElementById('mobile-card-menu').remove()" 
                  class="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg">
            取消
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    // 點擊背景關閉
    menu.addEventListener('click', (e) => {
      if (e.target === menu) {
        menu.remove();
      }
    });
  }

  /**
   * 🖥️ 顯示桌面端卡牌菜單
   */
  showDesktopCardMenu(cardIndex, x, y) {
    const gameState = this.gameController.getGameState();
    const card = gameState.player.hand[cardIndex];
    if (!card) return;

    // 移除現有菜單
    const existingMenu = document.getElementById('desktop-card-menu');
    if (existingMenu) existingMenu.remove();

    // 創建桌面端右鍵菜單
    const menu = document.createElement('div');
    menu.id = 'desktop-card-menu';
    menu.className = 'fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-48';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    const menuItems = [];
    
    if (this.canPlaceInZone(card, 'strike_zone')) {
      menuItems.push(`
        <button onclick="window.myGoApp.placeCardInZone(${cardIndex}, 'strike_zone')" 
                class="w-full text-left px-4 py-2 text-white hover:bg-red-600 flex items-center">
          🗡️ 打擊區
        </button>
      `);
    }
    
    if (this.canPlaceInZone(card, 'support_zone')) {
      menuItems.push(`
        <button onclick="window.myGoApp.placeCardInZone(${cardIndex}, 'support_zone')" 
                class="w-full text-left px-4 py-2 text-white hover:bg-blue-600 flex items-center">
          🛡️ 輔助區
        </button>
      `);
    }
    
    if (this.canPlaceInZone(card, 'spell_zone')) {
      menuItems.push(`
        <button onclick="window.myGoApp.placeCardInZone(${cardIndex}, 'spell_zone')" 
                class="w-full text-left px-4 py-2 text-white hover:bg-purple-600 flex items-center">
          ✨ 法術區
        </button>
      `);
    }

    menu.innerHTML = `
      <div class="py-2">
        <div class="px-4 py-2 text-gray-300 font-bold border-b border-gray-600">${card.name}</div>
        ${menuItems.join('')}
      </div>
    `;

    document.body.appendChild(menu);

    // 點擊其他地方關閉菜單
    setTimeout(() => {
      document.addEventListener('click', function closeMenu() {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      });
    }, 100);
  }

  /**
   * 🎯 檢查卡牌是否可以放置在指定區域
   */
  canPlaceInZone(card, zoneType) {
    const gameState = this.gameController.getGameState();
    
    // 檢查區域是否已被佔用
    if (gameState.player[zoneType]) {
      return false;
    }

    // 檢查卡牌類型是否適合區域
    switch (zoneType) {
      case 'strike_zone':
        return card.type === 'batter' || card.type === 'support' || card.type === 'deathrattle';
      case 'support_zone':
        return card.type === 'batter' || card.type === 'support' || card.type === 'deathrattle';
      case 'spell_zone':
        return card.type === 'spell';
      default:
        return false;
    }
  }

  /**
   * 🎯 將卡牌放置到指定區域
   */
  placeCardInZone(cardIndex, zoneType) {
    const gameState = this.gameController.getGameState();
    const card = gameState.player.hand[cardIndex];
    
    if (!card || !this.canPlaceInZone(card, zoneType)) {
      if (this.uiManager) {
        this.uiManager.addLogEntry('❌ 無法放置此卡牌到該區域', 'system');
      }
      return;
    }

    // 從手牌移除卡牌
    gameState.player.hand.splice(cardIndex, 1);
    
    // 放置到指定區域
    gameState.player[zoneType] = card;
    
    // 觸發放置效果
    this.triggerCardPlacementEffects(card, zoneType);
    
    // 移除菜單
    const mobileMenu = document.getElementById('mobile-card-menu');
    const desktopMenu = document.getElementById('desktop-card-menu');
    if (mobileMenu) mobileMenu.remove();
    if (desktopMenu) desktopMenu.remove();
    
    // 更新UI
    this.gameController.updateUI();
    
    if (this.uiManager) {
      this.uiManager.addLogEntry(`🎴 ${card.name} 放置到${this.getZoneDisplayName(zoneType)}`, 'success');
    }
  }

  /**
   * ⚡ 觸發卡牌放置效果
   */
  async triggerCardPlacementEffects(card, zoneType) {
    const gameState = this.gameController.getGameState();
    
    try {
      // 觸發on_play效果（法術區）
      if (zoneType === 'spell_zone' && card.effects?.on_play) {
        const result = await card.effects.on_play.call(card, gameState);
        if (result.success && this.uiManager) {
          this.uiManager.addLogEntry(`✨ ${result.description}`, 'success');
        }
        
        // 標記為抽牌效果（如果適用）
        if (card.description.includes('抽') && card.description.includes('牌')) {
          card.effectType = 'draw';
          this.gameController.triggeredEffects.add(card.cardInstanceId);
        }
      }
      
      // 觸發on_strike效果（打擊區）
      if (zoneType === 'strike_zone' && card.effects?.on_strike) {
        const result = await card.effects.on_strike.call(card, gameState);
        if (result.success && this.uiManager) {
          this.uiManager.addLogEntry(`⚔️ ${result.description}`, 'success');
        }
      }
      
      // 觸發on_support效果（輔助區）
      if (zoneType === 'support_zone' && card.effects?.on_support) {
        const result = await card.effects.on_support.call(card, gameState);
        if (result.success && this.uiManager) {
          this.uiManager.addLogEntry(`🛡️ ${result.description}`, 'success');
        }
      }
      
    } catch (error) {
      console.error(`❌ 觸發 ${card.name} 效果時出錯:`, error);
      if (this.uiManager) {
        this.uiManager.addLogEntry(`❌ ${card.name} 效果執行失敗`, 'system');
      }
    }
  }

  /**
   * 🏷️ 獲取區域顯示名稱
   */
  getZoneDisplayName(zoneType) {
    switch (zoneType) {
      case 'strike_zone': return '打擊區';
      case 'support_zone': return '輔助區';
      case 'spell_zone': return '法術區';
      default: return '未知區域';
    }
  }

  /**
   * 📦 處理卡牌投放
   */
  handleCardDrop(cardIndex, zoneType) {
    this.placeCardInZone(cardIndex, zoneType);
  }

  /**
   * 📱 檢測移動設備
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * 📱 設置移動端適配
   */
  setupMobileAdaptation() {
    if (this.isMobile) {
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
      
      // 添加移動端提示
      setTimeout(() => {
        if (this.uiManager) {
          this.uiManager.addLogEntry('📱 移動端：點擊卡牌選擇放置區域', 'system');
        }
      }, 2000);
      
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
        @media (max-width: 768px) {
          body { 
            -webkit-touch-callout: none; 
            -webkit-user-select: none; 
            touch-action: manipulation; 
          }
          
          .hand-card { 
            width: 70px !important; 
            height: 100px !important; 
            font-size: 10px !important; 
          }
          
          .card-hover:active { 
            transform: scale(0.95); 
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); 
          }
          
          button { 
            min-height: 48px !important; 
            font-size: 16px !important; 
          }
          
          #strike-zone, #support-zone, #spell-zone {
            height: 120px !important;
          }
          
          .grid-cols-4 {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) { 
          .hand-card { 
            width: 60px !important; 
            height: 85px !important; 
            font-size: 9px !important;
          }
          
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
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
      window.myGoApp = this;
      window.gameDebug = this.createDebugTools();
      
      setTimeout(() => {
        console.log(`%c🎮 MyGO!!!!! TCG - 調試工具已啟用`, 'color: #f97316; font-weight: bold; font-size: 14px;');
        console.log(`使用 gameDebug 來訪問調試功能`);
        console.log(`使用 myGoApp 來訪問應用程序實例`);
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
        console.log(`🎴 添加了 ${randomCard}`);
      },
      addHumanCard: () => {
        const humanCards = ['president', 'kindness', 'hero', 'strongman', 'democracy', 'lottery'];
        const randomCard = humanCards[Math.floor(Math.random() * humanCards.length)];
        this.gameController.addCardToHand(randomCard);
        console.log(`👥 添加了人類卡牌: ${randomCard}`);
      },
      heal: (amount = 20) => {
        this.gameController.healPlayer(amount);
        console.log(`💚 回復 ${amount} 血量`);
      },
      damage: (amount = 30) => {
        this.gameController.damagePitcher(amount);
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
      restart: () => this.gameController.startGame(),
      showDeck: () => {
        const gameState = this.gameController.getGameState();
        if (gameState) {
          console.log('📊 當前牌組分析:');
          console.log('手牌:', gameState.player.hand.map(c => c.name));
          console.log('牌庫:', gameState.player.deck.map(c => c.name));
          console.log('棄牌堆:', gameState.player.discard_pile.map(c => c.name));
        }
      },
      testDrag: () => {
        console.log('🎯 拖拽系統狀態:');
        console.log('移動設備:', this.isMobile);
        console.log('拖拽中的卡牌:', this.draggedCardIndex);
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

    console.log('🎯 開始新遊戲...');
    
    try {
      // 啟動遊戲
      this.gameController.startGame();
      
      if (this.uiManager) {
        this.uiManager.addLogEntry('🎉 歡迎來到 MyGO!!!!! TCG！', 'success');
        this.uiManager.addLogEntry('💡 將卡牌放置到戰鬥區域以使用', 'system');
        
        if (this.isMobile) {
          this.uiManager.addLogEntry('📱 移動端：點擊卡牌選擇放置位置', 'system');
        } else {
          this.uiManager.addLogEntry('🖱️ 桌面端：拖拽卡牌或右鍵選擇', 'system');
        }
        
        this.uiManager.addLogEntry('⚔️ 佈置好卡牌後，點擊「結束回合」來發動攻擊', 'system');
        this.uiManager.addLogEntry('👥 人類主題：人屬性卡牌相互配合更強！', 'system');
      }
      
      console.log('✅ 遊戲開始成功');
      
    } catch (error) {
      console.error('❌ 開始遊戲時發生錯誤:', error);
      if (this.uiManager) {
        this.uiManager.addLogEntry('❌ 遊戲啟動失敗，請重新載入頁面', 'damage');
      }
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
    this.gameController.startGame();
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

// ===== 🌟 全局錯誤處理 =====

window.addEventListener('error', (event) => {
  console.error('💥 全局錯誤:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 未處理的Promise拒絕:', event.reason);
});

// 導出主要類供測試使用
export { MyGoTCGApplication };