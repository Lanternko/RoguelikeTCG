// ===== 📊 SIMPLIFIED GAME BALANCE (src/data/balance/GameBalance.js) =====

/**
 * 📊 遊戲平衡數據 - 精簡版
 * 只包含全局遊戲參數，卡牌數值已移至各自文件
 */
export const GAME_BALANCE = {
  // 玩家基礎數值
  PLAYER_INITIAL_HP: 100,
  
  // 投手數值
  PITCHER_INITIAL_HP: 150,
  PITCHER_BASE_ATTACK: 30,
  PITCHER_BASE_FATIGUE_RATE: 0.05,
  
  // 投手第二階段
  PITCHER_STAGE2_HP: 200,
  PITCHER_STAGE2_ATTACK: 45,
  
  // 遊戲限制
  HAND_SIZE_LIMIT: 7,
  STRIKE_ZONE_LIMIT: 1,
  SUPPORT_ZONE_LIMIT: 1,
  SPELL_ZONE_LIMIT: 1,
  
  // 效果參數
  MIN_ATTRIBUTES_FOR_BONUS: 3,
  
  // 賽季設置
  TOTAL_BATTLES_PER_SEASON: 15,
  BADGE_BATTLE_NUMBERS: [1, 4, 7, 10, 13],
  
  // 平衡調整開關
  BALANCE_MODIFIERS: {
    GLOBAL_DAMAGE_MULTIPLIER: 1.0,      // 全局傷害倍數
    GLOBAL_HP_MULTIPLIER: 1.0,          // 全局血量倍數
    CRIT_DAMAGE_MULTIPLIER: 1.0,        // 暴擊傷害倍數
    PITCHER_DIFFICULTY_MULTIPLIER: 1.0   // 投手難度倍數
  }
};

// ===== 🎯 BALANCE ANALYZER TOOL (src/tools/BalanceAnalyzer.js) =====

import { CardRegistry } from '../cards/CardRegistry.js';

/**
 * 🎯 平衡分析工具
 * 分析所有卡牌的平衡性，生成報告
 */
export class BalanceAnalyzer {
  
  /**
   * 📊 分析所有卡牌
   */
  static analyzeAllCards() {
    if (!CardRegistry.initialized) {
      console.warn('⚠️ CardRegistry 尚未初始化');
      return null;
    }

    const analysis = {
      totalCards: 0,
      byRarity: {},
      byAttribute: {},
      byType: {},
      powerLevels: [],
      outliers: []
    };

    // 獲取所有卡牌
    const allCardIds = CardRegistry.getAllCardIds();
    analysis.totalCards = allCardIds.length;

    allCardIds.forEach(cardId => {
      try {
        const card = CardRegistry.create(cardId);
        
        // 統計分佈
        analysis.byRarity[card.rarity] = (analysis.byRarity[card.rarity] || 0) + 1;
        analysis.byAttribute[card.attribute] = (analysis.byAttribute[card.attribute] || 0) + 1;
        analysis.byType[card.type] = (analysis.byType[card.type] || 0) + 1;

        // 計算力量等級
        const powerLevel = this.calculatePowerLevel(card);
        analysis.powerLevels.push({
          id: cardId,
          name: card.name,
          powerLevel,
          rarity: card.rarity
        });

        // 檢查異常值
        const outlier = this.checkOutlier(card, powerLevel);
        if (outlier) {
          analysis.outliers.push(outlier);
        }

      } catch (error) {
        console.error(`分析卡牌 ${cardId} 時出錯:`, error);
      }
    });

    // 排序力量等級
    analysis.powerLevels.sort((a, b) => b.powerLevel - a.powerLevel);

    return analysis;
  }

