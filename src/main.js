// main.js - 最終整合版

class MyGoTCGApplication {
  constructor() {
    console.log('🎸 MyGO!!!!! TCG 完整版本 初始化中...');
    
    this.gameState = null;
    this.isInitialized = false;
    this.isGameRunning = false;
    this.ui = { elements: {}, handContainer: null, gameLog: null };
    
    // 初始大師牌組模板
    this.masterDeckTemplate = [
      // 人類卡牌
      'president', 'president', 'kindness', 'kindness', 'hero', 'hero', 'hero',
      'strongman', 'strongman', 'democracy', 'democracy', 'lottery', 'lottery',
      'simple_folk', 'simple_folk', 'flesh', 'flesh', 'inheritance', 'legacy',
      'culture', 'patience', 'unity', 'help_stream', 'benevolent_legacy',
      'communism', 'multiculture', 'prosperity', 'master', 'head_pat',
      // 陰屬性卡牌
      'shadow_devour', 'lone_shadow', 'evil_genius', 'ambush', 'time_stop',
      // 陽屬性卡牌
      'weapon_master', 'holy_light', 'yinyang_harmony'
    ];

    // 賽季系統
    this.seasonData = {
      currentBattle: 1,
      totalBattles: 15,
      battlesWon: 0,
      playerMaxHP: 100,
      masterDeck: [...this.masterDeckTemplate] // 當前賽季的牌組
    };
  }

  async initialize() {
    console.log('🔧 正在初始化系統...');
    
    try {
      this.initializeUIElements();
      this.initializeCardLibrary();
      this.connectUIEvents();
      this.setupDragAndDrop();
      
      this.isInitialized = true;
      console.log('✅ 完整版本初始化完成！');
      
    } catch (error) {
      console.error('❌ 應用程序初始化失敗:', error);
      throw error;
    }
  }

  initializeUIElements() {
    this.ui.elements = {
      playerHp: document.getElementById('player-hp'),
      playerHpBar: document.getElementById('player-hp-bar'),
      pitcherHp: document.getElementById('pitcher-hp'),
      pitcherHpBar: document.getElementById('pitcher-hp-bar'),
      pitcherAttack: document.getElementById('pitcher-attack'),
      pitcherAttribute: document.getElementById('pitcher-attribute'),
      handContainer: document.getElementById('hand-container'),
      deckCount: document.getElementById('deck-count'),
      discardCount: document.getElementById('discard-count'),
      strikeZone: document.getElementById('strike-zone'),
      supportZone: document.getElementById('support-zone'),
      spellZone: document.getElementById('spell-zone'),
      attackBtn: document.getElementById('attack-btn'),
      endTurnBtn: document.getElementById('end-turn-btn'),
      resetBtn: document.getElementById('reset-btn'),
      turnCounter: document.getElementById('turn-counter'),
      gamePhase: document.getElementById('game-phase'),
      gameLog: document.getElementById('game-log')
    };
    
    this.ui.handContainer = this.ui.elements.handContainer;
    this.ui.gameLog = this.ui.elements.gameLog;
    
    console.log('🎨 UI元素初始化完成');
  }

