// ===== 🎨 SEASON UI COMPONENTS (src/ui/components/SeasonUI.js) =====

/**
 * 🎨 賽季UI組件
 * 處理賽季相關的UI顯示和交互
 */
export class SeasonUI {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.currentView = 'map'; // 'map', 'deck', 'rewards'
    console.log('🎨 賽季UI組件初始化完成');
  }

  /**
   * 🗺️ 渲染地圖視圖
   */
  renderMapView(map, season) {
    const mapContainer = document.getElementById('season-map-container');
    if (!mapContainer) {
      console.warn('⚠️ 找不到地圖容器元素');
      return;
    }
    
    const progress = this.calculateProgress(map);
    
    mapContainer.innerHTML = `
      <div class="season-map-view">
        <!-- 賽季信息頭部 -->
        <div class="season-header bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-white">賽季進行中</h2>
              <p class="text-gray-300">戰鬥進度: ${progress.current}/${progress.total}</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400">獲得徽章</div>
              <div class="text-xl font-bold text-yellow-400">${season.badges.length}/5</div>
            </div>
          </div>
          
          <!-- 進度條 -->
          <div class="mt-4">
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                   style="width: ${progress.percentage}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>開始</span>
              <span>${progress.percentage}%</span>
              <span>賽季完成</span>
            </div>
          </div>
        </div>

        <!-- 地圖節點 -->
        <div class="map-nodes-container relative bg-gray-800/50 rounded-lg p-6 min-h-96">
          ${this.renderMapNodes(map)}
        </div>

        <!-- 當前戰鬥信息 -->
        ${this.renderCurrentBattleInfo(map, season)}
      </div>
    `;
    
    // 顯示地圖容器
    mapContainer.classList.remove('hidden');
    
    // 隱藏其他容器
    this.hideOtherContainers('map');
    
    // 綁定節點點擊事件
    this.bindMapNodeEvents(map);
  }

  /**
   * ⚔️ 渲染地圖節點
   */
  renderMapNodes(map) {
    return map.nodes.map(node => {
      const statusClass = this.getNodeStatusClass(node);
      const iconClass = this.getNodeIconClass(node);
      
      return `
        <div class="map-node ${statusClass}" 
             data-node-id="${node.id}"
             style="position: absolute; left: ${node.position.x}px; top: ${node.position.y}px;">
          
          <div class="node-icon ${iconClass}">
            ${this.getNodeIcon(node)}
          </div>
          
          <div class="node-info">
            <div class="node-title">${node.battleNumber}</div>
            <div class="node-subtitle">${node.enemyInfo.name}</div>
            
            ${node.isBadgeBattle ? '<div class="badge-marker">🏅</div>' : ''}
            ${node.isBoss ? '<div class="boss-marker">👑</div>' : ''}
          </div>
          
          <!-- 連接線 -->
          ${node.id < map.nodes.length ? '<div class="connection-line"></div>' : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * 🎯 獲取節點狀態樣式
   */
  getNodeStatusClass(node) {
    switch (node.status) {
      case 'completed': return 'node-completed';
      case 'available': return 'node-available';
      case 'locked': return 'node-locked';
      default: return 'node-unknown';
    }
  }

  /**
   * 🎨 獲取節點圖標樣式
   */
  getNodeIconClass(node) {
    if (node.isBoss) return 'boss-icon';
    if (node.isElite) return 'elite-icon';
    if (node.isBadgeBattle) return 'badge-icon';
    return 'normal-icon';
  }

  /**
   * 🎭 獲取節點圖標
   */
  getNodeIcon(node) {
    if (node.isBoss) return '👑';
    if (node.isElite) return '⭐';
    if (node.isBadgeBattle) return '🏅';
    if (node.status === 'completed') return '✅';
    if (node.status === 'available') return '⚔️';
    return '🔒';
  }

  /**
   * ℹ️ 渲染當前戰鬥信息
   */
  renderCurrentBattleInfo(map, season) {
    const availableNodes = map.nodes.filter(node => node.status === 'available');
    if (availableNodes.length === 0) return '';
    
    const currentNode = availableNodes[0];
    
    return `
      <div class="current-battle-info bg-blue-900/30 rounded-lg p-4 mt-6">
        <h3 class="text-lg font-bold text-white mb-3">下一場戰鬥</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-400">敵人</div>
            <div class="text-white font-bold">${currentNode.enemyInfo.name}</div>
            <div class="text-sm text-gray-300">屬性: ${currentNode.enemyInfo.attribute}</div>
            <div class="text-sm text-gray-300">難度: ${currentNode.enemyInfo.difficulty}</div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400">獎勵</div>
            <div class="text-sm text-green-400">📋 ${currentNode.rewards.cards} 張卡牌</div>
            ${currentNode.rewards.specialReward ? 
              `<div class="text-sm text-yellow-400">✨ ${currentNode.rewards.specialReward}</div>` : ''
            }
          </div>
        </div>
        
        <button class="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                onclick="startBattle(${currentNode.id})">
          開始戰鬥
        </button>
      </div>
    `;
  }

  /**
   * 🎴 渲染牌組視圖
   */
  renderDeckView(season, badges = []) {
    const deckContainer = document.getElementById('season-deck-container');
    if (!deckContainer) {
      console.warn('⚠️ 找不到牌組容器元素');
      return;
    }
    
    const deckAnalysis = this.analyzeDeck(season.playerDeck);
    
    deckContainer.innerHTML = `
      <div class="deck-view">
        <!-- 牌組頭部 -->
        <div class="deck-header bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-white">我的牌組</h2>
              <p class="text-gray-300">共 ${season.playerDeck.length} 張卡牌</p>
            </div>
            <div class="deck-stats text-right">
              <div class="text-sm text-gray-400">平均攻擊力</div>
              <div class="text-xl font-bold text-red-400">${deckAnalysis.averageAttack}</div>
            </div>
          </div>
        </div>

        <!-- 徽章效果 -->
        ${this.renderActiveBadges(badges)}

        <!-- 牌組分析 -->
        ${this.renderDeckAnalysis(deckAnalysis)}

        <!-- 卡牌展示 -->
        <div class="deck-cards grid grid-cols-6 gap-3">
          ${season.playerDeck.map((card, index) => 
            this.renderDeckCard(card, index)
          ).join('')}
        </div>
      </div>
    `;
    
    // 顯示牌組容器
    deckContainer.classList.remove('hidden');
    
    // 隱藏其他容器
    this.hideOtherContainers('deck');
  }

  /**
   * 🏅 渲染活躍徽章
   */
  renderActiveBadges(badges) {
    if (!badges || badges.length === 0) {
      return `
        <div class="active-badges bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-bold text-white mb-2">活躍徽章</h3>
          <p class="text-gray-400">尚未獲得任何徽章</p>
        </div>
      `;
    }
    
    return `
      <div class="active-badges bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-bold text-white mb-3">活躍徽章 (${badges.length}/5)</h3>
        <div class="badges-grid grid grid-cols-1 gap-2">
          ${badges.map(badge => `
            <div class="badge-item flex items-center p-2 bg-yellow-900/30 rounded">
              <div class="badge-icon text-2xl mr-3">🏅</div>
              <div>
                <div class="badge-name text-yellow-400 font-bold">${badge.name}</div>
                <div class="badge-description text-gray-300 text-sm">${badge.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 📊 渲染牌組分析
   */
  renderDeckAnalysis(analysis) {
    return `
      <div class="deck-analysis bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-bold text-white mb-3">牌組分析</h3>
        
        <div class="grid grid-cols-3 gap-4">
          <!-- 屬性分佈 -->
          <div>
            <div class="text-sm text-gray-400 mb-2">屬性分佈</div>
            ${Object.entries(analysis.byAttribute).map(([attr, count]) => `
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">${attr}</span>
                <span class="text-white">${count}張</span>
              </div>
            `).join('')}
          </div>
          
          <!-- 類型分佈 -->
          <div>
            <div class="text-sm text-gray-400 mb-2">類型分佈</div>
            ${Object.entries(analysis.byType).map(([type, count]) => `
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">${type}</span>
                <span class="text-white">${count}張</span>
              </div>
            `).join('')}
          </div>
          
          <!-- 稀有度分佈 -->
          <div>
            <div class="text-sm text-gray-400 mb-2">稀有度分佈</div>
            ${Object.entries(analysis.byRarity).map(([rarity, count]) => `
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">${rarity}</span>
                <span class="text-white">${count}張</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 🃏 渲染牌組中的卡牌
   */
  renderDeckCard(card, index) {
    const cardClasses = this.generateCardClasses(card.attribute, card.rarity);
    
    return `
      <div class="${cardClasses} deck-card" data-card-index="${index}">
        <div class="text-center mb-2">
          <div class="font-bold text-xs mb-1">${card.name}</div>
          <div class="text-[9px] opacity-80">${card.attribute}</div>
        </div>
        
        <div class="flex justify-between items-center mb-1">
          <div class="text-center">
            <div class="text-[9px] opacity-75">ATK</div>
            <div class="font-bold text-sm text-red-300">${card.stats.attack}</div>
          </div>
          <div class="text-center">
            <div class="text-[9px] opacity-75">CRIT</div>
            <div class="font-bold text-sm text-yellow-300">${card.stats.crit}%</div>
          </div>
        </div>
        
        <div class="text-[8px] text-center opacity-90 bg-black/20 p-1 rounded">
          ${card.description.substring(0, 30)}${card.description.length > 30 ? '...' : ''}
        </div>
      </div>
    `;
  }

  /**
   * 🎁 渲染獎勵選擇視圖
   */
  renderRewardView(availableCards, selectionCount = 1, context = 'battle_reward') {
    const rewardContainer = document.getElementById('season-reward-container');
    if (!rewardContainer) {
      console.warn('⚠️ 找不到獎勵容器元素');
      return;
    }
    
    rewardContainer.innerHTML = `
      <div class="reward-view">
        <!-- 獎勵頭部 -->
        <div class="reward-header bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6 text-center">
          <h2 class="text-3xl font-bold text-white mb-2">🏆 戰鬥勝利！</h2>
          <p class="text-gray-300">選擇 ${selectionCount} 張卡牌加入你的牌組</p>
        </div>

        <!-- 可選卡牌 -->
        <div class="reward-cards">
          <div class="grid grid-cols-3 gap-6 justify-center">
            ${availableCards.map((card, index) => 
              this.renderRewardCard(card, index)
            ).join('')}
          </div>
        </div>

        <!-- 選擇確認 -->
        <div class="reward-actions text-center mt-6">
          <button id="confirm-selection" 
                  class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
                  disabled>
            確認選擇
          </button>
          <div class="text-sm text-gray-400 mt-2">
            已選擇 <span id="selection-count">0</span> / ${selectionCount} 張卡牌
          </div>
        </div>
      </div>
    `;
    
    // 顯示獎勵容器
    rewardContainer.classList.remove('hidden');
    
    // 隱藏其他容器
    this.hideOtherContainers('rewards');
    
    // 綁定卡牌選擇事件
    this.bindRewardCardEvents(selectionCount);
  }

  /**
   * 🎴 渲染獎勵卡牌
   */
  renderRewardCard(card, index) {
    const cardClasses = this.generateCardClasses(card.attribute, card.rarity);
    
    return `
      <div class="${cardClasses} reward-card cursor-pointer transform hover:scale-105 transition-transform"
           data-card-id="${card.id}" data-card-index="${index}">
        
        <!-- 稀有度標識 -->
        ${card.rarity === 'legendary' ? '<div class="absolute top-2 right-2 text-yellow-400 text-lg">★</div>' : ''}
        ${card.rarity === 'rare' ? '<div class="absolute top-2 right-2 text-blue-400 text-lg">◆</div>' : ''}
        
        <div class="text-center mb-3">
          <div class="font-bold text-lg mb-1">${card.name}</div>
          <div class="text-sm opacity-80">${card.attribute} • ${card.type}</div>
        </div>
        
        <div class="flex justify-between items-center mb-3">
          <div class="text-center">
            <div class="text-sm opacity-75">攻擊</div>
            <div class="font-bold text-2xl text-red-300">${card.stats.attack}</div>
          </div>
          <div class="text-center">
            <div class="text-sm opacity-75">暴擊</div>
            <div class="font-bold text-2xl text-yellow-300">${card.stats.crit}%</div>
          </div>
        </div>
        
        <div class="text-sm leading-tight opacity-90 bg-black/20 p-3 rounded text-center">
          ${card.description}
        </div>
        
        <!-- 選中標記 -->
        <div class="selected-overlay hidden absolute inset-0 bg-green-500/30 rounded-xl border-4 border-green-400">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="text-4xl">✓</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 🎮 綁定地圖節點事件
   */
  bindMapNodeEvents(map) {
    document.querySelectorAll('.map-node[data-node-id]').forEach(nodeElement => {
      const nodeId = parseInt(nodeElement.dataset.nodeId);
      const node = map.nodes.find(n => n.id === nodeId);
      
      if (node && node.status === 'available') {
        nodeElement.addEventListener('click', () => {
          this.showNodeDetails(node);
        });
      }
    });
  }

  /**
   * 🔍 顯示節點詳情
   */
  showNodeDetails(node) {
    // 創建節點詳情模態框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-xl font-bold text-white mb-4">第${node.battleNumber}場戰鬥</h3>
        
        <div class="space-y-3">
          <div>
            <span class="text-gray-400">敵人：</span>
            <span class="text-white font-bold">${node.enemyInfo.name}</span>
          </div>
          <div>
            <span class="text-gray-400">屬性：</span>
            <span class="text-white">${node.enemyInfo.attribute}</span>
          </div>
          <div>
            <span class="text-gray-400">難度：</span>
            <span class="text-white">${node.enemyInfo.difficulty}</span>
          </div>
          
          ${node.isBadgeBattle ? '<div class="text-yellow-400">🏅 徽章戰：獲得永久強化</div>' : ''}
          ${node.isBoss ? '<div class="text-red-400">👑 Boss戰：最終挑戰</div>' : ''}
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button onclick="this.closest('.fixed').remove()" 
                  class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
            取消
          </button>
          <button onclick="startBattle(${node.id}); this.closest('.fixed').remove()" 
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
            開始戰鬥
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * 🎁 綁定獎勵卡牌事件
   */
  bindRewardCardEvents(selectionLimit) {
    const selectedCards = new Set();
    const confirmButton = document.getElementById('confirm-selection');
    const selectionCountDisplay = document.getElementById('selection-count');
    
    document.querySelectorAll('.reward-card').forEach(cardElement => {
      cardElement.addEventListener('click', () => {
        const cardId = cardElement.dataset.cardId;
        const overlay = cardElement.querySelector('.selected-overlay');
        
        if (selectedCards.has(cardId)) {
          // 取消選擇
          selectedCards.delete(cardId);
          overlay.classList.add('hidden');
          cardElement.classList.remove('ring-4', 'ring-green-400');
        } else if (selectedCards.size < selectionLimit) {
          // 選擇卡牌
          selectedCards.add(cardId);
          overlay.classList.remove('hidden');
          cardElement.classList.add('ring-4', 'ring-green-400');
        }
        
        // 更新UI
        selectionCountDisplay.textContent = selectedCards.size;
        confirmButton.disabled = selectedCards.size === 0;
        
        // 儲存選擇結果到按鈕
        confirmButton.dataset.selectedCards = JSON.stringify([...selectedCards]);
      });
    });
  }

  /**
   * 👁️ 隱藏其他容器
   */
  hideOtherContainers(currentView) {
    const containers = ['season-map-container', 'season-deck-container', 'season-reward-container'];
    
    containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container && containerId !== `season-${currentView}-container`) {
        container.classList.add('hidden');
      }
    });
    
    this.currentView = currentView;
  }

  /**
   * 📊 計算進度
   */
  calculateProgress(map) {
    const completed = map.completedNodes.length;
    const total = map.nodes.length;
    
    return {
      current: completed,
      total: total,
      percentage: Math.round((completed / total) * 100)
    };
  }

  /**
   * 📊 分析牌組
   */
  analyzeDeck(deck) {
    const analysis = {
      byAttribute: {},
      byType: {},
      byRarity: {},
      averageAttack: 0,
      averageCrit: 0
    };
    
    let totalAttack = 0;
    let totalCrit = 0;
    
    deck.forEach(card => {
      // 屬性統計
      analysis.byAttribute[card.attribute] = (analysis.byAttribute[card.attribute] || 0) + 1;
      
      // 類型統計
      analysis.byType[card.type] = (analysis.byType[card.type] || 0) + 1;
      
      // 稀有度統計
      analysis.byRarity[card.rarity] = (analysis.byRarity[card.rarity] || 0) + 1;
      
      // 數值累計
      totalAttack += card.stats.attack;
      totalCrit += card.stats.crit;
    });
    
    // 計算平均值
    if (deck.length > 0) {
      analysis.averageAttack = Math.round(totalAttack / deck.length);
      analysis.averageCrit = Math.round(totalCrit / deck.length);
    }
    
    return analysis;
  }

  /**
   * 🎨 生成卡牌樣式
   */
  generateCardClasses(attribute, rarity) {
    const baseClasses = 'relative w-32 h-44 rounded-xl p-3 text-xs flex flex-col justify-between';
    
    const attributeColors = {
      human: { base: 'bg-orange-700', text: 'text-orange-100' },
      yin: { base: 'bg-purple-800', text: 'text-purple-100' },
      yang: { base: 'bg-yellow-600', text: 'text-yellow-100' },
      heaven: { base: 'bg-blue-700', text: 'text-blue-100' },
      earth: { base: 'bg-green-700', text: 'text-green-100' }
    };
    
    const rarityEffects = {
      common: '',
      rare: 'shadow-lg ring-2 ring-blue-400/50',
      legendary: 'shadow-xl ring-2 ring-yellow-400/50 animate-pulse'
    };
    
    const colors = attributeColors[attribute] || attributeColors.human;
    const effects = rarityEffects[rarity] || rarityEffects.common;
    
    return `${baseClasses} ${colors.base} ${colors.text} ${effects}`;
  }

  /**
   * 🔧 獲取當前視圖
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * 🧹 清理UI
   */
  cleanup() {
    const containers = ['season-map-container', 'season-deck-container', 'season-reward-container'];
    
    containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
        container.classList.add('hidden');
      }
    });
    
    console.log('🧹 賽季UI清理完成');
  }
}