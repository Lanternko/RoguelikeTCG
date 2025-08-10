// src/ui/UIManager.js - 修復版

/**
 * 🎨 UI管理器
 * 統一管理所有UI元素的更新和事件處理
 */
export class UIManager {
  constructor() {
    console.log('🎨 初始化UI管理器...');
    
    this.elements = {};
    this.isInitialized = false;
    
    // DOM準備好後再初始化，避免找不到元素
    document.addEventListener('DOMContentLoaded', () => {
        this.initializeElements();
        this.setupStyles();
    });
  }

  /**
   * 📊 獲取UI狀態
   */
  getUIStatus() {
    return {
      initialized: this.isInitialized,
      elementsFound: Object.keys(this.elements).length,
      missingElements: Object.entries(this.elements)
        .filter(([key, element]) => !element || element.dataset.isDummy)
        .map(([key]) => key)
    };
  }

  /**
   * 🔧 初始化UI元素
   */
  initializeElements() {
    console.log('🔧 初始化UI元素...');
    
    this.elements = {
      // 玩家狀態
      playerHp: document.getElementById('player-hp'),
      playerHpBar: document.getElementById('player-hp-bar'),
      
      // 投手狀態
      pitcherHp: document.getElementById('pitcher-hp'),
      pitcherHpBar: document.getElementById('pitcher-hp-bar'),
      pitcherAttack: document.getElementById('pitcher-attack'),
      pitcherAttribute: document.getElementById('pitcher-attribute'),
      pitcherStage: document.getElementById('pitcher-stage'),
      
      // 手牌和牌庫
      handContainer: document.getElementById('hand-container'),
      deckCount: document.getElementById('deck-count'),
      discardCount: document.getElementById('discard-count'),
      
      // 戰鬥區域
      strikeZone: document.getElementById('strike-zone'),
      supportZone: document.getElementById('support-zone'),
      spellZone: document.getElementById('spell-zone'),
      
      // 控制按鈕
      attackBtn: document.getElementById('attack-btn'),
      endTurnBtn: document.getElementById('end-turn-btn'),
      resetBtn: document.getElementById('reset-btn'),
      
      // 遊戲信息
      turnCounter: document.getElementById('turn-counter'),
      gamePhase: document.getElementById('game-phase'),
      gameLog: document.getElementById('game-log')
    };
    
    const missingElements = Object.entries(this.elements)
      .filter(([key, element]) => !element)
      .map(([key]) => key);
    
    if (missingElements.length > 0) {
      console.warn('⚠️ 缺少UI元素:', missingElements);
      missingElements.forEach(elementName => {
        this.elements[elementName] = this.createDummyElement(elementName);
      });
    }
    
    console.log('✅ UI元素初始化完成');
    this.isInitialized = true;
  }

  /**
   * 🔧 創建虛擬元素
   * 用一個簡單的物件模擬 DOM 元素，避免後續操作因 null 而報錯。
   */
  createDummyElement(elementName) {
    console.log(`🔧 創建虛擬元素: ${elementName}`);
    return {
      textContent: '',
      innerHTML: '',
      style: {},
      className: '',
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      addEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      remove: () => {},
      scrollTop: 0,
      scrollHeight: 0,
      children: { length: 0 },
      dataset: { isDummy: true } // 添加標記以供識別
    };
  }