  /**
   * 💪 計算卡牌力量等級
   */
  static calculatePowerLevel(card) {
    const stats = card.stats;
    
    // 基礎分數計算
    let score = 0;
    
    // 攻擊力權重最高
    score += stats.attack * 2;
    
    // 暴擊率按百分比計算
    score += (stats.crit / 100) * stats.attack;
    
    // 血量加成
    score += stats.hp_bonus * 0.5;
    
    // 效果加成（有效果的卡牌+10分）
    if (card.effects && Object.keys(card.effects).length > 0) {
      score += 10;
    }
    
    // 稀有度調整
    const rarityMultiplier = {
      'common': 1.0,
      'rare': 1.15,
      'legendary': 1.3
    };
    
    score *= rarityMultiplier[card.rarity] || 1.0;
    
    return Math.round(score);
  }

  /**
   * 🚨 檢查異常值
   */
  static checkOutlier(card, powerLevel) {
    const expectedPowerByRarity = {
      'common': { min: 20, max: 60 },
      'rare': { min: 50, max: 90 },
      'legendary': { min: 80, max: 120 }
    };

    const expected = expectedPowerByRarity[card.rarity];
    if (!expected) return null;

    if (powerLevel < expected.min) {
      return {
        id: card.id,
        name: card.name,
        issue: 'UNDERPOWERED',
        powerLevel,
        expected: expected.min,
        suggestion: '考慮增加數值或效果'
      };
    }

    if (powerLevel > expected.max) {
      return {
        id: card.id,
        name: card.name,
        issue: 'OVERPOWERED',
        powerLevel,
        expected: expected.max,
        suggestion: '考慮降低數值或效果'
      };
    }

    return null;
  }

  /**
   * 📈 生成平衡報告
   */
  static generateBalanceReport() {
    const analysis = this.analyzeAllCards();
    if (!analysis) return '分析失敗';

    let report = `
🎯 MyGO!!!!! TCG 平衡分析報告
=====================================

📊 總體統計:
- 總卡牌數: ${analysis.totalCards}

🎭 稀有度分佈:
${Object.entries(analysis.byRarity).map(([rarity, count]) => 
  `- ${rarity}: ${count}張 (${((count/analysis.totalCards)*100).toFixed(1)}%)`
).join('\n')}

🎨 屬性分佈:
${Object.entries(analysis.byAttribute).map(([attr, count]) => 
  `- ${attr}: ${count}張 (${((count/analysis.totalCards)*100).toFixed(1)}%)`
).join('\n')}

🎪 類型分佈:
${Object.entries(analysis.byType).map(([type, count]) => 
  `- ${type}: ${count}張 (${((count/analysis.totalCards)*100).toFixed(1)}%)`
).join('\n')}

💪 力量等級排行 (前10):
${analysis.powerLevels.slice(0, 10).map((card, index) => 
  `${index + 1}. ${card.name} (${card.rarity}) - ${card.powerLevel}分`
).join('\n')}

🚨 平衡問題:
${analysis.outliers.length > 0 ? 
  analysis.outliers.map(outlier => 
    `- ${outlier.name}: ${outlier.issue} (${outlier.powerLevel}分, 預期${outlier.expected}分) - ${outlier.suggestion}`
  ).join('\n') 
  : '- 未發現明顯平衡問題'}

📝 建議:
- 關注力量等級極端的卡牌
- 確保同稀有度卡牌力量等級相近
- 檢查異常值是否符合設計意圖
`;

    return report;
  }

  /**
   * 🎲 建議平衡調整
   */
  static suggestBalanceChanges() {
    const analysis = this.analyzeAllCards();
    if (!analysis) return [];

    const suggestions = [];

    analysis.outliers.forEach(outlier => {
      if (outlier.issue === 'OVERPOWERED') {
        suggestions.push({
          cardId: outlier.id,
          type: 'NERF',
          suggestion: `降低 ${outlier.name} 的攻擊力或暴擊率`,
          priority: 'HIGH'
        });
      } else if (outlier.issue === 'UNDERPOWERED') {
        suggestions.push({
          cardId: outlier.id,
          type: 'BUFF',
          suggestion: `增強 ${outlier.name} 的數值或添加特殊效果`,
          priority: 'MEDIUM'
        });
      }
    });

    return suggestions;
  }
}

// ===== 🔧 DEVELOPMENT TOOLS (src/tools/DevTools.js) =====

import { CardRegistry } from '../cards/CardRegistry.js';
import { BalanceAnalyzer } from './BalanceAnalyzer.js';