  setupDragAndDrop() {
    const dropZones = [
      { element: this.ui.elements.strikeZone, zone: 'strike_zone', name: '打擊區' },
      { element: this.ui.elements.supportZone, zone: 'support_zone', name: '輔助區' },
      { element: this.ui.elements.spellZone, zone: 'spell_zone', name: '法術區' }
    ];

    dropZones.forEach(({ element, zone, name }) => {
      if (!element) return;

      element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('drag-over');
      });

      element.addEventListener('dragleave', () => {
        element.classList.remove('drag-over');
      });

      element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('drag-over');
        
        const cardIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(cardIndex)) {
          this.playCard(cardIndex, zone);
        }
      });

      // 雙擊區域移除卡牌（撤銷功能）
      element.addEventListener('dblclick', () => {
        this.removeCardFromZone(zone);
      });
    });

    console.log('🖱️ 拖拽功能已啟用');
  }

  setupCardDragEvents() {
    const cards = this.ui.handContainer.querySelectorAll('[data-card-index]');
    cards.forEach(card => {
      card.setAttribute('draggable', 'true');
      
      card.addEventListener('dragstart', (e) => {
      // 確保從正確的目標獲取 data-card-index
      const targetCard = e.target.closest('.hand-card');
      if (targetCard) {
        e.dataTransfer.setData('text/plain', targetCard.dataset.cardIndex);
        targetCard.style.opacity = '0.5';
      }
      });
      
      card.addEventListener('dragend', (e) => {
      const targetCard = e.target.closest('.hand-card');
      if (targetCard) {
        targetCard.style.opacity = '1';
      }
      });

      card.addEventListener('click', (e) => {
      const targetCard = e.target.closest('.hand-card');
      if (targetCard) {
        const cardIndex = parseInt(targetCard.dataset.cardIndex);
        this.showCardPlacementMenu(cardIndex);
      }
      });
    });
  }

  /**
   * 📚 完整卡牌庫
   */
  initializeCardLibrary() {
    this.cardLibrary = {
      // === 人類卡牌 (29張) ===
      president: { id: 'president', name: '總統', type: 'batter', attribute: 'human', rarity: 'common', stats: { hp_bonus: 15, attack: 20, crit: 30 }, description: '打擊：每有一張人屬性卡，攻擊力+1', effect: (gameState) => { const humanCount = this.countHumanCards(gameState); return { attackBonus: humanCount, description: `人屬性卡數量: ${humanCount}，攻擊力+${humanCount}` }; }},
      kindness: { id: 'kindness', name: '慈愛', type: 'support', attribute: 'human', rarity: 'common', stats: { hp_bonus: 10, attack: 15, crit: 40 }, description: '輔助：本回合所有人屬性打者攻擊力+10', effect: (gameState) => { gameState.turnBuffs.push({ type: 'human_attack_boost', value: 10 }); return { description: '本回合人屬性打者攻擊力+10' }; }},
      hero: { id: 'hero', name: '英雄', type: 'batter', attribute: 'human', rarity: 'common', stats: { hp_bonus: 5, attack: 25, crit: 50 }, description: '無特殊效果的純粹戰士', effect: null },
      strongman: { id: 'strongman', name: '壯漢', type: 'batter', attribute: 'human', rarity: 'common', stats: { hp_bonus: 20, attack: 30, crit: 20 }, description: '高攻擊力，低暴擊的穩定輸出', effect: null },
      democracy: { id: 'democracy', name: '民主', type: 'support', attribute: 'human', rarity: 'common', stats: { hp_bonus: 10, attack: 18, crit: 35 }, description: '輔助：抽1張牌', effect: (gameState) => { this.drawCard(gameState); return { description: '抽了1張牌' }; }},
      lottery: { id: 'lottery', name: '樂透', type: 'spell', attribute: 'human', rarity: 'common', stats: { hp_bonus: 8, attack: 0, crit: 0 }, description: '法術：抽2張牌', effect: (gameState) => { let drawn = 0; for (let i = 0; i < 2; i++) { if (this.drawCard(gameState)) drawn++; } return { description: `抽了${drawn}張牌` }; }},
      simple_folk: { id: 'simple_folk', name: '民風淳樸', type: 'batter', attribute: 'human', rarity: 'common', stats: { hp_bonus: 13, attack: 27, crit: 50 }, description: '高攻擊力的基礎打者', effect: null },
      flesh: { id: 'flesh', name: '肉塊', type: 'batter', attribute: 'human', rarity: 'common', stats: { hp_bonus: 20, attack: 8, crit: 50 }, description: '高血量的肉盾打者', effect: null },
      inheritance: { id: 'inheritance', name: '傳承', type: 'deathrattle', attribute: 'human', rarity: 'common', stats: { hp_bonus: 10, attack: 8, crit: 35 }, description: '死聲：抽1張牌', effect: null },
      legacy: { id: 'legacy', name: '遺產', type: 'deathrattle', attribute: 'human', rarity: 'common', stats: { hp_bonus: 9, attack: 5, crit: 50 }, description: '死聲：抽1張卡牌', effect: null },
      culture: { id: 'culture', name: '文化脈絡', type: 'spell', attribute: 'human', rarity: 'common', stats: { hp_bonus: 12, attack: 0, crit: 0 }, description: '法術：抽1張任意卡牌', effect: (gameState) => { if (this.drawCard(gameState)) { return { description: '抽了1張卡牌' }; } return { description: '牌庫為空' }; }},
      patience: { id: 'patience', name: '忍耐', type: 'spell', attribute: 'human', rarity: 'common', stats: { hp_bonus: 10, attack: 0, crit: 0 }, description: '法術：本回合減少10點所受傷害', effect: (gameState) => { gameState.turnBuffs.push({ type: 'damage_reduction', value: 10 }); return { description: '本回合減少10點所受傷害' }; }},
      unity: { id: 'unity', name: '團結', type: 'spell', attribute: 'human', rarity: 'common', stats: { hp_bonus: 11, attack: 0, crit: 0 }, description: '法術：本回合人屬性打者卡攻擊力+8', effect: (gameState) => { gameState.turnBuffs.push({ type: 'human_attack_boost', value: 8 }); return { description: '人屬性打者卡攻擊力+8' }; }},
      help_stream: { id: 'help_stream', name: '幫我開直播', type: 'deathrattle', attribute: 'human', rarity: 'rare', stats: { hp_bonus: 12, attack: 5, crit: 35 }, description: '死聲：你的人屬性打者卡+5攻擊力', effect: null },
      benevolent_legacy: { id: 'benevolent_legacy', name: '仁道傳承', type: 'batter', attribute: 'human', rarity: 'rare', stats: { hp_bonus: 10, attack: 35, crit: 35 }, description: '打擊：若場上有陰或陽屬性卡，攻擊力+20', effect: (gameState, card) => { const hasYinYang = this.checkFieldForAttributes(gameState, ['yin', 'yang']); if (hasYinYang) { card.tempAttack = (card.tempAttack || 0) + 20; return { description: '場上有陰/陽屬性，攻擊力+20' }; } return { description: '場上無陰/陽屬性卡' }; }},
      communism: { id: 'communism', name: '共產主義', type: 'spell', attribute: 'human', rarity: 'rare', stats: { hp_bonus: 10, attack: 0, crit: 0 }, description: '法術：若我方血量低於敵方，則回復血量至與敵方相同', effect: (gameState) => { const playerHP = gameState.player.current_hp; const enemyHP = gameState.pitcher.current_hp; if (playerHP < enemyHP) { const healAmount = Math.min(enemyHP - playerHP, gameState.player.max_hp - playerHP); gameState.player.current_hp += healAmount; return { description: `回復${healAmount}點血量，追平敵方` }; } return { description: '血量不低於敵方' }; }},
      multiculture: { id: 'multiculture', name: '多元文化', type: 'batter', attribute: 'human', rarity: 'rare', stats: { hp_bonus: 10, attack: 10, crit: 70 }, description: '輔助：若場上存在≥3種屬性，手牌中人屬性打者+10攻擊', effect: (gameState) => { const attributeCount = this.countFieldAttributes(gameState); if (attributeCount >= 3) { gameState.turnBuffs.push({ type: 'human_hand_boost', value: 10 }); return { description: `場上${attributeCount}種屬性，人屬打者+10攻擊` }; } return { description: `場上屬性種類不足(${attributeCount}/3)` }; }},
      prosperity: { id: 'prosperity', name: '共榮', type: 'batter', attribute: 'human', rarity: 'rare', stats: { hp_bonus: 10, attack: 8, crit: 25 }, description: '輔助：若場上存在≥3種屬性，人屬性打者+15攻擊力', effect: (gameState) => { const attributeCount = this.countFieldAttributes(gameState); if (attributeCount >= 3) { gameState.turnBuffs.push({ type: 'human_attack_boost', value: 15 }); return { description: `場上${attributeCount}種屬性，人屬打者+15攻擊力` }; } return { description: `場上屬性種類不足(${attributeCount}/3)` }; }},
      master: { id: 'master', name: '集大成者', type: 'batter', attribute: 'human', rarity: 'legendary', stats: { hp_bonus: 10, attack: 10, crit: 25 }, description: '打擊：牌組中每有一張人屬性卡，攻擊力+1', effect: (gameState, card) => { const humanCount = this.countHumanCards(gameState); card.tempAttack = (card.tempAttack || 0) + humanCount; return { description: `人屬性卡數量: ${humanCount}，攻擊力+${humanCount}` }; }},
      head_pat: { id: 'head_pat', name: '摸頭', type: 'spell', attribute: 'human', rarity: 'legendary', stats: { hp_bonus: 15, attack: 0, crit: 0 }, description: '法術：抽3張卡，其中每張人屬性卡+5攻擊力', effect: (gameState) => { let drawnCards = 0; let humanBoosted = 0; for (let i = 0; i < 3; i++) { if (this.drawCard(gameState)) { drawnCards++; const lastCard = gameState.player.hand[gameState.player.hand.length - 1]; if (lastCard.attribute === 'human') { lastCard.permanentBonus = (lastCard.permanentBonus || 0) + 5; humanBoosted++; }}} return { description: `抽了${drawnCards}張卡，${humanBoosted}張人屬卡+5攻擊力` }; }},
      // === 陰屬性卡牌 (5張) ===
      shadow_devour: { id: 'shadow_devour', name: '暗影吞噬', type: 'batter', attribute: 'yin', rarity: 'common', stats: { hp_bonus: 8, attack: 28, crit: 60 }, description: '輔助：投手攻擊力-3', effect: (gameState) => { gameState.pitcher.current_attack -= 3; return { description: '投手攻擊力-3' }; }},
      lone_shadow: { id: 'lone_shadow', name: '孤影', type: 'batter', attribute: 'yin', rarity: 'common', stats: { hp_bonus: 6, attack: 22, crit: 80 }, description: '高暴擊率的刺客型卡牌', effect: null },
      evil_genius: { id: 'evil_genius', name: '邪惡天才', type: 'batter', attribute: 'yin', rarity: 'rare', stats: { hp_bonus: 10, attack: 26, crit: 45 }, description: '打擊：吸取投手5點攻擊力', effect: (gameState, card) => { gameState.pitcher.current_attack -= 5; card.tempAttack = (card.tempAttack || 0) + 5; return { description: '吸取投手5點攻擊力' }; }},
      ambush: { id: 'ambush', name: '偷襲', type: 'batter', attribute: 'yin', rarity: 'rare', stats: { hp_bonus: 6, attack: 10, crit: 35 }, description: '輔助：直接降低投手10點血量', effect: (gameState) => { gameState.pitcher.current_hp -= 10; gameState.pitcher.current_hp = Math.max(0, gameState.pitcher.current_hp); return { description: '直接對投手造成10點傷害' }; }},
      time_stop: { id: 'time_stop', name: '時間暫停', type: 'spell', attribute: 'yin', rarity: 'legendary', stats: { hp_bonus: 10, attack: 0, crit: 0 }, description: '法術：投手跳過他的下一個回合', effect: (gameState) => { gameState.pitcher.skipNextTurn = true; return { description: '投手將跳過下一回合' }; }},
      // === 陽屬性卡牌 (3張) ===
      weapon_master: { id: 'weapon_master', name: '武器大師', type: 'batter', attribute: 'yang', rarity: 'common', stats: { hp_bonus: 8, attack: 8, crit: 70 }, description: '輔助：手牌中每有一種不同屬性，打者攻擊力+5', effect: (gameState) => { const attributes = new Set(); gameState.player.hand.forEach(card => attributes.add(card.attribute)); const boost = attributes.size * 5; gameState.turnBuffs.push({ type: 'batter_attack_boost', value: boost }); return { description: `手牌${attributes.size}種屬性，打者攻擊力+${boost}` }; }},
      holy_light: { id: 'holy_light', name: '聖光', type: 'spell', attribute: 'yang', rarity: 'common', stats: { hp_bonus: 8, attack: 0, crit: 0 }, description: '法術：回復15點生命值', effect: (gameState) => { const healAmount = Math.min(15, gameState.player.max_hp - gameState.player.current_hp); gameState.player.current_hp += healAmount; return { description: `回復${healAmount}點生命值` }; }},
      yinyang_harmony: { id: 'yinyang_harmony', name: '陰陽調和', type: 'batter', attribute: 'yang', rarity: 'rare', stats: { hp_bonus: 0, attack: 20, crit: 25 }, description: '打擊：若場上有陰或陽屬性卡，攻擊力+20', effect: (gameState, card) => { const hasYinYang = this.checkFieldForAttributes(gameState, ['yin', 'yang']); if (hasYinYang) { card.tempAttack = (card.tempAttack || 0) + 20; return { description: '場上有陰/陽屬性，攻擊力+20' }; } return { description: '場上無陰/陽屬性卡' }; }}
    };
    
    console.log('📚 完整卡牌庫載入完成');
  }

  /**
   * ↩️ 撤銷卡牌放置
   */
  removeCardFromZone(zone) {
    const card = this.gameState.player[zone];
    if (!card) {
      this.addLogEntry('❌ 該區域沒有卡牌', 'system');
      return;
    }

    // 將卡牌放回手牌
    this.gameState.player.hand.push(card);
    this.gameState.player[zone] = null;
    
    // 清除臨時效果
    if (card.tempAttack) {
      card.tempAttack = 0;
    }

    this.addLogEntry(`↩️ 撤回 ${card.name}`, 'success');
    this.updateUI();
  }

  /**
   * 🎴 創建當前賽季牌組
   */
  createDeckForBattle() {
    return this.seasonData.masterDeck.map(cardId => {
      const template = this.cardLibrary[cardId];
      if (!template) {
        console.warn(`牌庫中找不到ID為 "${cardId}" 的卡牌。`);
        return null;
      }
      return { ...template, tempAttack: 0, permanentBonus: 0 };
    }).filter(Boolean); // 過濾掉找不到的卡牌
  }

  /**
   * 🎨 改進的卡牌渲染 - 更好的視覺識別
   */
  renderCard(card, index) {
    // 屬性顏色
    const attributeColors = {
      human: 'bg-orange-700 text-orange-100 border-orange-500',
      yin: 'bg-purple-800 text-purple-100 border-purple-500',
      yang: 'bg-yellow-600 text-yellow-100 border-yellow-500'
    };
    
    // 稀有度效果
    const rarityEffects = {
      common: '',
      rare: 'ring-2 ring-blue-400/50 shadow-lg',
      legendary: 'ring-2 ring-yellow-400/50 shadow-xl animate-pulse'
    };
    
    // 類型圖標
    const typeIcons = {
      batter: '⚔️',
      support: '🛡️',
      spell: '✨',
      deathrattle: '💀'
    };
    
    const cardClass = attributeColors[card.attribute] || attributeColors.human;
    const rarityClass = rarityEffects[card.rarity] || '';
    const typeIcon = typeIcons[card.type] || '🎴';
    
    return `
      <div class="${cardClass} ${rarityClass} relative w-20 h-28 md:w-28 md:h-36 rounded-xl p-2 text-xs cursor-pointer card-hover flex flex-col justify-between hand-card border-2" 
           data-card-index="${index}"
           draggable="true">
        
                ${card.rarity === 'legendary' ? '<div class="absolute -top-1 -right-1 text-yellow-400 text-lg animate-spin">★</div>' : ''}
        ${card.rarity === 'rare' ? '<div class="absolute top-0 right-0 text-blue-400 text-sm">◆</div>' : ''}
        
                <div class="absolute top-0 left-0 text-lg">${typeIcon}</div>
        
        <div class="text-center mb-1 mt-2">
          <div class="font-bold text-xs mb-1">${card.name}</div>
          <div class="text-[8px] opacity-80">${card.attribute}</div>
        </div>
        
        <div class="flex justify-between items-center mb-1">
          <div class="text-center">
            <div class="text-[8px] opacity-75">ATK</div>
            <div class="font-bold text-sm ${card.stats.attack > 25 ? 'text-red-200' : 'text-red-300'}">
              ${card.stats.attack}${card.tempAttack ? `+${card.tempAttack}` : ''}${card.permanentBonus ? `+${card.permanentBonus}` : ''}
            </div>
          </div>
          <div class="text-center">
            <div class="text-[8px] opacity-75">CRIT</div>
            <div class="font-bold text-sm ${card.stats.crit > 60 ? 'text-yellow-200' : 'text-yellow-300'}">
              ${card.stats.crit}%
            </div>
          </div>
        </div>
        
        <div class="text-[7px] leading-tight opacity-90 bg-black/20 p-1 rounded text-center">
          ${card.type === 'spell' ? '⚡' : ''}${card.description.substring(0, 18)}${card.description.length > 18 ? '...' : ''}
        </div>
        
                ${card.stats.hp_bonus > 0 ? `<div class="absolute bottom-0 left-0 text-[8px] bg-green-600/80 px-1 rounded">+${card.stats.hp_bonus}❤️</div>` : ''}
      </div>
    `;
  }

  /**
   * 🔗 連接UI事件 - 添加撤銷與重啟賽季按鈕
   */
  connectUIEvents() {
    // 隱藏舊的攻擊按鈕
    if (this.ui.elements.attackBtn) {
      this.ui.elements.attackBtn.style.display = 'none';
    }

    // 結束回合按鈕
    this.ui.elements.endTurnBtn?.addEventListener('click', () => {
      this.endTurn();
    });

    // 將重置按鈕改為「撤銷」功能
    if (this.ui.elements.resetBtn) {
      this.ui.elements.resetBtn.innerHTML = '↩️ 撤銷';
      this.ui.elements.resetBtn.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors';
      this.ui.elements.resetBtn.addEventListener('click', () => {
        this.undoLastAction();
      });
    }

    // 動態添加「重新開始賽季」按鈕
    const buttonContainer = this.ui.elements.resetBtn?.parentElement;
    if (buttonContainer && !document.getElementById('restart-season-btn')) {
      const restartBtn = document.createElement('button');
      restartBtn.id = 'restart-season-btn';
      restartBtn.innerHTML = '🔄 重新開始賽季';
      restartBtn.className = 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors';
      restartBtn.addEventListener('click', () => {
        this.restartSeason();
      });
      buttonContainer.appendChild(restartBtn);
    }

    console.log('🔗 UI事件連接完成');
  }

  /**
   * ↩️ 撤銷最後一次動作
   */
  undoLastAction() {
    let undone = false;
    const zones = ['spell_zone', 'support_zone', 'strike_zone'];
    
    for (const zone of zones) {
      if (this.gameState.player[zone]) {
        this.removeCardFromZone(zone);
        undone = true;
        break; // 每次只撤銷一張卡
      }
    }
    
    if (!undone) {
      this.addLogEntry('❌ 沒有可撤銷的動作', 'system');
    }
  }

  /**
   * 🎯 檢查場上是否有指定屬性
   */
  checkFieldForAttributes(gameState, attributes) {
    const fieldCards = [
      gameState.player.strike_zone,
      gameState.player.support_zone,
      gameState.player.spell_zone
    ].filter(Boolean);

    return fieldCards.some(card => attributes.includes(card.attribute));
  }

  /**
   * 🎨 計算場上屬性種類數量
   */
  countFieldAttributes(gameState) {
    const attributes = new Set();
    const fieldCards = [
      gameState.player.strike_zone,
      gameState.player.support_zone,
      gameState.player.spell_zone
    ].filter(Boolean);

    fieldCards.forEach(card => {
      if (card && card.attribute) {
        attributes.add(card.attribute);
      }
    });

    return attributes.size;
  }

  /**
   * 📱 改進的卡牌放置選單 (適用於行動裝置)
   */
  showCardPlacementMenu(cardIndex) {
    const card = this.gameState.player.hand[cardIndex];
    if (!card) return;

    const validZones = this.getValidZonesForCard(card);
    if (validZones.length === 0) {
        this.addLogEntry('ℹ️ 這張卡沒有可以放置的區域', 'system');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-orange-800 rounded-lg p-4 mx-4 max-w-sm">
        <div class="text-center mb-4">
          <div class="text-2xl mb-2">${this.getCardTypeIcon(card)}</div>
          <h3 class="text-lg font-bold text-orange-100">放置 ${card.name}</h3>
          <div class="text-sm text-orange-200">${card.description}</div>
          ${card.rarity === 'legendary' ? '<div class="text-yellow-400 text-sm">★ 傳說卡牌 ★</div>' : ''}
          ${card.rarity === 'rare' ? '<div class="text-blue-400 text-sm">◆ 稀有卡牌</div>' : ''}
        </div>
        
        <div class="space-y-2">
          ${validZones.map(zone => this.renderZoneButton(zone, cardIndex)).join('')}
          
          <button onclick="this.closest('.fixed').remove()" 
                  class="w-full bg-gray-500 text-white py-2 rounded-lg">
            ❌ 取消
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    window.playCard = (cardIndex, zone) => {
      modal.remove();
      this.playCard(cardIndex, zone);
    };
  }

  /**
   * 🎭 獲取卡牌類型圖標
   */
  getCardTypeIcon(card) {
    const icons = { batter: '⚔️', support: '🛡️', spell: '✨', deathrattle: '💀' };
    return icons[card.type] || '🎴';
  }

  /**
   * 🎯 獲取卡牌有效放置區域
   */
  getValidZonesForCard(card) {
    const zones = [];
    
    switch (card.type) {
      case 'batter':
      case 'deathrattle': // 死聲卡也可以是打者或輔助
        if (!this.gameState.player.strike_zone) zones.push({ id: 'strike_zone', name: '打擊區', icon: '🗡️', color: 'bg-red-500' });
        if (!this.gameState.player.support_zone) zones.push({ id: 'support_zone', name: '輔助區', icon: '🛡️', color: 'bg-blue-500' });
        break;
      case 'support':
        if (!this.gameState.player.support_zone) zones.push({ id: 'support_zone', name: '輔助區', icon: '🛡️', color: 'bg-blue-500' });
        break;
      case 'spell':
        if (!this.gameState.player.spell_zone) zones.push({ id: 'spell_zone', name: '法術區', icon: '✨', color: 'bg-purple-500' });
        break;
    }
    
    return zones;
  }

  /**
   * 🎨 渲染區域按鈕
   */
  renderZoneButton(zone, cardIndex) {
    return `
      <button onclick="window.playCard(${cardIndex}, '${zone.id}')" 
              class="w-full ${zone.color} hover:opacity-80 text-white py-3 rounded-lg transition-all">
        ${zone.icon} ${zone.name}
      </button>
    `;
  }

  /**
   * ⚔️ 執行自動攻擊 - 應用所有Buff
   */
  executeAutoAttack() {
    const strikeCard = this.gameState.player.strike_zone;
    if (!strikeCard) return;

    let totalAttack = 0;
    let totalCrit = 0;

    // 觸發打擊區卡牌的 "打擊" 效果
    if (strikeCard.effect && strikeCard.type === 'batter') {
        this.triggerCardEffect(strikeCard, '打擊');
    }

    // 計算打擊區卡牌的攻擊和暴擊
    let strikeAttack = strikeCard.stats.attack + (strikeCard.tempAttack || 0) + (strikeCard.permanentBonus || 0);
    totalAttack += strikeAttack;
    totalCrit += strikeCard.stats.crit;

    // 計算輔助區卡牌的攻擊和暴擊
    const supportCard = this.gameState.player.support_zone;
    if (supportCard) {
      let supportAttack = supportCard.stats.attack + (supportCard.tempAttack || 0) + (supportCard.permanentBonus || 0);
      totalAttack += supportAttack;
      totalCrit += supportCard.stats.crit;
    }

    // 應用回合Buff
    this.gameState.turnBuffs.forEach(buff => {
      if ( (buff.type === 'human_attack_boost' && strikeCard.attribute === 'human') ||
           (buff.type === 'batter_attack_boost' && strikeCard.type === 'batter') ||
             (buff.type === 'human_hand_boost' && strikeCard.attribute === 'human') ) {
            totalAttack += buff.value;
            this.addLogEntry(`🔄 回合增益: +${buff.value} 攻擊力`, 'success');
        }
    });

    // 計算最終傷害 (暴擊修正)
    const isCritical = Math.random() * 100 < totalCrit;
    const critMultiplier = isCritical ? 1.5 : 1;
    const finalDamage = Math.round(totalAttack * critMultiplier);

    // 對投手造成傷害
    this.gameState.pitcher.current_hp -= finalDamage;
    this.gameState.pitcher.current_hp = Math.max(0, this.gameState.pitcher.current_hp);

    const critMessage = isCritical ? `💥 觸發暴擊！` : '';
    this.addLogEntry(`⚔️ 總攻擊 ${totalAttack} 造成 ${finalDamage} 傷害！${critMessage}`, 'damage');
  }

  /**
   * ✨ 觸發卡牌效果
   */
  triggerCardEffect(card, timing) {
    if (card && card.effect) {
        try {
            const result = card.effect(this.gameState, card);
            if (result && result.description) {
                this.addLogEntry(`✨ ${card.name} (${timing}): ${result.description}`, 'success');
            }
            if (result && result.attackBonus) {
              card.tempAttack = (card.tempAttack || 0) + result.attackBonus;
            }
        } catch (error) {
            console.error(`執行 ${card.name} 的效果時失敗:`, error);
        }
    }
  }


  /**
   * 🎯 投手攻擊 - 考慮傷害減免
   */
  pitcherAttack() {
    if (this.gameState.pitcher.skipNextTurn) {
      this.addLogEntry('⏸️ 投手被時間暫停，跳過攻擊', 'system');
      this.gameState.pitcher.skipNextTurn = false;
      return;
    }

    let damage = this.gameState.pitcher.current_attack;
    let totalReduction = 0;

    // 應用傷害減免
    this.gameState.turnBuffs.forEach(buff => {
      if (buff.type === 'damage_reduction') {
        totalReduction += buff.value;
      }
    });

    if (totalReduction > 0) {
        damage -= totalReduction;
        this.addLogEntry(`🛡️ 傷害減免: -${totalReduction}`, 'success');
    }
    damage = Math.max(1, damage); // 最少造成1點傷害

    this.gameState.player.current_hp -= damage;
    this.gameState.player.current_hp = Math.max(0, this.gameState.player.current_hp);

    this.addLogEntry(`💥 投手反擊，造成 ${damage} 點傷害`, 'damage');
  }

  /**
   * 🎁 改進的戰鬥獎勵系統
   */
  generateBattleRewards() {
    const rewardPool = {
        common: ['president', 'kindness', 'hero', 'strongman', 'democracy', 'simple_folk', 'shadow_devour', 'lone_shadow', 'weapon_master', 'holy_light'],
        rare: ['help_stream', 'benevolent_legacy', 'multiculture', 'prosperity', 'evil_genius', 'ambush', 'yinyang_harmony', 'communism'],
        legendary: ['master', 'head_pat', 'time_stop']
    };
    
    let chosenPool = [];
    const rand = Math.random();

    if (this.seasonData.currentBattle > 10 && rand < 0.1) { // 10戰後 10% 機率出傳說
      chosenPool.push(...rewardPool.legendary);
    } else if (this.seasonData.currentBattle > 5 && rand < 0.4) { // 5戰後 40% 機率出稀有
      chosenPool.push(...rewardPool.rare);
    } else {
      chosenPool.push(...rewardPool.common);
    }
    
    const shuffled = [...chosenPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(cardId => this.cardLibrary[cardId]).filter(Boolean);
  }

  /**
   * 🎨 更新戰鬥區域 - 改進視覺效果
   */
  updateBattleZones() {
    const zones = [
      { element: this.ui.elements.strikeZone, card: this.gameState.player.strike_zone, icon: '🗡️', name: '打擊卡', tip: '雙擊移除' },
      { element: this.ui.elements.supportZone, card: this.gameState.player.support_zone, icon: '🛡️', name: '輔助卡', tip: '雙擊移除' },
      { element: this.ui.elements.spellZone, card: this.gameState.player.spell_zone, icon: '✨', name: '法術卡', tip: '雙擊移除' }
    ];

    zones.forEach(({ element, card, icon, name, tip }) => {
      if (!element) return;

      if (card) {
        element.innerHTML = this.renderCard(card, -1); // index -1 表示不在手牌
        element.classList.add('card-zone-occupied');
        element.title = tip; // 添加提示
      } else {
        element.innerHTML = `
          <div class="text-center text-orange-300 h-full flex flex-col items-center justify-center">
            <div class="text-3xl mb-2">${icon}</div>
            <div class="text-sm">${name}</div>
            <div class="text-xs mt-1 opacity-70">拖拽或點擊卡牌放置</div>
          </div>
        `;
        element.classList.remove('card-zone-occupied');
        element.title = ''; // 清除提示
      }
    });
  }

  async startNewBattle() {
    console.log(`⚔️ 開始第 ${this.seasonData.currentBattle} 場戰鬥...`);

    this.gameState = {
      player: {
        current_hp: this.seasonData.playerMaxHP,
        max_hp: this.seasonData.playerMaxHP,
        deck: this.createDeckForBattle(),
        hand: [],
        discard_pile: [],
        strike_zone: null,
        support_zone: null,
        spell_zone: null
      },
      pitcher: {
        current_hp: 150 + (this.seasonData.currentBattle - 1) * 20,
        max_hp: 150 + (this.seasonData.currentBattle - 1) * 20,
        base_attack: 30 + (this.seasonData.currentBattle - 1) * 3,
        current_attack: 30 + (this.seasonData.currentBattle - 1) * 3,
        attribute: this.getEnemyAttribute(),
        skipNextTurn: false
      },
      gamePhase: 'DRAW_PHASE',
      turnCount: 1,
      turnBuffs: []
    };

    this.shuffleDeck(this.gameState.player.deck);
    this.startTurn();
    this.updateUI();

    this.addLogEntry(`⚔️ 第 ${this.seasonData.currentBattle} 場戰鬥開始！`, 'success');
    this.addLogEntry(`👹 對手: ${this.getEnemyName()} (${this.gameState.pitcher.current_hp}血, ${this.gameState.pitcher.current_attack}攻擊)`, 'system');
    
    this.isGameRunning = true;
  }

  getEnemyName() {
    const names = [
      '新手投手', '街頭選手', '業餘好手', '校隊王牌', '地區冠軍',
      '職業新秀', '聯盟老將', '明星選手', '全明星', '賽揚候選',
      '傳奇投手', '殿堂級', '不敗神話', '時代巨星', '終極魔王'
    ];
    return names[this.seasonData.currentBattle - 1] || `第${this.seasonData.currentBattle}號投手`;
  }

  getEnemyAttribute() {
    const attributes = ['heaven', 'earth', 'yin', 'yang', 'human'];
    return attributes[(this.seasonData.currentBattle - 1) % attributes.length];
  }

  endTurn() {
    if (!this.isGameRunning) return;

    console.log('🌙 結束回合...');
    this.addLogEntry(`---------- 回合 ${this.gameState.turnCount} 結束 ----------`, 'system');

    this.executeAutoAttack();

    if (this.gameState.pitcher.current_hp > 0) {
      setTimeout(() => this.pitcherAttack(), 500); // 延遲投手攻擊，增加節奏感
    }

    setTimeout(() => {
        if (this.checkBattleEnd()) {
          return;
        }

        this.moveCardsToDiscard();
        this.applyPitcherFatigue();
        this.cleanupTurnEffects();

        this.gameState.turnCount++;
        this.startTurn();
        this.updateUI();
    }, 1000); // 延遲回合結算
  }

  checkBattleEnd() {
    if (this.gameState.player.current_hp <= 0) {
      this.addLogEntry('💀 戰敗！賽季結束...', 'damage');
      this.showSeasonDefeat();
      this.isGameRunning = false;
      return true;
    }

    if (this.gameState.pitcher.current_hp <= 0) {
      this.addLogEntry('🏆 戰鬥勝利！', 'success');
      this.completeBattle();
      this.isGameRunning = false;
      return true;
    }

    return false;
  }

  completeBattle() {
    this.seasonData.battlesWon++;
    this.seasonData.playerMaxHP += 5;

    if (this.seasonData.currentBattle >= this.seasonData.totalBattles) {
      this.showSeasonVictory();
    } else {
      this.seasonData.currentBattle++;
      this.showBattleReward();
    }
  }

  showBattleReward() {
    const rewards = this.generateBattleRewards();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-orange-800 rounded-lg p-6 max-w-md mx-4 text-center">
        <h2 class="text-2xl font-bold text-orange-100 mb-4">🏆 戰鬥勝利！</h2>
        <div class="text-orange-200 mb-4">
          <p>第 ${this.seasonData.currentBattle - 1} 場戰鬥完成</p>
          <p>最大血量 +5 (目前: ${this.seasonData.playerMaxHP})</p>
        </div>
        
        <div class="space-y-2 mb-6">
          <h3 class="text-lg font-bold text-orange-100">選擇一張獎勵卡牌加入牌組:</h3>
          ${rewards.length > 0 ? rewards.map((card, index) => `
            <button onclick="selectReward('${card.id}')" 
                    class="w-full bg-orange-600 hover:bg-orange-500 text-white p-3 rounded text-left">
              <div>
                    <span class="font-bold">${this.getCardTypeIcon(card)} ${card.name}</span>
                    ${card.rarity === 'legendary' ? '★' : card.rarity === 'rare' ? '◆' : ''}
                  </div>
              <div class="text-xs opacity-80">${card.description}</div>
            </button>
          `).join('') : '<p class="text-orange-300">沒有可用的獎勵。</p>'}
            <button onclick="selectReward(null)" class="w-full bg-gray-600 hover:bg-gray-500 text-white p-2 mt-2 rounded">跳過獎勵</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    window.selectReward = (cardId) => {
      modal.remove();
      if(cardId) {
        this.addRewardCard(cardId);
      } else {
        this.addLogEntry('ℹ️ 跳過了本次獎勵選擇。', 'system');
      }
      setTimeout(() => {
        this.startNewBattle();
      }, 1000);
    };
  }

  addRewardCard(cardId) {
    const card = this.cardLibrary[cardId];
    if (card) {
        this.seasonData.masterDeck.push(cardId);
        this.addLogEntry(`🎁 獲得新卡牌: ${card.name}！已加入你的賽季牌組。`, 'success');
        this.addLogEntry(`ℹ️ 目前牌組總數: ${this.seasonData.masterDeck.length}張`, 'system');
    }
  }

  moveCardsToDiscard() {
    ['strike_zone', 'support_zone', 'spell_zone'].forEach(zone => {
      const card = this.gameState.player[zone];
      if (card) {
          // 觸發死聲效果
          if (card.type === 'deathrattle') {
              this.triggerCardEffect(card, '死聲');
          }
        this.gameState.player.discard_pile.push(card);
        this.gameState.player[zone] = null;
      }
    });
  }

  applyPitcherFatigue() {
    this.gameState.pitcher.current_attack = Math.max(10, Math.round(this.gameState.pitcher.current_attack * 0.95));
    this.addLogEntry(`😴 投手疲勞，攻擊力降至 ${this.gameState.pitcher.current_attack}`, 'system');
  }

  cleanupTurnEffects() {
    this.gameState.turnBuffs = [];
    const allCards = [...this.gameState.player.hand, ...this.gameState.player.discard_pile, this.gameState.player.strike_zone, this.gameState.player.support_zone, this.gameState.player.spell_zone].filter(Boolean);
    allCards.forEach(card => card.tempAttack = 0);
  }

  startTurn() {
    console.log(`🌅 回合 ${this.gameState.turnCount} 開始`);
    this.addLogEntry(`---------- 回合 ${this.gameState.turnCount} 開始 ----------`, 'system');
    
    const handLimit = 7;
    let drawnCount = 0;
    while(this.gameState.player.hand.length < handLimit) {
      if (!this.drawCard(this.gameState)) break; // 牌庫抽乾則停止
      drawnCount++;
    }
    
    this.gameState.gamePhase = 'PLAY_PHASE';
    if (drawnCount > 0) {
      this.addLogEntry(`🌅 抽了 ${drawnCount} 張牌`, 'system');
    }
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  drawCard(gameState) {
    if (gameState.player.deck.length === 0) {
      if (gameState.player.discard_pile.length > 0) {
        gameState.player.deck = [...gameState.player.discard_pile];
        gameState.player.discard_pile = [];
        this.shuffleDeck(gameState.player.deck);
        this.addLogEntry('🔄 牌庫已空，重新洗牌！', 'system');
      } else {
        this.addLogEntry('⚠️ 牌庫和棄牌堆都已空！', 'system');
        return false;
      }
    }
    
    const card = gameState.player.deck.pop();
    if (card) {
      gameState.player.hand.push(card);
      return true;
    }
    return false;
  }

  playCard(cardIndex, targetZone) {
    const card = this.gameState.player.hand[cardIndex];
    if (!card) return;

    if (this.gameState.player[targetZone]) {
      this.addLogEntry(`❌ ${targetZone.replace('_', ' ')} 區域已被佔用`, 'system');
      return;
    }

    this.gameState.player.hand.splice(cardIndex, 1);
    this.gameState.player[targetZone] = card;

    // 觸發放置時的效果 (法術、輔助)
    const timing = { spell: '法術', support: '輔助' }[card.type];
    if (timing) {
        this.triggerCardEffect(card, timing);
    }

    this.addLogEntry(`🎴 打出 ${card.name} 到 ${targetZone.replace('_zone', '區')}`, 'success');
    this.updateUI();
  }

  countHumanCards(gameState) {
    let count = 0;
    const allPlayerCards = [
        ...gameState.player.deck,
        ...gameState.player.hand,
        ...gameState.player.discard_pile,
        gameState.player.strike_zone,
        gameState.player.support_zone,
        gameState.player.spell_zone
    ].filter(Boolean);
    allPlayerCards.forEach(card => {
      if (card.attribute === 'human') count++;
    });
    return count;
  }

  updateUI() {
    if (!this.isInitialized || !this.gameState) return;

    if (this.ui.elements.playerHp) this.ui.elements.playerHp.textContent = `${this.gameState.player.current_hp}/${this.gameState.player.max_hp}`;
    if (this.ui.elements.playerHpBar) this.ui.elements.playerHpBar.style.width = `${(this.gameState.player.current_hp / this.gameState.player.max_hp) * 100}%`;
    if (this.ui.elements.pitcherHp) this.ui.elements.pitcherHp.textContent = `${this.gameState.pitcher.current_hp}/${this.gameState.pitcher.max_hp}`;
    if (this.ui.elements.pitcherHpBar) this.ui.elements.pitcherHpBar.style.width = `${(this.gameState.pitcher.current_hp / this.gameState.pitcher.max_hp) * 100}%`;
    if (this.ui.elements.pitcherAttack) this.ui.elements.pitcherAttack.textContent = this.gameState.pitcher.current_attack;
    if (this.ui.elements.turnCounter) this.ui.elements.turnCounter.textContent = this.gameState.turnCount;
    if (this.ui.elements.deckCount) this.ui.elements.deckCount.textContent = this.gameState.player.deck.length;
    if (this.ui.elements.discardCount) this.ui.elements.discardCount.textContent = this.gameState.player.discard_pile.length;

    this.updateHandDisplay();
    this.updateBattleZones();
    this.updateSeasonInfo();
  }

  updateSeasonInfo() {
    const titleElement = document.querySelector('h1.page-title');
    if (titleElement) {
      titleElement.textContent = `👥 MyGO!!!!! TCG - 第${this.seasonData.currentBattle}/${this.seasonData.totalBattles}戰`;
    }

    const battleInfo = document.getElementById('battle-info');
    if (battleInfo) {
        battleInfo.textContent = `戰鬥 ${this.seasonData.currentBattle}/${this.seasonData.totalBattles}`;
    }
  }

  updateHandDisplay() {
    if (!this.ui.handContainer || !this.gameState) return;

    const hand = this.gameState.player.hand;
    
    if (hand.length === 0) {
      this.ui.handContainer.innerHTML = `
        <div class="text-center text-orange-300 py-8 w-full">
          <p class="text-lg">手牌為空</p>
          <p class="text-sm">點擊「結束回合」</p>
        </div>
      `;
      return;
    }

    this.ui.handContainer.innerHTML = hand.map((card, index) => 
      this.renderCard(card, index)
    ).join('');

    this.setupCardDragEvents();
  }

  addLogEntry(message, type = 'info') {
    if (!this.ui.gameLog) return;

    const timestamp = new Date().toLocaleTimeString('en-GB');
    const typeClass = {
      'info': 'text-orange-400',
      'success': 'text-green-400',
      'damage': 'text-red-400',
      'system': 'text-blue-400'
    }[type] || 'text-orange-400';

    const logEntry = document.createElement('div');
    logEntry.className = `text-sm py-1 ${typeClass} transition-opacity duration-300`;
    logEntry.innerHTML = `<span class="text-gray-400 text-xs">[${timestamp}]</span> ${message}`;

    this.ui.gameLog.appendChild(logEntry);
    this.ui.gameLog.scrollTop = this.ui.gameLog.scrollHeight;

    if (this.ui.gameLog.children.length > 100) {
      this.ui.gameLog.removeChild(this.ui.gameLog.firstChild);
    }
  }

  showSeasonVictory() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-green-900/80 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-green-800 rounded-lg p-8 max-w-lg mx-4 text-center">
        <div class="text-8xl mb-4">🏆</div>
        <h2 class="text-4xl font-bold text-white mb-4">賽季完成！</h2>
        <div class="text-green-100 space-y-2 mb-6">
          <p>🎉 恭喜！人類聯盟征服了所有敵人！</p>
          <p>完成戰鬥: ${this.seasonData.battlesWon}/${this.seasonData.totalBattles}</p>
          <p>最終血量: ${this.seasonData.playerMaxHP}</p>
        </div>
        <button onclick="window.MyGoTCG.restartSeason(); this.closest('.fixed').remove()" 
                class="bg-green-500 hover:bg-green-400 text-green-900 font-bold py-3 px-6 rounded-lg">
          開始新賽季
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  showSeasonDefeat() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-red-900/80 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-red-800 rounded-lg p-8 max-w-lg mx-4 text-center">
        <div class="text-8xl mb-4">💀</div>
        <h2 class="text-4xl font-bold text-white mb-4">賽季失敗</h2>
        <div class="text-red-100 space-y-2 mb-6">
          <p>雖然失敗了，但人類的精神永不屈服！</p>
          <p>戰鬥進度: ${this.seasonData.battlesWon}/${this.seasonData.totalBattles}</p>
          <p>倒在第 ${this.seasonData.currentBattle} 場戰鬥</p>
        </div>
        <button onclick="window.MyGoTCG.restartSeason(); this.closest('.fixed').remove()" 
                class="bg-red-500 hover:bg-red-400 text-red-900 font-bold py-3 px-6 rounded-lg">
          重新挑戰
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  restartSeason() {
    this.addLogEntry('🔄 新的賽季即將開始...', 'system');
    this.seasonData = {
      currentBattle: 1,
      totalBattles: 15,
      battlesWon: 0,
      playerMaxHP: 100,
      masterDeck: [...this.masterDeckTemplate]
    };
    
    this.startNewBattle();
  }

  async startGame() {
    if (!this.isInitialized) {
      console.error('❌ 應用程序尚未初始化');
      return;
    }

    console.log('🎯 開始賽季...');
    this.ui.gameLog.innerHTML = ''; // 清空日誌

    try {
      await this.startNewBattle();
      
      this.addLogEntry('🎉 歡迎來到 MyGO!!!!! TCG 完整賽季！', 'success');
      this.addLogEntry('💡 拖拽卡牌到戰鬥區域，或點擊卡牌選擇位置', 'system');
      this.addLogEntry('💡 雙擊戰鬥區域的卡牌可以撤銷該次放置', 'system');
      this.addLogEntry('⚔️ 佈置好卡牌後，點擊「結束回合」來發動攻擊', 'system');
      
      console.log('✅ 賽季開始成功');
      
    } catch (error) {
      console.error('❌ 開始賽季時發生錯誤:', error);
    }
  }

  getGameState() {
    return this.gameState;
  }
}

// ===== 🚀 應用程序啟動邏輯 =====

async function startApplication() {
  console.log('🎬 啟動 MyGO!!!!! TCG 完整版本...');
  
  const app = new MyGoTCGApplication();
  
  try {
    await app.initialize();
    console.log('🎉 MyGO!!!!! TCG 完整版本就緒');
    
    setTimeout(async () => {
      await app.startGame();
    }, 500);
    
    return app;
    
  } catch (error) {
    console.error('💥 應用程序啟動失敗:', error);
    showErrorScreen(error);
    throw error;
  }
}

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
          <pre class="text-xs bg-gray-900 p-2 rounded mb-4 text-left whitespace-pre-wrap">${error.stack}</pre>
          <button onclick="location.reload()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            重新載入
          </button>
        </div>
      </div>
    `;
    gameContainer.style.display = 'block';
  }
}

function createDebugTools(app) {
  return {
    getState: () => app.getGameState(),
    addCard: (cardId = null) => {
      const allCards = Object.keys(app.cardLibrary);
      const randomCard = cardId || allCards[Math.floor(Math.random() * allCards.length)];
      const cardTemplate = app.cardLibrary[randomCard];
      if (cardTemplate && app.gameState) {
        app.gameState.player.hand.push({ ...cardTemplate, tempAttack: 0, permanentBonus: 0 });
        app.updateUI();
        console.log(`🎴 添加了 ${cardTemplate.name} (${cardTemplate.rarity}) 到手牌`);
      }
    },
    addLegendary: () => { const legendary = Object.keys(app.cardLibrary).filter(id => app.cardLibrary[id].rarity === 'legendary'); createDebugTools(app).addCard(legendary[Math.floor(Math.random() * legendary.length)]); },
    addRare: () => { const rare = Object.keys(app.cardLibrary).filter(id => app.cardLibrary[id].rarity === 'rare'); createDebugTools(app).addCard(rare[Math.floor(Math.random() * rare.length)]); },
    showDeck: () => {
      console.log(`📊 當前賽季牌組 (${app.seasonData.masterDeck.length}張):`);
      const counts = app.seasonData.masterDeck.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
      console.table(counts);
    },
    heal: (amount = 20) => { if (app.gameState) { app.gameState.player.current_hp = Math.min(app.gameState.player.max_hp, app.gameState.player.current_hp + amount); app.updateUI(); app.addLogEntry(`💚 (除錯) 回復 ${amount} 血量`, 'success'); }},
    damage: (amount = 30) => { if (app.gameState) { app.gameState.pitcher.current_hp = Math.max(0, app.gameState.pitcher.current_hp - amount); app.updateUI(); app.addLogEntry(`💥 (除錯) 對投手造成 ${amount} 傷害`, 'damage'); }},
    nextBattle: () => { if (app.seasonData.currentBattle < app.seasonData.totalBattles) { app.seasonData.currentBattle++; app.startNewBattle(); console.log(`⚔️ (除錯) 跳到第 ${app.seasonData.currentBattle} 場戰鬥`); } else { console.log('已是最終戰'); }},
    winBattle: () => { if (app.gameState && app.isGameRunning) { app.gameState.pitcher.current_hp = 0; app.endTurn(); console.log('🏆 (除錯) 強制戰鬥勝利'); }},
    restart: () => app.restartSeason(),
    showSeason: () => { console.log('📊 賽季狀態:', app.seasonData); }
  };
}

function setupMobileAdaptation() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    console.log('📱 檢測到移動設備，應用移動端適配...');
    
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    
    if (!document.getElementById('mobile-styles')) {
        const mobileStyle = document.createElement('style');
        mobileStyle.id = 'mobile-styles';
        mobileStyle.textContent = `
          body { -webkit-touch-callout: none; -webkit-user-select: none; touch-action: manipulation; }
          .hand-card { width: 64px !important; height: 90px !important; font-size: 9px !important; }
          .card-hover:active { transform: scale(0.95); box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
          button { min-height: 48px !important; font-size: 16px !important; }
          @media (max-width: 380px) { .hand-card { width: 56px !important; height: 80px !important; } }
        `;
        document.head.appendChild(mobileStyle);
    }
    
    document.body.classList.add('mobile-device');
    return true;
  }
  
  return false;
}

// 主啟動流程
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

async function initializeApp() {
  console.log('🚀 開始初始化 MyGO!!!!! TCG 完整版本...');
  
  try {
    const isMobile = setupMobileAdaptation();
    const app = await startApplication();
    
    const loadingScreen = document.getElementById('loading-screen');
    const gameContainer = document.getElementById('game-container');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';
    
    window.MyGoTCG = app;
    window.gameDebug = createDebugTools(app);
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setTimeout(() => {
        console.log(`%c🎮 MyGO!!!!! TCG 完整版 - 除錯工具已啟用`, 'color: #f97316; font-weight: bold; font-size: 14px;');
        console.log(`在控制台輸入 gameDebug 來使用，例如 gameDebug.winBattle()`);
      }, 2000);
    }
    
    console.log('✅ MyGO!!!!! TCG 完整版本成功啟動！');
    
  } catch (error) {
    console.error('💥 初始化失敗:', error);
    showErrorScreen(error);
  }
}
// main.js 的最最最下面

export { MyGoTCGApplication, startApplication };