  /**
   * 🎨 設置CSS樣式
   */
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 卡牌懸停效果 */
      .card-hover {
        transition: all 0.3s ease;
        transform-origin: center bottom;
      }
      .card-hover:hover {
        transform: translateY(-8px) scale(1.05);
        z-index: 100;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      }
      /* 拖拽區域效果 */
      .drag-over {
        background-color: rgba(59, 130, 246, 0.2) !important;
        border: 2px dashed #3b82f6 !important;
        transform: scale(1.02);
      }
      /* 手牌動畫 */
      .hand-card {
        animation: cardDraw 0.5s ease-out forwards;
      }
      @keyframes cardDraw {
        from { opacity: 0; transform: translateY(20px) scale(0.8); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      /* 傷害數字動畫 */
      .damage-number {
        animation: damageFloat 2s ease-out forwards;
        font-weight: bold; font-size: 1.5rem; pointer-events: none;
      }
      @keyframes damageFloat {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        50% { transform: translateY(-30px) scale(1.2); }
        100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
      }
      /* 治療數字動畫 */
      .heal-number {
        animation: healFloat 2s ease-out forwards;
        font-weight: bold; font-size: 1.5rem; color: #10b981; pointer-events: none;
      }
      @keyframes healFloat {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        50% { transform: translateY(-20px) scale(1.1); }
        100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 🔄 更新整個UI
   */
  updateUI(gameState) {
    if (!this.isInitialized) {
      console.warn('⚠️ UI管理器尚未初始化，無法更新。');
      return;
    }

    this.updatePlayerStatus(gameState);
    this.updatePitcherStatus(gameState);
    this.updateHandDisplay(gameState);
    this.updateBattleZones(gameState);
    this.updateGameInfo(gameState);
    this.updateCounters(gameState);
  }

  /**
   * 💚 更新玩家狀態顯示
   */
  updatePlayerStatus(gameState) {
    const player = gameState.player;
    if (this.elements.playerHp) {
      this.elements.playerHp.textContent = `${player.current_hp}/${player.max_hp}`;
    }
    if (this.elements.playerHpBar) {
      const percentage = (player.current_hp / player.max_hp) * 100;
      this.elements.playerHpBar.style.width = `${percentage}%`;
      
      if (percentage > 60) {
        this.elements.playerHpBar.className = 'bg-green-500 h-full transition-all duration-300';
      } else if (percentage > 30) {
        this.elements.playerHpBar.className = 'bg-yellow-500 h-full transition-all duration-300';
      } else {
        this.elements.playerHpBar.className = 'bg-red-500 h-full transition-all duration-300 animate-pulse';
      }
    }
  }

  /**
   * 👹 更新投手狀態顯示
   */
  updatePitcherStatus(gameState) {
    const pitcher = gameState.pitcher;
    if (this.elements.pitcherHp) {
      this.elements.pitcherHp.textContent = `${pitcher.current_hp}/${pitcher.max_hp}`;
    }
    if (this.elements.pitcherHpBar) {
      const percentage = (pitcher.current_hp / pitcher.max_hp) * 100;
      this.elements.pitcherHpBar.style.width = `${percentage}%`;
    }
    if (this.elements.pitcherAttack) {
      this.elements.pitcherAttack.textContent = pitcher.current_attack;
    }
    if (this.elements.pitcherAttribute) {
      this.elements.pitcherAttribute.textContent = pitcher.attribute;
    }
  }

  /**
   * 🎴 更新手牌顯示
   */
  updateHandDisplay(gameState) {
    if (!this.elements.handContainer) return;
    
    const hand = gameState.player.hand;
    if (hand.length === 0) {
      this.elements.handContainer.innerHTML = `
        <div class="text-center text-orange-300 py-8">
          <p class="text-lg">手牌為空</p>
          <p class="text-sm">等待抽牌階段</p>
        </div>
      `;
      return;
    }
    
    this.elements.handContainer.innerHTML = hand.map((card, index) => 
      this.renderCard(card, index)
    ).join('');
    
    this.bindCardDragEvents();
  }

  /**
   * 🎨 渲染卡牌HTML
   */
  renderCard(card, index) {
    const cardClasses = this.generateCardClasses(card.attribute, card.rarity);
    const animationDelay = (index >= 0 && index < 7) ? index * 0.1 : 0;
    
    return `
      <div class="${cardClasses} ${index >= 0 ? 'hand-card' : ''}" 
           draggable="true" 
           data-card-index="${index}" 
           style="animation-delay: ${animationDelay}s">
        
        <div class="text-center mb-2">
          <div class="font-bold text-sm mb-1">${card.name}</div>
          <div class="text-[10px] opacity-80 bg-black/20 px-2 py-1 rounded">
            ${card.attribute} • ${card.type}
          </div>
        </div>
        
        <div class="flex justify-between items-center mb-2">
          <div class="text-center">
            <div class="text-xs opacity-75">攻擊</div>
            <div class="font-bold text-lg text-red-300">
              ${card.stats?.attack || 0}${card.tempAttack ? `+${card.tempAttack}` : ''}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xs opacity-75">暴擊</div>
            <div class="font-bold text-lg text-yellow-300">
              ${card.stats?.crit || 0}%
            </div>
          </div>
        </div>
        
        <div class="text-[9px] leading-tight opacity-90 bg-black/20 p-2 rounded text-center">
          ${card.description || '無效果'}
        </div>
        
        ${card.rarity === 'legendary' ? '<div class="absolute top-1 right-1 text-yellow-400">★</div>' : ''}
        ${card.rarity === 'rare' ? '<div class="absolute top-1 right-1 text-blue-400">◆</div>' : ''}
      </div>
    `;
  }

  /**
   * 🎨 生成卡牌CSS類名
   */
  generateCardClasses(attribute, rarity) {
    const baseClasses = 'relative w-28 h-36 rounded-xl p-3 text-xs cursor-pointer card-hover flex flex-col justify-between';
    const attributeColors = {
      human: 'bg-orange-700 text-orange-100',
      yin: 'bg-purple-800 text-purple-100',
      yang: 'bg-yellow-600 text-yellow-100',
      heaven: 'bg-blue-700 text-blue-100',
      earth: 'bg-green-700 text-green-100'
    };
    const rarityStyles = {
      common: '',
      rare: 'shadow-lg ring-2 ring-blue-400/50',
      legendary: 'shadow-xl ring-2 ring-yellow-400/50 animate-glow'
    };
    
    const colors = attributeColors[attribute] || attributeColors.human;
    const effects = rarityStyles[rarity] || rarityStyles.common;
    
    return `${baseClasses} ${colors} ${effects}`;
  }

  /**
   * 🖱️ 綁定卡牌拖拽事件
   */
  bindCardDragEvents() {
    const cards = document.querySelectorAll('[data-card-index]');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.closest('[data-card-index]').dataset.cardIndex);
        e.target.style.opacity = '0.5';
      });
      
      card.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
      });
    });
  }

  /**
   * ⚔️ 更新戰鬥區域
   */
  updateBattleZones(gameState) {
    const zones = [
      { element: this.elements.strikeZone, card: gameState.player.strike_zone, icon: '🗡️', name: '打擊' },
      { element: this.elements.supportZone, card: gameState.player.support_zone, icon: '🛡️', name: '輔助' },
      { element: this.elements.spellZone, card: gameState.player.spell_zone, icon: '✨', name: '法術' }
    ];
    
    zones.forEach(({ element, card, icon, name }) => {
      if (!element || element.dataset?.isDummy) return;
      
      if (card) {
        element.innerHTML = this.renderCard(card, -1); // -1 表示不在手牌中
        element.classList.add('card-zone-occupied');
      } else {
        element.innerHTML = `
          <div class="text-center text-orange-300 h-full flex flex-col items-center justify-center">
            <div class="text-3xl mb-2">${icon}</div>
            <div class="text-sm">拖拽${name}卡到此處</div>
          </div>
        `;
        element.classList.remove('card-zone-occupied');
      }
    });
  }

  /**
   * ℹ️ 更新遊戲信息
   */
  updateGameInfo(gameState) {
    if (this.elements.turnCounter) {
      this.elements.turnCounter.textContent = gameState.turnCount;
    }
    if (this.elements.gamePhase) {
      const phaseNames = {
        'DRAW_PHASE': '抽牌階段',
        'PLAY_PHASE': '出牌階段',
        'COMBAT_PHASE': '戰鬥階段',
        'END_PHASE': '結束階段'
      };
      this.elements.gamePhase.textContent = phaseNames[gameState.gamePhase] || gameState.gamePhase;
    }
  }

  /**
   * 🔢 更新計數器
   */
  updateCounters(gameState) {
    if (this.elements.deckCount) {
      this.elements.deckCount.textContent = gameState.player.deck.length;
    }
    if (this.elements.discardCount) {
      this.elements.discardCount.textContent = gameState.player.discard_pile.length;
    }
  }

  /**
   * 📝 添加遊戲日誌
   */
  addLogEntry(message, type = 'info') {
    if (!this.elements.gameLog || this.elements.gameLog.dataset?.isDummy) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const typeClass = {
      'info': 'text-gray-600',
      'success': 'text-green-600',
      'damage': 'text-red-600',
      'system': 'text-blue-600'
    }[type] || 'text-gray-600';
    
    const logEntry = document.createElement('div');
    logEntry.className = `text-sm py-1 ${typeClass}`;
    logEntry.innerHTML = `<span class="text-gray-400 text-xs">[${timestamp}]</span> ${message}`;
    
    this.elements.gameLog.appendChild(logEntry);
    this.elements.gameLog.scrollTop = this.elements.gameLog.scrollHeight;
    
    const maxEntries = 50;
    while (this.elements.gameLog.children.length > maxEntries) {
      this.elements.gameLog.removeChild(this.elements.gameLog.firstChild);
    }
  }

  /**
   * ⚡ 觸發卡牌放置效果
   */
  async triggerCardPlacementEffects(card, zoneType, gameState) {
    try {
        const effectMap = {
            'spell_zone': { effect: card.effects?.on_play, icon: '✨', name: '法術' },
            'strike_zone': { effect: card.effects?.on_strike, icon: '⚔️', name: '打擊' },
            'support_zone': { effect: card.effects?.on_support, icon: '🛡️', name: '輔助' }
        };

        const currentEffect = effectMap[zoneType];

        if (currentEffect && typeof currentEffect.effect === 'function') {
            console.log(`${currentEffect.icon} 觸發 ${card.name} 的${currentEffect.name}效果`);
            const result = await currentEffect.effect.call(card, gameState);
            if (result && result.success) {
                this.addLogEntry(`${currentEffect.icon} ${result.description}`, 'success');
                console.log(`✅ ${currentEffect.name}效果成功: ${result.description}`);
            } else {
                console.warn(`❌ ${currentEffect.name}效果失敗或無返回值:`, result);
            }
        }
    } catch (error) {
        console.error(`❌ 觸發 ${card.name} 效果時出錯:`, error);
        this.addLogEntry(`❌ ${card.name} 效果執行失敗`, 'system');
    }
  }
}