/**
 * 🔧 開發工具
 * 提供開發和調試功能
 */
export class DevTools {
  
  /**
   * 🎴 快速創建測試牌組
   */
  static createTestDeck(deckType = 'balanced') {
    const testDecks = {
      balanced: [
        'president', 'president', 'kindness', 'hero', 'hero',
        'strongman', 'democracy', 'lottery', 'shadow_devour',
        'lone_shadow', 'evil_genius', 'yinyang_harmony',
        'holy_light', 'weapon_master', 'weapon_master'
      ],
      
      aggressive: [
        'hero', 'hero', 'hero', 'strongman', 'strongman',
        'lone_shadow', 'lone_shadow', 'evil_genius', 'evil_genius',
        'weapon_master', 'weapon_master', 'yinyang_harmony',
        'democracy', 'lottery', 'holy_light'
      ],
      
      control: [
        'kindness', 'kindness', 'democracy', 'democracy',
        'shadow_devour', 'shadow_devour', 'lottery', 'lottery',
        'holy_light', 'holy_light', 'president', 'president',
        'hero', 'strongman', 'weapon_master'
      ]
    };

    const deckIds = testDecks[deckType] || testDecks.balanced;
    return deckIds.map(id => CardRegistry.create(id));
  }

  /**
   * 📊 打印卡牌詳情
   */
  static printCardDetails(cardId) {
    try {
      const card = CardRegistry.create(cardId);
      const powerLevel = BalanceAnalyzer.calculatePowerLevel(card);
      
      console.log(`
🎴 ${card.name} (${card.id})
=====================================
類型: ${card.type} | 屬性: ${card.attribute} | 稀有度: ${card.rarity}
血量加成: ${card.stats.hp_bonus} | 攻擊力: ${card.stats.attack} | 暴擊率: ${card.stats.crit}%
力量等級: ${powerLevel}分

📝 描述: ${card.description}
${card.balanceNotes ? `⚖️ 平衡註記: ${card.balanceNotes}` : ''}

🎯 效果:
${Object.keys(card.effects).length > 0 ? 
  Object.keys(card.effects).map(effect => `- ${effect}`).join('\n') : 
  '- 無特殊效果'}
      `);
      
    } catch (error) {
      console.error(`無法創建卡牌 ${cardId}:`, error);
    }
  }

  /**
   * 🎯 運行完整測試
   */
  static runFullTest() {
    console.log('🧪 開始完整系統測試...\n');
    
    // 1. 測試卡牌創建
    console.log('1️⃣ 測試卡牌創建...');
    const allCardIds = CardRegistry.getAllCardIds();
    let successCount = 0;
    let failCount = 0;
    
    allCardIds.forEach(cardId => {
      try {
        const card = CardRegistry.create(cardId);
        if (card.id && card.name && card.stats) {
          successCount++;
        } else {
          console.warn(`⚠️ ${cardId} 缺少必要屬性`);
          failCount++;
        }
      } catch (error) {
        console.error(`❌ ${cardId} 創建失敗:`, error);
        failCount++;
      }
    });
    
    console.log(`✅ 成功: ${successCount}張, ❌ 失敗: ${failCount}張\n`);
    
    // 2. 測試平衡分析
    console.log('2️⃣ 測試平衡分析...');
    try {
      const report = BalanceAnalyzer.generateBalanceReport();
      console.log('✅ 平衡分析完成');
      console.log(report);
    } catch (error) {
      console.error('❌ 平衡分析失敗:', error);
    }
    
    // 3. 測試牌組創建
    console.log('\n3️⃣ 測試牌組創建...');
    try {
      const deck = this.createTestDeck('balanced');
      console.log(`✅ 成功創建平衡牌組: ${deck.length}張卡牌`);
      
      // 統計牌組
      const deckStats = {};
      deck.forEach(card => {
        deckStats[card.attribute] = (deckStats[card.attribute] || 0) + 1;
      });
      
      console.log('牌組屬性分佈:', deckStats);
      
    } catch (error) {
      console.error('❌ 牌組創建失敗:', error);
    }
    
    console.log('\n🎉 測試完成！');
  }

  /**
   * 🎮 快速遊戲設置
   */
  static quickGameSetup(gameController, deckType = 'balanced') {
    if (!gameController) {
      console.error('❌ 需要提供 gameController');
      return false;
    }

    try {
      // 重置遊戲
      gameController.resetGame();
      
      // 設置測試牌組
      const testDeck = this.createTestDeck(deckType);
      gameController.gameState.player.deck = testDeck;
      
      // 開始遊戲
      gameController.startNewTurn();
      
      console.log(`🎮 快速設置完成: ${deckType} 牌組`);
      return true;
      
    } catch (error) {
      console.error('❌ 快速設置失敗:', error);
      return false;
    }
  }
}

// ===== 🎨 CARD THEME ANALYZER (src/tools/ThemeAnalyzer.js) =====

/**
 * 🎨 卡牌主題分析器
 * 分析卡牌的主題一致性和設計風格
 */
export class ThemeAnalyzer {
  
  /**
   * 🎭 分析屬性主題
   */
  static analyzeAttributeThemes() {
    const themes = {
      human: {
        theme: '人性與團結',
        expectedTraits: ['團隊增益', '成長型', '數量依賴'],
        actualCards: []
      },
      yin: {
        theme: '陰影與控制',
        expectedTraits: ['高暴擊', '控制效果', '風險回報'],
        actualCards: []
      },
      yang: {
        theme: '光明與治療',
        expectedTraits: ['治療效果', '正面增益', '平衡'],
        actualCards: []
      },
      heaven: {
        theme: '天空與力量',
        expectedTraits: ['高數值', '穩定輸出', '權威'],
        actualCards: []
      },
      earth: {
        theme: '大地與防護',
        expectedTraits: ['高血量', '防護效果', '持久'],
        actualCards: []
      }
    };

    // 分析每張卡牌
    CardRegistry.getAllCardIds().forEach(cardId => {
      try {
        const card = CardRegistry.create(cardId);
        if (themes[card.attribute]) {
          themes[card.attribute].actualCards.push({
            name: card.name,
            type: card.type,
            traits: this.analyzeCardTraits(card)
          });
        }
      } catch (error) {
        console.warn(`分析 ${cardId} 主題時出錯:`, error);
      }
    });

    return themes;
  }

  /**
   * 🔍 分析卡牌特質
   */
  static analyzeCardTraits(card) {
    const traits = [];
    
    // 數值特質
    if (card.stats.attack > 25) traits.push('高攻擊');
    if (card.stats.crit > 60) traits.push('高暴擊');
    if (card.stats.hp_bonus > 15) traits.push('高血量');
    
    // 效果特質
    if (card.effects.on_support) traits.push('輔助效果');
    if (card.effects.on_strike) traits.push('攻擊效果');
    if (card.effects.on_play) traits.push('法術效果');
    
    // 描述特質分析
    const desc = card.description.toLowerCase();
    if (desc.includes('治療') || desc.includes('回復')) traits.push('治療');
    if (desc.includes('抽牌') || desc.includes('抽')) traits.push('抽牌');
    if (desc.includes('攻擊力+') || desc.includes('增強')) traits.push('增益');
    if (desc.includes('攻擊力-') || desc.includes('減少')) traits.push('削弱');
    
    return traits;
  }

  /**
   * 📊 生成主題報告
   */
  static generateThemeReport() {
    const themes = this.analyzeAttributeThemes();
    
    let report = `
🎨 MyGO!!!!! TCG 主題一致性報告
=====================================\n`;

    Object.entries(themes).forEach(([attribute, data]) => {
      report += `
🎭 ${attribute.toUpperCase()} 屬性
主題: ${data.theme}
期望特質: ${data.expectedTraits.join(', ')}
實際卡牌: ${data.actualCards.length}張

卡牌列表:
${data.actualCards.map(card => 
  `- ${card.name} (${card.type}): ${card.traits.join(', ')}`
).join('\n')}
`;
    });

    return report;
  }
}